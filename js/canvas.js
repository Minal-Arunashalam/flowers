import { VW, VH } from './config.js';

export const canvas = document.getElementById('c');
export const C      = canvas.getContext('2d');
export const DPR    = Math.min(window.devicePixelRatio || 1, 2.5);

export const BC1 = document.createElement('canvas');
export const BX1 = BC1.getContext('2d');
export const BC2 = document.createElement('canvas');
export const BX2 = BC2.getContext('2d');

export const view = { scale: 1 };

export function updateScale() {
  view.scale = Math.min(canvas.width / VW, canvas.height / VH) * .9;
}

export function resize() {
  canvas.width  = window.innerWidth  * DPR;
  canvas.height = window.innerHeight * DPR;
  BC1.width  = canvas.width  >> 1;  BC1.height = canvas.height >> 1;
  BC2.width  = canvas.width  >> 2;  BC2.height = canvas.height >> 2;
}

export function applyVT() {
  C.setTransform(view.scale, 0, 0, view.scale,
    canvas.width  / 2 - (VW / 2) * view.scale,
    canvas.height / 2 - (VH / 2) * view.scale);
}

export function toV(ex, ey) {
  const ox = canvas.width  / 2 - (VW / 2) * view.scale;
  const oy = canvas.height / 2 - (VH / 2) * view.scale;
  return { x: (ex * DPR - ox) / view.scale, y: (ey * DPR - oy) / view.scale };
}

resize();
updateScale();
window.addEventListener('resize', () => { resize(); updateScale(); });
