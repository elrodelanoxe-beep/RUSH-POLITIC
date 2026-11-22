import * as THREE from 'three';
import { pivotTopBox } from './geom.js';

const lam = c => new THREE.MeshLambertMaterial({ color: c });

// Protagonista low-poly con animación procedural de carrera
export class PlayerModel {
  constructor(scene) {
    const g = this.group = new THREE.Group();
    const jacket = lam(0x24476b), pants = lam(0x1d2633), skin = lam(0xe8b48a), boots = lam(0x15181d), stripe = lam(0xff8c1a), dark = lam(0x2b2f36);
    const limb = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
    this.legL = limb(pivotTopBox(0.24, 0.82, 0.26), pants, -0.14, 0.88, 0);
    this.legR = limb(pivotTopBox(0.24, 0.82, 0.26), pants, 0.14, 0.88, 0);
    for (const leg of [this.legL, this.legR]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.16, 0.36), boots); b.position.set(0, -0.8, -0.04); leg.add(b); }
    const torso = limb(new THREE.BoxGeometry(0.6, 0.7, 0.36), jacket, 0, 1.22, 0);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.38), stripe); band.position.y = -0.1; torso.add(band);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.5, 0.2), dark); pack.position.set(0, 0.02, 0.27); torso.add(pack);
    const lightBar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: 0x5ff3ff })); lightBar.position.set(0, 0.18, 0.38); torso.add(lightBar);
    this.head = limb(new THREE.BoxGeometry(0.33, 0.34, 0.33), skin, 0, 1.75, 0);
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), dark); helmet.position.y = 0.2; this.head.add(helmet);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.05), new THREE.MeshBasicMaterial({ color: 0x111111 })); visor.position.set(0, 0.03, -0.17); this.head.add(visor);
    this.armL = limb(pivotTopBox(0.17, 0.62, 0.19), jacket, -0.39, 1.52, 0);
    this.armR = limb(pivotTopBox(0.17, 0.62, 0.19), jacket, 0.39, 1.52, 0);
    // armas: una malla por tipo
    this.guns = {
      pistola: this._gun([[0.1, 0.14, 0.38, 0, 0, -0.1]], 0x30343b),
      subfusil: this._gun([[0.12, 0.16, 0.6, 0, 0, -0.2], [0.08, 0.22, 0.08, 0, -0.14, -0.05], [0.06, 0.06, 0.2, 0, 0.02, -0.55]], 0x3b4250),
      escopeta: this._gun([[0.12, 0.14, 0.9, 0, 0, -0.35], [0.1, 0.1, 0.5, 0, -0.09, -0.4]], 0x6b4a2b),
    };
    this.gunHolder = new THREE.Group();
    this.gunHolder.position.set(0, -0.6, 0);
    this.gunHolder.rotation.x = -Math.PI / 2;
    this.armR.add(this.gunHolder);
    for (const m of Object.values(this.guns)) { m.visible = false; this.gunHolder.add(m); }
    this.flash = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), new THREE.MeshBasicMaterial({ color: 0xfff2a8, fog: false }));
    this.flash.visible = false;
    this.gunHolder.add(this.flash);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.3, depthWrite: false }));
    sh.position.y = 0.03; g.add(sh);
    this.phase = 0; this.flashT = 0; this.hurtT = 0;
    this.mats = [jacket, pants];
    scene.add(g);
    this.setWeapon('pistola');
  }

  _gun(boxes, color) {
    const grp = new THREE.Group();
    for (const [w, h, d, x, y, z] of boxes) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(color)); m.position.set(x, y, z); grp.add(m); }
    grp.userData.tip = Math.min(...boxes.map(b => b[5] - b[2] / 2));
    return grp;
  }

  setWeapon(id) {
    for (const [k, m] of Object.entries(this.guns)) m.visible = k === id;
    this.flash.position.set(0, 0, this.guns[id].userData.tip - 0.1);
  }

  muzzle() { this.flashT = 0.05; }
  hurt() { this.hurtT = 0.25; }

  update(dt, x, z, vx, aimYaw, running = true) {
    const g = this.group;
    g.position.set(x, 0, z);
    this.phase += dt * (running ? 13 : 0);
    const s = Math.sin(this.phase);
    g.position.y = running ? Math.abs(Math.cos(this.phase)) * 0.1 : 0;
    g.rotation.z = -vx * 0.012;
    g.rotation.y = aimYaw * 0.5;
    this.legL.rotation.x = -s * 0.8; this.legR.rotation.x = s * 0.8;
    this.armL.rotation.x = s * 0.7;
    this.armR.rotation.x = Math.PI / 2 - 0.05; // apuntando hacia delante
    this.armR.rotation.y = aimYaw * 0.5;
    this.flashT -= dt; this.flash.visible = this.flashT > 0;
    if (this.flash.visible) this.flash.rotation.z += 1.3;
    this.hurtT -= dt;
    const red = this.hurtT > 0 && Math.floor(this.hurtT * 30) % 2 === 0;
    this.mats[0].emissive.setHex(red ? 0x880000 : 0x000000);
  }
}
