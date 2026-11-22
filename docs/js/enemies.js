import * as THREE from 'three';
import { pivotTopBox } from './geom.js';
import { ENEMY_TYPES, MAX_ENEMIES, ROAD } from './config.js';

// Paletas para que la horda no sea idéntica (GDD 5.1)
const TOPS = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xecf0f1, 0x34495e, 0xe67e22, 0xff6b9d, 0x95a5a6, 0x16a085, 0xd35400, 0x2c3e50, 0xf1c40f];
const PANTS = [0x2c3e50, 0x1f2a36, 0x5d6d7e, 0x34495e, 0x4a3b2c, 0x22313f, 0x6c3483, 0x1b4f72, 0x7b7d7d];
const SKIN = [0xf5cba7, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac, 0xd8a07a, 0x6b4226];
const HAIR = [0x1b1b1b, 0x3b2314, 0x6d4c2f, 0xb8860b, 0x8b0000, 0x222244, 0xdddddd, 0xff7f50];
const CAPS = [0xc0392b, 0x2980b9, 0x111111, 0xf1c40f, 0x27ae60, 0xffffff, 0x8e44ad];
const PACKS = [0x2d3436, 0x6c5ce7, 0x00b894, 0xd63031, 0xfdcb6e, 0x0984e3];
const SHOES = [0xffffff, 0x111111, 0xe74c3c, 0x3498db, 0xf1c40f];
const SIGNS = [0xffffff, 0xfff3a0, 0xffd1dc, 0xc8f7c5];

const _c = new THREE.Color();
const _m = new THREE.Matrix4(), _base = new THREE.Matrix4(), _loc = new THREE.Matrix4(), _tmp = new THREE.Matrix4();
const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

function merged(parts) {
  // une varias cajas en una geometría simple
  const pos = [], nor = [];
  for (const [w, h, d, x, y, z] of parts) {
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.translate(x, y, z);
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}

const pick = a => a[(Math.random() * a.length) | 0];

export class Horde {
  constructor(scene) {
    this.scene = scene;
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const defs = {
      legL: pivotTopBox(0.22, 0.8, 0.24), legR: pivotTopBox(0.22, 0.8, 0.24),
      shoeL: new THREE.BoxGeometry(0.25, 0.13, 0.34), shoeR: new THREE.BoxGeometry(0.25, 0.13, 0.34),
      torso: new THREE.BoxGeometry(0.56, 0.66, 0.34),
      armL: pivotTopBox(0.16, 0.62, 0.18), armR: pivotTopBox(0.16, 0.62, 0.18),
      head: new THREE.BoxGeometry(0.32, 0.34, 0.32),
      hair: new THREE.BoxGeometry(0.35, 0.12, 0.35),
      cap: merged([[0.37, 0.13, 0.37, 0, 0, 0], [0.3, 0.04, 0.22, 0, -0.05, 0.26]]),
      helmet: merged([[0.42, 0.24, 0.42, 0, 0, 0], [0.36, 0.14, 0.04, 0, -0.14, 0.2]]),
      backpack: new THREE.BoxGeometry(0.42, 0.48, 0.2),
      vest: new THREE.BoxGeometry(0.64, 0.56, 0.42),
      sign: merged([[0.05, 1.1, 0.05, 0, 0.55, 0], [0.85, 0.5, 0.04, 0, 1.25, 0.03]]),
      flag: merged([[0.06, 2.6, 0.06, 0, 1.3, 0], [1.1, 0.65, 0.03, 0.58, 2.25, 0]]),
    };
    this.parts = {};
    for (const [k, g] of Object.entries(defs)) {
      const im = new THREE.InstancedMesh(g, mat, MAX_ENEMIES);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      im.frustumCulled = false;
      for (let i = 0; i < MAX_ENEMIES; i++) { im.setMatrixAt(i, ZERO); im.setColorAt(i, _c.set(0xffffff)); }
      im.count = 0;
      scene.add(im);
      this.parts[k] = im;
    }
    // sombras redondas baratas
    const shadowGeo = new THREE.CircleGeometry(0.5, 12); shadowGeo.rotateX(-Math.PI / 2);
    this.shadow = new THREE.InstancedMesh(shadowGeo, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false }), MAX_ENEMIES);
    this.shadow.frustumCulled = false; this.shadow.count = 0;
    scene.add(this.shadow);

    this.list = [];
    for (let i = 0; i < MAX_ENEMIES; i++) this.list.push({ active: false, i });
    this.activeCount = 0;
    this.maxUsed = 0;
    // rejilla espacial a lo largo de la carretera
    this.binSize = 2; this.bins = 100;
    this.head = new Int32Array(this.bins); this.next = new Int32Array(MAX_ENEMIES);
    this.gridBase = 0;
  }

  spawn(typeName, x, z, extra = {}) {
    let e = null;
    for (const c of this.list) if (!c.active) { e = c; break; }
    if (!e) return null;
    const t = ENEMY_TYPES[typeName];
    const h = 0.9 + Math.random() * 0.2;
    Object.assign(e, {
      active: true, type: typeName, t, x, z, hp: t.hp, maxHp: t.hp,
      speed: t.speed * (0.85 + Math.random() * 0.3) * (extra.speedMul || 1),
      lat: t.lateral, scale: t.scale * h, width: t.width * (0.9 + Math.random() * 0.25),
      phase: Math.random() * 6.28, state: 'run', dieT: 0, flash: 0, vx: 0,
      weave: Math.random() * 6.28, dodgeCd: 0, yaw: 0, fall: 0,
      top: pick(TOPS), skin: pick(SKIN), hairC: pick(HAIR), pants: pick(PANTS), shoe: pick(SHOES),
      cap: false, pack: false, sign: false, flag: typeName === 'lider', helmet: typeName === 'blindado', vest: typeName === 'blindado' || typeName === 'lider',
      wander: (Math.random() - 0.5) * 2, homeX: x,
      aggr: typeName === 'corredor' || typeName === 'lider' ? 1 : 0.35 + Math.random() * 0.65,
    });
    if (!e.helmet && !e.flag) {
      e.cap = Math.random() < 0.4; e.pack = Math.random() < 0.45;
      e.sign = Math.random() < 0.22;
    }
    if (typeName === 'grande') e.top = pick([0x7f8c8d, 0x5d4037, 0x2c3e50, 0x8e44ad]);
    this._paint(e);
    this.activeCount++;
    this.maxUsed = Math.max(this.maxUsed, e.i + 1);
    for (const im of Object.values(this.parts)) im.count = this.maxUsed;
    this.shadow.count = this.maxUsed;
    return e;
  }

  _paint(e) {
    const P = this.parts, i = e.i;
    P.legL.setColorAt(i, _c.set(e.pants)); P.legR.setColorAt(i, _c);
    P.shoeL.setColorAt(i, _c.set(e.shoe)); P.shoeR.setColorAt(i, _c);
    P.torso.setColorAt(i, _c.set(e.top)); P.armL.setColorAt(i, _c); P.armR.setColorAt(i, _c);
    P.head.setColorAt(i, _c.set(e.skin));
    P.hair.setColorAt(i, _c.set(e.hairC));
    P.cap.setColorAt(i, _c.set(pick(CAPS)));
    P.helmet.setColorAt(i, _c.set(0x2f3640));
    P.backpack.setColorAt(i, _c.set(pick(PACKS)));
    P.vest.setColorAt(i, _c.set(e.flag ? 0xffd32a : 0x485460));
    P.sign.setColorAt(i, _c.set(pick(SIGNS)));
    P.flag.setColorAt(i, _c.set(0xd7263d));
    for (const im of Object.values(P)) im.instanceColor.needsUpdate = true;
  }

  kill(e) {
    if (e.state !== 'run') return;
    e.state = 'dying'; e.dieT = 0;
  }

  release(e) {
    e.active = false;
    this.activeCount--;
    for (const im of Object.values(this.parts)) im.setMatrixAt(e.i, ZERO);
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

  // llama a cb(e) por cada enemigo vivo con z dentro de [z0, z1]
  query(z0, z1, cb) {
    const b0 = Math.max(0, Math.floor((z0 - this.gridBase) / this.binSize));
    const b1 = Math.min(this.bins - 1, Math.floor((z1 - this.gridBase) / this.binSize));
    for (let b = b0; b <= b1; b++) {
      for (let j = this.head[b]; j !== -1; j = this.next[j]) if (cb(this.list[j]) === true) return;
    }
  }

  update(dt, px, pz, onDead) {
    const P = this.parts;
    const lim = ROAD.halfWidth - 0.5;
    this.buildGrid(pz - 150);
    // separación ligera para que no se apilen
    for (let b = 0; b < this.bins; b++) {
      for (let a = this.head[b]; a !== -1; a = this.next[a]) {
        const ea = this.list[a];
        for (let c = this.next[a]; c !== -1; c = this.next[c]) {
          const ec = this.list[c];
          const dx = ec.x - ea.x, dz = ec.z - ea.z;
          const min = 0.38 * (ea.width + ec.width);
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
        // mantienen su posición en la horda y se cierran sobre el jugador al acercarse
        const k = dzp < 45 ? (1 - dzp / 45) * e.aggr : 0;
        e.homeX += e.wander * dt * 0.3;
        if (Math.abs(e.homeX) > lim) e.wander = -e.wander;
        let want = (e.homeX + (px - e.homeX) * k - e.x) * 1.5;
        if (e.type === 'agil') want += Math.sin(e.weave += dt * 3.2) * 2.5;
        want = Math.max(-e.lat, Math.min(e.lat, want));
        e.vx += (want - e.vx) * Math.min(1, dt * 4);
        e.x += e.vx * dt;
        if (e.x > lim) e.x = lim; else if (e.x < -lim) e.x = -lim;
        e.phase += dt * (5 + e.speed * 1.2);
        e.yaw = Math.atan2(e.vx, e.speed) * 0.6;
        if (e.dodgeCd > 0) e.dodgeCd -= dt;
        if (e.flash > 0) e.flash -= dt;
      } else {
        e.dieT += dt;
        e.z -= 3 * dt * Math.max(0, 1 - e.dieT * 2);
        e.fall = Math.min(1, e.dieT / 0.35) * 1.45;
        if (e.dieT > 0.75) { onDead && onDead(e); this.release(e); continue; }
      }
      this._pose(e);
    }
    for (const im of Object.values(P)) { im.instanceMatrix.needsUpdate = true; }
    P.torso.instanceColor.needsUpdate = true;
    this.shadow.instanceMatrix.needsUpdate = true;
  }

  _pose(e) {
    const P = this.parts, i = e.i;
    const running = e.state === 'run';
    const sw = running ? Math.sin(e.phase) : 0;
    const bob = running ? Math.abs(Math.cos(e.phase)) * 0.09 : 0;
    let sc = e.scale;
    if (!running && e.dieT > 0.45) sc *= Math.max(0.01, 1 - (e.dieT - 0.45) / 0.3);
    const sink = running ? 0 : Math.max(0, e.dieT - 0.4) * 1.2;
    _base.compose(_p.set(e.x, bob - sink, e.z), _q.setFromEuler(_e.set(-e.fall, e.yaw, 0)), _s.set(sc * e.width, sc, sc * e.width));

    const set = (im, lx, ly, lz, rx = 0) => {
      _loc.compose(_p.set(lx, ly, lz), _q.setFromEuler(_e.set(rx, 0, 0)), _s.set(1, 1, 1));
      _m.multiplyMatrices(_base, _loc);
      im.setMatrixAt(i, _m);
    };
    const leg = sw * 0.75;
    set(P.legL, -0.13, 0.86, 0, leg);
    set(P.legR, 0.13, 0.86, 0, -leg);
    // zapatillas al final de cada pierna
    for (const [im, x, a] of [[P.shoeL, -0.13, leg], [P.shoeR, 0.13, -leg]]) {
      _loc.compose(_p.set(x, 0.86, 0), _q.setFromEuler(_e.set(a, 0, 0)), _s.set(1, 1, 1));
      _tmp.makeTranslation(0, -0.8, 0.05);
      _m.multiplyMatrices(_base, _loc).multiply(_tmp);
      im.setMatrixAt(i, _m);
    }
    set(P.torso, 0, 1.2, 0);
    set(P.armL, -0.37, 1.49, 0, running ? -sw * 0.7 : -2.2);
    set(P.armR, 0.37, 1.49, 0, (e.sign || e.flag) && running ? -2.75 : (running ? sw * 0.7 : -2.2));
    set(P.head, 0, 1.71, 0);
    if (e.cap) { set(P.cap, 0, 1.92, 0); P.hair.setMatrixAt(i, ZERO); } else { P.cap.setMatrixAt(i, ZERO); e.helmet ? P.hair.setMatrixAt(i, ZERO) : set(P.hair, 0, 1.91, -0.01); }
    e.helmet ? set(P.helmet, 0, 1.9, 0) : P.helmet.setMatrixAt(i, ZERO);
    e.pack ? set(P.backpack, 0, 1.22, -0.27) : P.backpack.setMatrixAt(i, ZERO);
    e.vest ? set(P.vest, 0, 1.22, 0) : P.vest.setMatrixAt(i, ZERO);
    e.sign && running ? set(P.sign, 0.42, 1.95, 0.05) : P.sign.setMatrixAt(i, ZERO);
    e.flag ? set(P.flag, 0.45, 1.6, 0.05) : P.flag.setMatrixAt(i, ZERO);
    P.torso.setColorAt(i, _c.set(e.flash > 0 ? 0xffffff : e.top));
    _m.compose(_p.set(e.x, 0.02, e.z), _q.identity(), _s.set(e.width * e.scale * 1.1, 1, e.width * e.scale * 1.1));
    this.shadow.setMatrixAt(i, running ? _m : ZERO);
  }
}
