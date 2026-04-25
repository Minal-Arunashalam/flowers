import { FLOWERS } from './config.js';

export const S = {
  T: 0,
  phase: 0,         // 0=idle  1=blooming  2=done
  bloomStart: null,
  masterBloom: 0,
  blooms:      FLOWERS.map(() => 0),
  sparked:     FLOWERS.map(() => false),
  sparkedDone: FLOWERS.map(() => false),
  stemGrowths: FLOWERS.map(() => 0),
  particles:   [],
  pulseRings:  [],
  lastRingT:   0,
};
