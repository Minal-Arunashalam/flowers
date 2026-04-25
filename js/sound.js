import { S } from './state.js';

let AC = null, ambO = null, ambG = null, ambLfo = null, ambLfoG = null, masterG = null, delay = null, delayG = null;
export let soundOn = true;

function unlockSoundOnFirstGesture() {
  if (!soundOn) return;
  try {
    const ac = gAC();
    if (ac.state === 'suspended') ac.resume();
    startAmbient();
  } catch(e) {}
}

function gAC() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    masterG = AC.createGain();
    delay = AC.createDelay(4);
    delayG = AC.createGain();

    masterG.gain.value = .82;
    delay.delayTime.value = .42;
    delayG.gain.value = .18;

    masterG.connect(AC.destination);
    masterG.connect(delay);
    delay.connect(delayG);
    delayG.connect(AC.destination);
  }
  return AC;
}

export function toggleSnd() {
  soundOn = !soundOn;
  if (!soundOn && ambG) ambG.gain.setTargetAtTime(.0001, gAC().currentTime, .9);
  else if (soundOn && S.phase >= 2) startAmbient();
}

function note(freq, start, dur, gain, type = 'triangle') {
  const ac = gAC(), o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + .9);
  g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + start + dur);
  o.connect(g); g.connect(masterG || ac.destination);
  o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + .1);
}

export function playBloomChord() {
  if (!soundOn) return;
  // warm suspended/major-9 color: calm, nostalgic, less “pingy”
  [[196,.00,.022],[246.9,.45,.018],[293.7,.9,.016],[369.99,1.25,.014],[440,1.7,.011]]
    .forEach(([f, s, g]) => note(f, s, 8.5, g, 'sine'));
  setTimeout(startAmbient, 2400);
}

export function playFlowerSound(i) {
  if (!soundOn) return;
  // sparse celesta-like bloom tones
  const motifs = [
    [293.7, 369.99],
    [329.6, 440],
    [246.9, 392],
    [220, 329.6]
  ];
  const pair = motifs[i % motifs.length];
  pair.forEach((f, j) => note(f, i * .16 + j * .18, 4.8, j ? .010 : .014, 'sine'));
}

export function startAmbient() {
  if (!soundOn) return;
  try {
    const ac = gAC();
    if (ambO) { try { ambO.stop(); } catch(e) {} }
    if (ambLfo) { try { ambLfo.stop(); } catch(e) {} }

    ambO = ac.createOscillator();
    ambG = ac.createGain();
    ambLfo = ac.createOscillator();
    ambLfoG = ac.createGain();

    ambO.type = 'sine';
    ambO.frequency.value = 73.42; // low D, softer than the previous drone

    // very subtle pitch drift so it feels organic, not electronic
    ambLfo.type = 'sine';
    ambLfo.frequency.value = .045;
    ambLfoG.gain.value = .9;
    ambLfo.connect(ambLfoG);
    ambLfoG.connect(ambO.frequency);

    ambG.gain.setValueAtTime(.0001, ac.currentTime);
    ambG.gain.exponentialRampToValueAtTime(.010, ac.currentTime + 5.5);

    ambO.connect(ambG);
    ambG.connect(masterG || ac.destination);
    ambO.start();
    ambLfo.start();
  } catch(e) {}
}

window.addEventListener('pointerdown', unlockSoundOnFirstGesture, { once: true, passive: true });
window.addEventListener('keydown', unlockSoundOnFirstGesture, { once: true });
