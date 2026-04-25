import { C, applyVT } from './canvas.js';
import { S } from './state.js';
import { FLOWERS, PAL, NIGHT } from './config.js';
import { hexRGB } from './utils.js';

export function spawnPollen(fx, fy, burst) {
  const n = burst ? 24 : 1;
  for (let i = 0; i < n; i++) {
    const a = burst ? Math.random() * Math.PI * 2 : -Math.PI/2 + (Math.random() - .5) * .9;
    const spd = burst ? Math.random() * 3.2 + .8 : Math.random() * .48 + .1;
    S.particles.push({
      x: fx + (Math.random() - .5) * 30, y: fy + (Math.random() - .5) * 30,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - (burst ? .6 : .2),
      sz: Math.random() * 2.2 + .5, op: Math.random() * .65 + .2,
      life: 1, decay: Math.random() * .005 + .001,
      r: NIGHT ? 220 : 255, g: NIGHT ? 150 : 190, b: NIGHT ? 255 : 220,
      isPetal: false, isFirefly: false,
    });
  }
}

export function spawnFallingPetal(fx, fy) {
  const pal = PAL[Math.floor(Math.random() * PAL.length)];
  const [r, g, b] = hexRGB(pal.mid);
  const p = {
    x: fx + (Math.random() - .5) * 70, y: fy - 15,
    vx: (Math.random() - .5) * .9, vy: Math.random() * .3 + .05,
    windPhase: Math.random() * Math.PI * 2, windAmp: Math.random() * .35 + .1,
    sz: Math.random() * 9 + 5, szY: 0,
    op: Math.random() * .55 + .25, life: 1, decay: Math.random() * .0025 + .0006,
    rot: Math.random() * Math.PI * 2, rotV: (Math.random() - .5) * .055,
    r, g, b, isPetal: true, isFirefly: false,
  };
  p.szY = p.sz * .45;
  S.particles.push(p);
}

export function spawnFirefly(fx, fy) {
  const warm = Math.random() > .5;
  const [r, g, b] = warm ? [255, 180, 220] : [255, 220, 120];
  S.particles.push({
    x: fx + (Math.random() - .5) * 80, y: fy + (Math.random() - .5) * 80,
    vx: (Math.random() - .5) * .3, vy: -(Math.random() * .2 + .05),
    lissFreqX: Math.random() * .4 + .2, lissFreqY: Math.random() * .3 + .15,
    lissAmp: Math.random() * .8 + .3,
    phase: Math.random() * Math.PI * 2,
    sz: Math.random() * 4 + 3, haloR: Math.random() * 10 + 14,
    op: Math.random() * .4 + .4, life: 1, decay: Math.random() * .003 + .001,
    r, g, b, isPetal: false, isFirefly: true,
  });
}

export function initParticles() {
  FLOWERS.forEach(f => { for (let i = 0; i < 2; i++) spawnPollen(f.x, f.y, false); });
  for (let i = 0; i < 4; i++) {
    const f = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    spawnFirefly(f.x, f.y);
  }
}

export function drawParticles() {
  C.save(); applyVT();
  const maxPollen = S.phase >= 2 ? 100 : 28;
  const maxFly    = S.phase >= 2 ? 24  : 4;
  const nFly    = S.particles.filter(q => q.isFirefly).length;
  const nPollen = S.particles.filter(q => !q.isFirefly && !q.isPetal).length;

  if (nPollen < maxPollen && Math.random() < (S.phase >= 2 ? .22 : .06)) {
    const f = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    spawnPollen(f.x, f.y, false);
  }
  if (S.phase >= 2 && Math.random() < .12) {
    const f = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    spawnFallingPetal(f.x, f.y);
  }
  if (nFly < maxFly && Math.random() < .04) {
    const f = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    spawnFirefly(f.x, f.y);
  }

  S.particles = S.particles.filter(pt => {
    pt.x += pt.vx; pt.y += pt.vy;
    if (pt.isFirefly) {
      pt.vx += Math.sin(S.T * pt.lissFreqX + pt.phase) * pt.lissAmp * .012;
      pt.vy += Math.cos(S.T * pt.lissFreqY + pt.phase) * pt.lissAmp * .008;
      const spd = Math.sqrt(pt.vx*pt.vx + pt.vy*pt.vy);
      if (spd > .8) { pt.vx *= .8/spd; pt.vy *= .8/spd; }
      pt.vy -= .006;
    } else if (pt.isPetal) {
      pt.vy += .025; pt.vx += Math.sin(S.T * 1.2 + pt.windPhase) * pt.windAmp * .04;
      pt.rot += pt.rotV;
    } else {
      pt.vy -= .008; pt.vx += (Math.random() - .5) * .05;
    }
    pt.life -= pt.decay;
    if (pt.life <= 0) return false;

    if (pt.isFirefly) {
      const pulse = .4 + .35 * Math.sin(S.T * 2.2 + pt.phase);
      const a = pulse * pt.life;
      C.globalCompositeOperation = 'screen';
      const hg = C.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.haloR);
      hg.addColorStop(0, `rgba(${pt.r},${pt.g},${pt.b},${a*.55})`);
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      C.fillStyle = hg; C.beginPath(); C.arc(pt.x, pt.y, pt.haloR, 0, Math.PI*2); C.fill();
      C.beginPath(); C.arc(pt.x, pt.y, pt.sz*.4, 0, Math.PI*2);
      C.fillStyle = `rgba(255,255,255,${a*.9})`; C.fill();
      C.globalCompositeOperation = 'source-over';
    } else if (pt.isPetal) {
      C.save(); C.translate(pt.x, pt.y); C.rotate(pt.rot); C.globalAlpha = pt.life * pt.op;
      C.beginPath(); C.ellipse(0, 0, pt.sz, pt.szY, 0, 0, Math.PI*2);
      C.fillStyle = `rgb(${pt.r},${pt.g},${pt.b})`; C.fill(); C.restore();
    } else {
      const a = pt.life * pt.op;
      C.globalCompositeOperation = 'screen';
      const hg = C.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.sz*2.5);
      hg.addColorStop(0, `rgba(${pt.r},${pt.g},${pt.b},${a*.28})`);
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      C.fillStyle = hg; C.beginPath(); C.arc(pt.x, pt.y, pt.sz*2.5, 0, Math.PI*2); C.fill();
      C.beginPath(); C.arc(pt.x, pt.y, pt.sz, 0, Math.PI*2);
      C.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${a})`; C.fill();
      C.globalCompositeOperation = 'source-over';
    }
    return true;
  });
  C.restore();
}
