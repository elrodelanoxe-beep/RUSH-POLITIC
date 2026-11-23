import * as THREE from 'three';
import { bodyGeometries, PART_JOINT, PART_GEO, JOINT_INDEX, makePose, runPose, solve, makeJointMatrices } from './rig.js';
import { gunGeometry, GUN_TIP } from './player.js';
import { ROAD } from './config.js';

// (v1.0) sin límite de soldados: la capacidad de dibujo crece sola cuando hace falta
const START_CAP = 256;
const BUCKETS = 12;  // fases de carrera precalculadas (rendimiento con miles de soldados)
const PARTS = ['pelvis', 'torso', 'head', 'helmet', 'thighL', 'shinL', 'shoeL', 'thighR', 'shinR', 'shoeR',
  'upperArmL', 'foreArmL', 'handL', 'upperArmR', 'foreArmR', 'handR', 'vest', 'backpack'];
const COLORS = {
  pelvis: 0x163f70, torso: 0x1f5fa8, head: 0xe2a97e, helmet: 0x2b3036, thighL: 0x163f70, shinL: 0x163f70, shoeL: 0x1a1c20,
  thighR: 0x163f70, shinR: 0x163f70, shoeR: 0x1a1c20, upperArmL: 0x1f5fa8, foreArmL: 0x1f5fa8, handL: 0x222428,
  upperArmR: 0x1f5fa8, foreArmR: 0x1f5fa8, handR: 0x222428, vest: 0x3b4048, backpack: 0x2b3036,
};
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const _base = new THREE.Matrix4(), _m = new THREE.Matrix4(), _gunL = new THREE.Matrix4(), _t = new THREE.Matrix4();
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();

// Posición de cada soldado respecto al protagonista (detrás y a los lados)
// la formación se ensancha a medida que crece el ejército
// (v0.9) cuanto más grande es el ejército, más ancho: hasta 16 columnas (casi toda la calzada)
export function cols(n) { return Math.max(4, Math.min(16, Math.ceil(Math.sqrt(n * 1.6)))); }
export function slot(k, n = 0) {
  if (k < 2) return [k === 0 ? -0.85 : 0.85, 0.15];
  const c0 = cols(n);
  const r = Math.floor((k - 2) / c0) + 1, c = (k - 2) % c0;
  return [(c - (c0 - 1) / 2) * 0.8 + (r % 2 ? 0.2 : -0.2), r * 0.8];
}
// ancho total de la formación
export function formationHalfWidth(n) { return n <= 2 ? 0.85 : Math.max(0.85, ((cols(n) - 1) / 2) * 0.8 + 0.2); }

// Escuadrón de soldados que corren y disparan con el protagonista
export class Squad {
  constructor(scene) {
    this.scene = scene;
    this.geos = bodyGeometries();
    this.partMats = PARTS.map(k => new THREE.MeshLambertMaterial({ color: COLORS[k] }));
    this.gunMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.shadowGeo = new THREE.CircleGeometry(0.42, 12); this.shadowGeo.rotateX(-Math.PI / 2);
    this.shadowMat = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.3, depthWrite: false });
    this.parts = []; this.guns = {}; this.cap = 0;
    this._alloc(START_CAP);
    this.pose = makePose();
    this.bucketJ = Array.from({ length: BUCKETS }, () => makeJointMatrices());
    this.members = []; this.model = 'pistola';
    this.groups = 0;
  }

  _mk(geo, mat, cap) {
    const im = new THREE.InstancedMesh(geo, mat, cap);
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; im.count = 0;
    this.scene.add(im); return im;
  }

  // crea (o agranda) los InstancedMesh
  _alloc(cap) {
    for (const im of this.parts) { this.scene.remove(im); im.dispose(); }
    for (const im of Object.values(this.guns)) { this.scene.remove(im); im.dispose(); }
    if (this.shadow) { this.scene.remove(this.shadow); this.shadow.dispose(); }
    this.parts = PARTS.map((k, i) => { const im = this._mk(this.geos[PART_GEO[k] || k], this.partMats[i], cap); im.userData.joint = JOINT_INDEX[PART_JOINT[k]]; return im; });
    this.guns = {};
    this.shadow = this._mk(this.shadowGeo, this.shadowMat, cap);
    this.cap = cap;
  }

  _gun(model) {
    if (!this.guns[model]) this.guns[model] = this._mk(gunGeometry(model), this.gunMat, this.cap);
    return this.guns[model];
  }

  setWeapon(model) {
    for (const im of Object.values(this.guns)) im.count = 0;
    this.model = model;
  }

  get count() { return this.members.length; }

  // Cada grupo reclutado (un panel) tiene su propio contador de disparo, desfasado y con
  // una cadencia ligeramente distinta: así los grupos nunca disparan a la vez (fuego continuo).
  add(n, fromX, fromZ) {
    const g = { offset: Math.random(), rateMul: 0.88 + Math.random() * 0.24 };
    this.groups++;
    for (let i = 0; i < n; i++) {
      this.members.push({ x: fromX + (Math.random() - 0.5), z: fromZ + Math.random(), phase: Math.random() * 6.28,
        // (v1.1) cada soldado arranca en un momento distinto del ciclo y con su propio ritmo
        group: g, fireCd: Math.random() * 0.5, rateMul: g.rateMul * (0.9 + Math.random() * 0.2) });
    }
    if (this.members.length > this.cap) {
      let c = this.cap; while (c < this.members.length) c *= 2;
      this._alloc(c);
    }
  }

  // quita n soldados (los de atrás primero); devuelve cuántos ha quitado y dónde
  remove(n) {
    const out = [];
    for (let i = 0; i < n && this.members.length; i++) out.push(this.members.pop());
    return out;
  }

  // quita los soldados que cumplan la condición (p. ej. dentro de la zona de un golpe)
  removeWhere(fn) {
    const out = [], keep = [];
    for (const m of this.members) (fn(m) ? out : keep).push(m);
    this.members = keep;
    return out;
  }

  clear() { this.members.length = 0; this.groups = 0; this.update(0, 0, 0); }

  update(dt, px, pz, onFire) {
    const lim = ROAD.halfWidth - 0.4;
    const gun = this._gun(this.model);
    const n = this.members.length;
    // posturas de carrera precalculadas en el origen (mirando hacia delante)
    this.t = (this.t || 0) + dt;
    _base.makeRotationY(Math.PI);
    for (let b = 0; b < BUCKETS; b++) {
      runPose(this.pose, this.t * 11.5 + (b / BUCKETS) * Math.PI * 2, 1, { aim: true, aimYaw: 0 });
      solve(_base, this.pose, this.bucketJ[b]);
    }
    _gunL.makeRotationX(Math.PI / 2).setPosition(0, -0.07, 0.01);
    const wr = JOINT_INDEX.wristR;
    // la formación se desplaza para no salirse de la calzada (el protagonista puede quedar en un lateral)
    const hw = formationHalfWidth(n), cx = Math.max(-lim + hw, Math.min(lim - hw, px));
    this.cx = hw >= lim ? 0 : cx;
    const f = Math.min(1, dt * 8);
    for (let k = 0; k < n; k++) {
      const m = this.members[k];
      const [ox, oz] = slot(k, n);
      const tx = Math.max(-lim, Math.min(lim, this.cx + ox)), tz = pz + oz;
      m.x += (tx - m.x) * f; m.z += (tz - m.z) * f;
      const J = this.bucketJ[(k * 5 + (m.group ? (m.group.offset * BUCKETS) | 0 : 0)) % BUCKETS];
      _t.makeTranslation(m.x, 0, m.z);
      for (const im of this.parts) { _m.multiplyMatrices(_t, J[im.userData.joint]); im.setMatrixAt(k, _m); }
      _m.multiplyMatrices(_t, J[wr]).multiply(_gunL); gun.setMatrixAt(k, _m);
      _m.makeTranslation(m.x, 0.025, m.z); this.shadow.setMatrixAt(k, _m);
      m.fireCd -= dt;
      // tras cada disparo, un pequeño desfase aleatorio (±15 %) para que nunca vuelvan a sincronizarse
      if (onFire && m.fireCd <= 0) { m.fireCd += (onFire(m) || 0.25) / (m.rateMul || 1) * (0.85 + Math.random() * 0.3); if (m.fireCd < 0) m.fireCd = Math.random() * 0.05; }
    }
    for (const im of this.parts) { im.count = n; im.instanceMatrix.needsUpdate = true; }
    gun.count = n; gun.instanceMatrix.needsUpdate = true;
    this.shadow.count = n; this.shadow.instanceMatrix.needsUpdate = true;
  }
}
