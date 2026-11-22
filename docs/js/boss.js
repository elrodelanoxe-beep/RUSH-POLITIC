import * as THREE from 'three';
import { canvasTexture } from './geom.js';
import { BOSS, ROAD } from './config.js';

const lam = c => new THREE.MeshLambertMaterial({ color: c });

// EL GRAN PORTAVOZ: jefe final ficticio y satírico (GDD sección 10.1)
export class Boss {
  constructor(scene) {
    this.scene = scene;
    const root = this.root = new THREE.Group();
    const body = this.body = new THREE.Group();
    root.add(body);
    const suit = lam(0x3d4450), shirt = lam(0xf5f5f5), tie = lam(0xd7263d), skin = lam(0xe9b48f), shoe = lam(0x111111), hairM = lam(0x9aa0a6);
    const box = (w, h, d, mat, x, y, z, parent = body) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); parent.add(m); return m; };
    const pivot = (x, y, z, parent = body) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
    this.legL = pivot(-0.22, 0.95, 0); this.legR = pivot(0.22, 0.95, 0);
    for (const l of [this.legL, this.legR]) { box(0.34, 0.95, 0.36, suit, 0, -0.47, 0, l); box(0.38, 0.16, 0.5, shoe, 0, -0.92, 0.06, l); }
    box(0.95, 0.95, 0.55, suit, 0, 1.45, 0);          // chaqueta
    box(0.95, 0.4, 0.5, suit, 0, 1.0, 0.02);           // barriga
    box(0.3, 0.6, 0.02, shirt, 0, 1.6, 0.28);
    box(0.12, 0.55, 0.03, tie, 0, 1.55, 0.3);
    this.head = pivot(0, 2.0, 0);
    box(0.56, 0.6, 0.52, skin, 0, 0.3, 0, this.head);
    box(0.6, 0.16, 0.56, hairM, 0, 0.62, -0.02, this.head);
    box(0.4, 0.12, 0.1, skin, 0, 0.05, 0.28, this.head);              // mentón
    box(0.16, 0.05, 0.03, lam(0x222222), -0.13, 0.42, 0.27, this.head); // cejas enfadadas
    box(0.16, 0.05, 0.03, lam(0x222222), 0.13, 0.42, 0.27, this.head);
    this.head.children[3].rotation.z = -0.35; this.head.children[4].rotation.z = 0.35;
    this.mouth = box(0.22, 0.1, 0.03, lam(0x5a1010), 0, 0.17, 0.27, this.head);
    // brazo con megáfono
    this.armL = pivot(-0.6, 1.85, 0);
    box(0.26, 0.8, 0.28, suit, 0, -0.4, 0, this.armL);
    const mega = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.12, 0.8, 10, 1, true), new THREE.MeshLambertMaterial({ color: 0xf5f5f5, side: THREE.DoubleSide }));
    mega.position.set(0, -0.85, 0.3); mega.rotation.x = Math.PI / 2 - 0.2;
    this.armL.add(mega);
    const megaRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), lam(0xd7263d)); megaRing.position.set(0, -0.78, 0.7); this.armL.add(megaRing);
    // brazo con bandera roja ficticia
    this.armR = pivot(0.6, 1.85, 0);
    box(0.26, 0.8, 0.28, suit, 0, -0.4, 0, this.armR);
    box(0.08, 3.6, 0.08, lam(0x8a6d3b), 0, 0.8, 0.1, this.armR);
    const flagTex = canvasTexture(512, 320, (ctx, w, h) => {
      ctx.fillStyle = '#d7263d'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffd32a'; ctx.beginPath(); ctx.arc(110, 110, 70, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d7263d'; ctx.font = '900 70px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', 110, 114);
      ctx.fillStyle = '#fff'; ctx.font = '900 92px system-ui, sans-serif'; ctx.fillText('S.F.G.', 340, 110);
      ctx.font = '700 34px system-ui, sans-serif';
      ctx.fillText('SINDICATO FICTICIO', w / 2, 225); ctx.fillText('DEL GRITO', w / 2, 270);
    });
    this.flagGeo = new THREE.PlaneGeometry(2.4, 1.5, 16, 4);
    this.flagBase = Float32Array.from(this.flagGeo.attributes.position.array);
    const flag = new THREE.Mesh(this.flagGeo, new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide }));
    flag.position.set(1.22, 1.85, 0.1);
    this.armR.add(flag);
    root.scale.setScalar(4.6);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.3, depthWrite: false }));
    sh.position.y = 0.01; root.add(sh);
    this.mats = [suit];
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
    const b = this.body;
    if (this.state !== 'dying') {
      const s = Math.sin(this.t * 6);
      this.legL.rotation.x = s * 0.4; this.legR.rotation.x = -s * 0.4;
      b.position.y = Math.abs(Math.cos(this.t * 6)) * 0.05;
      this.armL.rotation.x = -1.3 + Math.sin(this.t * 3) * 0.15;
      this.armR.rotation.x = -0.25 + Math.sin(this.t * 2) * 0.1;
      const shouting = this.attackT < 0.6 || this.attackT > (phase2 ? 1.6 : 2.4);
      this.mouth.scale.y = shouting ? 3 : 1;
      this.head.rotation.x = shouting ? -0.15 : 0;
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
      pos.array[i * 3 + 2] = Math.sin(x * 2.4 - this.t * 6) * 0.12 * (x + 1.2);
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
