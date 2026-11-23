import * as THREE from 'three';

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const _c = new THREE.Color(), _c2 = new THREE.Color(), _white = new THREE.Color(0xffffff);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const _fwd = new THREE.Vector3(0, 0, 1), _v = new THREE.Vector3();

// Proyectiles con object pooling (GDD sección 15)
// (v1.1) Proyectiles con forma según el arma, en vez de rayos láser:
//   bala   → punta metálica + estela corta que se desvanece (pistola, subfusil, escopeta, rifle, ametralladora)
//   cohete → cuerpo con aletas + llama de escape + humo (lanzacohetes, cañón)
//   energía → orbe brillante con halo que palpita (arma energética)
function taperedTrail(len, r) {
  // cono tumbado hacia atrás (punta en la cola)
  const g = new THREE.ConeGeometry(r, len, 8, 1, true); g.rotateX(-Math.PI / 2); g.translate(0, 0, len / 2); return g;
}
function bulletHead() {
  const tip = new THREE.ConeGeometry(0.055, 0.13, 8); tip.rotateX(-Math.PI / 2); tip.translate(0, 0, -0.165);
  const body = new THREE.CylinderGeometry(0.055, 0.055, 0.2, 8); body.rotateX(Math.PI / 2);
  return mergeSimple([tip, body]);
}
function rocketBody() {
  const parts = [];
  const body = new THREE.CylinderGeometry(0.075, 0.075, 0.5, 10); body.rotateX(Math.PI / 2); parts.push(body);
  const nose = new THREE.ConeGeometry(0.075, 0.18, 10); nose.rotateX(-Math.PI / 2); nose.translate(0, 0, -0.34); parts.push(nose);
  for (let k = 0; k < 4; k++) { const f = new THREE.BoxGeometry(0.02, 0.12, 0.14); f.translate(0, 0.1, 0.2); f.rotateZ(k * Math.PI / 2); parts.push(f); }
  return mergeSimple(parts);
}
function mergeSimple(list) {
  const pos = [], nor = [];
  for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0; pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}
export const SHOT_KIND = { lanzacohetes: 'rocket', canon: 'rocket', energetica: 'energy' };

export class Bullets {
  constructor(scene, max = 800) {
    const add = { blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false };
    const mk = (geo, mat) => {
      const m = new THREE.InstancedMesh(geo, mat, max);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false;
      for (let i = 0; i < max; i++) { m.setMatrixAt(i, ZERO); m.setColorAt(i, _c.set(0xffffff)); }
      scene.add(m); return m;
    };
    this.kinds = {
      bullet: [mk(bulletHead(), new THREE.MeshBasicMaterial({ color: 0xffffff })),
        mk(taperedTrail(1.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.6, ...add })),
        mk(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.45, ...add }))],
      rocket: [mk(rocketBody(), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x222222 })),
        mk(taperedTrail(0.9, 0.11), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.85, ...add })),
        mk(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.6, ...add }))],
      energy: [mk(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, ...add })),
        mk(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.35, ...add })),
        mk(taperedTrail(0.6, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, ...add }))],
    };
    this.all = Object.values(this.kinds).flat();
    this.list = [];
    for (let i = 0; i < max; i++) this.list.push({ active: false, i, kind: 'bullet' });
    this.free = this.list.slice();
    this.onTrail = null;  // (x, y, z, b) → humo de los cohetes
  }

  fire(x, y, z, dirX, dirZ, w, dmg, pierce) {
    const b = this.free.pop();
    if (!b) return;
    const len = Math.hypot(dirX, dirZ) || 1;
    const kind = w.kind || 'bullet';
    if (b.kind !== kind) for (const m of this.kinds[b.kind]) m.setMatrixAt(b.i, ZERO);
    Object.assign(b, {
      active: true, x, y, z, vx: dirX / len * w.speed, vz: dirZ / len * w.speed, kind,
      life: w.range / w.speed, dmg, pierce, size: w.size, hitSet: null, age: 0, lastHit: -1, ally: false, splash: 0,
      wob: Math.random() * 6.28, trailT: 0,
    });
    const [a, t, c] = this.kinds[kind];
    if (kind === 'bullet') { a.setColorAt(b.i, _c.set(0xffe2a0).lerp(_c2.set(w.color), 0.25)); t.setColorAt(b.i, _c.set(w.color)); c.setColorAt(b.i, _c.set(w.color).lerp(_white, 0.4)); }
    else if (kind === 'rocket') { a.setColorAt(b.i, _c.set(0x55613f)); t.setColorAt(b.i, _c.set(0xffb347)); c.setColorAt(b.i, _c.set(0xff7b3b)); }
    else { a.setColorAt(b.i, _c.set(0xffffff)); t.setColorAt(b.i, _c.set(w.color)); c.setColorAt(b.i, _c.set(w.color)); }
    for (const m of this.kinds[kind]) m.instanceColor.needsUpdate = true;
    return b;
  }

  _hide(b) { for (const m of this.kinds[b.kind]) m.setMatrixAt(b.i, ZERO); }

  clear() {
    for (const b of this.list) { if (b.active) { b.active = false; this._hide(b); } }
    this.free = this.list.slice();
    for (const m of this.all) m.instanceMatrix.needsUpdate = true;
  }

  // onHit(b, x0, z0, x1, z1) devuelve true si la bala debe desaparecer
  update(dt, onHit) {
    for (const b of this.list) {
      if (!b.active) continue;
      const x0 = b.x, z0 = b.z;
      b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt;
      if (b.life <= 0 || onHit(b, x0, z0, b.x, b.z)) {
        b.active = false; this._hide(b); this.free.push(b); continue;
      }
      b.age += dt;
      const yaw = Math.atan2(b.vx, b.vz) + Math.PI;  // las geometrías miran hacia -Z
      _q.setFromEuler(_e.set(0, yaw, 0));
      const sz = b.size, grow = Math.min(1, b.age * 10);
      const [a, t, c] = this.kinds[b.kind];
      if (b.kind === 'bullet') {
        a.setMatrixAt(b.i, _m.compose(_p.set(b.x, b.y, b.z), _q, _s.set(sz, sz, sz)));
        t.setMatrixAt(b.i, _m.compose(_p, _q, _s.set(sz, sz, sz * grow * (0.85 + 0.3 * Math.random()))));
        const fl = b.age < 0.05 ? 2.2 : 1;  // destello al salir
        c.setMatrixAt(b.i, _m.compose(_p, _q, _s.set(sz * fl, sz * fl, sz * fl * 1.6)));
      } else if (b.kind === 'rocket') {
        const r = sz * 1.1;
        _q.multiply(_q2.setFromAxisAngle(_fwd, b.age * 9));  // gira sobre sí mismo
        a.setMatrixAt(b.i, _m.compose(_p.set(b.x, b.y, b.z), _q, _s.set(r, r, r)));
        const fl = 0.8 + 0.4 * Math.random();
        _v.set(0, 0, 0.32 * r).applyQuaternion(_q);
        t.setMatrixAt(b.i, _m.compose(_p.set(b.x + _v.x, b.y, b.z + _v.z), _q, _s.set(r * fl, r * fl, r * fl * grow)));
        c.setMatrixAt(b.i, _m.compose(_p, _q, _s.set(r * fl, r * fl, r * fl)));
        b.trailT -= dt;
        if (this.onTrail && b.trailT <= 0) { b.trailT = b.ally ? 0.14 : 0.035; this.onTrail(b.x + _v.x, b.y, b.z + _v.z, b); }
      } else {
        const pulse = 1 + 0.25 * Math.sin(b.age * 40 + b.wob);
        a.setMatrixAt(b.i, _m.compose(_p.set(b.x, b.y, b.z), _q, _s.set(sz * pulse, sz * pulse, sz * pulse)));
        t.setMatrixAt(b.i, _m.compose(_p, _q, _s.set(sz * pulse, sz * pulse, sz * pulse)));
        c.setMatrixAt(b.i, _m.compose(_p, _q, _s.set(sz, sz, sz * grow)));
      }
    }
    for (const m of this.all) m.instanceMatrix.needsUpdate = true;
  }
}

// Partículas: chispas, polvo y confeti (sin violencia gráfica)
export class Particles {
  constructor(scene, max = 900, additive = false, geo = new THREE.BoxGeometry(0.16, 0.16, 0.16)) {
    const mat = additive
      ? new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })
      : new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x222222 });
    this.additive = additive;
    this.mesh = new THREE.InstancedMesh(geo, mat, max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    for (let i = 0; i < max; i++) { this.mesh.setMatrixAt(i, ZERO); this.mesh.setColorAt(i, _c.set(0xffffff)); }
    scene.add(this.mesh);
    this.list = [];
    for (let i = 0; i < max; i++) this.list.push({ active: false, i });
    this.cursor = 0;
  }

  emit(x, y, z, n, color, speed = 4, life = 0.6, size = 1, gravity = 9) {
    let colorDirty = false;
    for (let k = 0; k < n; k++) {
      const p = this.list[this.cursor];
      this.cursor = (this.cursor + 1) % this.list.length;
      const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1;
      const r = Math.sqrt(1 - u * u);
      Object.assign(p, {
        active: true, x, y, z, vx: Math.cos(a) * r * speed, vy: Math.abs(u) * speed + speed * 0.3, vz: Math.sin(a) * r * speed,
        life, max: life, size: size * (0.6 + Math.random() * 0.8), g: gravity, rot: Math.random() * 6,
      });
      const col = Array.isArray(color) ? color[(Math.random() * color.length) | 0] : color;
      this.mesh.setColorAt(p.i, _c.set(col)); colorDirty = true;
    }
    if (colorDirty) this.mesh.instanceColor.needsUpdate = true;
  }

  clear() { for (const p of this.list) { p.active = false; this.mesh.setMatrixAt(p.i, ZERO); } this.mesh.instanceMatrix.needsUpdate = true; }

  update(dt) {
    for (const p of this.list) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; this.mesh.setMatrixAt(p.i, ZERO); continue; }
      p.vy -= p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.y < 0.05) { p.y = 0.05; p.vy *= -0.3; p.vx *= 0.7; p.vz *= 0.7; }
      p.rot += dt * 8;
      const s = p.size * Math.min(1, p.life / p.max * 2);
      if (this.additive) {
        // chispas alargadas en la dirección del movimiento
        _q.setFromUnitVectors(_fwd, _v.set(p.vx, p.vy, p.vz).normalize());
        _m.compose(_p.set(p.x, p.y, p.z), _q, _s.set(s * 0.5, s * 0.5, s * 2.4));
      } else _m.compose(_p.set(p.x, p.y, p.z), _q.setFromEuler(_e.set(p.rot, p.rot * 0.7, 0)), _s.set(s, s, s));
      this.mesh.setMatrixAt(p.i, _m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

// Onda expansiva visual para la bomba y explosiones
export class Shockwaves {
  constructor(scene) {
    const geo = new THREE.RingGeometry(0.8, 1, 40); geo.rotateX(-Math.PI / 2);
    this.pool = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      m.visible = false; scene.add(m);
      this.pool.push({ m, t: 0, max: 0, r: 1 });
    }
  }
  emit(x, z, radius, color = 0xffe08a, dur = 0.5) {
    const w = this.pool.find(w => !w.m.visible) || this.pool[0];
    w.m.visible = true; w.t = 0; w.max = dur; w.r = radius;
    w.m.material.color.set(color);
    w.m.position.set(x, 0.15, z);
  }
  update(dt) {
    for (const w of this.pool) {
      if (!w.m.visible) continue;
      w.t += dt;
      const k = w.t / w.max;
      if (k >= 1) { w.m.visible = false; continue; }
      const s = 0.5 + k * w.r; w.m.scale.set(s, 1, s);
      w.m.material.opacity = (1 - k) * 0.8;
    }
  }
}

// Destellos de impacto y fogonazos: planos que miran a la cámara, aditivos
export class Flashes {
  constructor(scene, texture, max = 80) {
    const geo = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ map: texture, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    for (let i = 0; i < max; i++) { this.mesh.setMatrixAt(i, ZERO); this.mesh.setColorAt(i, _c.set(0)); }
    scene.add(this.mesh);
    this.list = []; for (let i = 0; i < max; i++) this.list.push({ active: false, i });
    this.cursor = 0;
  }
  emit(x, y, z, size, color, life = 0.12, grow = 1.6) {
    const f = this.list[this.cursor]; this.cursor = (this.cursor + 1) % this.list.length;
    Object.assign(f, { active: true, x, y, z, size, life, max: life, grow, color, rot: Math.random() * 6.28 });
  }
  clear() { for (const f of this.list) { f.active = false; this.mesh.setMatrixAt(f.i, ZERO); } this.mesh.instanceMatrix.needsUpdate = true; }
  update(dt, camera) {
    for (const f of this.list) {
      if (!f.active) continue;
      f.life -= dt;
      if (f.life <= 0) { f.active = false; this.mesh.setMatrixAt(f.i, ZERO); continue; }
      const k = 1 - f.life / f.max;
      const s = f.size * (1 + k * f.grow);
      _q.copy(camera.quaternion).multiply(_q2.setFromAxisAngle(_z, f.rot));
      _m.compose(_p.set(f.x, f.y, f.z), _q, _s.set(s, s, s));
      this.mesh.setMatrixAt(f.i, _m);
      this.mesh.setColorAt(f.i, _c.set(f.color).multiplyScalar(1 - k));
    }
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }
}
const _q2 = new THREE.Quaternion(), _z = new THREE.Vector3(0, 0, 1);
