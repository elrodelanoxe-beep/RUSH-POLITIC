import * as THREE from 'three';
import { canvasTexture } from './geom.js';
import { JOINTS, bodyGeometries, mergeGeos, makePose, runPose, T, S, R, sph, box, cyl, tint } from './rig.js';
import { BOSS, ROAD } from './config.js';

const lam = c => new THREE.MeshLambertMaterial({ color: c });

// EL GRAN PORTAVOZ: jefe final ficticio y satírico (GDD sección 10.1)
export class Boss {
  constructor(scene) {
    this.scene = scene;
    const root = this.root = new THREE.Group();
    const body = this.body = new THREE.Group();
    root.add(body);
    const G = bodyGeometries();
    const suit = lam(0x4a5468), suitDark = lam(0x343c4a), skin = lam(0xe9b48f), shoe = lam(0x121212);
    const vc = new THREE.MeshLambertMaterial({ vertexColors: true });
    this.joints = {};
    for (const [name, parent, off] of JOINTS) {
      const j = new THREE.Group(); j.position.set(...off); j.rotation.order = 'YXZ';
      (parent ? this.joints[parent] : body).add(j); this.joints[name] = j;
    }
    const at = (joint, geo, mat) => { const m = new THREE.Mesh(geo, mat); this.joints[joint].add(m); return m; };
    at('pelvis', G.pelvis, suitDark); at('spine', G.torso, suit); at('head', G.head, skin);
    for (const sd of ['L', 'R']) {
      at('hip' + sd, G.thigh, suitDark); at('knee' + sd, G.shin, suitDark); at('ankle' + sd, G.shoe, shoe);
      at('shoulder' + sd, G.upperArm, suit); at('elbow' + sd, G.foreArm, suit); at('wrist' + sd, G.hand, skin);
    }
    // traje: barriga, solapas, camisa, corbata roja e insignia ficticia
    at('spine', mergeGeos([
      tint(S(T(sph(0.2, 14, 10), 0, 0.12, 0.05), 1.15, 1, 1), 0x3a4150),
      tint(T(R(box(0.1, 0.36, 0.02), 0, 0, 0.25), -0.07, 0.3, 0.155), 0xf5f5f5),
      tint(T(R(box(0.1, 0.36, 0.02), 0, 0, -0.25), 0.07, 0.3, 0.155), 0xf5f5f5),
      tint(T(R(box(0.06, 0.34, 0.025), 0.12, 0, 0), 0, 0.25, 0.2), 0xd7263d),
      tint(T(box(0.05, 0.05, 0.03), 0, 0.43, 0.16), 0xb81f33),
      tint(T(R(box(0.08, 0.3, 0.025), 0, 0, -0.35), -0.12, 0.32, 0.165), 0x2a303b),
      tint(T(R(box(0.08, 0.3, 0.025), 0, 0, 0.35), 0.12, 0.32, 0.165), 0x2a303b),
      tint(T(cyl(0.03, 0.03, 0.01, 10).rotateX(Math.PI / 2), -0.12, 0.42, 0.18), 0xffd32a),
      tint(T(box(0.07, 0.025, 0.02), 0.13, 0.2, 0.2), 0xf5f5f5),
    ]), vc);
    // cara: canas a los lados, cejas enfadadas, gafas
    at('head', mergeGeos([
      tint(S(T(new THREE.SphereGeometry(0.118, 14, 8, Math.PI * 0.6, Math.PI * 1.8, Math.PI * 0.32, Math.PI * 0.28), 0, 0.12, -0.005), 1.04, 1.1, 1.1), 0xbfc3c8),
      tint(T(R(box(0.07, 0.016, 0.02), 0, 0, -0.35), -0.045, 0.175, 0.112), 0x333333),
      tint(T(R(box(0.07, 0.016, 0.02), 0, 0, 0.35), 0.045, 0.175, 0.112), 0x333333),
      tint(T(R(cyl(0.028, 0.028, 0.008, 12), Math.PI / 2, 0, 0), -0.045, 0.145, 0.118), 0x222222),
      tint(T(R(cyl(0.028, 0.028, 0.008, 12), Math.PI / 2, 0, 0), 0.045, 0.145, 0.118), 0x222222),
      tint(T(box(0.03, 0.006, 0.006), 0, 0.147, 0.122), 0x222222),
    ]), vc);
    this.mouth = at('head', T(S(sph(0.03, 10, 6), 1.5, 0.6, 0.5), 0, 0.065, 0.112), lam(0x4a0d0d));
    // megáfono delante de la boca
    const mega = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.03, 0.22, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xf5f5f5, side: THREE.DoubleSide }));
    cone.rotation.x = Math.PI / 2; cone.position.z = 0.11; mega.add(cone);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 18), lam(0xd7263d)); ring.position.z = 0.22; mega.add(ring);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.07, 0.03), lam(0x222222)); grip.position.set(0, -0.05, 0.05); mega.add(grip);
    mega.position.set(0, 0.07, 0.12);
    this.joints.head.add(mega);
    // mástil y bandera roja ficticia
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.6, 8), lam(0x8a6d3b));
    const poleG = new THREE.Group(); poleG.position.set(0.33, 0.1, 0.12); poleG.add(pole); pole.position.y = 0.6;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), lam(0xffd32a)); knob.position.y = 1.42; poleG.add(knob);
    this.joints.spine.add(poleG);
    const flagTex = canvasTexture(512, 320, (ctx, w, h) => {
      ctx.fillStyle = '#d7263d'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffd32a'; ctx.beginPath(); ctx.arc(110, 110, 70, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d7263d'; ctx.font = '900 70px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', 110, 114);
      ctx.fillStyle = '#fff'; ctx.font = '900 92px system-ui, sans-serif'; ctx.fillText('S.F.G.', 340, 110);
      ctx.font = '700 34px system-ui, sans-serif';
      ctx.fillText('SINDICATO FICTICIO', w / 2, 225); ctx.fillText('DEL GRITO', w / 2, 270);
    });
    this.flagGeo = new THREE.PlaneGeometry(0.72, 0.45, 16, 4);
    this.flagBase = Float32Array.from(this.flagGeo.attributes.position.array);
    const flag = new THREE.Mesh(this.flagGeo, new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide }));
    flag.position.set(0.37, 1.15, 0);
    poleG.add(flag);
    this.pose = makePose();
    root.scale.setScalar(4.6);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.6, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.3, depthWrite: false }));
    sh.position.y = 0.01; root.add(sh);
    this.mats = [suit, suitDark];
    root.visible = false;
    scene.add(root);

    // peligros: ondas de grito y panfletos
    const waveMat = new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.55, depthWrite: false });
    this.waves = [];
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const l = new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, 0.6), waveMat); const r = l.clone();
      g.add(l, r); g.visible = false; scene.add(g);
      this.waves.push({ g, l, r, active: false });
    }
    const pGeo = new THREE.BoxGeometry(0.7, 0.12, 0.5);
    const pMat = new THREE.MeshLambertMaterial({ color: 0xfafafa, emissive: 0x552222 });
    this.pamphlets = [];
    for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(pGeo, pMat); m.visible = false; scene.add(m); this.pamphlets.push({ m, active: false }); }
    this.reset();
  }

  reset() {
    this.active = false; this.state = 'off'; this.maxHp = this.maxHp || BOSS.hp; this.hp = this.maxHp; this.t = 0; this.attackT = 3; this.cycle = 0; this.flashT = 0; this.offset = 130; this.queue = [];
    this.root.visible = false;
    this.root.rotation.set(0, 0, 0);
    for (const w of this.waves) { w.active = false; w.g.visible = false; }
    for (const p of this.pamphlets) { p.active = false; p.m.visible = false; }
  }

  start(pz, hp) { this.maxHp = hp || BOSS.hp; this.reset(); this.active = true; this.state = 'intro'; this.root.visible = true; this.x = 0; this.z = pz - this.offset; }

  get vulnerable() { return this.state === 'fight'; }

  damage(d) {
    if (!this.vulnerable) return false;
    this.hp -= d; this.flashT = 0.06;
    if (this.hp <= 0) { this.hp = 0; this.state = 'dying'; this.t = 0; return true; }
    return false;
  }

  _later(t, fn) { this.queue.push({ t, fn }); }

  _shout() {
    const w = this.waves.find(w => !w.active); if (!w) return;
    const gap = 3.6, gx = (Math.random() * 2 - 1) * (ROAD.halfWidth - gap / 2 - 0.4);
    const hw = ROAD.halfWidth;
    const lw = gx - gap / 2 + hw, rw = hw - (gx + gap / 2);
    w.l.scale.x = Math.max(0.01, lw); w.l.position.x = -hw + lw / 2;
    w.r.scale.x = Math.max(0.01, rw); w.r.position.x = hw - rw / 2;
    w.gx = gx; w.gap = gap; w.z = this.z + 2; w.active = true; w.g.visible = true; w.hit = false;
    w.g.position.set(0, 0.7, w.z);
  }

  _pamphlet(px, pz) {
    const p = this.pamphlets.find(p => !p.active); if (!p) return;
    p.active = true; p.m.visible = true; p.hit = false;
    p.x = this.x - 1.5; p.y = 6; p.z = this.z + 2;
    const tx = px + (Math.random() - 0.5) * 3;
    const time = (pz - p.z) / (16 + 9);
    p.vx = (tx - p.x) / time; p.vz = 16; p.vy = (1.1 - p.y) / time;
  }

  // events: {shout, summon(n), pamphlet} -> callbacks de la partida
  update(dt, px, pz, cb) {
    if (!this.active) return;
    this.t += dt;
    const phase2 = this.hp < this.maxHp * 0.5;
    if (this.state === 'intro') {
      this.offset = Math.max(BOSS.distance, this.offset - dt * 32);
      if (this.offset <= BOSS.distance && this.t > 3.2) { this.state = 'fight'; this.t = 0; cb.onFight && cb.onFight(); }
    }
    if (this.state === 'fight') {
      for (let i = this.queue.length - 1; i >= 0; i--) { const q = this.queue[i]; q.t -= dt; if (q.t <= 0) { this.queue.splice(i, 1); q.fn(); } }
      this.x = Math.sin(this.t * 0.45) * 3.5;
      this.attackT -= dt;
      if (this.attackT <= 0) {
        const pattern = this.cycle++ % 4;
        if (pattern === 0 || pattern === 2) { this._shout(); if (phase2) this._later(0.7, () => this._shout()); cb.onShout && cb.onShout(); }
        else if (pattern === 1) { const n = phase2 ? 5 : 3; for (let i = 0; i < n; i++) this._later(i * 0.26, () => this._pamphlet(this._px, this._pz)); cb.onPamphlet && cb.onPamphlet(); }
        else { cb.onSummon && cb.onSummon(phase2 ? 22 : 14, this.x, this.z); }
        this.attackT = phase2 ? 1.9 : 2.7;
      }
    }
    this._px = px; this._pz = pz;
    this.z = pz - this.offset;
    // animación
    if (this.state !== 'dying') {
      const shouting = this.attackT < 0.6 || this.attackT > (phase2 ? 1.6 : 2.4);
      runPose(this.pose, this.t * 5, 0.55);
      const r = this.pose.r, J = this.joints;
      JOINTS.forEach(([name], i) => J[name].rotation.set(r[i * 3], r[i * 3 + 1], r[i * 3 + 2]));
      J.pelvis.position.y = 0.95 + this.pose.bob;
      // brazo izquierdo sujeta el megáfono, el derecho el mástil
      J.shoulderL.rotation.set(-1.55, 0.75, -0.2); J.elbowL.rotation.set(-1.5, 0, 0);
      J.shoulderR.rotation.set(-0.5, -0.2, 0.25); J.elbowR.rotation.set(-1.1, 0, 0);
      J.head.rotation.x = shouting ? -0.22 : 0.05;
      J.spine.rotation.x = shouting ? -0.12 : 0.05;
      this.mouth.scale.set(1, shouting ? 3.2 : 1, 1);
    } else {
      this.root.rotation.x = Math.min(1.5, this.t * 1.2);
      this.root.position.y = -Math.max(0, this.t - 1) * 2;
      if (this.t > 2.6) { this.active = false; this.root.visible = false; cb.onDefeated && cb.onDefeated(); }
    }
    this.root.position.set(this.x, this.root.position.y, this.z);
    // bandera ondeando
    const pos = this.flagGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = this.flagBase[i * 3];
      pos.array[i * 3 + 2] = Math.sin(x * 8 - this.t * 6) * 0.04 * (x + 0.36);
    }
    pos.needsUpdate = true;
    this.flashT -= dt;
    this.mats[0].emissive.setHex(this.flashT > 0 ? 0x2a1010 : 0);

    // peligros
    for (const w of this.waves) {
      if (!w.active) continue;
      w.z += 15 * dt; w.g.position.z = w.z;
      const pulse = 1 + Math.sin(this.t * 20) * 0.08; w.g.scale.y = pulse;
      if (!w.hit && w.z >= pz - 0.3 && w.z <= pz + 0.6) {
        if (Math.abs(px - w.gx) > w.gap / 2 - 0.35) { w.hit = true; cb.onHazard && cb.onHazard(BOSS.shoutDamage, 'grito'); }
      }
      if (w.z > pz + 10) { w.active = false; w.g.visible = false; }
    }
    for (const p of this.pamphlets) {
      if (!p.active) continue;
      p.x += p.vx * dt; p.y = Math.max(0.6, p.y + p.vy * dt); p.z += p.vz * dt;
      p.m.position.set(p.x, p.y, p.z); p.m.rotation.y += dt * 9; p.m.rotation.x += dt * 4;
      if (!p.hit && Math.abs(p.z - pz) < 0.7 && Math.abs(p.x - px) < 1.0) { p.hit = true; p.active = false; p.m.visible = false; cb.onHazard && cb.onHazard(BOSS.pamphletDamage, 'panfleto'); }
      if (p.z > pz + 8) { p.active = false; p.m.visible = false; }
    }
  }
}
