export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const eoc = t => 1 - Math.pow(1 - t, 3);
export const eoe = t => {
  if (!t || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 4.5)) + 1;
};

export const NOISE = (() => {
  const G2 = (3 - Math.sqrt(3)) / 6;
  const g3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  const p = Array.from({length: 256}, () => Math.random() * 256 | 0);
  const pm = [...p, ...p];
  const dt = (g, x, y) => g[0] * x + g[1] * y;
  return (xi, yi) => {
    const F = .5 * (Math.sqrt(3) - 1), s = (xi + yi) * F;
    const i = xi + s | 0, j = yi + s | 0, t = (i + j) * G2;
    const x0 = xi - (i - t), y0 = yi - (j - t);
    const [i1, j1] = x0 > y0 ? [1, 0] : [0, 1];
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    const g0 = pm[ii + pm[jj]] % 12, g1 = pm[ii + i1 + pm[jj + j1]] % 12, g2 = pm[ii + 1 + pm[jj + 1]] % 12;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = .5 - x0*x0 - y0*y0; if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * dt(g3[g0], x0, y0); }
    let t1 = .5 - x1*x1 - y1*y1; if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * dt(g3[g1], x1, y1); }
    let t2 = .5 - x2*x2 - y2*y2; if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * dt(g3[g2], x2, y2); }
    return 70 * (n0 + n1 + n2);
  };
})();

export function hexRGB(h) {
  return [parseInt(h.slice(1,3), 16), parseInt(h.slice(3,5), 16), parseInt(h.slice(5,7), 16)];
}
export function hexRGBStr(h) { return hexRGB(h).join(','); }
