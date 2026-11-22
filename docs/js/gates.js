import * as THREE from 'three';
import { ROAD } from './config.js';

export const GOOD = '#1e88ff', BAD = '#ff2d3d';

function drawPanel(canvas, opt) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const col = opt.bad ? BAD : GOOD;
  ctx.clearRect(0, 0, w, h);
  // cristal translúcido de color con brillo superior
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, col + 'cc'); grd.addColorStop(0.55, col + '99'); grd.addColorStop(1, col + 'e6');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  const shine = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  shine.addColorStop(0, 'rgba(255,255,255,0.45)'); shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine; ctx.fillRect(0, 0, w, h * 0.45);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(0, 0, w, 8); ctx.fillRect(0, h - 8, w, 8);
  // número grande en negrita
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let size = opt.sub ? 150 : 170;
  const font = s => `900 ${s}px "Arial Black", "Helvetica Neue", system-ui, sans-serif`;
  ctx.font = font(size);
  while (ctx.measureText(opt.label).width > w - 60 && size > 50) { size -= 6; ctx.font = font(size); }
  const ty = opt.sub ? h * 0.42 : h / 2;
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.14; ctx.strokeStyle = 'rgba(10,20,40,0.9)';
  ctx.strokeText(opt.label, w / 2, ty);
  ctx.fillStyle = '#ffffff'; ctx.fillText(opt.label, w / 2, ty);
  if (opt.sub) {
    let ss = 46; ctx.font = `800 ${ss}px system-ui, sans-serif`;
    while (ctx.measureText(opt.sub).width > w - 40 && ss > 24) { ss -= 2; ctx.font = `800 ${ss}px system-ui, sans-serif`; }
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(10,20,40,0.85)';
    ctx.strokeText(opt.sub, w / 2, h * 0.82); ctx.fillText(opt.sub, w / 2, h * 0.82);
  }
}

// Puertas de selección de bonus (GDD sección 8.2): paneles translúcidos con postes
export class Gates {
  constructor(scene) {
    this.pool = [];
    const hw = ROAD.halfWidth;
    const pw = hw - 0.35, ph = 1.75, py = 1.15;
    const postGeo = new THREE.CylinderGeometry(0.17, 0.19, 2.3, 12); postGeo.translate(0, 1.15, 0);
    const capGeo = new THREE.CylinderGeometry(0.22, 0.17, 0.14, 12); capGeo.translate(0, 2.36, 0);
    const baseGeo = new THREE.BoxGeometry(0.6, 0.12, 0.6); baseGeo.translate(0, 0.06, 0);
    const bandGeo = new THREE.CylinderGeometry(0.195, 0.195, 0.06, 12);
    const white = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x444444 });
    const panelGeo = new THREE.PlaneGeometry(pw, ph);
    const stripGeo = new THREE.PlaneGeometry(pw, 0.35); stripGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      const sides = [];
      for (const s of [-1, 1]) {
        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
        const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
        const panel = new THREE.Mesh(panelGeo, mat);
        panel.position.set(s * (pw / 2 + 0.17), py, 0);
        panel.renderOrder = 2;
        g.add(panel);
        const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false });
        const strip = new THREE.Mesh(stripGeo, stripMat); strip.position.set(s * (pw / 2 + 0.17), 0.02, 0); g.add(strip);
        const postMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        sides.push({ canvas, tex, mat, panel, postMat, stripMat });
      }
      const posts = [];
      for (const [x, side] of [[-hw, 0], [0, 0], [hw, 1]]) {
        const post = new THREE.Group(); post.position.x = x;
        const m = sides[side].postMat;
        post.add(new THREE.Mesh(postGeo, m), new THREE.Mesh(capGeo, m), new THREE.Mesh(baseGeo, m));
        for (const y of [0.55, 1.15, 1.75]) { const b = new THREE.Mesh(bandGeo, white); b.position.y = y; post.add(b); }
        g.add(post); posts.push(post);
      }
      g.visible = false;
      scene.add(g);
      this.pool.push({ g, sides, posts, active: false, opts: null, z: 0, used: false, fade: 0 });
    }
  }

  spawn(z, left, right) {
    const gate = this.pool.find(p => !p.active);
    if (!gate) return null;
    gate.active = true; gate.used = false; gate.fade = 0; gate.z = z; gate.opts = [left, right];
    gate.g.position.set(0, 0, z); gate.g.visible = true;
    gate.sides.forEach((s, k) => {
      const o = gate.opts[k];
      drawPanel(s.canvas, o); s.tex.needsUpdate = true;
      s.mat.opacity = 1; s.panel.scale.set(1, 1, 1);
      const c = o.bad ? BAD : GOOD;
      s.postMat.color.set(c); s.postMat.emissive.set(c).multiplyScalar(0.25);
      s.stripMat.color.set(c); s.stripMat.opacity = 0.55;
    });
    return gate;
  }

  clear() { for (const p of this.pool) { p.active = false; p.g.visible = false; } }

  update(dt, px, pz, onPass) {
    for (const p of this.pool) {
      if (!p.active) continue;
      if (!p.used && pz <= p.z) {
        p.used = true;
        const k = px < 0 ? 0 : 1;
        p.chosen = k;
        onPass(p.opts[k]);
      }
      if (p.used) {
        p.fade += dt;
        const s = p.sides[p.chosen];
        s.panel.scale.set(1 + p.fade * 1.5, 1 + p.fade * 1.5, 1);
        s.mat.opacity = Math.max(0, 1 - p.fade * 3);
        p.sides[1 - p.chosen].mat.opacity = Math.max(0.2, 1 - p.fade * 2);
      } else {
        // brillo pulsante para llamar la atención
        const pulse = 0.45 + Math.sin(performance.now() / 180) * 0.15;
        for (const s of p.sides) s.stripMat.opacity = pulse;
      }
      if (p.z > pz + 20) { p.active = false; p.g.visible = false; }
    }
  }
}
