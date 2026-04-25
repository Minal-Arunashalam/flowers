import { canvas, toV } from './canvas.js';
import { S } from './state.js';
import { FLOWERS, CENTER_IDX, TOTAL_DUR, STEM_OFF, STEM_EACH, BOFF, BDUR } from './config.js';
import { clamp } from './utils.js';
import { soundOn, playBloomChord, playFlowerSound, startAmbient } from './sound.js';
import { spawnPollen, spawnFirefly, initParticles, drawParticles } from './particles.js';
import { drawBg, drawBokeh, drawGodRays, drawPulseRings, drawGround,
         drawBouquet, applyBloomGlow } from './renderer.js';

// ─── Bloom driver ─────────────────────────────────────────────────────────────
function tickBloom(now) {
  if (!S.bloomStart) S.bloomStart = now;
  const t = (now - S.bloomStart) / 1000;
  S.masterBloom = clamp(t / (TOTAL_DUR * .35), 0, 1);
  FLOWERS.forEach((_, i) => {
    S.stemGrowths[i] = clamp((t - STEM_OFF[i]*TOTAL_DUR) / (STEM_EACH*TOTAL_DUR), 0, 1);
    const prev = S.blooms[i];
    S.blooms[i] = clamp((t - BOFF[i]*TOTAL_DUR) / (BDUR[i]*TOTAL_DUR), 0, 1);
    if (prev < .97 && S.blooms[i] >= .97 && !S.sparked[i]) {
      S.sparked[i] = true;
      spawnPollen(FLOWERS[i].x, FLOWERS[i].y, true);
      for (let k = 0; k < 3; k++) spawnFirefly(FLOWERS[i].x, FLOWERS[i].y);
      if (soundOn) playFlowerSound(i);
    }
  });
  if (S.blooms.every(b => b >= 1)) {
    S.masterBloom = 1; S.blooms.fill(1); S.stemGrowths.fill(1); S.phase = 2;
  }
}

// ─── Main loop ────────────────────────────────────────────────────────────────
function loop(now) {
  S.T = now * .001;
  if (S.phase === 1) tickBloom(now);
  drawBg();
  drawBokeh();
  drawGodRays();
  drawPulseRings();
  drawGround();
  drawBouquet();
  drawParticles();
  applyBloomGlow();
  requestAnimationFrame(loop);
}

// ─── Input ────────────────────────────────────────────────────────────────────
function d2(ax, ay, bx, by) { const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }

function onTap(e) {
  const v = toV(e.clientX, e.clientY);
  if (S.phase === 0) {
    S.phase = 1;
    document.getElementById('hint').classList.add('hidden');
    if (soundOn) playBloomChord();
    return;
  }
  if (S.phase === 2) {
    FLOWERS.forEach(f => {
      if (d2(v.x, v.y, f.x, f.y) < (f.r*1.2)**2) spawnPollen(f.x, f.y, false);
    });
  }
}

canvas.addEventListener('click', onTap);
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const t = e.changedTouches[0]; onTap({clientX: t.clientX, clientY: t.clientY});
}, {passive: false});


// ─── Init ─────────────────────────────────────────────────────────────────────
initParticles();
requestAnimationFrame(loop);
