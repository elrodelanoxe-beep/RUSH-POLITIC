import * as THREE from 'three';
import { bodyGeometries, PART_JOINT, PART_GEO, JOINT_INDEX, makePose, runPose, solve, makeJointMatrices } from './rig.js';
import { gunGeometry, GUN_TIP } from './player.js';
import { ROAD } from './config.js';

export const MAX_SQUAD = 30;
const PARTS = ['pelvis', 'torso', 'head', 'helmet', 'thighL', 'shinL', 'shoeL', 'thighR', 'shinR', 'shoeR',
  'upperArmL', 'foreArmL', 'handL', 'upperArmR', 'foreArmR', 'handR', 'vest', 'backpack'];
const COLORS = {
  pelvis: 0x163f70, torso: 0x1f5fa8, head: 0xe2a97e, helmet: 0x2b3036, thighL: 0x163f70, shinL: 0x163f70, shoeL: 0x1a1c20,
  thighR: 0x163f70, shinR: 0x163f70, shoeR: 0x1a1c20, upperArmL: 0x1f5fa8, foreArmL: 0x1f5fa8, handL: 0x222428,
  upperArmR: 0x1f5fa8, foreArmR: 0x1f5fa8, handR: 0x222428, vest: 0x3b4048, backpack: 0x2b3036,
};
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const _base = new THREE.Matrix4(), _m = new THREE.Matrix4(), _gunL = new THREE.Matrix4();
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(1, 1, 1), _e = new THREE.Euler();

// Posición de cada soldado respecto al protagonista (detrás y a los lados)
export function slot(k) {
  if (k < 2) return [k === 0 ? -0.85 : 0.85, 0.15];
  const r = Math.floor((k - 2) / 4) + 1, c = (k - 2) % 4;
  return [(c - 1.5) * 0.8 + (r % 2 ? 0.2 : -0.2), r * 0.85];
}

// Escuadrón de soldados que corren y disparan con el protagonista
export class Squad {
  constructor(scene) {
    const geos = bodyGeometries();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.parts = [];
    for (const k of PARTS) {
      const im = new THREE.InstancedMesh(geos[PART_GEO[k] || k], new THREE.MeshLambertMaterial({ color: COLORS[k] }), MAX_SQUAD);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false; im.count = 0;
      im.userData.joint = JOINT_INDEX[PART_JOINT[k]];
      scene.add(im); this.parts.push(im);
    }
    this.gunMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.guns = {};
    this.scene = scene;
    const sh = new THREE.CircleGeometry(0.42, 12); sh.rotateX(-Math.PI / 2);
    this.shadow = new THREE.InstancedMesh(sh, new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.3, depthWrite: false }), MAX_SQUAD);
    this.shadow.frustumCulled = false; this.shadow.count = 0; scene.add(this.shadow);
    this.pose = makePose(); this.joints = makeJointMatrices();
    this.members = []; this.model = 'pistola';
  }

  _gun(model) {
    if (!this.guns[model]) {
      const im = new THREE.InstancedMesh(gunGeometry(model), this.gunMat, MAX_SQUAD);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; im.count = 0;
      this.scene.add(im); this.guns[model] = im;
    }
    return this.guns[model];
  }

  setWeapon(model) {
    for (const im of Object.values(this.guns)) im.count = 0;
    this.model = model;
  }

  get count() { return this.members.length; }

  add(n, fromX, fromZ) {
    for (let i = 0; i < n && this.members.length < MAX_SQUAD; i++) {
      this.members.push({ x: fromX + (Math.random() - 0.5), z: fromZ + Math.random(), phase: Math.random() * 6.28, fireCd: Math.random() * 0.3 });
    }
  }

  // quita n soldados (los de atrás primero); devuelve cuántos ha quitado y dónde
  remove(n) {
    const out = [];
    for (let i = 0; i < n && this.members.length; i++) out.push(this.members.pop());
    return out;
  }

  clear() { this.members.length = 0; this.update(0, 0, 0); }

  update(dt, px, pz, onFire) {
    const lim = ROAD.halfWidth - 0.4;
    const gun = this._gun(this.model);
    const n = this.members.length;
    for (let k = 0; k < n; k++) {
      const m = this.members[k];
      const [ox, oz] = slot(k);
      const tx = Math.max(-lim, Math.min(lim, px + ox)), tz = pz + oz;
      const f = Math.min(1, dt * 8);
      m.x += (tx - m.x) * f; m.z += (tz - m.z) * f;
      m.phase += dt * 11.5;
      _base.compose(_p.set(m.x, 0, m.z), _q.setFromEuler(_e.set(0, Math.PI, 0)), _s.set(1, 1, 1));
      runPose(this.pose, m.phase, 1, { aim: true, aimYaw: 0 });
      const J = solve(_base, this.pose, this.joints);
      for (const im of this.parts) im.setMatrixAt(k, J[im.userData.joint]);
      // arma en la mano derecha
      _gunL.makeRotationX(Math.PI / 2).setPosition(0, -0.07, 0.01);
      _m.multiplyMatrices(J[JOINT_INDEX.wristR], _gunL);
      gun.setMatrixAt(k, _m);
      this.shadow.setMatrixAt(k, _m.compose(_p.set(m.x, 0.025, m.z), _q.identity(), _s.set(1, 1, 1)));
      m.fireCd -= dt;
      if (onFire && m.fireCd <= 0) { m.fireCd += onFire(m) || 0.25; if (m.fireCd < 0) m.fireCd = 0; }
      _s.set(1, 1, 1);
    }
    for (const im of this.parts) { im.count = n; im.instanceMatrix.needsUpdate = true; }
    gun.count = n; gun.instanceMatrix.needsUpdate = true;
    this.shadow.count = n; this.shadow.instanceMatrix.needsUpdate = true;
  }
}
