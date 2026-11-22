import * as THREE from 'three';
import { ROAD } from './config.js';

function drawPanel(canvas, opt) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, opt.color + 'ee'); grd.addColorStop(1, opt.color + '88');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 10; ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8;
  let size = 96;
  ctx.font = `900 ${size}px system-ui, sans-serif`;
  while (ctx.measureText(opt.label).width > w - 40 && size > 40) { size -= 6; ctx.font = `900 ${size}px system-ui, sans-serif`; }
  ctx.fillText(opt.label, w / 2, h / 2 - (opt.sub ? 22 : 0));
  if (opt.sub) { ctx.font = '700 34px system-ui, sans-serif'; ctx.fillText(opt.sub, w / 2, h / 2 + 52); }
}

// Puertas de selección de bonus (GDD sección 8.2)
export class Gates {
  constructor(scene) {
    this.pool = [];
    const postGeo = new THREE.BoxGeometry(0.4, 4.2, 0.4);
    const postMat = new THREE.MeshLambertMaterial({ color: 0xdfe6ee });
    const beamGeo = new THREE.BoxGeometry(ROAD.halfWidth * 2 + 0.4, 0.35, 0.4);
    const pw = ROAD.halfWidth - 0.3;
    const panelGeo = new THREE.PlaneGeometry(pw, 3.1);
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      for (const x of [-ROAD.halfWidth, 0, ROAD.halfWidth]) { const p = new THREE.Mesh(postGeo, postMat); p.position.set(x, 2.1, 0); g.add(p); }
      const beam = new THREE.Mesh(beamGeo, postMat); beam.position.y = 4.2; g.add(beam);
      const sides = [];
      for (const s of [-1, 1]) {
        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
        const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
        const panel = new THREE.Mesh(panelGeo, mat);
        panel.position.set(s * (pw / 2 + 0.15), 2.5, 0);
        g.add(panel);
        sides.push({ canvas, tex, mat, panel });
      }
      g.visible = false;
      scene.add(g);
      this.pool.push({ g, sides, active: false, opts: null, z: 0, used: false, fade: 0 });
    }
  }

  spawn(z, left, right) {
    const gate = this.pool.find(p => !p.active);
    if (!gate) return null;
    gate.active = true; gate.used = false; gate.fade = 0; gate.z = z; gate.opts = [left, right];
    gate.g.position.set(0, 0, z); gate.g.visible = true; gate.g.scale.set(1, 1, 1);
    gate.sides.forEach((s, k) => { drawPanel(s.canvas, gate.opts[k]); s.tex.needsUpdate = true; s.mat.opacity = 1; s.panel.scale.set(1, 1, 1); });
    return gate;
  }

  clear() { for (const p of this.pool) { p.active = false; p.g.visible = false; } }

  // onPass(option) cuando el jugador cruza la puerta
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
        s.panel.scale.setScalar(1 + p.fade * 2);
        s.mat.opacity = Math.max(0, 1 - p.fade * 3);
        p.sides[1 - p.chosen].mat.opacity = Math.max(0.15, 1 - p.fade * 2);
      }
      if (p.z > pz + 20) { p.active = false; p.g.visible = false; }
    }
  }
}
