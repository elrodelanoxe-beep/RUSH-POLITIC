import * as THREE from 'three';
import { JOINTS, bodyGeometries, mergeGeos, makePose, runPose, T, S, R, sph, box, cyl, tint } from './rig.js';
import { BOSS, MINIBOSS, ROAD } from './config.js';

const lam = c => new THREE.MeshLambertMaterial({ color: c });
const vcMat = () => new THREE.MeshLambertMaterial({ vertexColors: true });
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- Armas cuerpo a cuerpo (en la mano derecha, apuntando hacia abajo del brazo) ----------
function batGeo() {
  // bate de béisbol de madera con pinchos
  const parts = [
    tint(T(cyl(0.022, 0.026, 0.16, 10), 0, -0.06, 0), 0x222222),           // empuñadura con cinta
    tint(T(cyl(0.026, 0.06, 0.62, 12), 0, -0.45, 0), 0xb07a3c),             // cuerpo
    tint(T(sph(0.06, 10, 6), 0, -0.76, 0), 0xb07a3c),
  ];
  for (let i = 0; i < 14; i++) {
    const y = -0.5 - (i % 5) * 0.06, a = i * 2.4;
    const r = 0.045 + (i % 5) * 0.004;
    parts.push(tint(T(R(new THREE.ConeGeometry(0.012, 0.07, 5), 0, 0, -Math.PI / 2).rotateY(a), Math.cos(a) * r, y, -Math.sin(a) * r), 0xcfd4da));
  }
  return mergeGeos(parts);
}
function batonGeo() {
  // porra gigante
  return mergeGeos([
    tint(T(cyl(0.03, 0.03, 0.18, 10), 0, -0.06, 0), 0x333333),
    tint(T(R(cyl(0.012, 0.012, 0.14, 6), 0, 0, Math.PI / 2), 0.07, -0.1, 0), 0x333333),
    tint(T(cyl(0.045, 0.05, 0.95, 12), 0, -0.62, 0), 0x16181c),
    tint(T(sph(0.05, 10, 6), 0, -1.1, 0), 0x16181c),
  ]);
}
function bottleGeo() {
  // botella de vidrio rota (cuello en la mano, cristal afilado abajo)
  const parts = [
    tint(T(cyl(0.022, 0.026, 0.14, 10), 0, -0.05, 0), 0x2e7d32),
    tint(T(cyl(0.028, 0.07, 0.1, 12), 0, -0.16, 0), 0x2e7d32),
    tint(T(cyl(0.07, 0.07, 0.16, 12), 0, -0.29, 0), 0x388e3c),
  ];
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2, h = 0.07 + (i % 3) * 0.05;
    parts.push(tint(T(R(new THREE.ConeGeometry(0.03, h, 3), Math.PI, a, 0), Math.cos(a) * 0.055, -0.37 - h / 2, Math.sin(a) * 0.055), 0x9be7a0));
  }
  return mergeGeos(parts);
}

// ---------- Modelos ----------
function buildBody(owner, look) {
  const G = bodyGeometries();
  const m = look.mats;
  owner.joints = {};
  for (const [name, parent, off] of JOINTS) {
    const j = new THREE.Group(); j.position.set(...off); j.rotation.order = 'YXZ';
    (parent ? owner.joints[parent] : owner.body).add(j); owner.joints[name] = j;
  }
  const at = (joint, geo, mat) => { const mm = new THREE.Mesh(geo, mat); owner.joints[joint].add(mm); return mm; };
  at('pelvis', G.pelvis, m.pants); at('spine', G.torso, m.top); at('head', G.head, m.skin);
  for (const sd of ['L', 'R']) {
    at('hip' + sd, look.wideLegs ? S(G.thigh.clone(), 1.45, 1, 1.45) : G.thigh, m.pants);
    at('knee' + sd, look.wideLegs ? S(G.shin.clone(), 1.7, 1, 1.7) : G.shin, m.pants);
    at('ankle' + sd, look.sandals ? mergeGeos([tint(S(T(sph(0.06, 10, 7), 0, -0.03, 0.05), 0.9, 0.55, 1.8), look.skinHex), tint(T(box(0.13, 0.025, 0.28), 0, -0.07, 0.05), 0x6d4c2f), tint(T(box(0.12, 0.02, 0.03), 0, -0.035, 0.08), 0x6d4c2f)]) : G.shoe,
      look.sandals ? vcMat() : m.shoe);
    at('shoulder' + sd, G.upperArm, m.top); at('elbow' + sd, G.foreArm, look.bareArms ? m.skin : m.top); at('wrist' + sd, G.hand, m.skin);
  }
  owner.mouth = at('head', T(S(sph(0.03, 10, 6), 1.5, 0.6, 0.5), 0, 0.065, 0.112), lam(0x4a0d0d));
  at('head', mergeGeos([
    tint(S(T(sph(0.016, 8, 6), -0.042, 0.135, 0.1), 1, 1.2, 0.6), 0x111111), tint(S(T(sph(0.016, 8, 6), 0.042, 0.135, 0.1), 1, 1.2, 0.6), 0x111111),
    tint(T(R(box(0.06, 0.016, 0.015), 0, 0, -0.35), -0.045, 0.172, 0.108), 0x222222), tint(T(R(box(0.06, 0.016, 0.015), 0, 0, 0.35), 0.045, 0.172, 0.108), 0x222222),
  ]), vcMat());
  if (look.extra) look.extra(owner, at);
}

const LOOKS = {
  // EL GRAN PERROFLAUTA: jefe final ficticio y satírico
  final: {
    skinHex: 0xd9a27c, sandals: true, wideLegs: true, bareArms: true,
    mats: { top: lam(0x8d6e63), pants: lam(0x7b5ea7), skin: lam(0xd9a27c), shoe: lam(0x6d4c2f) },
    extra(o, at) {
      // poncho de rayas
      const stripes = [];
      const cols = [0xd84315, 0xfbc02d, 0x2e7d32, 0x6d4c41, 0xfbc02d, 0xd84315];
      for (let i = 0; i < 6; i++) stripes.push(tint(S(T(new THREE.CylinderGeometry(0.2 + i * 0.028, 0.228 + i * 0.028, 0.07, 14, 1, true), 0, 0.5 - i * 0.07, 0), 1.25, 1, 0.9), cols[i]));
      stripes.push(tint(S(T(new THREE.CylinderGeometry(0.06, 0.2, 0.08, 14), 0, 0.54, 0), 1.25, 1, 0.9), 0xd84315));
      at('spine', mergeGeos(stripes), vcMat()).material.side = THREE.DoubleSide;
      // rastas, barba, cinta del pelo, aro en la nariz
      const dread = [];
      for (let i = 0; i < 22; i++) {
        const a = Math.PI * 0.15 + (i / 22) * Math.PI * 1.7, len = 0.22 + (i % 4) * 0.05;
        dread.push(tint(T(R(cyl(0.017, 0.013, len, 6), 0.15 * Math.sin(a), 0, 0.15 * Math.cos(a)), Math.sin(a) * 0.11, 0.17 - len / 2, Math.cos(a) * 0.105 - 0.01), i % 3 ? 0x5d4037 : 0x795548));
      }
      dread.push(tint(S(T(new THREE.SphereGeometry(0.122, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), 0, 0.14, -0.005), 1.04, 1.1, 1.1), 0x5d4037));
      dread.push(tint(T(cyl(0.124, 0.124, 0.03, 14), 0, 0.19, -0.005), 0xff7043));
      dread.push(tint(S(T(sph(0.09, 10, 7), 0, 0.03, 0.035), 1.15, 1.1, 1.05), 0x6d4c41));
      dread.push(tint(T(new THREE.TorusGeometry(0.012, 0.004, 5, 10), 0.012, 0.09, 0.15), 0xd4d4d4));
      at('head', mergeGeos(dread), vcMat());
      // pulseras y riñonera
      for (const sd of ['L', 'R']) at('elbow' + sd, mergeGeos([tint(T(cyl(0.05, 0.05, 0.03, 10), 0, -0.22, 0), 0xffca28), tint(T(cyl(0.048, 0.048, 0.02, 10), 0, -0.18, 0), 0x43a047)]), vcMat());
      at('pelvis', mergeGeos([tint(T(box(0.22, 0.09, 0.07), 0, 0.03, 0.17), 0x00897b), tint(T(cyl(0.16, 0.16, 0.025, 12).scale(1.27, 1, 0.86), 0, 0.03, 0), 0x004d40)]), vcMat());
    },
    weapon: batGeo,
  },
  porra: {
    skinHex: 0xc68642,
    mats: { top: lam(0x1e1e1e), pants: lam(0x2d3436), skin: lam(0xc68642), shoe: lam(0x111111) },
    extra(o, at) {
      at('head', mergeGeos([
        tint(S(T(new THREE.SphereGeometry(0.15, 12, 8, Math.PI, Math.PI, 0, Math.PI * 0.75), 0, 0.12, -0.03), 1.05, 1.05, 1), 0x1e1e1e),
        tint(S(T(new THREE.CylinderGeometry(0.118, 0.105, 0.09, 14, 1, true), 0, 0.07, 0.01), 1, 1, 1.12), 0x111111),
      ]), vcMat()).material.side = THREE.DoubleSide;
      at('spine', mergeGeos([tint(T(box(0.17, 0.15, 0.02), 0, 0.31, 0.145), 0xd7263d), tint(T(box(0.3, 0.38, 0.13), 0, 0.27, -0.2), 0x2d3436)]), vcMat());
    },
    weapon: batonGeo,
  },
  botella: {
    skinHex: 0xe0ac69, bareArms: true,
    mats: { top: lam(0xf5f5f5), pants: lam(0x3b5b7d), skin: lam(0xe0ac69), shoe: lam(0xf5f5f5) },
    extra(o, at) {
      at('head', mergeGeos([
        tint(S(T(new THREE.SphereGeometry(0.126, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), 0, 0.165, -0.005), 1.02, 1.15, 1.08), 0xd7263d),
        tint(T(sph(0.04, 8, 6), 0, 0.31, -0.01), 0xf5f5f5),
        tint(S(T(sph(0.085, 10, 7), 0, 0.04, 0.03), 1.15, 0.95, 1.05), 0x3b2314),
      ]), vcMat());
      at('spine', mergeGeos([tint(T(new THREE.TorusGeometry(0.085, 0.035, 6, 14).rotateX(Math.PI / 2), 0, 0.52, 0.01), 0xf1c40f)]), vcMat());
      at('shoulderL', mergeGeos([tint(T(cyl(0.07, 0.07, 0.05, 10), 0, -0.05, 0), 0xf5f5f5)]), vcMat());
    },
    weapon: bottleGeo,
  },
};

// ---------- Bruto: jefe o minijefe que ataca SOLO cuerpo a cuerpo ----------
export class Brute {
  constructor(scene, kind) {
    const cfg = this.cfg = kind === 'final' ? BOSS : MINIBOSS.kinds[kind];
    this.kind = kind; this.name = cfg.name;
    const root = this.root = new THREE.Group();
    this.body = new THREE.Group(); root.add(this.body);
    const look = LOOKS[kind];
    buildBody(this, look);
    this.mats = Object.values(look.mats);
    const wGeo = look.weapon();
    this.weapon = new THREE.Mesh(wGeo, vcMat());
    this.weapon.rotation.x = -0.35; this.weapon.position.y = -0.06;
    this.joints.wristR.add(this.weapon);
    this.weapon.scale.setScalar(kind === 'final' ? 1.7 : kind === 'porra' ? 1.5 : 1.6);
    this.pose = makePose();
    root.scale.setScalar(cfg.scale);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.3, depthWrite: false }));
    sh.position.y = 0.01; root.add(sh);
    root.visible = false; scene.add(root);
    // zona de impacto en el suelo (aviso rojo antes del golpe)
    this.zone = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff2244, transparent: true, opacity: 0, depthWrite: false }));
    this.zone.position.y = 0.04; this.zone.renderOrder = 1; this.zone.visible = false; scene.add(this.zone);
    this.maxHp = 100; this.reset();
  }

  reset() {
    this.active = false; this.state = 'off'; this.hp = this.maxHp; this.t = 0; this.st = 0; this.cycle = 0; this.flashT = 0;
    this.rel = 80; this.x = 0; this.z = 0; this.swing = 0;
    this.root.visible = false; this.zone.visible = false;
    this.root.rotation.set(0, 0, 0); this.root.position.y = 0;
  }

  start(px, pz, hp) {
    this.maxHp = hp; this.reset(); this.active = true; this.state = 'approach';
    this.root.visible = true; this.x = Math.max(-2, Math.min(2, px)); this.rel = this.cfg.startDist; this.z = pz - this.rel;
  }

  get vulnerable() { return this.active && this.state !== 'dying' && this.state !== 'off'; }
  get radius() { return this.cfg.radius; }

  damage(d) {
    if (!this.vulnerable) return false;
    this.hp -= d; this.flashT = 0.06;
    if (this.hp <= 0) { this.hp = 0; this.state = 'dying'; this.st = 0; this.zone.visible = false; return true; }
    return false;
  }

  _set(state) { this.state = state; this.st = 0; }

  // cb: onStrike(zone, dmg), onSummon(n, x, z), onWindup(), onDefeated()
  update(dt, px, pz, cb) {
    if (!this.active) return;
    const c = this.cfg;
    this.t += dt; this.st += dt;
    const phase2 = this.hp < this.maxHp * 0.5;
    const lim = ROAD.halfWidth - 1.2;
    let lean = 0;
    switch (this.state) {
      case 'approach': {
        // corre hacia el jugador y se coloca a distancia de golpe
        this.rel = Math.max(c.reach - 0.6, this.rel - c.approachSpeed * dt);
        this.x += Math.max(-c.lateral * dt, Math.min(c.lateral * dt, px - this.x));
        if (this.rel <= c.reach - 0.5 && this.st > 0.3) {
          this._set('windup');
          const w = c.zoneWidth;
          this.zx = Math.max(-ROAD.halfWidth + w / 2, Math.min(ROAD.halfWidth - w / 2, this.x));
          this.zone.visible = true;
          cb.onWindup && cb.onWindup(this);
        }
        break;
      }
      case 'windup': {
        const wt = phase2 ? c.windup * 0.7 : c.windup;
        this.swing = Math.min(1, this.st / wt);
        if (this.st >= wt) { this._set('strike'); }
        break;
      }
      case 'strike': {
        this.swing = 1 - Math.min(1, this.st / 0.12) * 2;
        if (this.st >= 0.12 && !this.struck) {
          this.struck = true;
          cb.onStrike && cb.onStrike({ x: this.zx, w: c.zoneWidth, z0: this.z, z1: this.z + c.reach + 1.5 }, c.damage, this);
        }
        if (this.st > 0.35) { this.struck = false; this._set('recover'); this.zone.visible = false; this.cycle++; }
        break;
      }
      case 'recover': {
        this.swing = lerp(-1, 0, Math.min(1, this.st / 0.5));
        this.rel += c.backoff * dt;
        if (this.st > (phase2 ? 0.45 : 0.7)) {
          if (c.summon && this.cycle % 3 === 0) cb.onSummon && cb.onSummon(phase2 ? c.summon * 1.5 : c.summon, this.x, this.z);
          this._set('approach');
        }
        break;
      }
      case 'dying': {
        this.root.rotation.x = Math.min(1.5, this.st * 1.4);
        this.root.position.y = -Math.max(0, this.st - 1) * 2;
        if (this.st > (this.kind === 'final' ? 2.6 : 1.6)) { this.active = false; this.root.visible = false; cb.onDefeated && cb.onDefeated(this); }
        break;
      }
    }
    if (this.x > lim) this.x = lim; else if (this.x < -lim) this.x = -lim;
    this.z = pz - this.rel;
    // aviso en el suelo
    if (this.zone.visible) {
      const len = c.reach + 1.5;
      this.zone.scale.set(c.zoneWidth, 1, len);
      this.zone.position.set(this.zx, 0.04, this.z + len / 2);
      this.zone.material.opacity = this.state === 'strike' ? 0.75 : 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(this.t * 22));
    }
    // animación
    if (this.state !== 'dying') {
      const moving = this.state === 'approach' ? 1 : 0.35;
      runPose(this.pose, this.t * 6, 0.6 * moving);
      const r = this.pose.r, J = this.joints;
      JOINTS.forEach(([name], i) => J[name].rotation.set(r[i * 3], r[i * 3 + 1], r[i * 3 + 2]));
      J.pelvis.position.y = 0.95 + this.pose.bob;
      // swing: 0 reposo · 1 arma levantada atrás · -1 golpe abajo-delante
      const s = this.swing;
      if (s >= 0) { J.shoulderR.rotation.set(lerp(-0.6, -3.0, s), 0, lerp(0.25, 0.1, s)); J.elbowR.rotation.set(lerp(-1.0, -0.6, s), 0, 0); lean = -0.25 * s; }
      else { J.shoulderR.rotation.set(lerp(-0.6, -0.9, -s), -0.3 * -s, 0.2); J.elbowR.rotation.set(-0.2, 0, 0); lean = 0.35 * -s; }
      J.shoulderL.rotation.set(-0.5 - 0.3 * Math.max(0, s), 0.3, -0.35); J.elbowL.rotation.set(-1.2, 0, 0);
      J.spine.rotation.x = 0.05 + lean;
      J.head.rotation.x = -lean * 0.6;
      this.mouth.scale.set(1, this.state === 'windup' || this.state === 'strike' ? 3 : 1, 1);
    }
    this.root.position.set(this.x, this.root.position.y, this.z);
    this.flashT -= dt;
    for (const m of this.mats) if (m.emissive) m.emissive.setHex(this.flashT > 0 ? 0x331111 : 0);
  }
}

// Jefe final: EL GRAN PERROFLAUTA (ficticio y satírico)
export class Boss extends Brute {
  constructor(scene) { super(scene, 'final'); }
  start(pz, hp) { super.start(0, pz, hp); this.state = 'intro'; this.rel = 110; }
  get vulnerable() { return this.active && (this.state === 'approach' || this.state === 'windup' || this.state === 'strike' || this.state === 'recover'); }
  update(dt, px, pz, cb) {
    if (this.active && this.state === 'intro') {
      this.st += dt;
      this.rel = Math.max(this.cfg.startDist, this.rel - dt * 30);
      if (this.rel <= this.cfg.startDist && this.st > 3) { this._set('approach'); cb.onFight && cb.onFight(); }
      // camina hacia el jugador mientras aparece
      this.t += dt;
      runPose(this.pose, this.t * 5, 0.5);
      const r = this.pose.r, J = this.joints;
      JOINTS.forEach(([name], i) => J[name].rotation.set(r[i * 3], r[i * 3 + 1], r[i * 3 + 2]));
      J.shoulderR.rotation.set(-2.6, 0, 0.3); J.elbowR.rotation.set(-0.8, 0, 0);
      this.z = pz - this.rel; this.root.position.set(this.x, 0, this.z);
      return;
    }
    super.update(dt, px, pz, cb);
  }
}
