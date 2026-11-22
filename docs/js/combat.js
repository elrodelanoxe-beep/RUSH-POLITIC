import * as THREE from 'three';

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const _c = new THREE.Color(), _white = new THREE.Color(0xffffff);
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const _fwd = new THREE.Vector3(0, 0, 1), _v = new THREE.Vector3();

// Proyectiles con object pooling (GDD sección 15)
export class Bullets {
  constructor(scene, max = 500) {
    // núcleo brillante + halo de color: trazadoras visibles
    const core = new THREE.BoxGeometry(0.045, 0.045, 1.5); core.translate(0, 0, -0.5);
    const glow = new THREE.BoxGeometry(0.16, 0.16, 2.3); glow.translate(0, 0, -0.8);
    const add = { blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false };
    this.mesh = new THREE.InstancedMesh(core, new THREE.MeshBasicMaterial({ color: 0xffffff, ...add }), max);
    this.glow = new THREE.InstancedMesh(glow, new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.55, ...add }), max);
    for (const m of [this.mesh, this.glow]) {
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      for (let i = 0; i < max; i++) { m.setMatrixAt(i, ZERO); m.setColorAt(i, _c.set(0xffffff)); }
      scene.add(m);
    }
    this.list = [];
    for (let i = 0; i < max; i++) this.list.push({ active: false, i });
  }

  fire(x, y, z, dirX, dirZ, w, dmg, pierce) {
    const b = this.list.find(b => !b.active);
    if (!b) return;
    const len = Math.hypot(dirX, dirZ) || 1;
    Object.assign(b, {
      active: true, x, y, z, vx: dirX / len * w.speed, vz: dirZ / len * w.speed,
      life: w.range / w.speed, dmg, pierce, size: w.size, hitSet: null, age: 0, lastHit: -1,
    });
    this.mesh.setColorAt(b.i, _c.set(w.color).lerp(_white, 0.6));
    this.glow.setColorAt(b.i, _c.set(w.color));
    this.mesh.instanceColor.needsUpdate = true; this.glow.instanceColor.needsUpdate = true;
  }

  clear() { for (const b of this.list) { b.active = false; this.mesh.setMatrixAt(b.i, ZERO); this.glow.setMatrixAt(b.i, ZERO); } this.mesh.instanceMatrix.needsUpdate = true; this.glow.instanceMatrix.needsUpdate = true; }

  // onHit(b, x0, z0, x1, z1) devuelve true si la bala debe desaparecer
  update(dt, onHit) {
    for (const b of this.list) {
      if (!b.active) continue;
      const x0 = b.x, z0 = b.z;
      b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt;
      if (b.life <= 0 || onHit(b, x0, z0, b.x, b.z)) {
        b.active = false; this.mesh.setMatrixAt(b.i, ZERO); this.glow.setMatrixAt(b.i, ZERO); continue;
      }
      b.age = (b.age || 0) + dt;
      const stretch = Math.min(1, b.age * 14);   // la estela crece al salir del cañón
      _m.compose(_p.set(b.x, b.y, b.z), _q.setFromEuler(_e.set(0, Math.atan2(b.vx, b.vz), 0)), _s.set(b.size, b.size, b.size * stretch));
      this.mesh.setMatrixAt(b.i, _m); this.glow.setMatrixAt(b.i, _m);
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.glow.instanceMatrix.needsUpdate = true;
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
