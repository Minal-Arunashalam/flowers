const HR = new Date().getHours();
export const NIGHT = HR < 6 || HR >= 20;

export const PAL = NIGHT ? [
  // deep midnight navy, icy glow edge
  {throat:'#020817',base:'#061636',mid:'#0d2f73',tip:'#1f3f8a',edge:'#eef5ff'},
  // royal navy, brighter blue rim
  {throat:'#030b1f',base:'#08245a',mid:'#1646a3',tip:'#244a9a',edge:'#f0f7ff'},
  // indigo-blue shade for variety
  {throat:'#06051f',base:'#10115a',mid:'#2936a5',tip:'#3a3fa8',edge:'#f2f4ff'},
  // sapphire/cobalt blue accent
  {throat:'#001021',base:'#00316b',mid:'#0062c9',tip:'#1b5fa8',edge:'#f3fbff'},
  // stormy blue-lavender, still navy based
  {throat:'#080b24',base:'#1a265f',mid:'#3f56b5',tip:'#4459b5',edge:'#f4f6ff'},
  // very dark blue flower with bright moonlit edge
  {throat:'#01040e',base:'#07122d',mid:'#10285f',tip:'#1f4a8a',edge:'#e8f1ff'},
] : [
  // keep the same family during daytime, just slightly lifted
  {throat:'#031025',base:'#092150',mid:'#123f91',tip:'#85aaff',edge:'#f0f6ff'},
  {throat:'#06142d',base:'#0d2f70',mid:'#1c55bd',tip:'#7db7ff',edge:'#f2f8ff'},
  {throat:'#08072a',base:'#18176a',mid:'#3442ba',tip:'#9ea8ff',edge:'#f4f5ff'},
  {throat:'#00172f',base:'#004080',mid:'#0070df',tip:'#8cd3ff',edge:'#f4fcff'},
  {throat:'#0b1230',base:'#223477',mid:'#5267c7',tip:'#bdc6ff',edge:'#f6f7ff'},
  {throat:'#020817',base:'#0a183b',mid:'#183775',tip:'#7595ea',edge:'#edf4ff'},
];

export const LEAF_L = NIGHT ? '#1a3d1a' : '#2a5a18';
export const LEAF_D = NIGHT ? '#0d2611' : '#1a3d0a';
export const STAMEN  = NIGHT ? '#ffe082' : '#ffc107';
export const BG0 = NIGHT ? [0,5,18]   : [1,7,22];
export const BG1 = NIGHT ? [4,15,42]  : [5,18,48];

export const VW = 460, VH = 600;
export const BUNDLE = {x: 230, y: 595};
export const CENTER_IDX = 12;

export const FLOWERS = [
  // deep-back
  {x:165,y:90, r:34,p:3,ang:-.08,depth:.06,cpx:188,cpy:320},
  {x:292,y:84, r:32,p:1,ang: .11,depth:.06,cpx:268,cpy:315},
  {x:68, y:138,r:30,p:4,ang:-.30,depth:.07,cpx:126,cpy:345},
  {x:395,y:125,r:28,p:2,ang: .33,depth:.07,cpx:346,cpy:338},
  // back
  {x:230,y:105,r:46,p:5,ang: .04,depth:.10,cpx:230,cpy:328},
  {x:78, y:165,r:42,p:0,ang:-.22,depth:.12,cpx:142,cpy:360},
  {x:382,y:148,r:44,p:4,ang: .22,depth:.12,cpx:320,cpy:350},
  // mid
  {x:152,y:148,r:60,p:2,ang:-.10,depth:.42,cpx:186,cpy:350},
  {x:310,y:160,r:58,p:1,ang: .13,depth:.42,cpx:276,cpy:358},
  {x:50, y:218,r:50,p:5,ang:-.28,depth:.32,cpx:118,cpy:390},
  {x:408,y:202,r:48,p:3,ang: .32,depth:.32,cpx:342,cpy:382},
  // front
  {x:115,y:246,r:86,p:0,ang:-.15,depth:1.0, cpx:153,cpy:408},
  {x:232,y:208,r:98,p:5,ang: .04,depth:1.0, cpx:232,cpy:385},
  {x:348,y:236,r:84,p:1,ang: .18,depth:1.0, cpx:310,cpy:402},
];

export const BUDS = [
  {x:230,y:542,r:24,p:0,ang:0,cpx:230,cpy:575},
];

export const LEAVES = [
  {x:145,y:405,ang: .66,sz:60,flip: 1},
  {x:315,y:418,ang:-.72,sz:56,flip:-1},
  {x:80, y:436,ang: .93,sz:50,flip: 1},
  {x:375,y:430,ang:-.96,sz:48,flip:-1},
  {x:188,y:456,ang: .22,sz:44,flip: 1},
  {x:270,y:460,ang:-.28,sz:42,flip:-1},
  {x:46, y:364,ang:1.12,sz:38,flip: 1},
  {x:412,y:358,ang:-1.16,sz:36,flip:-1},
  {x:228,y:410,ang: .08,sz:40,flip: 1},
];

export const FSEEDS = FLOWERS.map((_, i) => i * 3.7 + 1.1);

export const GRASS_L = Array.from({length: 24}, (_, i) => {
  const t = i / 24;
  return {x: 230-(28+t*148), h: 20+Math.sin(i*1.8)*9, w: 3+i%3, ang: -(0.06+t*0.30)};
});
export const GRASS_R = Array.from({length: 24}, (_, i) => {
  const t = i / 24;
  return {x: 230+(28+t*148), h: 20+Math.sin(i*2.1)*9, w: 3+i%3, ang: 0.06+t*0.30};
});

export const TOTAL_DUR = 6.8;
export const STEM_OFF  = [.00,.01,.02,.03, .04,.06,.05, .10,.11,.13,.12, .17,.16,.19];
export const STEM_EACH = 0.11;
export const BOFF = STEM_OFF.map(so => so + STEM_EACH + 0.02);
export const BDUR = [.24,.24,.26,.26, .28,.30,.26, .32,.30,.28,.26, .36,.38,.32];

export const BOKEH = Array.from({length: 32}, () => ({
  x: Math.random() * VW,
  y: Math.random() * VH * .72,
  r: Math.random() * 42 + 10,
  alpha: Math.random() * .07 + .018,
  spd: Math.random() * .28 + .08,
  phase: Math.random() * Math.PI * 2,
  col: Math.random() > .5
    ? (NIGHT ? '80,135,255' : '90,150,255')
    : (NIGHT ? '120,125,255' : '130,150,255'),
}));
