/* =====================================================================
   AURRA GREEN · LIVE 3D WALKTHROUGH  (three.js r160, ES module)
   The flat is rebuilt from the brochure's typical floor plan (walls traced in % of
   img/typical3d.webp, 21.3 m × 18.9 m). Furniture, materials and the exterior are
   modelled procedurally. Flat B (x02) is the mirror image of Flat A (x01).
   ===================================================================== */
let THREE, RoomEnvironment, RoundedBoxGeometry;

const PW = 21.3, PH = 18.9, WALL_H = 3.0, EYE = 1.55, FTF = 3.2, GROUND_H = 3.6;
const X = x => (x - 50) / 100 * PW, Z = y => (y - 50) / 100 * PH;
const MX = (x, sd) => sd === 'A' ? x : 100 - x;

/* ---------------- plan data (Flat A, % of plan image) ---------------- */
// [type, x1,y1,x2,y2, thickness, ext]  w wall · win window · gd glass door · d door · low parapet
const WALLS_A = [
  ['low', 4, 3.8, 23.2, 3.8, .14, 1],
  ['w', 4, 9, 7, 9, .22, 1], ['gd', 7, 9, 19, 9, .22, 1], ['w', 19, 9, 23.2, 9, .22, 1],
  ['w', 23.2, 3.8, 31.2, 3.8, .22, 1],
  ['w', 31.2, 2.8, 33, 2.8, .22, 1], ['win', 33, 2.8, 47, 2.8, .22, 1], ['w', 47, 2.8, 49.6, 2.8, .22, 1],
  ['w', 4.3, 9, 4.3, 27, .22, 1], ['win', 4.3, 27, 4.3, 31.6, .22, 1], ['w', 4.3, 31.6, 4.3, 35, .22, 1],
  ['w', 2.6, 35, 2.6, 38, .22, 1], ['win', 2.6, 38, 2.6, 52, .22, 1], ['w', 2.6, 52, 2.6, 56.5, .22, 1],
  ['win', 2.6, 56.5, 2.6, 61.5, .22, 1], ['w', 2.6, 61.5, 2.6, 83, .22, 1], ['win', 2.6, 83, 2.6, 90, .22, 1], ['w', 2.6, 90, 2.6, 92.5, .22, 1],
  ['w', 2.6, 92.5, 5, 92.5, .22, 1], ['win', 5, 92.5, 12, 92.5, .22, 1], ['w', 12, 92.5, 21.3, 92.5, .22, 1],
  ['w', 21.3, 83.5, 24, 83.5, .16, 0], ['gd', 24, 83.5, 38, 83.5, .16, 0], ['w', 38, 83.5, 40.4, 83.5, .16, 0],
  ['low', 21.3, 95.5, 40.4, 95.5, .14, 1], ['low', 21.3, 92.5, 21.3, 95.5, .14, 1],
  ['w', 40.4, 49.5, 40.4, 51.5, .2, 0], ['d', 40.4, 51.5, 40.4, 56.5, .2, 0, 'main'], ['w', 40.4, 56.5, 40.4, 95.5, .2, 0],
  ['w', 23.2, 3.8, 23.2, 19], ['d', 23.2, 19, 23.2, 23], ['w', 23.2, 23, 23.2, 29.5], ['d', 23.2, 29.5, 23.2, 34.5],
  ['w', 23.2, 16.5, 31.2, 16.5], ['w', 23.2, 30, 31.2, 30],
  ['w', 31.2, 3.8, 31.2, 8], ['d', 31.2, 8, 31.2, 12], ['w', 31.2, 12, 31.2, 30.5],
  ['w', 31.2, 30.5, 32, 30.5], ['d', 32, 30.5, 35.5, 30.5], ['w', 35.5, 30.5, 49.6, 30.5],
  ['w', 4.3, 34.5, 23.2, 34.5],
  ['w', 9.8, 35, 9.8, 47], ['d', 9.8, 47, 9.8, 53],
  ['w', 2.6, 55, 15.5, 55], ['w', 15.5, 55, 15.5, 58.5], ['d', 15.5, 58.5, 15.5, 62.5], ['w', 15.5, 62.5, 15.5, 63.5],
  ['w', 2.6, 63.5, 21.3, 63.5], ['d', 21.3, 63.5, 21.3, 68], ['w', 21.3, 68, 21.3, 92.5],
];
const WALLS_SHARED = [
  ['w', 49.6, 2.8, 49.6, 38, .2], ['w', 50.4, 2.8, 50.4, 38, .2],
  ['w', 40.4, 38, 59.6, 38, .2], ['w', 40.4, 49.5, 59.6, 49.5, .2], ['w', 40.4, 38, 40.4, 49.5, .2], ['w', 59.6, 38, 59.6, 49.5, .2], ['w', 50, 38, 50, 49.5, .2],
  ['w', 40.4, 30.5, 40.4, 38, .2], ['w', 59.6, 30.5, 59.6, 38, .2],
  ['w', 40.4, 95.5, 46, 95.5, .25, 1], ['win', 46, 95.5, 54, 95.5, .25, 1], ['w', 54, 95.5, 59.6, 95.5, .25, 1],
  ['w', 50.4, 2.8, 49.6, 2.8, .25, 1],
];
// floor finishes [x0,y0,x1,y1,material]
const FLOORS_A = [
  [4.3, 9, 23.2, 34.5, 'oak'], [31.2, 2.8, 49.6, 30.5, 'walnut'], [2.6, 63.5, 21.3, 92.5, 'oak'],
  [23.2, 3.8, 31.2, 30, 'bath'], [2.6, 55, 15.5, 63.5, 'bath'], [2.6, 35, 9.8, 55, 'stone'],
  [4, 3.8, 23.2, 9, 'deck'], [21.3, 83.5, 40.4, 95.5, 'deck'],
];
const DOORS = { '23.2,29.5': ['b', -1], '23.2,19': ['a', 1], '31.2,8': ['a', -1], '32,30.5': ['a', -1], '9.8,47': ['a', -1], '15.5,58.5': ['b', -1], '21.3,63.5': ['a', -1], '40.4,51.5': ['a', 1] };
const ROOMS3D = {
  drawing: { p: [33.5, 81.6], t: [25, 64], cap: 'The hall' },
  living: { p: [38.6, 59.5], t: [23.5, 40], cap: 'Living & dining' },
  kitchen: { p: [26.5, 50.5], t: [12, 38.5], cap: 'The kitchen' },
  bed1: { p: [21.4, 31.6], t: [8, 18], cap: 'The master bedroom' },
  bed2: { p: [33.7, 27.4], t: [45.5, 11], cap: 'Bedroom two' },
  bed3: { p: [19.6, 67], t: [5, 82], cap: 'Bedroom three' },
  toilets: { p: [19.8, 21.2], t: [30, 22.5], cap: 'The attached bathroom' },
  toilet3: { p: [14.6, 60.5], t: [4, 57.5], cap: 'The common bathroom' },
  balcony: { p: [31, 86.2], t: [31, 104], cap: 'The balcony' },
};
const NODES = {
  out3: [31, 205, 4.2], out2: [31, 150, 2.6], out1: [31, 110, 1.7],
  balcony: ROOMS3D.balcony.p, door_b: [31, 83.5], drawing: ROOMS3D.drawing.p, hall_c: [30, 71], hall_w: [23.6, 66],
  hub: [30, 53], living: ROOMS3D.living.p, kitchen: ROOMS3D.kitchen.p, living_n: [27.5, 38.5],
  pass: [18.2, 60.5], d_t3: [15.5, 60.5], toilet3: ROOMS3D.toilet3.p,
  d_bed3: [21.3, 65.8], bed3: ROOMS3D.bed3.p,
  d_bed1: [23.2, 32], bed1: ROOMS3D.bed1.p, toilets: ROOMS3D.toilets.p,
  d_bed2: [33.7, 30.5], bed2: ROOMS3D.bed2.p,
};
const EDGES = [
  ['out3', 'out2'], ['out2', 'out1'], ['out1', 'balcony'], ['balcony', 'door_b'], ['door_b', 'drawing'],
  ['drawing', 'hall_c'], ['hall_c', 'hub'], ['hall_c', 'hall_w'], ['hall_w', 'd_bed3'], ['d_bed3', 'bed3'],
  ['hub', 'living'], ['hub', 'kitchen'], ['hub', 'pass'], ['pass', 'd_t3'], ['d_t3', 'toilet3'],
  ['hub', 'living_n'], ['living_n', 'kitchen'], ['living_n', 'd_bed1'], ['d_bed1', 'bed1'], ['bed1', 'toilets'],
  ['living_n', 'd_bed2'], ['d_bed2', 'bed2'], ['living', 'hub'],
];
const TAGS = [
  ['drawing', 'Hall', 30, 72, 1.8], ['living', 'Living & dining', 32, 46, 2.0], ['kitchen', 'Kitchen', 17, 42, 1.9],
  ['bed1', 'Master bedroom', 23.2, 32, 2.0], ['bed2', 'Bedroom 2', 33.7, 30.5, 2.0], ['bed3', 'Bedroom 3', 21.3, 65.8, 2.0],
  ['toilets', 'Bathroom', 23.2, 21, 1.95], ['toilet3', 'Bathroom', 15.5, 60.5, 1.95], ['balcony', 'Balcony', 31, 88.5, 1.4],
];

/* ---------------- runtime state ---------------- */
let renderer, scene, cam, clock, ready = false, running = false, loading = null;
let side = 'A', level = 3, curNode = null, curRoom = null, mode = 'walk';
let worldGroup, flatGroups = {}, extGroup, ceilingGroup, upperGroup, roomLights = [], occluders = [], tagEls = [];
const st = { tgt: null, yaw: 0, pitch: 0, fly: null, drag: null, t0: 0, frameN: 0 };
const lowPower = matchMedia('(max-width: 900px)').matches || (navigator.hardwareConcurrency || 4) <= 4;

/* ---------------- helpers ---------------- */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function ctex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
const TX = {};
function makeTextures() {
  const wood = (base, seed, cols = 7) => (g, w, h) => {
    const r = rng(seed), pw = w / cols; g.fillStyle = `hsl(${base[0]},${base[1]}%,${base[2]}%)`; g.fillRect(0, 0, w, h);
    for (let i = 0; i < cols; i++) {
      let y = -r() * h * .6;
      while (y < h) {
        const len = h * (.32 + r() * .45), l = base[2] + (r() - .5) * 9;
        g.fillStyle = `hsl(${base[0] + (r() - .5) * 5},${base[1] + (r() - .5) * 8}%,${l}%)`; g.fillRect(i * pw, y, pw, len);
        for (let k = 0; k < 18; k++) {
          g.globalAlpha = .05 + r() * .09; g.strokeStyle = r() < .6 ? '#2a160a' : '#fff1dd'; g.lineWidth = .5 + r() * 1.4; g.beginPath();
          const x0 = i * pw + r() * pw; g.moveTo(x0, y); for (let s = 1; s <= 10; s++) g.lineTo(x0 + Math.sin(s * .8 + k) * 2.4 * r(), y + len * s / 10); g.stroke();
        }
        g.globalAlpha = 1; g.fillStyle = 'rgba(30,15,5,.45)'; g.fillRect(i * pw, y, pw, 2); g.fillRect(i * pw, y, 1.5, len);
        y += len;
      }
    }
  };
  TX.oak = ctex(1024, 1024, wood([32, 42, 56], 11)); TX.oak.repeat.set(1 / 1.4, 1 / 1.4);
  TX.walnut = ctex(1024, 1024, wood([24, 38, 38], 12)); TX.walnut.repeat.set(1 / 1.4, 1 / 1.4);
  TX.deck = ctex(1024, 1024, wood([22, 34, 33], 13, 9));
  TX.lam = ctex(512, 1024, wood([30, 30, 62], 14, 3));
  TX.darkwood = ctex(512, 512, wood([20, 30, 26], 15, 4));
  const marble = (base, cloud, vein, veins, grid, grout, seed) => (g, w, h) => {
    const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const x = r() * w, y = r() * h, rad = 40 + r() * 170, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, cloud); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    g.strokeStyle = vein;
    for (let i = 0; i < veins; i++) { g.globalAlpha = .18 + r() * .35; g.lineWidth = .4 + r() * 1.5; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let s = 0; s < 46; s++) { x += (r() - .35) * 16; y += (r() - .5) * 16; g.lineTo(x, y); } g.stroke(); }
    g.globalAlpha = 1;
    if (grid) { g.strokeStyle = grout; g.lineWidth = 2.2; for (let i = 0; i <= grid[0]; i++) { g.beginPath(); g.moveTo(i * w / grid[0], 0); g.lineTo(i * w / grid[0], h); g.stroke(); } for (let i = 0; i <= grid[1]; i++) { g.beginPath(); g.moveTo(0, i * h / grid[1]); g.lineTo(w, i * h / grid[1]); g.stroke(); } }
  };
  TX.tile = ctex(1024, 1024, marble('#f0ebe4', 'rgba(226,218,208,.07)', '#c2b6a8', 16, [2, 1], 'rgba(165,150,136,.5)', 21)); TX.tile.repeat.set(1 / 1.2, 1 / 1.2);
  TX.bath = ctex(1024, 1024, marble('#8f8c87', 'rgba(110,108,104,.12)', '#d0ccc5', 14, [2, 2], 'rgba(55,53,50,.6)', 22)); TX.bath.repeat.set(1 / 1.2, 1 / 1.2);
  TX.bathwall = ctex(1024, 1024, marble('#eae6df', 'rgba(210,202,192,.06)', '#c4b8aa', 10, [2, 4], 'rgba(150,140,128,.55)', 23));
  TX.stone = ctex(512, 512, marble('#8d8a84', 'rgba(70,68,64,.4)', '#bdb9b1', 8, [2, 2], 'rgba(50,48,45,.6)', 24));
  TX.granite = ctex(512, 512, (g, w, h) => { const r = rng(31); g.fillStyle = '#1d1b1a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 30 + r() * 90; g.fillStyle = `rgba(${v},${v * .95},${v * .9},${.3 + r() * .5})`; g.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5); } });
  TX.fabric = ctex(256, 256, (g, w, h) => { const r = rng(41); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(0,0,0,${.03 + r() * .05})`; g.fillRect(0, y, w, 1); } for (let x = 0; x < w; x += 2) { g.fillStyle = `rgba(0,0,0,${.02 + r() * .04})`; g.fillRect(x, 0, 1, h); } for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${r() * .06})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); } });
  TX.fabric.repeat.set(3, 3);
  TX.paint = ctex(256, 256, (g, w, h) => { const r = rng(42); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${r() * .025})`; g.fillRect(r() * w, r() * h, 2, 2); } });
  TX.paint.repeat.set(2, 2);
  TX.brick = ctex(512, 512, (g, w, h) => {
    const r = rng(51); g.fillStyle = '#c9b8a6'; g.fillRect(0, 0, w, h); const bh = h / 16, bw = w / 4;
    for (let row = 0; row < 16; row++) for (let i = -1; i < 5; i++) { const x = i * bw + (row % 2 ? bw / 2 : 0) + 2, y = row * bh + 2, l = 30 + r() * 12; g.fillStyle = `hsl(${10 + r() * 8},${48 + r() * 12}%,${l}%)`; g.fillRect(x, y, bw - 4, bh - 4); }
  });
  TX.plaster = ctex(512, 512, (g, w, h) => { const r = rng(52); g.fillStyle = '#8b8074'; g.fillRect(0, 0, w, h); for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},${r() * .05})`; g.fillRect(r() * w, r() * h, 2, 2); } });
  const rug = (bg, c1, c2, c3, seed) => (g, w, h) => {
    const r = rng(seed); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = c1; g.lineWidth = 14; g.strokeRect(22, 22, w - 44, h - 44); g.lineWidth = 3; g.strokeRect(46, 46, w - 92, h - 92);
    for (let i = 0; i < 9; i++) { g.fillStyle = [c1, c2, c3][i % 3]; g.globalAlpha = .7; g.beginPath(); const cx = 90 + r() * (w - 180), cy = 90 + r() * (h - 180), s = 30 + r() * 70; g.moveTo(cx, cy - s); g.lineTo(cx + s, cy); g.lineTo(cx, cy + s); g.lineTo(cx - s, cy); g.fill(); }
    g.globalAlpha = 1; for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${r() * .07})`; g.fillRect(r() * w, r() * h, 2, 2); }
  };
  TX.rug1 = ctex(512, 512, rug('#d8c7ae', '#8c4a2f', '#2f5d62', '#d49a3a', 61));
  TX.rug2 = ctex(512, 512, rug('#c9cfc4', '#43614f', '#b5654a', '#e3c27a', 62));
  TX.rug3 = ctex(512, 512, rug('#2f3a4a', '#d8b26a', '#b46a55', '#e8dccb', 63));
  const art = (bg, cols, seed) => (g, w, h) => {
    const r = rng(seed); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) { g.fillStyle = cols[i % cols.length]; g.globalAlpha = .85; g.beginPath(); if (r() < .5) g.arc(r() * w, r() * h, 30 + r() * 110, 0, Math.PI * (1 + r())); else g.fillRect(r() * w * .8, r() * h * .8, 40 + r() * 160, 20 + r() * 120); g.fill(); }
    g.globalAlpha = 1; g.strokeStyle = '#1d1a18'; g.lineWidth = 3; g.beginPath(); g.moveTo(r() * w, 0); g.bezierCurveTo(r() * w, h * .4, r() * w, h * .6, r() * w, h); g.stroke();
  };
  TX.art = [ctex(512, 340, art('#efe6d8', ['#c4623f', '#e0a63c', '#2f6563', '#1f2b3a'], 71)), ctex(512, 340, art('#20303a', ['#d89f5c', '#e9dcc6', '#8fb3a5', '#b7553f'], 72)),
    ctex(340, 512, art('#e8dfd2', ['#7f8f6a', '#c9845c', '#3d4b5c', '#e2c48a'], 73)), ctex(512, 340, art('#d9c3a5', ['#6d3b2a', '#2c4a45', '#efe4d2', '#c58b4b'], 74))];
  const facade = (south) => (g, w, h) => {
    const r = rng(south ? 81 : 82); g.fillStyle = '#93887c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#4b4541'; g.fillRect(0, 0, w, h * .07);
    const bays = south ? [[.02, .21, 'bed'], [.213, .40, 'bal'], [.404, .596, 'core'], [.6, .787, 'bal'], [.79, .98, 'bed']] : [[.04, .3, 'win'], [.36, .64, 'core'], [.7, .96, 'win']];
    bays.forEach(([a, b, t]) => {
      const x0 = a * w, x1 = b * w;
      if (t === 'bal') {
        const gr = g.createLinearGradient(0, h * .1, 0, h); gr.addColorStop(0, '#3a2c22'); gr.addColorStop(1, '#a8743f'); g.fillStyle = gr; g.fillRect(x0 + 6, h * .1, x1 - x0 - 12, h * .9);
        g.fillStyle = 'rgba(255,214,150,.55)'; g.fillRect(x0 + (x1 - x0) * .12, h * .2, (x1 - x0) * .76, h * .5);
        g.fillStyle = '#2d2a28'; g.fillRect(x0 + 6, h * .66, x1 - x0 - 12, h * .34);
        g.fillStyle = '#3d6b35'; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(x0 + 10 + r() * (x1 - x0 - 20), h * .66, 6 + r() * 10, 0, Math.PI * 2); g.fill(); }
      } else if (t === 'bed' || t === 'win') {
        g.fillStyle = '#8a4a36'; g.fillRect(x0, h * .1, x1 - x0, h * .9);
        for (let row = 0; row < 14; row++) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x0, h * .1 + row * h * .9 / 14, x1 - x0, 1.5); }
        const wx = x0 + (x1 - x0) * .25, ww = (x1 - x0) * .5; g.fillStyle = '#2b2a2a'; g.fillRect(wx - 4, h * .26, ww + 8, h * .5);
        const gr = g.createLinearGradient(0, h * .28, 0, h * .74); gr.addColorStop(0, r() < .5 ? '#f3c98d' : '#6c7a8a'); gr.addColorStop(1, '#2c3036'); g.fillStyle = gr; g.fillRect(wx, h * .28, ww, h * .46);
        g.fillStyle = '#1e1e1e'; g.fillRect(wx, h * .55, ww, 3);
      } else { g.fillStyle = '#3b3633'; g.fillRect(x0 + 10, h * .1, x1 - x0 - 20, h * .9); g.fillStyle = 'rgba(255,220,170,.35)'; g.fillRect(x0 + (x1 - x0) * .4, h * .25, (x1 - x0) * .2, h * .6); }
    });
  };
  TX.facS = ctex(1024, 160, facade(true)); TX.facS.wrapS = THREE.ClampToEdgeWrapping;
  TX.facN = ctex(1024, 160, facade(false));
  TX.city = ctex(64, 128, (g, w, h) => { const r = rng(91); g.fillStyle = '#6f675e'; g.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 10) for (let x = 4; x < w; x += 10) { g.fillStyle = r() < .35 ? `rgba(255,${190 + r() * 40 | 0},120,.9)` : 'rgba(30,32,38,.85)'; g.fillRect(x, y, 6, 6); } });
  TX.sky = ctex(32, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#26406f'); gr.addColorStop(.32, '#6f7fa4'); gr.addColorStop(.44, '#e0a183'); gr.addColorStop(.5, '#f7c88f'); gr.addColorStop(.51, '#a79a86'); gr.addColorStop(1, '#3a3b33'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
}

/* ---------------- materials ---------------- */
const MT = {};
function makeMaterials() {
  const S = (o) => new THREE.MeshStandardMaterial(Object.assign({ envMapIntensity: .55 }, o));
  const tileMat = (tex, rough = .3) => S({ map: tex, roughness: rough });
  MT.paint = S({ color: 0xf2ece4, roughness: .92, map: TX.paint });
  MT.ceiling = S({ color: 0xf7f3ee, roughness: 1 });
  MT.skirting = S({ color: 0xd8cec2, roughness: .6 });
  MT.oak = tileMat(TX.oak, .55); MT.walnut = tileMat(TX.walnut, .5); MT.deck = tileMat(TX.deck, .8); MT.tile = tileMat(TX.tile, .18);
  MT.bath = tileMat(TX.bath, .25); MT.stone = tileMat(TX.stone, .7); MT.bathwall = tileMat(TX.bathwall, .25);
  MT.lam = S({ map: TX.lam, roughness: .55 }); MT.darkwood = S({ map: TX.darkwood, roughness: .5 });
  MT.walnutF = S({ map: TX.walnut, roughness: .45 }); MT.oakF = S({ map: TX.oak, roughness: .5 });
  MT.white = S({ color: 0xf4f1ec, roughness: .35 }); MT.gloss = S({ color: 0xf6f3ee, roughness: .12, envMapIntensity: .9 });
  MT.black = S({ color: 0x141414, roughness: .25, envMapIntensity: .9 }); MT.metal = S({ color: 0xbfbab3, roughness: .25, metalness: 1, envMapIntensity: 1 });
  MT.brass = S({ color: 0xc89b5a, roughness: .3, metalness: 1, envMapIntensity: 1 }); MT.granite = S({ map: TX.granite, roughness: .15, envMapIntensity: 1 });
  MT.marbleTop = S({ map: TX.tile, roughness: .1, envMapIntensity: 1 });
  MT.glass = new THREE.MeshPhysicalMaterial({ color: 0xd8e6ee, roughness: .03, metalness: 0, transparent: true, opacity: .14, envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false });
  MT.frame = S({ color: 0x2b2b2d, roughness: .45, metalness: .4 });
  MT.doorWood = S({ map: TX.walnut, roughness: .45 }); MT.jamb = S({ color: 0x5b4334, roughness: .5 });
  MT.porcelain = S({ color: 0xffffff, roughness: .12, envMapIntensity: 1 });
  MT.mirror = new THREE.MeshStandardMaterial({ color: 0xdfe6ea, roughness: .02, metalness: 1, envMapIntensity: 1.5 });
  MT.tv = S({ color: 0x08090b, roughness: .08, envMapIntensity: 1.2 });
  const fab = (c, rough = .95) => S({ color: c, map: TX.fabric, roughness: rough, envMapIntensity: .25 });
  MT.sofa = fab(0xd9cbb5); MT.sage = fab(0x8ea08a); MT.terracotta = fab(0xc36b4a); MT.mustard = fab(0xd8a542); MT.teal = fab(0x2f6b6d); MT.navy = fab(0x2d3d5c);
  MT.linen = fab(0xf3efe8); MT.blush = fab(0xd9a79a); MT.grey = fab(0x8d8a87); MT.cream = fab(0xece2d0); MT.olive = fab(0x6e7347); MT.rust = fab(0xa6532f);
  MT.curtain = new THREE.MeshStandardMaterial({ color: 0xf6efe4, roughness: 1, transparent: true, opacity: .72, side: THREE.DoubleSide, envMapIntensity: .2 });
  MT.leaf = S({ color: 0x3f7a3a, roughness: .7, flatShading: true }); MT.leaf2 = S({ color: 0x5c8f45, roughness: .7, flatShading: true });
  MT.pot = S({ color: 0xb8735a, roughness: .8 }); MT.potW = S({ color: 0xece6dc, roughness: .6 }); MT.soil = S({ color: 0x3a2b20, roughness: 1 });
  MT.lampShade = new THREE.MeshStandardMaterial({ color: 0xfff1d8, emissive: 0xffc883, emissiveIntensity: 1.6, roughness: .9, side: THREE.DoubleSide });
  MT.led = new THREE.MeshBasicMaterial({ color: 0xffd9a3 }); MT.downlight = new THREE.MeshBasicMaterial({ color: 0xfff3dd });
  MT.ext = S({ map: TX.plaster, roughness: .95, color: 0xb0a497 }); MT.brick = S({ map: TX.brick, roughness: .9 });
  MT.slab = S({ color: 0x55504b, roughness: .9 }); MT.fin = S({ color: 0x3a3634, roughness: .8 });
  MT.facS = S({ map: TX.facS, roughness: .9 }); MT.facN = S({ map: TX.facN, roughness: .9 });
  MT.rug1 = S({ map: TX.rug1, roughness: 1, envMapIntensity: .2 }); MT.rug2 = S({ map: TX.rug2, roughness: 1, envMapIntensity: .2 }); MT.rug3 = S({ map: TX.rug3, roughness: 1, envMapIntensity: .2 });
  MT.art = TX.art.map(t => S({ map: t, roughness: .7 }));
  MT.dado = S({ map: TX.bathwall, roughness: .2, envMapIntensity: .8 });
}

/* ---------------- primitive builders ---------------- */
function mesh(geo, mat, shadow = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; return m; }
function rbox(w, h, d, mat, r = .02, shadow = true) { r = Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001); return mesh(r > .004 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d), mat, shadow); }
function at(o, x, y, z) { o.position.set(x, y, z); return o; }
function grp(...kids) { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; }
function cyl(rt, rb, h, mat, seg = 24) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); }
// place a local group (front = +z) at plan % position; rot = facing angle (0 = south/+z)
function place(parent, g, xp, yp, rot, sd, y = 0) { g.position.set(X(MX(xp, sd)), y, Z(yp)); g.rotation.y = sd === 'A' ? rot : -rot; parent.add(g); return g; }
const S_ = Math.PI / 2;  // rotations: face east = +S_, west = -S_, north = PI, south = 0

function bed(w, l, head, duvet, throwM, pillowM) {
  const g = grp();
  g.add(at(rbox(w + .12, .28, l + .06, MT.darkwood, .02), 0, .2, 0));
  g.add(at(rbox(w, .24, l - .04, MT.linen, .06), 0, .46, .02));
  g.add(at(rbox(w + .06, .1, l * .66, duvet, .045), 0, .6, l * .17));
  g.add(at(rbox(w + .08, .04, .5, throwM, .02), 0, .66, l * .32));
  [-1, 1].forEach(s => { g.add(at(rbox(w * .42, .16, .42, MT.linen, .07), s * w * .24, .64, -l / 2 + .32)); g.add(at(rbox(w * .36, .14, .34, pillowM, .06), s * w * .2, .72, -l / 2 + .52)); });
  g.add(at(rbox(w + .5, 1.25, .12, head, .04), 0, .7, -l / 2 - .06));
  return g;
}
function nightstand(lampOn = true) {
  const g = grp(at(rbox(.5, .5, .42, MT.walnutF, .015), 0, .28, 0), at(rbox(.46, .02, .02, MT.brass, .005), 0, .4, .215));
  [[-.2, -.16], [.2, -.16], [-.2, .16], [.2, .16]].forEach(([x, z]) => g.add(at(cyl(.012, .012, .04, MT.brass, 8), x, .02, z)));
  if (lampOn) { g.add(at(cyl(.07, .09, .3, MT.potW, 20), 0, .68, 0)); const sh = mesh(new THREE.CylinderGeometry(.13, .17, .22, 24, 1, true), MT.lampShade, false); g.add(at(sh, 0, .92, 0)); }
  return g;
}
function wardrobe(len, h = 2.25, d = .6) {
  const g = grp(at(rbox(len, h, d, MT.lam, .01), 0, h / 2, 0));
  const n = Math.max(2, Math.round(len / .55));
  for (let i = 1; i < n; i++) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(.006, h - .06, .01), MT.frame), -len / 2 + i * len / n, h / 2, d / 2 + .003));
  for (let i = 0; i < n; i++) g.add(at(rbox(.018, .5, .025, MT.brass, .006), -len / 2 + (i + .5) * len / n + (i % 2 ? -1 : 1) * (len / n / 2 - .06), 1.1, d / 2 + .02));
  return g;
}
function sofaL(len, depth, mat, cushMats) {
  const g = grp();
  g.add(at(rbox(len, .4, depth, mat, .05), 0, .24, 0));
  g.add(at(rbox(len, .5, .22, mat, .08), 0, .62, -depth / 2 + .11));
  [-1, 1].forEach(s => g.add(at(rbox(.22, .6, depth, mat, .08), s * (len / 2 - .11), .32, 0)));
  const n = 3; for (let i = 0; i < n; i++) g.add(at(rbox((len - .44) / n - .02, .14, depth - .28, mat, .06), -len / 2 + .22 + (i + .5) * (len - .44) / n, .5, .07));
  cushMats.forEach((m, i) => { const c = rbox(.42, .4, .14, m, .07); c.rotation.x = -.25; g.add(at(c, -len / 2 + .5 + i * (len - 1) / Math.max(1, cushMats.length - 1), .74, -depth / 2 + .3)); });
  g.add(at(rbox(.9, .4, .85, mat, .05), len / 2 - .45 - .22 + .22, .24, depth / 2 + .4));  // chaise
  g.add(at(rbox(.9 - .02, .14, .8, mat, .06), len / 2 - .45, .5, depth / 2 + .4));
  [-1, 1].forEach(s => [-1, 1].forEach(t => g.add(at(cyl(.02, .015, .06, MT.black, 8), s * (len / 2 - .1), .02, t * (depth / 2 - .1)))));
  return g;
}
function armchair(mat, cush) {
  const g = grp(at(rbox(.78, .38, .78, mat, .06), 0, .3, 0), at(rbox(.78, .45, .16, mat, .07), 0, .65, -.31));
  [-1, 1].forEach(s => g.add(at(rbox(.14, .5, .78, mat, .06), s * .32, .4, 0)));
  g.add(at(rbox(.5, .12, .58, mat, .05), 0, .54, .06)); g.add(at(rbox(.36, .32, .12, cush, .06), 0, .7, -.18));
  [-1, 1].forEach(s => [-1, 1].forEach(t => g.add(at(cyl(.018, .012, .12, MT.walnutF, 8), s * .32, .06, t * .32))));
  return g;
}
function coffeeTable() {
  const g = grp(at(cyl(.45, .45, .035, MT.marbleTop, 40), 0, .42, 0), at(cyl(.06, .06, .38, MT.brass, 16), 0, .2, 0), at(cyl(.24, .24, .02, MT.brass, 30), 0, .01, 0));
  g.add(at(rbox(.22, .05, .16, MT.navy, .01), -.12, .46, .05)); g.add(at(cyl(.06, .05, .12, MT.potW, 16), .16, .5, -.06));
  return g;
}
function plant(scale = 1, potMat = MT.pot) {
  const g = grp(at(cyl(.17 * scale, .13 * scale, .38 * scale, potMat, 20), 0, .19 * scale, 0), at(cyl(.155 * scale, .155 * scale, .02, MT.soil, 16), 0, .37 * scale, 0));
  const r = rng(Math.floor(scale * 1000));
  for (let i = 0; i < 9; i++) { const ico = mesh(new THREE.IcosahedronGeometry((.16 + r() * .14) * scale, 0), r() < .5 ? MT.leaf : MT.leaf2); ico.scale.y = 1.3; g.add(at(ico, (r() - .5) * .38 * scale, (.6 + r() * .75) * scale, (r() - .5) * .38 * scale)); }
  g.add(at(cyl(.012, .012, .6 * scale, MT.darkwood, 6), 0, .65 * scale, 0));
  return g;
}
function floorLamp() { const g = grp(at(cyl(.16, .16, .02, MT.black), 0, .01, 0), at(cyl(.012, .012, 1.5, MT.black, 8), 0, .76, 0)); g.add(at(mesh(new THREE.CylinderGeometry(.18, .24, .3, 28, 1, true), MT.lampShade, false), 0, 1.55, 0)); return g; }
function artPiece(w, h, mat) { const g = grp(at(rbox(w + .06, h + .06, .03, MT.black, .004), 0, 0, 0)); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); g.add(at(p, 0, 0, .017)); return g; }
function rug(w, d, mat) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, .012, d), mat); m.receiveShadow = true; m.position.y = .007; return grp(m); }
function curtain(w, h, folds = 7) {
  const geo = new THREE.PlaneGeometry(w, h, folds * 6, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) / w * folds * Math.PI * 2) * .045); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, MT.curtain); m.position.y = h / 2; return grp(m, at(cyl(.012, .012, w + .3, MT.brass, 8), 0, h + .02, 0)).rotateZ(0);
}
function curtainPanel(w, h) { const g = curtain(w, h); g.children[1].rotation.z = Math.PI / 2; return g; }
function diningSet() {
  const g = grp(at(rbox(1.9, .05, .95, MT.walnutF, .015), 0, .75, 0));
  [[-.82, -.36], [.82, -.36], [-.82, .36], [.82, .36]].forEach(([x, z]) => g.add(at(rbox(.06, .72, .06, MT.walnutF, .01), x, .36, z)));
  [-.6, 0, .6].forEach(x => [-1, 1].forEach(s => { const c = chair(s < 0 ? MT.mustard : MT.teal); c.position.set(x, 0, s * .68); c.rotation.y = s < 0 ? 0 : Math.PI; g.add(c); }));
  g.add(at(cyl(.1, .07, .1, MT.potW, 20), 0, .83, 0)); g.add(at(mesh(new THREE.IcosahedronGeometry(.1, 0), MT.leaf2), 0, .93, 0));
  return g;
}
function chair(mat) { const g = grp(at(rbox(.46, .07, .46, mat, .025), 0, .47, 0), at(rbox(.46, .42, .06, mat, .03), 0, .72, -.21)); [[-.19, -.19], [.19, -.19], [-.19, .19], [.19, .19]].forEach(([x, z]) => g.add(at(rbox(.035, .45, .035, MT.walnutF, .008), x, .225, z))); return g; }
function pendant(drop) { const g = grp(at(cyl(.004, .004, drop, MT.black, 4), 0, -drop / 2, 0)); const sh = mesh(new THREE.SphereGeometry(.13, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MT.brass, false); sh.material = MT.brass; g.add(at(sh, 0, -drop - .0, 0)); g.add(at(mesh(new THREE.CircleGeometry(.12, 24), MT.lampShade, false).rotateX(Math.PI / 2), 0, -drop + .001, 0)); return g; }
function tvUnit(len) {
  const g = grp(at(rbox(len, .42, .42, MT.walnutF, .015), 0, .3, 0));
  for (let i = 1; i < 4; i++) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(.006, .36, .01), MT.black), -len / 2 + i * len / 4, .3, .215));
  g.add(at(rbox(1.45, .84, .05, MT.tv, .01), 0, 1.3, -.12)); g.add(at(rbox(1.4, .79, .002, new THREE.MeshBasicMaterial({ color: 0x0c1016 }), .001, false), 0, 1.3, -.094));
  g.add(at(rbox(.6, .06, .18, MT.black, .02), .3, .54, .06)); g.add(at(plant(.5, MT.potW), -len / 2 + .2, .51, 0));
  return g;
}
function slatWall(w, h) { const g = grp(at(rbox(w, h, .03, MT.darkwood, .005), 0, h / 2, 0)); const n = Math.floor(w / .07); for (let i = 0; i < n; i++) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(.035, h, .03), MT.walnutF), -w / 2 + (i + .5) * w / n, h / 2, .03)); return g; }
function desk(len) { const g = grp(at(rbox(len, .04, .55, MT.oakF, .01), 0, .75, 0)); [-1, 1].forEach(s => g.add(at(rbox(.04, .73, .5, MT.black, .005), s * (len / 2 - .04), .365, 0))); g.add(at(rbox(.36, .24, .02, MT.black, .005), 0, .95, -.15)); return g; }
function dresser(len) { const g = grp(at(rbox(len, .78, .45, MT.walnutF, .015), 0, .41, 0)); for (let i = 0; i < 3; i++) g.add(at(rbox(len - .06, .006, .01, MT.black, .002), 0, .2 + i * .22, .228)); return g; }
function wc() { const g = grp(at(rbox(.38, .4, .55, MT.porcelain, .12), 0, .2, .05), at(rbox(.42, .06, .5, MT.porcelain, .03), 0, .42, .05), at(rbox(.45, .55, .12, MT.white, .02), 0, .85, -.25)); return g; }
function vanity() { const g = grp(at(rbox(.9, .45, .48, MT.walnutF, .01), 0, .62, 0), at(rbox(.92, .03, .5, MT.marbleTop, .005), 0, .86, 0), at(cyl(.2, .16, .1, MT.porcelain, 28), 0, .92, .02), at(cyl(.012, .012, .2, MT.metal, 8), 0, 1.0, -.18)); g.add(at(rbox(.7, .9, .02, MT.mirror, .005), 0, 1.6, -.23)); return g; }
function showerScreen(w) { const g = grp(at(new THREE.Mesh(new THREE.BoxGeometry(w, 2.0, .01), MT.glass), 0, 1.0, 0), at(rbox(w, .02, .03, MT.metal, .005), 0, 2.0, 0)); return g; }
function fridge() { const g = grp(at(rbox(.82, 1.85, .72, MT.metal, .02), 0, .925, 0), at(rbox(.004, 1.7, .01, MT.black, .001), 0, .95, .365)); [-1, 1].forEach(s => g.add(at(rbox(.02, .6, .03, MT.black, .006), s * .06, 1.15, .38))); return g; }
function washer() { const g = grp(at(rbox(.6, .85, .6, MT.white, .02), 0, .425, 0)); const d = mesh(new THREE.TorusGeometry(.17, .03, 10, 30), MT.metal); g.add(at(d, 0, .45, .3)); g.add(at(mesh(new THREE.CircleGeometry(.16, 30), MT.glass), 0, .45, .302)); return g; }
function loungeChair(mat) { const g = grp(at(rbox(.7, .1, .7, MT.darkwood, .02), 0, .36, 0), at(rbox(.7, .55, .08, MT.darkwood, .02), 0, .6, -.3), at(rbox(.62, .1, .62, mat, .04), 0, .45, .02)); [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]].forEach(([x, z]) => g.add(at(rbox(.04, .36, .04, MT.darkwood, .01), x, .18, z))); return g; }
function sideTable() { return grp(at(cyl(.25, .25, .03, MT.walnutF, 28), 0, .5, 0), at(cyl(.02, .02, .5, MT.black, 8), 0, .25, 0), at(cyl(.15, .15, .015, MT.black, 20), 0, .008, 0)); }
function planter(len) { const g = grp(at(rbox(len, .42, .32, MT.fin, .02), 0, .21, 0)); const r = rng(len * 100 | 0); for (let i = 0; i < len * 6; i++) { const b = mesh(new THREE.IcosahedronGeometry(.1 + r() * .1, 0), r() < .5 ? MT.leaf : MT.leaf2); g.add(at(b, -len / 2 + .1 + r() * (len - .2), .48 + r() * .18, (r() - .5) * .18)); } return g; }

/* ---------------- architecture ---------------- */
function segBox(parent, x1, y1, x2, y2, h0, h1, th, mat, opts = {}) {
  const vert = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  const a = vert ? Z(Math.min(y1, y2)) : X(Math.min(x1, x2)), b = vert ? Z(Math.max(y1, y2)) : X(Math.max(x1, x2));
  const len = b - a + (opts.noOverlap ? 0 : th * .6); if (len <= 0 || h1 <= h0) return null;
  const m = mesh(new THREE.BoxGeometry(vert ? th : len, h1 - h0, vert ? len : th), mat, opts.shadow !== false);
  m.position.set(vert ? X(x1) : (a + b) / 2, (h0 + h1) / 2, vert ? (a + b) / 2 : Z(y1)); parent.add(m);
  if (opts.occ) occluders.push(m);
  return m;
}
// outward normal of an exterior segment relative to the flat centre
function outward(x1, y1, x2, y2, sd) { const vert = Math.abs(x2 - x1) < Math.abs(y2 - y1); const cx = MX(25, sd), cy = 50; return vert ? [Math.sign(x1 - cx), 0] : [0, Math.sign(y1 - cy)]; }
function cladding(parent, x1, y1, x2, y2, h0, h1, th, sd, brick) {
  const [nx, nz] = outward(x1, y1, x2, y2, sd); const vert = nz === 0;
  const a = vert ? Z(Math.min(y1, y2)) : X(Math.min(x1, x2)), b = vert ? Z(Math.max(y1, y2)) : X(Math.max(x1, x2));
  const mat = brick ? MT.brick : MT.ext; const len = b - a + th * .6;
  const m = mesh(new THREE.BoxGeometry(vert ? .03 : len, h1 - h0, vert ? len : .03), mat);
  m.position.set(vert ? X(x1) + nx * (th / 2 + .016) : (a + b) / 2, (h0 + h1) / 2, vert ? (a + b) / 2 : Z(y1) + nz * (th / 2 + .016));
  if (brick) { const t = mat.map; m.material = mat.clone(); m.material.map = t.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(len / 1.6, (h1 - h0) / 1.6); }
  parent.add(m);
}
function buildWalls(parent, list, sd) {
  list.forEach(([t, x1, y1, x2, y2, th, ext, kind]) => {
    x1 = MX(x1, sd); x2 = MX(x2, sd); th = th || .12;
    const vert = Math.abs(x2 - x1) < Math.abs(y2 - y1), O = { occ: true };
    if (t === 'w') {
      segBox(parent, x1, y1, x2, y2, 0, WALL_H, th, MT.paint, O);
      segBox(parent, x1, y1, x2, y2, 0, .09, th + .024, MT.skirting, { shadow: false, noOverlap: true });
      if (ext) cladding(parent, x1, y1, x2, y2, -.2, WALL_H + .2, th, sd, (Math.abs(y1 - 92.5) < .1 && x1 < 50 + 30 && sd) || (vert && Math.abs(MX(x1, sd) - 2.6) < .1));
    }
    if (t === 'low') { segBox(parent, x1, y1, x2, y2, 0, 1.0, th, MT.ext, O); segBox(parent, x1, y1, x2, y2, 1.0, 1.04, th + .05, MT.fin); segBox(parent, x1, y1, x2, y2, 1.04, 1.12, .012, MT.glass, { shadow: false }); }
    if (t === 'd') {
      segBox(parent, x1, y1, x2, y2, 2.15, WALL_H, th, MT.paint, O);
      // jambs + head
      const a = vert ? Z(Math.min(y1, y2)) : X(Math.min(x1, x2)), b = vert ? Z(Math.max(y1, y2)) : X(Math.max(x1, x2));
      const L = b - a, cxw = vert ? X(x1) : (a + b) / 2, czw = vert ? (a + b) / 2 : Z(y1);
      [a + .03, b - .03].forEach(p => { const j = mesh(new THREE.BoxGeometry(vert ? th + .04 : .06, 2.15, vert ? .06 : th + .04), MT.jamb); j.position.set(vert ? cxw : p, 1.075, vert ? p : czw); parent.add(j); });
      const hd = mesh(new THREE.BoxGeometry(vert ? th + .04 : L, .06, vert ? L : th + .04), MT.jamb); hd.position.set(cxw, 2.15, czw); parent.add(hd);
      // open door leaf, hinged at the "a" end and swung 90°
      const lw = Math.min(L - .1, kind === 'main' ? 1.05 : .9); const leaf = new THREE.Group();
      const cfg = DOORS[[MX(x1, sd), y1].join(',')] || ['a', 1]; const hingeAt = cfg[0] === 'a' ? a + .05 : b - .05; let sgnN = cfg[1]; if (vert && sd === 'B') sgnN = -sgnN;
      const slab = rbox(lw, 2.08, .045, kind === 'main' ? MT.darkwood : MT.doorWood, .006); slab.position.set(lw / 2, 1.04, 0); leaf.add(slab);
      leaf.add(at(rbox(.14, .02, .03, MT.brass, .006), lw - .1, 1.0, .04));
      if (vert) { leaf.position.set(cxw, 0, hingeAt); leaf.rotation.y = sgnN > 0 ? 0 : Math.PI; }
      else { leaf.position.set(hingeAt, 0, czw); leaf.rotation.y = sgnN > 0 ? -S_ : S_; }
      parent.add(leaf);
    }
    if (t === 'win') {
      segBox(parent, x1, y1, x2, y2, 0, .9, th, MT.paint, O); segBox(parent, x1, y1, x2, y2, 2.2, WALL_H, th, MT.paint, O);
      segBox(parent, x1, y1, x2, y2, .88, .92, th + .06, MT.marbleTop, { shadow: false });
      segBox(parent, x1, y1, x2, y2, .92, 2.2, .02, MT.glass, { shadow: false });
      segBox(parent, x1, y1, x2, y2, 2.17, 2.21, .07, MT.frame, { shadow: false });
      const vertical = vert; const a = vertical ? Math.min(y1, y2) : Math.min(x1, x2), b = vertical ? Math.max(y1, y2) : Math.max(x1, x2); const n = Math.max(1, Math.round((b - a) * (vertical ? .189 : .213) / 1.1));
      for (let i = 0; i <= n; i++) { const p = a + (b - a) * i / n; if (vertical) segBox(parent, x1, p - .15, x1, p + .15, .92, 2.17, .06, MT.frame, { shadow: false, noOverlap: true }); else segBox(parent, p - .15, y1, p + .15, y1, .92, 2.17, .06, MT.frame, { shadow: false, noOverlap: true }); }
      if (ext) { cladding(parent, x1, y1, x2, y2, -.2, .9, th, sd, false); cladding(parent, x1, y1, x2, y2, 2.2, WALL_H + .2, th, sd, false); }
    }
    if (t === 'gd') {
      segBox(parent, x1, y1, x2, y2, 2.4, WALL_H, th, MT.paint, O);
      segBox(parent, x1, y1, x2, y2, .02, 2.4, .02, MT.glass, { shadow: false });
      segBox(parent, x1, y1, x2, y2, 2.37, 2.42, .08, MT.frame, { shadow: false }); segBox(parent, x1, y1, x2, y2, 0, .03, .08, MT.frame, { shadow: false });
      const a = vert ? Math.min(y1, y2) : Math.min(x1, x2), b = vert ? Math.max(y1, y2) : Math.max(x1, x2); const n = Math.max(3, Math.ceil((b - a) * .213 / 1.2)) | 1;
      for (let i = 0; i <= n; i++) { const p = a + (b - a) * i / n; segBox(parent, p - .2, y1, p + .2, y1, .03, 2.37, .06, MT.frame, { shadow: false, noOverlap: true }); }
      if (ext) cladding(parent, x1, y1, x2, y2, 2.4, WALL_H + .2, th, sd, false);
    }
  });
}
function floorRect(parent, x0, y0, x1, y1, matName, sd, y = .003) {
  const a = MX(x0, sd), b = MX(x1, sd); const xa = Math.min(a, b), xb = Math.max(a, b);
  const w = X(xb) - X(xa), d = Z(y1) - Z(y0);
  const geo = new THREE.PlaneGeometry(w, d); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * d);
  const m = new THREE.Mesh(geo, MT[matName]); m.rotation.x = -S_; m.position.set((X(xa) + X(xb)) / 2, y, (Z(y0) + Z(y1)) / 2); m.receiveShadow = true; parent.add(m); return m;
}
function tilePanel(parent, x1, y1, x2, y2, h0, h1, inset, mat, sd, facing) {
  // thin tiled panel in front of a wall; facing: direction (dx,dz) into the room
  const vert = Math.abs(MX(x2, sd) - MX(x1, sd)) < Math.abs(y2 - y1); x1 = MX(x1, sd); x2 = MX(x2, sd);
  const a = vert ? Z(Math.min(y1, y2)) : X(Math.min(x1, x2)), b = vert ? Z(Math.max(y1, y2)) : X(Math.max(x1, x2)); const L = b - a;
  const geo = new THREE.BoxGeometry(vert ? .01 : L, h1 - h0, vert ? L : .01);
  const m = new THREE.Mesh(geo, mat.clone()); m.material.map = mat.map.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(L / 1.2, (h1 - h0) / 1.2); m.receiveShadow = true;
  const f = sd === 'A' ? facing : [-facing[0], facing[1]];
  m.position.set(vert ? X(x1) + f[0] * inset : (a + b) / 2, (h0 + h1) / 2, vert ? (a + b) / 2 : Z(y1) + f[1] * inset); parent.add(m);
}

/* ---------------- furnish one flat ---------------- */
function furnish(g, sd) {
  const P = (o, x, y, r, yy) => place(g, o, x, y, r, sd, yy);
  const wallX = (xp, off) => xp + (sd === 'A' ? 1 : 1) * off / .213; // % offset helper along +x in plan space
  // ---------- HALL (drawing room) ----------
  P(rug(2.5, 2.1, MT.rug1), 30.5, 73.5, 0);
  P(slatWall(2.7, 2.85), 21.3 + .11 / .213 + .02, 73.3, S_);
  P(tvUnit(2.0), 21.3 + .38 / .213, 73.3, S_);
  P(sofaL(2.6, .95, MT.sofa, [MT.terracotta, MT.mustard, MT.teal, MT.terracotta]), 40.4 - .65 / .213, 73.6, -S_);
  P(armchair(MT.teal, MT.mustard), 26.3, 66.6, .65);
  P(coffeeTable(), 30.6, 73.4, 0);
  P(floorLamp(), 38.9, 66.0, 0);
  P(plant(1.25), 38.4, 81.3, 0); P(plant(.95, MT.potW), 23.1, 81.4, 0);
  P(artPiece(1.3, .85, MT.art[0]), 40.4 - .12 / .213, 73.4, -S_, 1.78);
  // cove ceiling + LEDs
  const cove = grp();
  [[21.6, 64, 40.1, 64.6], [21.6, 82.6, 40.1, 83.2], [21.6, 64, 22.3, 83.2], [39.4, 64, 40.1, 83.2]].forEach(([a, b, c, d]) => {
    const w = X(MX(c, sd)) - X(MX(a, sd)), dd = Z(d) - Z(b); const m = mesh(new THREE.BoxGeometry(Math.abs(w), .18, dd), MT.ceiling, false);
    m.position.set((X(MX(a, sd)) + X(MX(c, sd))) / 2, WALL_H - .09, (Z(b) + Z(d)) / 2); g.add(m);
  });
  [[22.6, 65, 39.1, 65.2], [22.6, 82, 39.1, 82.2], [22.6, 65, 22.8, 82.2], [38.9, 65, 39.1, 82.2]].forEach(([a, b, c, d]) => {
    const w = Math.abs(X(MX(c, sd)) - X(MX(a, sd))), dd = Z(d) - Z(b); const m = new THREE.Mesh(new THREE.BoxGeometry(w, .02, dd), MT.led); m.position.set((X(MX(a, sd)) + X(MX(c, sd))) / 2, WALL_H - .19, (Z(b) + Z(d)) / 2); g.add(m);
  });
  // curtains at the balcony glass door
  P(curtainPanel(1.1, 2.9), 25.2, 83.5 - .2 / .189, 0); P(curtainPanel(1.1, 2.9), 36.9, 83.5 - .2 / .189, 0);
  // ---------- LIVING / DINING ----------
  P(diningSet(), 33.0, 46.2, 0);
  [-.55, 0, .55].forEach(o => P(pendant(.85), 33.0 + o / .213, 46.2, 0, WALL_H));
  P(dresser(1.5), 40.4 - .33 / .213, 43.8, -S_);
  P(artPiece(1.0, 1.4, MT.art[2]), 40.4 - .12 / .213, 43.8, -S_, 1.65);
  P(dresser(1.6), 44.8, 30.5 + .33 / .189, 0); P(artPiece(1.4, .9, MT.art[1]), 44.8, 30.5 + .12 / .189, 0, 1.75);
  P(plant(1.3), 48.3, 35.8, 0); P(plant(1.0, MT.potW), 24.6, 58.6, 0);
  P(rbox(.9, .9, .36, MT.lam, .01), 40.4 - .29 / .213, 59.8, -S_);
  // ---------- KITCHEN ----------
  const kit = grp(); g.add(kit);
  const counter = (x0, y0, x1, y1, h = .88) => {
    const a = X(MX(x0, sd)), b = X(MX(x1, sd)); const xa = Math.min(a, b), xb = Math.max(a, b);
    const w = xb - xa, d = Z(y1) - Z(y0), cx = (xa + xb) / 2, cz = (Z(y0) + Z(y1)) / 2;
    kit.add(at(rbox(w - .02, h - .1, d - .04, MT.white, .01), cx, (h - .1) / 2 + .08, cz));
    kit.add(at(rbox(w - .04, .08, d - .1, MT.darkwood, .005), cx, .04, cz));
    kit.add(at(rbox(w + .02, .04, d + .02, MT.granite, .006), cx, h - .02, cz));
  };
  counter(10, 34.5 + .07 / .189, 25, 34.5 + .7 / .189);
  counter(9.8 + .07 / .213, 34.5 + .7 / .189, 9.8 + .7 / .213, 47);
  counter(10, 55 - .7 / .189, 16.6, 55 - .07 / .189);
  P(fridge(), 19.6, 55 - .45 / .189, Math.PI);
  // hob, hood, sink, uppers, dado
  P(grp(at(rbox(.6, .01, .5, MT.black, .004), 0, .885, 0), ...[[-.15, -.1], [.15, -.1], [-.15, .12], [.15, .12]].map(([x, z]) => at(mesh(new THREE.TorusGeometry(.06, .008, 6, 20).rotateX(S_), MT.metal), x, .892, z))), 18.5, 34.5 + .38 / .189, Math.PI);
  P(grp(at(rbox(.9, .1, .5, MT.metal, .01), 0, 2.0, 0), at(rbox(.3, .8, .25, MT.metal, .01), 0, 2.5, -.08)), 18.5, 34.5 + .3 / .189, Math.PI);
  P(grp(at(rbox(.55, .02, .42, MT.metal, .005), 0, .885, 0), at(cyl(.012, .012, .32, MT.metal, 8), 0, 1.03, -.18), at(cyl(.01, .01, .16, MT.metal, 8).rotateX(S_), 0, 1.18, -.1)), 9.8 + .38 / .213, 41.5, S_);
  [[10.3, 15.8], [21.3, 24.8]].forEach(([a, b]) => { const w = (b - a) * .213; P(grp(at(rbox(w, .7, .34, MT.lam, .01), 0, 1.9, 0)), (a + b) / 2, 34.5 + .24 / .189, Math.PI); });
  tilePanel(g, 10, 34.5, 25, 34.5, .9, 1.55, .075, MT.dado, sd, [0, 1]);
  tilePanel(g, 9.8, 38.3, 9.8, 47, .9, 2.0, .075, MT.dado, sd, [1, 0]);
  P(grp(at(cyl(.12, .1, .12, MT.terracotta, 20), 0, .95, 0), at(mesh(new THREE.IcosahedronGeometry(.1, 0), MT.leaf2), 0, 1.07, 0)), 13, 35.8, 0);
  // wash
  P(washer(), 5.0, 52.6, Math.PI);
  // ---------- MASTER BEDROOM ----------
  const b1x = 4.3 + (.11 + .12 + 1.07) / .213;
  P(bed(1.8, 2.1, MT.sage, MT.linen, MT.rust, MT.mustard), b1x, 21.8, S_);
  P(nightstand(), 4.3 + .45 / .213, 21.8 - 1.32 / .189, S_); P(nightstand(), 4.3 + .45 / .213, 21.8 + 1.32 / .189, S_);
  P(rug(1.8, 2.4, MT.rug2), b1x + .7 / .213, 21.8, S_);
  P(wardrobe(2.3), 9.9, 34.5 - .37 / .189, Math.PI);
  P(dresser(1.2), 23.2 - .33 / .213, 12.5, -S_); P(grp(at(rbox(.8, 1.0, .03, MT.mirror, .01), 0, 0, 0)), 23.2 - .1 / .213, 12.5, -S_, 1.45);
  P(armchair(MT.blush, MT.sage), 19.0, 12.3, -2.5);
  P(curtainPanel(1.0, 2.9), 8.0, 9 + .2 / .189, Math.PI); P(curtainPanel(1.0, 2.9), 18.0, 9 + .2 / .189, Math.PI);
  P(artPiece(.9, .6, MT.art[3]), 4.3 + .14 / .213, 21.8, S_, 1.95);
  P(plant(.9), 5.8, 11.3, 0);
  // north balcony
  P(loungeChair(MT.mustard), 13.5, 6.3, .4); P(loungeChair(MT.teal), 18.5, 6.3, -.4); P(sideTable(), 16, 7.2, 0); P(planter(3.4), 13, 4.6, 0);
  // ---------- BEDROOM 2 ----------
  const b2x = 49.6 - (.1 + .12 + 1.07) / .213;
  P(bed(1.8, 2.1, MT.navy, MT.cream, MT.mustard, MT.terracotta), b2x, 15.6, -S_);
  P(nightstand(), 49.6 - .45 / .213, 15.6 - 1.32 / .189, -S_); P(nightstand(), 49.6 - .45 / .213, 15.6 + 1.32 / .189, -S_);
  P(rug(1.8, 2.4, MT.rug3), b2x - .7 / .213, 15.6, -S_);
  P(wardrobe(2.4), 43.3, 30.5 - .37 / .189, Math.PI);
  P(desk(1.2), 35.4, 2.8 + .4 / .189, Math.PI); P(chair(MT.mustard), 35.4, 2.8 + .95 / .189, Math.PI);
  P(curtainPanel(1.0, 2.9), 34.0, 2.8 + .22 / .189, Math.PI); P(curtainPanel(1.0, 2.9), 46.0, 2.8 + .22 / .189, Math.PI);
  P(artPiece(1.1, .7, MT.art[1]), 49.6 - .14 / .213, 15.6, -S_, 2.0);
  P(plant(1.05, MT.potW), 47.8, 27.0, 0);
  // ---------- BEDROOM 3 ----------
  const b3x = 2.6 + (.11 + .12 + 1.07) / .213;
  P(bed(1.6, 2.1, MT.terracotta, MT.linen, MT.teal, MT.mustard), b3x, 75.6, S_);
  P(nightstand(), 2.6 + .45 / .213, 75.6 - 1.22 / .189, S_); P(nightstand(), 2.6 + .45 / .213, 75.6 + 1.22 / .189, S_);
  P(rug(1.7, 2.2, MT.rug1), b3x + .7 / .213, 75.6, S_);
  P(wardrobe(2.0), 16.4, 92.5 - .37 / .189, Math.PI);
  P(desk(1.1), 21.3 - .35 / .213, 78.5, -S_); P(chair(MT.sage), 21.3 - .9 / .213, 78.5, S_);
  P(artPiece(1.0, .65, MT.art[2]), 2.6 + .14 / .213, 75.6, S_, 1.95);
  P(curtainPanel(.9, 2.9), 6.0, 92.5 - .22 / .189, 0); P(curtainPanel(.9, 2.9), 11.0, 92.5 - .22 / .189, 0);
  P(plant(.85), 4.6, 89.6, 0);
  // ---------- BATHROOMS ----------
  [[23.2, 16.5, 31.2, 30], [23.2, 3.8, 31.2, 16.5], [2.6, 55, 15.5, 63.5]].forEach(([a, b, c, d]) => {
    const i = .075; tilePanel(g, a, b, c, b, 0, 2.15, i, MT.dado, sd, [0, 1]); tilePanel(g, a, d, c, d, 0, 2.15, i, MT.dado, sd, [0, -1]);
    tilePanel(g, a, b, a, d, 0, 2.15, i, MT.dado, sd, [1, 0]); tilePanel(g, c, b, c, d, 0, 2.15, i, MT.dado, sd, [-1, 0]);
  });
  P(vanity(), 31.2 - .32 / .213, 19.2, -S_); P(wc(), 31.2 - .38 / .213, 23.6, -S_); P(showerScreen(1.0), 26.5, 26.6, 0);
  P(vanity(), 23.2 + .32 / .213, 13.6, S_); P(wc(), 23.2 + .38 / .213, 9.4, S_); P(showerScreen(1.0), 27.6, 6.9, 0);
  P(vanity(), 12.2, 55 + .32 / .189, 0); P(wc(), 8.6, 55 + .36 / .189, 0); P(showerScreen(.9), 6.0, 59.6, S_);
  // ---------- BALCONY ----------
  P(loungeChair(MT.terracotta), 26.2, 88.6, .5); P(loungeChair(MT.sage), 30.6, 88.4, -.2); P(sideTable(), 28.4, 89.8, 0);
  P(planter(3.6), 31.0, 95.5 - .25 / .189, 0); P(plant(1.15), 38.6, 86.2, 0);
  // ---------- CEILING DOWNLIGHTS ----------
  [[13, 22], [10, 15], [16, 28], [40, 16], [36, 9], [44, 24], [11, 76], [8, 70], [15, 84], [16, 42], [21, 44], [17, 50], [30, 40], [36, 40], [27, 56], [36, 57], [27, 23], [27, 10], [9, 59], [31, 89]].forEach(([x, y]) => {
    const d = new THREE.Mesh(new THREE.CircleGeometry(.06, 20), MT.downlight); d.rotation.x = S_; d.position.set(X(MX(x, sd)), WALL_H - .002, Z(y)); g.add(d);
  });
}

/* ---------------- exterior: building, ground, city ---------------- */
function buildExterior() {
  extGroup = new THREE.Group(); scene.add(extGroup); upperGroup = new THREE.Group(); scene.add(upperGroup);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ map: TX.sky, side: THREE.BackSide, fog: false })); scene.add(sky);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: 0xffe2b0, fog: false })); sun.position.set(-160, 18, 330); sun.lookAt(0, 0, 0); scene.add(sun);
}
function placeExterior(L) {
  extGroup.clear(); upperGroup.clear();
  const base = -(GROUND_H + (L - 1) * FTF);  // ground level relative to current floor
  // ground, road, footpath, lawn
  const ground = mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x46503a, roughness: 1 }), false); ground.rotation.x = -S_; ground.position.y = base; extGroup.add(ground);
  const road = mesh(new THREE.PlaneGeometry(400, 12), new THREE.MeshStandardMaterial({ color: 0x343434, roughness: .9 }), false); road.rotation.x = -S_; road.position.set(0, base + .02, Z(96) + 9); extGroup.add(road);
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(400, .15), new THREE.MeshBasicMaterial({ color: 0xd9d2c0 })); lane.rotation.x = -S_; lane.position.set(0, base + .03, Z(96) + 9); extGroup.add(lane);
  const path = mesh(new THREE.PlaneGeometry(400, 2.4), new THREE.MeshStandardMaterial({ color: 0x9b958b, roughness: 1 }), false); path.rotation.x = -S_; path.position.set(0, base + .04, Z(96) + 1.8); extGroup.add(path);
  const plot = mesh(new THREE.BoxGeometry(PW + 8, .3, PH + 8), new THREE.MeshStandardMaterial({ color: 0x5f6b45, roughness: 1 }), false); plot.position.set(0, base + .15, 0); extGroup.add(plot);
  const r = rng(L * 31 + 7);
  // trees
  for (let i = 0; i < 46; i++) {
    const ang = r() * Math.PI * 2, rad = 14 + r() * 70; let x = Math.cos(ang) * rad, z = Math.sin(ang) * rad; if (Math.abs(z - (Z(96) + 9)) < 7) z += 12; if (z > 4 && z < 45 && Math.abs(x) < 15) continue;
    const h = 5 + r() * 7; const t = grp(at(cyl(.18, .26, h * .5, MT.darkwood, 6), 0, h * .25, 0));
    for (let k = 0; k < 4; k++) t.add(at(mesh(new THREE.IcosahedronGeometry(1.6 + r() * 1.6, 0), r() < .5 ? MT.leaf : MT.leaf2), (r() - .5) * 2, h * .55 + r() * h * .35, (r() - .5) * 2));
    t.position.set(x, base, z); extGroup.add(t);
  }
  // city blocks
  const cityMat = new THREE.MeshStandardMaterial({ map: TX.city, roughness: .9, color: 0xc8beb2 });
  for (let i = 0; i < 70; i++) {
    const ang = r() * Math.PI * 2, rad = 55 + r() * 170, w = 10 + r() * 16, d = 10 + r() * 16, h = 8 + r() * (r() < .2 ? 55 : 24);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cityMat.clone()); m.material.map = TX.city.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(w / 8, h / 10);
    m.position.set(Math.cos(ang) * rad, base + h / 2, Math.sin(ang) * rad); extGroup.add(m);
  }
  // the tower: ground floor + other residential floors as facade blocks, terrace parapet
  const blockW = PW * .97, blockD = PH * .94;
  const facMats = [MT.facN, MT.facN, MT.slab, MT.slab, MT.facS, MT.facN];
  const stilt = mesh(new THREE.BoxGeometry(blockW, GROUND_H, blockD), new THREE.MeshStandardMaterial({ color: 0x2f2a27, roughness: 1 })); stilt.position.set(0, base + GROUND_H / 2, 0); extGroup.add(stilt);
  for (let f = 1; f <= 6; f++) {
    const y0 = base + GROUND_H + (f - 1) * FTF;
    if (f === L) {  // the current floor's slabs (floor + ceiling) as building bands
      const band = mesh(new THREE.BoxGeometry(blockW + .5, .22, blockD + .5), MT.slab); band.position.set(0, -.12, 0); extGroup.add(band);
      continue;
    }
    const m = mesh(new THREE.BoxGeometry(blockW, FTF, blockD), facMats); m.position.set(0, y0 + FTF / 2, 0); (f > L ? upperGroup : extGroup).add(m);
    const band = mesh(new THREE.BoxGeometry(blockW + .5, .2, blockD + .5), MT.slab); band.position.set(0, y0 + .1, 0); (f > L ? upperGroup : extGroup).add(band);
  }
  const roofY = base + GROUND_H + 6 * FTF;
  const roof = mesh(new THREE.BoxGeometry(blockW + .5, .25, blockD + .5), MT.slab); roof.position.set(0, roofY, 0); upperGroup.add(roof);
  const par = mesh(new THREE.BoxGeometry(blockW, 1.1, blockD), MT.ext); par.position.set(0, roofY + .65, 0); upperGroup.add(par);
  // vertical fins on the south facade
  [21.3, 40.4, 59.6, 78.7].forEach(xp => { const fin = mesh(new THREE.BoxGeometry(.35, roofY - base, .5), MT.fin); fin.position.set(X(xp), base + (roofY - base) / 2, Z(95.8)); upperGroup.add(fin); });
}

/* ---------------- scene ---------------- */
async function build() {
  const mod = await import('three'); THREE = mod;
  RoomEnvironment = (await import('three/addons/environments/RoomEnvironment.js')).RoomEnvironment;
  RoundedBoxGeometry = (await import('three/addons/geometries/RoundedBoxGeometry.js')).RoundedBoxGeometry;
  const canvas = document.getElementById('liveCanvas');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xc9a58b, 120, 420);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  cam = new THREE.PerspectiveCamera(66, 1, .05, 900); clock = new THREE.Clock();
  makeTextures(); makeMaterials();
  // lights: low golden sun from the south-west, sky fill, warm interior lamps
  scene.add(new THREE.HemisphereLight(0xffeedd, 0x6d5a4c, .55));
  const sun = new THREE.DirectionalLight(0xffcf9a, 3.1); sun.position.set(-14, 11, 22); sun.target.position.set(-1, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 12, bottom: -12, near: 1, far: 70 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  scene.add(sun, sun.target);
  for (let i = 0; i < 7; i++) { const l = new THREE.PointLight(0xffc68a, 5, 7.5, 1.6); scene.add(l); roomLights.push(l); }
  buildExterior();
  worldGroup = new THREE.Group(); scene.add(worldGroup);
  ['A', 'B'].forEach(sd => { const g = new THREE.Group(); worldGroup.add(g); flatGroups[sd] = g;
    floorRect(g, 2.6, 2.8, 49.6, 95.5, 'tile', sd, .001);
    FLOORS_A.forEach(([a, b, c, d, m]) => floorRect(g, a, b, c, d, m, sd));
    buildWalls(g, WALLS_A, sd); furnish(g, sd); });
  const core = new THREE.Group(); worldGroup.add(core);
  floorRect(core, 49.6, 2.8, 50.4, 38, 'tile', 'A'); floorRect(core, 40.4, 49.5, 59.6, 95.5, 'stone', 'A', .002);
  buildWalls(core, WALLS_SHARED, 'A');
  for (let i = 0; i < 10; i++) { const s = mesh(new THREE.BoxGeometry(X(56) - X(48.5), .17 * (i + 1), .28), MT.stone); s.position.set((X(48.5) + X(56)) / 2, .085 * (i + 1), Z(80) - i * .28); core.add(s); }
  // ceiling slab (hidden in dollhouse mode)
  ceilingGroup = new THREE.Group(); worldGroup.add(ceilingGroup);
  const cs = mesh(new THREE.BoxGeometry(PW * .97, .2, PH * .94), [MT.slab, MT.slab, MT.slab, MT.ceiling, MT.slab, MT.slab]); cs.position.set(0, WALL_H + .1, 0); ceilingGroup.add(cs);
  const cb = mesh(new THREE.BoxGeometry(PW * .97 + .5, .14, PH * .94 + .5), MT.slab); cb.position.set(0, WALL_H + .13, 0); ceilingGroup.add(cb);
  placeExterior(level);
  // tags
  const box = document.getElementById('liveTags'); box.innerHTML = '';
  tagEls = TAGS.map(([id, label]) => { const b = document.createElement('button'); b.className = 'tag3d'; b.dataset.room = id; b.innerHTML = `<i></i>${label}`; box.appendChild(b); return b; });
  box.onclick = e => { const b = e.target.closest('.tag3d'); if (b) window.openLive(b.dataset.room); };
  new ResizeObserver(resize).observe(document.getElementById('liveStage')); resize();
  bindInput(); ready = true;
}
function resize() { if (!renderer) return; const el = document.getElementById('liveStage'); const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < 1 ? 80 : 64; cam.updateProjectionMatrix(); }
function setRoomLights() {
  [[13, 22], [40, 16], [11, 77], [31, 73], [33, 47], [17, 45], [27, 20]].forEach(([x, y], i) => roomLights[i].position.set(X(MX(x, side)), 2.55, Z(y)));
}

/* ---------------- camera paths ---------------- */
const V = (p, h = EYE) => new THREE.Vector3(X(MX(p[0], side)), p[2] !== undefined ? p[2] : h, Z(p[1]));
function route(from, to) {
  const adj = {}; EDGES.forEach(([a, b]) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); });
  const dist = { [from]: 0 }, prev = {}, Q = new Set(Object.keys(NODES));
  while (Q.size) { let u = null; Q.forEach(n => { if (dist[n] !== undefined && (u === null || dist[n] < dist[u])) u = n; }); if (u === null) break; Q.delete(u); if (u === to) break;
    (adj[u] || []).forEach(v => { const d = dist[u] + Math.hypot((NODES[u][0] - NODES[v][0]) * .213, (NODES[u][1] - NODES[v][1]) * .189); if (dist[v] === undefined || d < dist[v]) { dist[v] = d; prev[v] = u; } }); }
  const out = [to]; while (out[0] !== from && prev[out[0]]) out.unshift(prev[out[0]]); return out;
}
function flyPath(points, finalTarget, dur) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', .5); const L = curve.getLength();
  st.fly = { curve, L, finalTarget, dur: dur || Math.min(8.5, Math.max(2.6, L / 1.15)) * 1000, t0: performance.now(), startTgt: st.tgt ? st.tgt.clone() : finalTarget.clone(), y0: st.yaw, p0: st.pitch };
}
function goRoom(id, intro) {
  const R = ROOMS3D[id]; mode = 'walk'; setModeUI(); ceilingGroup.visible = true; upperGroup.visible = true;
  document.getElementById('liveCap').classList.remove('on');
  const target = V(R.t, 1.25);
  let pts;
  if (intro) {
    const names = route('out3', id); pts = names.map(n => V(NODES[n]));
    cam.position.copy(pts[0]); st.tgt = V([31, 83.5, 1.6]);
  } else if (curNode && NODES[curNode] && mode === 'walk' && cam.position.y < 2.5) {
    const names = route(curNode, id); pts = [cam.position.clone(), ...names.slice(1).map(n => V(NODES[n]))];
    if (pts.length < 2) pts.push(V(R.p));
  } else { const end = V(R.p); const mid = cam.position.clone().lerp(end, .55); mid.y = Math.max(end.y + 2.5, cam.position.y * .6); pts = [cam.position.clone(), mid, end]; }
  if (pts.length === 2) pts.splice(1, 0, pts[0].clone().lerp(pts[1], .5));
  flyPath(pts, target, intro ? 9000 : 0);
  curNode = id; curRoom = id;
  const total = st.fly.dur;
  clearTimeout(goRoom._t); goRoom._t = setTimeout(() => { if (curRoom !== id || mode !== 'walk') return; const room = (window.__ROOMS || []).find(x => x.id === id);
    document.getElementById('liveCapTitle').textContent = R.cap; document.getElementById('liveCapSub').textContent = room ? room.size : ''; document.getElementById('liveCap').classList.add('on'); }, total - 600);
  document.querySelectorAll('#liveBar button').forEach(b => b.classList.toggle('on', b.dataset.room === id));
}
function dollhouse() {
  mode = 'doll'; setModeUI(); document.getElementById('liveCap').classList.remove('on');
  const c = new THREE.Vector3(X(MX(27, side)), 0, Z(52)); const end = new THREE.Vector3(c.x + (side === 'A' ? -7 : 7), 15, c.z + 14);
  const mid = cam.position.clone().lerp(end, .5); mid.y = Math.max(cam.position.y, 6) + 3;
  flyPath([cam.position.clone(), mid, end], c, 3200); curNode = null;
  setTimeout(() => { if (mode === 'doll') { ceilingGroup.visible = false; upperGroup.visible = false; } }, 500);
}
function setModeUI() { document.querySelectorAll('#liveModes button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode)); }

/* ---------------- input ---------------- */
function bindInput() {
  const el = document.getElementById('liveStage');
  el.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; st.drag = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch }; el.setPointerCapture(e.pointerId); document.getElementById('liveHint').style.opacity = 0; });
  el.addEventListener('pointermove', e => { if (!st.drag) return; st.yaw = st.drag.yaw - (e.clientX - st.drag.x) * .0045; st.pitch = Math.max(-.7, Math.min(.7, st.drag.pitch - (e.clientY - st.drag.y) * .0035)); });
  const up = () => { st.drag = null; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  document.querySelectorAll('#liveModes button').forEach(b => b.onclick = () => { b.dataset.mode === 'doll' ? dollhouse() : goRoom(curRoom || 'drawing'); });
  document.getElementById('liveBar').onclick = e => { const b = e.target.closest('button'); if (b) window.openLive(b.dataset.room); };
}

/* ---------------- frame loop ---------------- */
const tmp = {};
function frame(now) {
  if (!running) return; requestAnimationFrame(frame);
  if (st.fly) {
    const f = st.fly, t = Math.max(0, Math.min(1, (now - f.t0) / f.dur)), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    cam.position.copy(f.curve.getPointAt(e));
    const ahead = f.curve.getPointAt(Math.min(1, e + 2.2 / f.L)); ahead.y = cam.position.y - (cam.position.y > 2 ? .6 : 0);
    const w = Math.min(1, Math.max(0, (e - .55) / .45)); const ws = w * w * (3 - 2 * w);
    const look = (e > .999) ? f.finalTarget.clone() : ahead.lerp(f.finalTarget, ws);
    const a = Math.min(1, t * 4); st.tgt = f.startTgt.clone().lerp(look, a);
    st.yaw = f.y0 * (1 - e); st.pitch = f.p0 * (1 - e);
    if (t >= 1) st.fly = null;
  }
  const sway = (!st.fly && !st.drag && mode === 'walk') ? Math.sin(now / 2800) * .03 : 0;
  const dir = st.tgt.clone().sub(cam.position); const len = dir.length() || 1;
  const yaw = Math.atan2(dir.x, dir.z) + st.yaw + sway, pitch = Math.asin(Math.max(-.999, Math.min(.999, dir.y / len))) + st.pitch;
  cam.lookAt(cam.position.x + Math.sin(yaw) * Math.cos(pitch), cam.position.y + Math.sin(pitch), cam.position.z + Math.cos(yaw) * Math.cos(pitch));
  renderer.render(scene, cam);
  if ((st.frameN++ % 3) === 0) updateTags();
}
const ray = { r: null };
function updateTags() {
  const el = document.getElementById('liveStage'); const W = el.clientWidth, H = el.clientHeight;
  if (!ray.r) ray.r = new THREE.Raycaster();
  const placed = [];
  TAGS.map((t, i) => [t, i, new THREE.Vector3(X(MX(t[2], side)), t[4], Z(t[3])).distanceTo(cam.position)]).sort((a, b) => a[2] - b[2]).forEach(([[id, , x, y, h], i]) => {
    const b = tagEls[i]; const p = new THREE.Vector3(X(MX(x, side)), h, Z(y));
    const dist = p.distanceTo(cam.position); let vis = mode === 'walk' && !st.fly && id !== curRoom && dist < 9.5;
    const s = p.clone().project(cam); if (s.z > 1 || Math.abs(s.x) > .95 || Math.abs(s.y) > .9) vis = false;
    if (vis) { ray.r.set(cam.position, p.clone().sub(cam.position).normalize()); ray.r.far = dist - .25; if (ray.r.intersectObjects(occluders, false).length) vis = false; }
    const sx = (s.x * .5 + .5) * W, sy = (-s.y * .5 + .5) * H;
    if (vis && placed.some(([px, py]) => Math.abs(px - sx) < 130 && Math.abs(py - sy) < 34)) vis = false;
    if (vis) placed.push([sx, sy]);
    b.classList.toggle('show', vis);
    if (vis) b.style.transform = `translate(${(s.x * .5 + .5) * W}px,${(-s.y * .5 + .5) * H}px) translate(-50%,-50%)`;
  });
}

/* ---------------- public API ---------------- */
function loadingOn(on) { document.getElementById('liveLoading').style.opacity = on ? 1 : 0; }
window.openLive = async function (id) {
  const S = window.__STATE; const first = S.view !== 'live' || side !== (S.flat || 'A') || level !== S.level;
  side = S.flat || 'A'; S.view = 'live'; S.room = id;
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'liveView'));
  window.__renderLivePanel(id);
  document.getElementById('liveLabel').textContent = `Level ${S.level} · Flat ${S.level * 100 + (side === 'A' ? 1 : 2)}`;
  try {
    if (!ready) { loadingOn(true); await build(); }
    if (level !== S.level) { level = S.level; placeExterior(level); }
    loadingOn(false); setRoomLights();
    if (!running) { running = true; requestAnimationFrame(frame); }
    if (first) { document.getElementById('liveFade').classList.add('on'); curNode = null; setTimeout(() => document.getElementById('liveFade').classList.remove('on'), 120); goRoom(id, true); }
    else goRoom(id, false);
  } catch (err) {
    console.error(err); document.getElementById('liveLoading').textContent = '3D view could not load on this device';
    setTimeout(() => { window.stopLive(); document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'floorView')); S.view = 'flat'; window.__openRoomPlan(id); }, 1400);
  }
};
window.switchLiveFlat = function (sd) { const S = window.__STATE; S.flat = sd; S.view = 'switching'; window.openLive('drawing'); };
window.stopLive = function () { running = false; curNode = null; curRoom = null; const c = document.getElementById('liveCap'); c && c.classList.remove('on'); tagEls.forEach(b => b.classList.remove('show')); };
window.liveMode = m => m === 'doll' ? dollhouse() : goRoom(curRoom || 'drawing');
window.__live = { get cam() { return cam; }, get st() { return st; } };
