import * as THREE from 'three';
import { ENEMY_TYPES, MAX_ENEMIES, ROAD } from './config.js';
import { bodyGeometries, PART_JOINT, PART_GEO, JOINT_INDEX, makePose, runPose, solve, makeJointMatrices } from './rig.js';

// Paletas para que la horda no sea idéntica (GDD 5.1)
const TOPS = [0xc0392b, 0x2f6fb0, 0x27ae60, 0xe67e22, 0x8e44ad, 0x16a085, 0xe8e8e8, 0x2c3e50, 0xd35400, 0xe84393, 0x7f8c8d, 0x1e272e, 0xf1c40f, 0x6d214f, 0x3d3d3d, 0x8b5a2b];
const PANTS = [0x2c3e50, 0x1f2a36, 0x3b5b7d, 0x34495e, 0x4a3b2c, 0x22313f, 0x5a5a5a, 0x1b4f72, 0x6b705c, 0x111111];
const SKIN = [0xf1c7a5, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac, 0xd8a07a, 0x6b4226, 0xb5835a];
const HAIR = [0x1b1b1b, 0x3b2314, 0x6d4c2f, 0xb8860b, 0x7a2e12, 0x2b2b3b, 0xcfcfcf, 0x9c6b3c];
const CAPS = [0xc0392b, 0x2980b9, 0x111111, 0xf1c40f, 0x27ae60, 0xf5f5f5, 0x8e44ad, 0x34495e];
const PACKS = [0x2d3436, 0x6c5ce7, 0x00b894, 0xb33939, 0xfdcb6e, 0x0984e3, 0x4b4b4b];
const SHOES = [0xf5f5f5, 0x1a1a1a, 0xe74c3c, 0x3498db, 0xf1c40f, 0x9b9b9b];
const SIGNS = [0xffffff, 0xfff3a0, 0xffd1dc, 0xc8f7c5, 0xbfe3ff];

const _c = new THREE.Color();
const _base = new THREE.Matrix4(), _m = new THREE.Matrix4();
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const pick = a => a[(Math.random() * a.length) | 0];

const PARTS = ['pelvis', 'torso', 'head', 'hair', 'cap', 'helmet', 'hood', 'thighL', 'shinL', 'shoeL', 'thighR', 'shinR', 'shoeR',
  'upperArmL', 'foreArmL', 'handL', 'upperArmR', 'foreArmR', 'handR', 'backpack', 'vest', 'sign', 'flag'];

export class Horde {
  constructor(scene) {
    this.scene = scene;
    const geos = bodyGeometries();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.parts = {};
    for (const k of PARTS) {
      const im = new THREE.InstancedMesh(geos[PART_GEO[k] || k], mat, MAX_ENEMIES);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false;
      for (let i = 0; i < MAX_ENEMIES; i++) { im.setMatrixAt(i, ZERO); im.setColorAt(i, _c.set(0xffffff)); }
      im.count = 0;
      im.userData.joint = JOINT_INDEX[PART_JOINT[k]];
      scene.add(im);
      this.parts[k] = im;
    }
    this.partList = Object.entries(this.parts);
    const shadowGeo = new THREE.CircleGeometry(0.42, 14); shadowGeo.rotateX(-Math.PI / 2);
    this.shadow = new THREE.InstancedMesh(shadowGeo, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }), MAX_ENEMIES);
    this.shadow.frustumCulled = false; this.shadow.count = 0;
    scene.add(this.shadow);

    this.pose = makePose();
    this.joints = makeJointMatrices();
    this.list = [];
    for (let i = 0; i < MAX_ENEMIES; i++) this.list.push({ active: false, i });
    this.activeCount = 0;
    this.maxUsed = 0;
    this.binSize = 2; this.bins = 100;
    this.head = new Int32Array(this.bins); this.next = new Int32Array(MAX_ENEMIES);
    this.gridBase = 0;
  }

  spawn(typeName, x, z, extra = {}) {
    let e = null;
    for (const c of this.list) if (!c.active) { e = c; break; }
    if (!e) return null;
    const t = ENEMY_TYPES[typeName];
    const h = 0.92 + Math.random() * 0.16;
    Object.assign(e, {
      active: true, type: typeName, t, x, z, hp: t.hp, maxHp: t.hp,
      speed: t.speed * (0.85 + Math.random() * 0.3) * (extra.speedMul || 1),
      lat: t.lateral, scale: t.scale * h, width: t.width * (0.92 + Math.random() * 0.2),
      phase: Math.random() * 6.28, state: 'run', dieT: 0, flash: 0, vx: 0, recoil: 0,
      weave: Math.random() * 6.28, dodgeCd: 0, yaw: 0, fall: 0,
      top: pick(TOPS), skin: pick(SKIN), pants: pick(PANTS),
      cap: false, pack: false, sign: false, hood: false, longSleeve: Math.random() < 0.55,
      flag: typeName === 'lider', helmet: typeName === 'blindado', vest: typeName === 'blindado' || typeName === 'lider',
      wander: (Math.random() - 0.5) * 2, homeX: x,
      aggr: typeName === 'corredor' || typeName === 'lider' ? 1 : 0.35 + Math.random() * 0.65,
      stride: 0.9 + Math.random() * 0.2,
    });
    if (!e.helmet && !e.flag) {
      const r = Math.random();
      e.hood = r < 0.22; e.cap = !e.hood && r < 0.55;
      if (e.hood) e.longSleeve = true;
      e.pack = Math.random() < 0.45;
      e.sign = Math.random() < 0.2;
    }
    if (typeName === 'grande') e.top = pick([0x7f8c8d, 0x5d4037, 0x2c3e50, 0x6d214f]);
    if (typeName === 'corredor') e.top = pick([0xe74c3c, 0xf1c40f, 0x00cec9, 0xff7675]);
    this._paint(e);
    this.activeCount++;
    if (e.i + 1 > this.maxUsed) {
      this.maxUsed = e.i + 1;
      for (const [, im] of this.partList) im.count = this.maxUsed;
      this.shadow.count = this.maxUsed;
    }
    return e;
  }

  _paint(e) {
    const P = this.parts, i = e.i;
    const set = (k, c) => P[k].setColorAt(i, _c.set(c));
    set('pelvis', e.pants); set('thighL', e.pants); set('thighR', e.pants); set('shinL', e.pants); set('shinR', e.pants);
    const shoe = pick(SHOES); set('shoeL', shoe); set('shoeR', shoe);
    set('torso', e.top); set('upperArmL', e.top); set('upperArmR', e.top); set('hood', e.top);
    const fore = e.longSleeve ? e.top : e.skin;
    set('foreArmL', fore); set('foreArmR', fore);
    set('handL', e.skin); set('handR', e.skin); set('head', e.skin);
    set('hair', pick(HAIR)); set('cap', pick(CAPS)); set('helmet', 0x2f3640);
    set('backpack', pick(PACKS)); set('vest', e.flag ? 0xffd32a : 0x3d4a57);
    set('sign', pick(SIGNS)); set('flag', 0xd7263d);
    for (const [, im] of this.partList) im.instanceColor.needsUpdate = true;
  }

  kill(e) { if (e.state === 'run') { e.state = 'dying'; e.dieT = 0; } }

  release(e) {
    e.active = false;
    this.activeCount--;
    for (const [, im] of this.partList) im.setMatrixAt(e.i, ZERO);
    this.shadow.setMatrixAt(e.i, ZERO);
  }

  clear() { for (const e of this.list) if (e.active) this.release(e); this.activeCount = 0; }

  buildGrid(baseZ) {
    this.gridBase = baseZ;
    this.head.fill(-1);
    for (const e of this.list) {
      if (!e.active || e.state !== 'run') continue;
      const b = Math.floor((e.z - baseZ) / this.binSize);
      if (b < 0 || b >= this.bins) continue;
      this.next[e.i] = this.head[b]; this.head[b] = e.i;
    }
  }

  query(z0, z1, cb) {
    const b0 = Math.max(0, Math.floor((z0 - this.gridBase) / this.binSize));
    const b1 = Math.min(this.bins - 1, Math.floor((z1 - this.gridBase) / this.binSize));
    for (let b = b0; b <= b1; b++) {
      for (let j = this.head[b]; j !== -1; j = this.next[j]) if (cb(this.list[j]) === true) return;
    }
  }

  update(dt, px, pz, onDead) {
    const lim = ROAD.halfWidth - 0.5;
    this.buildGrid(pz - 150);
    for (let b = 0; b < this.bins; b++) {
      for (let a = this.head[b]; a !== -1; a = this.next[a]) {
        const ea = this.list[a];
        for (let c = this.next[a]; c !== -1; c = this.next[c]) {
          const ec = this.list[c];
          const dx = ec.x - ea.x, dz = ec.z - ea.z;
          const min = 0.36 * (ea.width + ec.width);
          if (Math.abs(dx) < min && Math.abs(dz) < 0.7) {
            const push = (min - Math.abs(dx)) * 0.5 * (dx >= 0 ? 1 : -1);
            ea.x -= push * 0.5; ec.x += push * 0.5;
          }
        }
      }
    }
    for (const e of this.list) {
      if (!e.active) continue;
      if (e.state === 'run') {
        e.z += e.speed * dt;
        if (e.z > pz + 4) { this.release(e); continue; }
        const dzp = pz - e.z;
        const k = dzp < 45 ? (1 - dzp / 45) * e.aggr : 0;
        e.homeX += e.wander * dt * 0.3;
        if (Math.abs(e.homeX) > lim) e.wander = -e.wander;
        let want = (e.homeX + (px - e.homeX) * k - e.x) * 1.5;
        if (e.type === 'agil') want += Math.sin(e.weave += dt * 3.2) * 2.5;
        want = Math.max(-e.lat, Math.min(e.lat, want));
        e.vx += (want - e.vx) * Math.min(1, dt * 4);
        e.x += e.vx * dt;
        if (e.x > lim) e.x = lim; else if (e.x < -lim) e.x = -lim;
        // la cadencia de zancada depende de la velocidad
        e.phase += dt * (6 + e.speed * 0.9) / e.stride;
        e.yaw = Math.atan2(e.vx, e.speed) * 0.6;
        if (e.dodgeCd > 0) e.dodgeCd -= dt;
        if (e.flash > 0) e.flash -= dt;
        if (e.recoil > 0) e.recoil = Math.max(0, e.recoil - dt * 6);
      } else {
        e.dieT += dt;
        e.z -= 3 * dt * Math.max(0, 1 - e.dieT * 2);
        e.fall = Math.min(1, e.dieT / 0.35) * 1.45;
        if (e.dieT > 0.8) { onDead && onDead(e); this.release(e); continue; }
      }
      this._pose(e);
    }
    for (const [, im] of this.partList) im.instanceMatrix.needsUpdate = true;
    this.parts.torso.instanceColor.needsUpdate = true;
    this.shadow.instanceMatrix.needsUpdate = true;
  }

  _pose(e) {
    const P = this.parts, i = e.i;
    const running = e.state === 'run';
    let sc = e.scale;
    if (!running && e.dieT > 0.5) sc *= Math.max(0.01, 1 - (e.dieT - 0.5) / 0.3);
    const sink = running ? 0 : Math.max(0, e.dieT - 0.45) * 1.2;
    _base.compose(_p.set(e.x, -sink, e.z), _q.setFromEuler(_e.set(-e.fall - e.recoil * 0.35, e.yaw, 0)), _s.set(sc * e.width, sc, sc * e.width));
    const pose = runPose(this.pose, e.phase, running ? (e.type === 'grande' ? 0.75 : 1) : 0.3,
      { raiseR: running && (e.sign || e.flag), armsUp: !running });
    const J = solve(_base, pose, this.joints);
    for (const [k, im] of this.partList) {
      let show = true;
      switch (k) {
        case 'hair': show = !e.cap && !e.helmet && !e.hood; break;
        case 'cap': show = e.cap; break;
        case 'helmet': show = e.helmet; break;
        case 'hood': show = e.hood; break;
        case 'backpack': show = e.pack; break;
        case 'vest': show = e.vest; break;
        case 'sign': show = e.sign && running; break;
        case 'flag': show = e.flag; break;
      }
      im.setMatrixAt(i, show ? J[im.userData.joint] : ZERO);
    }
    P.torso.setColorAt(i, _c.set(e.flash > 0 ? 0xffffff : e.top));
    _m.compose(_p.set(e.x, 0.02, e.z), _q.identity(), _s.set(e.width * e.scale * 1.1, 1, e.width * e.scale * 1.1));
    this.shadow.setMatrixAt(i, running ? _m : ZERO);
  }
}
