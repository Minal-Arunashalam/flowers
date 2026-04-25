import { C, canvas, BC1, BX1, BC2, BX2, applyVT } from './canvas.js';
import { S } from './state.js';
import { NIGHT, PAL, LEAF_L, LEAF_D, STAMEN, BG0, BG1, VW, VH,
         BUNDLE, CENTER_IDX, FLOWERS, BUDS, LEAVES, FSEEDS,
         GRASS_L, GRASS_R, BOKEH } from './config.js';
import { lerp, clamp, eoc, eoe, NOISE, hexRGBStr } from './utils.js';

// ─── Background ───────────────────────────────────────────────────────────────
export function drawBg() {
  C.save(); C.setTransform(1,0,0,1,0,0);
  const w = canvas.width, h = canvas.height;
  const osc = Math.sin(S.T * .3) * .09 + .09, bp = S.masterBloom;
  const [r0,g0,b0] = BG0, [r1,g1,b1] = BG1;
  const gr = C.createRadialGradient(w/2, h*.42, 0, w/2, h*.42, Math.max(w,h)*.82);
  gr.addColorStop(0, `rgb(${r1+r1*bp*.95+r1*osc|0},${g1+g1*bp*.65+g1*osc|0},${b1+b1*bp*1.1+b1*osc|0})`);
  gr.addColorStop(.5, `rgb(${r0*1.9|0},${g0*1.9|0},${b0*1.9|0})`);
  gr.addColorStop(1,  `rgb(${r0},${g0},${b0})`);
  C.fillStyle = gr; C.fillRect(0, 0, w, h);
  const vig = C.createRadialGradient(w/2, h/2, h*.22, w/2, h/2, h*.9);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.65)');
  C.fillStyle = vig; C.fillRect(0, 0, w, h);
  C.restore();
}

// ─── Bokeh ────────────────────────────────────────────────────────────────────
export function drawBokeh() {
  C.save(); applyVT();
  C.globalCompositeOperation = 'screen';
  BOKEH.forEach(b => {
    const r = b.r * (.8 + Math.sin(S.T * b.spd + b.phase) * .2);
    const a = b.alpha * (.5 + S.masterBloom * .7);
    const g = C.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
    g.addColorStop(0,   `rgba(${b.col},${a})`);
    g.addColorStop(.55, `rgba(${b.col},${a*.28})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    C.fillStyle = g; C.beginPath(); C.arc(b.x, b.y, r, 0, Math.PI*2); C.fill();
  });
  C.globalCompositeOperation = 'source-over';
  C.restore();
}

// ─── God rays ─────────────────────────────────────────────────────────────────
export function drawGodRays() {
  if (S.masterBloom < .7) return;
  const alpha = clamp((S.masterBloom - .7) / .3, 0, 1);
  const {x: cx, y: cy} = FLOWERS[CENTER_IDX];
  C.save(); applyVT();
  C.globalCompositeOperation = 'screen';
  const NR = 22, rot = S.T * .018;
  for (let i = 0; i < NR; i++) {
    const ang = (i / NR) * Math.PI * 2 + rot;
    const wobble = 1 + NOISE(Math.cos(ang)*2 + S.T*.3, Math.sin(ang)*2) * .18;
    const len = (200 + NOISE(i, S.T*.1)*50) * wobble;
    const w = 3 + NOISE(i*2, S.T*.15) * 4;
    const ex = cx + Math.cos(ang)*len, ey = cy + Math.sin(ang)*len;
    const g = C.createLinearGradient(cx, cy, ex, ey);
    const pulse = (.7 + Math.sin(S.T*.8 + i*.4)*.3) * alpha;
    const rc = i%2===0
      ? (NIGHT ? '200,120,255' : '255,180,150')
      : (NIGHT ? '140,80,220'  : '220,140,200');
    g.addColorStop(0,   `rgba(${rc},${.18*pulse})`);
    g.addColorStop(.35, `rgba(${rc},${.10*pulse})`);
    g.addColorStop(1,   'rgba(0,0,0,0)');
    C.beginPath(); C.moveTo(cx,cy); C.lineTo(ex,ey);
    C.strokeStyle = g; C.lineWidth = w; C.stroke();
  }
  C.globalCompositeOperation = 'source-over';
  C.restore();
}

// ─── Pulse rings ──────────────────────────────────────────────────────────────
export function drawPulseRings() {
  return;
}

// ─── Stem ─────────────────────────────────────────────────────────────────────
export function drawStem(x1, y1, cpx, cpy, x2, y2, w, d, progress) {
  if (progress <= 0) return;
  progress = Math.min(progress, 1);
  const N = Math.max(4, Math.ceil(28 * progress));
  const g = C.createLinearGradient(x2, y2, x1, y1);
  const a = lerp(.55, 1, d);
  g.addColorStop(0, `rgba(22,55,8,${a})`);
  g.addColorStop(1, `rgba(42,90,20,${a})`);
  C.beginPath();
  for (let k = 0; k <= N; k++) {
    const t = (k/N) * progress, mt = 1 - t;
    const bx = mt*mt*x2 + 2*mt*t*cpx + t*t*x1;
    const by = mt*mt*y2 + 2*mt*t*cpy + t*t*y1;
    k === 0 ? C.moveTo(bx, by) : C.lineTo(bx, by);
  }
  C.strokeStyle = g; C.lineWidth = w; C.lineCap = 'round'; C.stroke();
}

export function getStemTip(x1, y1, cpx, cpy, x2, y2, progress) {
  const p = Math.min(progress, 1), mt = 1 - p;
  return { x: mt*mt*x2 + 2*mt*p*cpx + p*p*x1, y: mt*mt*y2 + 2*mt*p*cpy + p*p*y1 };
}

// ─── Bud cap ──────────────────────────────────────────────────────────────────
export function drawBudCap(cx, cy, size, pal, alpha, depth) {
  if (alpha < 0.01) return;
  C.save(); C.translate(cx, cy); C.globalAlpha = alpha;
  if (depth < .38)
    C.filter = `saturate(${lerp(40,100,depth/.38)|0}%) blur(${lerp(2.0,0,depth/.38).toFixed(1)}px)`;
  const h = size*2.2, w = size;
  const bg = C.createRadialGradient(-w*.15, -h*.3, 0, 0, -h*.45, h*.65);
  bg.addColorStop(0, pal.mid); bg.addColorStop(.55, pal.base); bg.addColorStop(1, pal.throat);
  C.beginPath(); C.moveTo(0, h*.18);
  C.bezierCurveTo(-w*.52,h*.05,-w*.62,-h*.36,-w*.28,-h*.82);
  C.bezierCurveTo(-w*.08,-h,w*.08,-h,w*.28,-h*.82);
  C.bezierCurveTo(w*.62,-h*.36,w*.52,h*.05,0,h*.18);
  C.fillStyle = bg; C.fill();
  const sg = C.createLinearGradient(0, 0, 0, -h*.3);
  sg.addColorStop(0, '#3d8c22'); sg.addColorStop(1, 'rgba(42,136,32,0)');
  C.fillStyle = sg;
  C.beginPath(); C.moveTo(0, h*.18);
  C.bezierCurveTo(-w*.44,h*.08,-w*.5,-h*.08,-w*.3,-h*.18);
  C.bezierCurveTo(-w*.12,-h*.06,0,0,0,h*.18); C.fill();
  C.beginPath(); C.moveTo(0, h*.18);
  C.bezierCurveTo(w*.44,h*.08,w*.5,-h*.08,w*.3,-h*.18);
  C.bezierCurveTo(w*.12,-h*.06,0,0,0,h*.18); C.fill();
  C.filter = 'none'; C.restore();
}

// ─── Leaf ─────────────────────────────────────────────────────────────────────
export function drawLeaf(lx, ly, ang, sz) {
  C.save(); C.translate(lx, ly); C.rotate(ang);
  const l = sz, w = sz * .56;
  C.beginPath(); C.moveTo(0, 0);
  C.bezierCurveTo(w*.46,-l*.14,w*.66,-l*.44,w*.44,-l*.76);
  C.bezierCurveTo(w*.28,-l*.93,0,-l,0,-l);
  C.bezierCurveTo(-w*.18,-l*.9,-w*.08,-l*.52,0,-l*.28);
  C.closePath();
  const lg = C.createLinearGradient(0, 0, 0, -l);
  lg.addColorStop(0, LEAF_D); lg.addColorStop(.45, LEAF_L); lg.addColorStop(1, LEAF_D);
  C.fillStyle = lg; C.fill();
  C.beginPath(); C.moveTo(0, -2);
  C.bezierCurveTo(w*.11,-l*.37,w*.06,-l*.73,0,-l*.98);
  C.strokeStyle = 'rgba(0,0,0,.22)'; C.lineWidth = .9; C.stroke();
  for (let i = 0; i < 4; i++) {
    const t = .18 + i * .18;
    C.beginPath();
    C.moveTo(w*.04, -l*(.1+t*.58));
    C.quadraticCurveTo(w*(.18+t*.18), -l*(.2+t*.42), w*(.22+t*.22), -l*(.3+t*.28));
    C.strokeStyle = 'rgba(0,0,0,.12)'; C.lineWidth = .62; C.stroke();
  }
  C.restore();
}

// ─── Petal ────────────────────────────────────────────────────────────────────
export function drawPetal(cx, cy, len, wid, ang, pal, bp, pidx, depth, seed) {
  if (bp <= .005) return;
  C.save(); C.translate(cx, cy); C.rotate(ang);

  const w = wid * eoe(clamp(bp, 0, 1));
  const l = len * (.06 + .94 * eoc(clamp(bp*1.2, 0, 1)));
  if (w < 1 || l < 2) { C.restore(); return; }

  const ns = seed + pidx * .77;
  const nEdge  = 1 + NOISE(ns,       pidx*.5) * .12;
  const nTip   = 1 + NOISE(ns+1,     pidx*.6) * .10;
  const nWaist = 1 + NOISE(ns+2,     pidx*.4) * .14;

  const p = new Path2D();
  p.moveTo(0, 0);
  p.bezierCurveTo(-w*.08,-l*.05,-w*.32,-l*.18,-w*.48*nEdge,-l*.36);
  p.bezierCurveTo(-w*.58*nWaist,-l*.50,-w*.60*nEdge,-l*.62,-w*.55,-l*.70);
  p.bezierCurveTo(-w*.50,-l*.80,-w*.36,-l*.91,-w*.22*nEdge,-l*.96);
  p.bezierCurveTo(-w*.10,-l*.99*nTip,-w*.04,-l,0,-l*nTip);
  p.bezierCurveTo(w*.04,-l,w*.10,-l*.99*nTip,w*.22*nEdge,-l*.96);
  p.bezierCurveTo(w*.36,-l*.91,w*.50,-l*.80,w*.55,-l*.70);
  p.bezierCurveTo(w*.60*nEdge,-l*.62,w*.58*nWaist,-l*.50,w*.48*nEdge,-l*.36);
  p.bezierCurveTo(w*.32,-l*.18,w*.08,-l*.05,0,0);

  const rg = C.createRadialGradient(0,-l*.06,l*.02,0,-l*.48,l*.94);
  rg.addColorStop(.00, pal.throat); rg.addColorStop(.12, pal.base);
  rg.addColorStop(.46, pal.mid);    rg.addColorStop(.80, pal.tip);
  rg.addColorStop(1.0, pal.edge);
  C.fillStyle = rg; C.fill(p);

  const sd = pidx%2===0 ? -1 : 1;
  const sg = C.createLinearGradient(sd*w*.56, 0, -sd*w*.15, 0);
  sg.addColorStop(0, 'rgba(0,0,0,.26)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  C.fillStyle = sg; C.fill(p);

  const hg = C.createLinearGradient(-w*.06,-l*.1,w*.06,-l*.78);
  hg.addColorStop(0,   'rgba(255,255,255,0)');
  hg.addColorStop(.38, `rgba(255,255,255,${.14*bp*depth})`);
  hg.addColorStop(.65, `rgba(255,255,255,${.06*bp*depth})`);
  hg.addColorStop(1,   'rgba(255,255,255,0)');
  C.fillStyle = hg; C.fill(p);

  if (bp > .5) {
    const ea = (bp - .5) * .28;
    const eg = C.createLinearGradient(-w*.56,-l*.6,w*.56,-l*.6);
    eg.addColorStop(0,  `rgba(255,210,230,${ea})`);
    eg.addColorStop(.2, 'rgba(255,210,230,0)');
    eg.addColorStop(.8, 'rgba(255,210,230,0)');
    eg.addColorStop(1,  `rgba(255,210,230,${ea})`);
    C.fillStyle = eg; C.fill(p);
  }

  C.globalCompositeOperation = 'screen';
  const tg = C.createRadialGradient(0,-l*.07,0,0,-l*.07,l*.36);
  tg.addColorStop(0, `rgba(255,200,100,${.22*bp})`);
  tg.addColorStop(1, 'rgba(0,0,0,0)');
  C.fillStyle = tg; C.fill(p);

  const iridAngle = S.T*.18 + pidx*.6 + seed*.4;
  const hShift    = Math.sin(S.T*.22 + pidx*1.1 + seed*.5);
  const iridA     = .09 * bp * depth;
  const ig = C.createLinearGradient(
    Math.cos(iridAngle)*w*.9, -l*.2+Math.sin(iridAngle)*l*.4,
    -Math.cos(iridAngle)*w*.9, -l*.7
  );
  ig.addColorStop(0,   `rgba(255,240,200,${iridA*(.6+hShift*.4)})`);
  ig.addColorStop(.45, `rgba(200,240,255,${iridA*(.8+hShift*.2)})`);
  ig.addColorStop(1,   `rgba(255,200,240,${iridA})`);
  C.fillStyle = ig; C.fill(p);
  C.globalCompositeOperation = 'source-over';

  if (bp > .38) {
    const va = (bp - .38) * .26;
    C.strokeStyle = `rgba(0,0,0,${va})`; C.lineWidth = .68; C.lineCap = 'round';
    C.beginPath(); C.moveTo(0, -l*.03);
    C.bezierCurveTo(-w*.02,-l*.42,w*.03,-l*.73,0,-l*.97); C.stroke();
    for (let vi = 0; vi < 4; vi++) {
      const vt = .14 + vi * .2;
      [-1, 1].forEach(s => {
        C.beginPath();
        C.moveTo(s*w*.04, -l*(.06+vt*.62));
        C.quadraticCurveTo(s*w*(.14+vt*.24), -l*(.16+vt*.44), s*w*(.2+vt*.3), -l*(.28+vt*.3));
        C.stroke();
      });
    }
  }

  if (bp > .85 && depth >= .8) {
    const fade = clamp((bp - .85) / .12, 0, 1);
    for (let d = 0; d < 2; d++) {
      const dt = NOISE(seed+d*2.3, pidx*1.4+d);
      const dx = (dt*.5-.25)*w*.72;
      const dy = -l*(.35 + NOISE(seed+d, pidx*1.7)*.35);
      const dr = 2.8 + NOISE(seed*2, d)*1.6;
      C.beginPath(); C.arc(dx, dy, dr, -Math.PI*.8, Math.PI*.1);
      C.strokeStyle = `rgba(255,255,255,${.35*fade})`; C.lineWidth = .9; C.stroke();
      C.beginPath(); C.arc(dx-dr*.3, dy-dr*.4, dr*.38, 0, Math.PI*2);
      C.fillStyle = `rgba(255,255,255,${.55*fade})`; C.fill();
    }
  }
  C.restore();
}

// ─── Stamen ───────────────────────────────────────────────────────────────────
export function drawStamen(cx, cy, sz, bp, pal) {
  if (bp < .36) return;
  const a = clamp((bp - .36) / .42, 0, 1);
  const h = sz * .2 * eoc(a);
  C.save(); C.translate(cx, cy); C.globalAlpha = a;
  const cg = C.createLinearGradient(-3, 0, 3, -h);
  cg.addColorStop(0, pal.throat); cg.addColorStop(.5, pal.base); cg.addColorStop(1, pal.mid);
  C.beginPath();
  C.moveTo(-4, 3);
  C.bezierCurveTo(-5.5,-h*.28,-4.5,-h*.68,-3,-h);
  C.bezierCurveTo(3,-h,5.5,-h*.68,5.5,-h*.28);
  C.lineTo(4, 3); C.fillStyle = cg; C.fill();
  const NF = 14;
  for (let i = 0; i < NF; i++) {
    const fa = (i/NF) * Math.PI * 2;
    const sp = sz*.4, vs = sz*.2;
    const fx = Math.cos(fa)*sp, fy = -h + Math.sin(fa)*vs;
    C.beginPath(); C.moveTo(0, -h+2); C.quadraticCurveTo(fx*.5,-h+fy*.5,fx,fy);
    C.strokeStyle = STAMEN; C.lineWidth = .4; C.globalAlpha = a*.88; C.stroke();
    C.beginPath(); C.arc(fx, fy, 1, 0, Math.PI*2);
    C.fillStyle = STAMEN; C.globalAlpha = a; C.fill();
  }
  for (let i = 0; i < 5; i++) {
    const sa = (i/5) * Math.PI*2 - Math.PI/2;
    C.beginPath(); C.arc(Math.cos(sa)*4, -h-4+Math.sin(sa)*3, 2.5, 0, Math.PI*2);
    C.fillStyle = '#ff80ab'; C.globalAlpha = a; C.fill();
  }
  C.restore();
}

// ─── Calyx ────────────────────────────────────────────────────────────────────
export function drawCalyx(cx, cy, sz, bp) {
  const a = clamp(bp * 2.4, 0, 1);
  C.save(); C.translate(cx, cy); C.globalAlpha = a;
  for (let i = 0; i < 5; i++) {
    const sa = (i/5) * Math.PI*2 - Math.PI/2;
    const r = sz*.21, sx = Math.cos(sa)*r*.55, sy = Math.sin(sa)*r*.55;
    C.beginPath(); C.moveTo(0, 0);
    C.bezierCurveTo(sx-r*.22,sy+r*.28,sx+r*.18,sy+r*.88,sx,sy+r);
    C.bezierCurveTo(sx-r*.16,sy+r*.46,-r*.12,r*.3,0,0);
    const sg = C.createLinearGradient(0, 0, sx, sy+r);
    sg.addColorStop(0, '#4a9028'); sg.addColorStop(1, '#1e4a10');
    C.fillStyle = sg; C.fill();
  }
  C.restore();
}

// ─── Flower ───────────────────────────────────────────────────────────────────
export function drawFlower(flower, bp, burstNow, fi) {
  if (bp <= 0) return;
  const {x, y, r, p, ang, depth} = flower;
  const pal = PAL[p % PAL.length];
  const da = lerp(.52, 1, depth);
  const ds = lerp(.80, 1, depth);

  C.save();
  C.translate(x, y); C.scale(ds, ds); C.translate(-x, -y);
  C.globalAlpha = da;

  if (depth < .38)
    C.filter = `saturate(${lerp(40,100,depth/.38)|0}%) blur(${lerp(2.0,0,depth/.38).toFixed(1)}px)`;

  if (bp > .25) {
    const sa = clamp((bp - .25) * .85, 0, .6) * da;
    const sdg = C.createRadialGradient(x,y+r*.18,0,x,y+r*.18,r*.98);
    sdg.addColorStop(0, `rgba(0,0,0,${sa*.8})`); sdg.addColorStop(1, 'rgba(0,0,0,0)');
    C.fillStyle = sdg; C.beginPath(); C.ellipse(x,y+r*.18,r*.94,r*.32,0,0,Math.PI*2); C.fill();
  }

  if (bp > .38 && depth > .28) {
    const ga = clamp((bp - .38) * 1.3, 0, 1) * da;
    const pr = r * (1.18 + Math.sin(S.T*2.2+p)*.09*(S.phase>=2?1:0));
    C.globalCompositeOperation = 'screen';
    const gg = C.createRadialGradient(x,y,0,x,y,pr*2);
    gg.addColorStop(0,   `rgba(${hexRGBStr(pal.mid)},${.28*ga})`);
    gg.addColorStop(.55, `rgba(${hexRGBStr(pal.base)},${.10*ga})`);
    gg.addColorStop(1,   'rgba(0,0,0,0)');
    C.fillStyle = gg; C.beginPath(); C.arc(x,y,pr*2,0,Math.PI*2); C.fill();
    C.globalCompositeOperation = 'source-over';
  }

  [1,3,0,2,4].forEach(pi => {
    const pa = ang + (pi/5)*Math.PI*2 - Math.PI/2;
    const pbp = clamp((bp*1.6 - pi*.09)*1.25, 0, 1);
    const depthSway = lerp(.008, .038, depth);
    const swayFreq  = lerp(.38,  .62,  depth);
    const sway = S.phase >= 2 ? Math.sin(S.T*swayFreq + pi*1.5 + p*.9)*depthSway : 0;
    drawPetal(x, y, r*1.12, r*.94, pa+sway, pal, pbp, pi, depth, FSEEDS[fi]);
  });

  if (bp > .3) {
    const cga = clamp((bp - .3) * 1.5, 0, 1);
    const pr2 = r*.34 + Math.sin(S.T*2.4+p)*r*.08*(S.phase>=2?1:0);
    const cg  = C.createRadialGradient(x,y,0,x,y,pr2*2.8);
    cg.addColorStop(0,  `rgba(255,220,90,${.38*cga})`);
    cg.addColorStop(.4, `rgba(${hexRGBStr(pal.mid)},${.2*cga})`);
    cg.addColorStop(1,  'rgba(0,0,0,0)');
    C.fillStyle = cg; C.beginPath(); C.arc(x,y,pr2*2.8,0,Math.PI*2); C.fill();
  }

  C.filter = 'none';
  drawCalyx(x, y, r, bp);
  drawStamen(x, y, r*.64, bp, pal);

  if (burstNow) {
    for (let i = 0; i < 20; i++) {
      const sa = (i/20) * Math.PI*2;
      const sr = r * lerp(.28, 1.15, Math.random());
      C.beginPath(); C.arc(x+Math.cos(sa)*sr, y+Math.sin(sa)*sr, Math.random()*3+.8, 0, Math.PI*2);
      C.fillStyle = `rgba(255,225,110,${Math.random()*.9+.1})`; C.fill();
    }
  }
  C.globalAlpha = 1; C.restore();
}

// ─── Bud ──────────────────────────────────────────────────────────────────────
export function drawBud(bud, bi) {
  const {x, y, r, p, ang} = bud;
  const pal = PAL[p % PAL.length];
  const breathe = S.phase === 0 ? (1 + Math.sin(S.T*1.1 + bi*.8) * .042) : 1;
  C.save(); C.translate(x, y); C.scale(breathe, breathe);
  if (S.phase === 0 && r >= 18) {
    const ga = .28 + Math.sin(S.T*1.4 + bi) * .1;
    C.globalCompositeOperation = 'screen';
    const glg = C.createRadialGradient(0, 0, 0, 0, 0, r*3.2);
    glg.addColorStop(0, `rgba(${hexRGBStr(pal.mid)},${ga*.3})`);
    glg.addColorStop(1, 'rgba(0,0,0,0)');
    C.fillStyle = glg; C.beginPath(); C.arc(0, 0, r*3.2, 0, Math.PI*2); C.fill();
    C.globalCompositeOperation = 'source-over';
  }
  C.rotate(ang);
  const bh = r*1.72, bw = r*.7;
  const bg = C.createRadialGradient(-bw*.2,-bh*.3,0,0,-bh*.5,bh);
  bg.addColorStop(0, pal.mid); bg.addColorStop(.55, pal.base); bg.addColorStop(1, pal.throat);
  C.fillStyle = bg;
  C.beginPath(); C.moveTo(0, 0);
  C.bezierCurveTo(-bw*.52,-bh*.1,-bw*.60,-bh*.52,-bw*.28,-bh*.9);
  C.bezierCurveTo(-bw*.08,-bh*1.04,bw*.08,-bh*1.04,bw*.28,-bh*.9);
  C.bezierCurveTo(bw*.60,-bh*.52,bw*.52,-bh*.1,0,0); C.fill();
  for (let i = 0; i < 3; i++) {
    const t = (i+1)/4;
    C.beginPath();
    C.moveTo(-bw*(t*.55+.08), -bh*t*.88);
    C.bezierCurveTo(-bw*(t*.45+.14),-bh*(t*.88+.1),-bw*(t*.3+.1),-bh*(t*.88+.18),-bw*(t*.14+.08),-bh*(t*.88+.22));
    C.strokeStyle = 'rgba(0,0,0,.16)'; C.lineWidth = .75; C.stroke();
  }
  C.restore();
}

// ─── Ground & grass ───────────────────────────────────────────────────────────
export function drawGround() {
  C.save(); applyVT();
  const groundY = 578;
  const sg = C.createLinearGradient(0, groundY, 0, VH);
  sg.addColorStop(0, NIGHT ? '#1e3a0a' : '#2e5010');
  sg.addColorStop(1, NIGHT ? '#080e04' : '#111808');
  C.fillStyle = sg; C.fillRect(0, groundY, VW, VH-groundY);
  const gl = NIGHT ? '#2a5a12' : '#3a8020';
  const gd = NIGHT ? '#163010' : '#1e4a10';
  [...GRASS_L, ...GRASS_R].forEach((b, idx) => {
    const isL = idx < GRASS_L.length;
    const ni   = isL ? idx : idx - GRASS_L.length;
    const t    = ni / (isL ? GRASS_L.length : GRASS_R.length);
    const prog = S.phase >= 1 ? clamp((S.masterBloom*2.6 - t*0.5)/1, 0, 1) : 0;
    if (prog <= 0) return;
    const h    = b.h * prog;
    const sway = Math.sin(S.T*1.1 + ni*0.7 + (isL?0:1.4)) * 0.07 * (S.phase>=1?1:0.2);
    C.save(); C.translate(b.x, groundY); C.rotate(b.ang + sway);
    const gg = C.createLinearGradient(0, 0, 0, -h);
    gg.addColorStop(0, gl); gg.addColorStop(1, gd);
    C.beginPath();
    C.moveTo(-b.w/2, 0);
    C.quadraticCurveTo(-b.w*0.7, -h*0.55, 0, -h);
    C.quadraticCurveTo(b.w*0.7,  -h*0.55, b.w/2, 0);
    C.fillStyle = gg; C.fill();
    C.restore();
  });
  C.restore();
}

// ─── Bouquet ──────────────────────────────────────────────────────────────────
export function drawBouquet() {
  C.save(); applyVT();

  const openingOnly = S.phase === 0 && S.masterBloom <= 0.01;
  const originBud = BUDS[0];
  const growthOrigin = originBud ? { x: originBud.x, y: 578 } : BUNDLE;

  if (openingOnly) {
    const b = originBud;
    if (b) {
      const groundY = 578;
      const stemBottomY = groundY + 2;
      const stemTopY = b.y - b.r*.04;

      C.save();

      // clean soil shadow
      C.beginPath();
      C.ellipse(b.x, groundY + 2, b.r*.82, b.r*.18, 0, 0, Math.PI*2);
      C.fillStyle = NIGHT ? 'rgba(3,8,3,.62)' : 'rgba(10,16,6,.46)';
      C.fill();

      // short visible stem
      const sg = C.createLinearGradient(b.x, stemBottomY, b.x, stemTopY);
      sg.addColorStop(0, NIGHT ? '#1c5b12' : '#2e7418');
      sg.addColorStop(1, NIGHT ? '#55b83a' : '#5ab83a');

      C.beginPath();
      C.moveTo(b.x, stemBottomY);
      C.bezierCurveTo(b.x - 3, groundY - 8, b.x - 2, b.y + b.r*.18, b.x, stemTopY);
      C.bezierCurveTo(b.x + 2, b.y + b.r*.18, b.x + 3, groundY - 8, b.x, stemBottomY);
      C.closePath();
      C.fillStyle = sg;
      C.fill();

      C.restore();

      drawBud(b, 0);
    }
    C.restore();
    return;
  }

  // Draw the original bulb during the early grow phase so the bouquet visibly emerges from it.
  if (originBud && S.masterBloom < .38) {
    const fade = 1 - clamp((S.masterBloom - .18) / .20, 0, 1);
    C.save();
    C.globalAlpha = fade;
    const groundY = 578;
    const stemBottomY = groundY + 2;
    const stemTopY = originBud.y - originBud.r*.04;

    C.beginPath();
    C.ellipse(originBud.x, groundY + 2, originBud.r*.82, originBud.r*.18, 0, 0, Math.PI*2);
    C.fillStyle = NIGHT ? 'rgba(3,8,3,.62)' : 'rgba(10,16,6,.46)';
    C.fill();

    const sg = C.createLinearGradient(originBud.x, stemBottomY, originBud.x, stemTopY);
    sg.addColorStop(0, NIGHT ? '#1c5b12' : '#2e7418');
    sg.addColorStop(1, NIGHT ? '#55b83a' : '#5ab83a');
    C.beginPath();
    C.moveTo(originBud.x, stemBottomY);
    C.bezierCurveTo(originBud.x - 3, groundY - 8, originBud.x - 2, originBud.y + originBud.r*.18, originBud.x, stemTopY);
    C.bezierCurveTo(originBud.x + 2, originBud.y + originBud.r*.18, originBud.x + 3, groundY - 8, originBud.x, stemBottomY);
    C.closePath();
    C.fillStyle = sg;
    C.fill();

    C.restore();
    C.save();
    C.globalAlpha = fade;
    drawBud(originBud, 0);
    C.restore();
  }

  FLOWERS.forEach((f, i) => {
    drawStem(f.x, f.y+f.r*.88, f.cpx, f.cpy, growthOrigin.x, growthOrigin.y, f.r*.07+1.4, f.depth, S.stemGrowths[i]);
  });

  LEAVES.forEach(l => drawLeaf(l.x, l.y, l.ang, l.sz));

  [...FLOWERS.map((f, i) => ({f, i}))].sort((a, b) => a.f.depth-b.f.depth || a.f.y-b.f.y)
    .forEach(({f, i}) => {
      const sg = S.stemGrowths[i], bp = S.blooms[i];
      if (sg > 0.06 && bp < 0.12) {
        const tip = getStemTip(f.x, f.y+f.r*.88, f.cpx, f.cpy, growthOrigin.x, growthOrigin.y, sg);
        const fa  = clamp(sg*4, 0, 1) * (1-bp/0.12) * lerp(.52, 1, f.depth);
        drawBudCap(tip.x, tip.y, f.r*.24, PAL[f.p%PAL.length], fa, f.depth);
      }
      const burst = S.sparked[i] && !S.sparkedDone[i];
      if (burst) S.sparkedDone[i] = true;
      drawFlower(f, bp, burst, i);
    });

  C.restore();
}

// ─── Triple-pass bloom glow ───────────────────────────────────────────────────
export function applyBloomGlow() {
  if (S.masterBloom < .3) return;
  const strength = clamp((S.masterBloom - .3) / .4, 0, 1);
  C.save(); C.setTransform(1,0,0,1,0,0);
  C.globalCompositeOperation = 'screen';

  BX2.clearRect(0, 0, BC2.width, BC2.height);
  BX2.filter = 'blur(28px) brightness(1.4) saturate(1.2)';
  BX2.drawImage(canvas, 0, 0, BC2.width, BC2.height);
  BX2.filter = 'none';
  C.globalAlpha = strength * .22;
  C.drawImage(BC2, 0, 0, canvas.width, canvas.height);

  BX1.clearRect(0, 0, BC1.width, BC1.height);
  BX1.filter = 'blur(12px) brightness(1.6) saturate(1.3)';
  BX1.drawImage(canvas, 0, 0, BC1.width, BC1.height);
  BX1.filter = 'none';
  C.globalAlpha = strength * .18;
  C.drawImage(BC1, 0, 0, canvas.width, canvas.height);

  BX1.clearRect(0, 0, BC1.width, BC1.height);
  BX1.filter = 'blur(4px) brightness(1.9) saturate(1.5)';
  BX1.drawImage(canvas, 0, 0, BC1.width, BC1.height);
  BX1.filter = 'none';
  C.globalAlpha = strength * .10;
  C.drawImage(BC1, 0, 0, canvas.width, canvas.height);

  C.globalCompositeOperation = 'source-over';
  C.globalAlpha = 1; C.restore();
}
