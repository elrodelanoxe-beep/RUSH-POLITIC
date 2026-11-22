import * as THREE from 'three';
import { LANES } from './config.js';
import { gunGeometry } from './player.js';

const UP_COLOR = { CADENCIA: '#1ea7ff', DAÑO: '#ff7a1a', DISPAROS: '#a64dff' };

function glassPanel(ctx, w, h, col) {
  ctx.clearRect(0, 0, w, h);
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, col + 'd9'); grd.addColorStop(0.55, col + '99'); grd.addColorStop(1, col + 'e6');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
  const shine = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  shine.addColorStop(0, 'rgba(255,255,255,0.45)'); shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine; ctx.fillRect(0, 0, w, h * 0.45);
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(0, 0, w, 8); ctx.fillRect(0, h - 8, w, 8);
}
function bigText(ctx, text, x, y, size, maxW) {
  const font = s => `900 ${s}px "Arial Black", "Helvetica Neue", system-ui, sans-serif`;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxW && size > 30) { size -= 6; ctx.font = font(size); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = 'rgba(10,20,40,0.9)'; ctx.strokeText(text, x, y);
  ctx.fillStyle = '#fff'; ctx.fillText(text, x, y);
}

function post(color) {
  const g = new THREE.Group();
  const m = new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(color).multiplyScalar(0.25) });
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 2.4, 12), m); p.position.y = 1.2; g.add(p);
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.12, 12), m); c.position.y = 2.45; g.add(c);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), m); b.position.y = 0.05; g.add(b);
  const wm = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x444444 });
  for (const y of [0.6, 1.2, 1.8]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.06, 12), wm); r.position.y = y; g.add(r); }
  g.userData.mat = m;
  return g;
}

// Carril izquierdo: armas especiales que se consiguen a disparos
export class WeaponCrates {
  constructor(scene) {
    this.pool = [];
    const pw = LANES.width - 0.5;
    for (let i = 0; i < 2; i++) {
      const g = new THREE.Group();
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 384;
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(pw, pw * 0.75), mat);
      panel.position.y = 0.3 + pw * 0.375; panel.renderOrder = 2; g.add(panel);
      const pl = post(0xffffff), pr = post(0xffffff);
      pl.position.x = -pw / 2 - 0.1; pr.position.x = pw / 2 + 0.1; g.add(pl, pr);
      // el arma flota encima, girando
      const gunHolder = new THREE.Group(); gunHolder.position.y = pw * 0.75 + 1.3; g.add(gunHolder);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
      ring.rotation.x = Math.PI / 2; ring.position.y = -0.35; gunHolder.add(ring);
      g.visible = false; scene.add(g);
      this.pool.push({ g, canvas, tex, mat, panel, posts: [pl, pr], gunHolder, ring, guns: {}, active: false });
    }
  }

  _draw(c) {
    const ctx = c.canvas.getContext('2d'), w = c.canvas.width, h = c.canvas.height;
    glassPanel(ctx, w, h, UP_COLOR[c.tier.up] || '#888888');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 40px system-ui, sans-serif'; ctx.fillStyle = '#fff';
    ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(10,20,40,0.85)';
    ctx.strokeText(c.tier.name, w / 2, 48); ctx.fillText(c.tier.name, w / 2, 48);
    bigText(ctx, String(Math.ceil(c.hp)), w / 2, h * 0.52, 170, w - 50);
    ctx.font = '800 36px system-ui, sans-serif';
    const sub = '+ ' + c.tier.up;
    ctx.strokeText(sub, w / 2, h - 46); ctx.fillText(sub, w / 2, h - 46);
    c.tex.needsUpdate = true;
  }

  spawn(z, tierIndex, tier) {
    const c = this.pool.find(p => !p.active); if (!c) return null;
    Object.assign(c, { active: true, z, x: LANES.left, tierIndex, tier, hp: tier.counter, shown: -1, done: false, pop: 0 });
    c.g.position.set(c.x, 0, z); c.g.visible = true; c.g.scale.setScalar(1);
    c.mat.opacity = 1;
    for (const p of c.posts) { const col = UP_COLOR[tier.up]; p.userData.mat.color.set(col); p.userData.mat.emissive.set(col).multiplyScalar(0.25); }
    for (const m of Object.values(c.guns)) m.visible = false;
    if (!c.guns[tier.model]) { const m = new THREE.Mesh(gunGeometry(tier.model), new THREE.MeshLambertMaterial({ vertexColors: true, emissive: 0x555555 })); m.scale.setScalar(4); c.gunHolder.add(m); c.guns[tier.model] = m; }
    c.guns[tier.model].visible = true;
    c.ring.material.color.set(UP_COLOR[tier.up]);
    this._draw(c);
    return c;
  }

  clear() { for (const c of this.pool) { c.active = false; c.g.visible = false; } }

  // devuelve la caja si la bala (segmento z0→z1 en x) la alcanza
  hitTest(x, z0, z1) {
    for (const c of this.pool) {
      if (!c.active || c.done) continue;
      if (Math.abs(x - c.x) < LANES.width / 2 - 0.1 && z1 <= c.z + 0.3 && z0 >= c.z - 0.3) return c;
    }
    return null;
  }

  update(dt, pz, t) {
    for (const c of this.pool) {
      if (!c.active) continue;
      c.gunHolder.rotation.y += dt * 1.6;
      c.gunHolder.position.y = LANES.width * 0.56 + 1.0 + Math.sin(t * 2.5) * 0.12;
      if (!c.done && Math.ceil(c.hp) !== c.shown) { c.shown = Math.ceil(c.hp); this._draw(c); }
      c.pop = Math.max(0, c.pop - dt * 6);
      c.panel.scale.setScalar(1 + c.pop * 0.06);
      if (c.done) {
        c.fade += dt;
        c.g.scale.setScalar(1 + c.fade * 1.5);
        c.mat.opacity = Math.max(0, 1 - c.fade * 3);
        if (c.fade > 0.35) { c.active = false; c.g.visible = false; }
      } else if (c.z > pz + 6) { c.active = false; c.g.visible = false; c.missed = true; }
    }
  }
}

// Carril derecho: paneles +1 que suben al dispararles y se cogen al tocarlos (dan soldados)
export class BonusTokens {
  constructor(scene) {
    this.pool = [];
    const pw = LANES.width - 0.8, ph = 1.5;
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const canvas = document.createElement('canvas'); canvas.width = 384; canvas.height = 192;
      const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat); panel.position.y = 1.0; panel.renderOrder = 2; g.add(panel);
      const pl = post(0x1e88ff), pr = post(0x1e88ff);
      pl.scale.y = pr.scale.y = 0.75;
      pl.position.x = -pw / 2 - 0.1; pr.position.x = pw / 2 + 0.1; g.add(pl, pr);
      g.visible = false; scene.add(g);
      this.pool.push({ g, canvas, tex, mat, panel, active: false });
    }
  }
  spawn(z, value) {
    const b = this.pool.find(p => !p.active); if (!b) return null;
    Object.assign(b, { active: true, z, x: LANES.right, value, acc: 0, used: false, fade: 0, pop: 0 });
    this._draw(b);
    b.g.position.set(b.x, 0, z); b.g.visible = true; b.panel.scale.setScalar(1); b.mat.opacity = 1;
    return b;
  }
  _draw(b) {
    const ctx = b.canvas.getContext('2d');
    glassPanel(ctx, b.canvas.width, b.canvas.height, '#1e88ff');
    bigText(ctx, '+' + b.value, b.canvas.width / 2, b.canvas.height / 2 + 4, 130, b.canvas.width - 40);
    b.tex.needsUpdate = true;
  }
  // al dispararle, el número sube (+1 cada 'step' de daño)
  hitTest(x, z0, z1) {
    for (const b of this.pool) {
      if (!b.active || b.used) continue;
      if (Math.abs(x - b.x) < LANES.width / 2 - 0.3 && z1 <= b.z + 0.3 && z0 >= b.z - 0.3) return b;
    }
    return null;
  }
  addDamage(b, dmg, step, max) {
    const BONUS_GROWTH = 0.6;
    if (b.value >= max) return false;
    b.acc += dmg; b.pop = 1;
    let changed = false;
    // cada punto cuesta más que el anterior (proporcional)
    let cost = step * (1 + b.value * BONUS_GROWTH);
    while (b.acc >= cost && b.value < max) { b.acc -= cost; b.value++; changed = true; cost = step * (1 + b.value * BONUS_GROWTH); }
    if (changed) this._draw(b);
    return changed;
  }
  clear() { for (const b of this.pool) { b.active = false; b.g.visible = false; } }
  update(dt, px, pz, onTake) {
    for (const b of this.pool) {
      if (!b.active) continue;
      if (!b.used && pz <= b.z) {
        b.used = true;
        if (Math.abs(px - b.x) < LANES.width / 2 + 0.2) { b.taken = true; onTake(b.value, b); } else b.taken = false;
      }
      b.pop = Math.max(0, (b.pop || 0) - dt * 6);
      if (!b.used) b.panel.scale.setScalar(1 + b.pop * 0.05);
      if (b.used) {
        b.fade += dt;
        if (b.taken) { b.panel.scale.setScalar(1 + b.fade * 2); b.mat.opacity = Math.max(0, 1 - b.fade * 3); }
      }
      if (b.z > pz + 15) { b.active = false; b.g.visible = false; }
    }
  }
}
