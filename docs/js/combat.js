import * as THREE from 'three';

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const _c = new THREE.Color();
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

// Proyectiles con object pooling (GDD sección 15)
export class Bullets {
  constructor(scene, max = 500) {
    const geo = new THREE.BoxGeometry(0.09, 0.09, 0.9);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
    this.mesh = new THREE.InstancedMesh(geo, mat, max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    for (let i = 0; i < max; i++) { this.mesh.setMatrixAt(i, ZERO); this.mesh.setColorAt(i, _c.set(0xffffff)); }
    scene.add(this.mesh);
    this.list = [];
    for (let i = 0; i < max; i++) this.list.push({ active: false, i });
  }

  fire(x, y, z, dirX, dirZ, w, dmg, pierce) {
    const b = this.list.find(b => !b.active);
    if (!b) return;
    const len = Math.hypot(dirX, dirZ) || 1;
    Object.assign(b, {
      active: true, x, y, z, vx: dirX / len * w.speed, vz: dirZ / len * w.speed,
      life: w.range / w.speed, dmg, pierce, size: w.size, hitSet: null,
    });
    this.mesh.setColorAt(b.i, _c.set(w.color));
    this.mesh.instanceColor.needsUpdate = true;
  }

  clear() { for (const b of this.list) { b.active = false; this.mesh.setMatrixAt(b.i, ZERO); } this.mesh.instanceMatrix.needsUpdate = true; }

  // onHit(b, x0, z0, x1, z1) devuelve true si la bala debe desaparecer
  update(dt, onHit) {
    for (const b of this.list) {
      if (!b.active) continue;
      const x0 = b.x, z0 = b.z;
      b.x += b.vx * dt; b.z += b.vz * dt; b.life -= dt;
      if (b.life <= 0 || onHit(b, x0, z0, b.x, b.z)) {
        b.active = false; this.mesh.setMatrixAt(b.i, ZERO); continue;
      }
      _m.compose(_p.set(b.x, b.y, b.z), _q.setFromEuler(_e.set(0, Math.atan2(b.vx, b.vz), 0)), _s.set(b.size, b.size, b.size));
      this.mesh.setMatrixAt(b.i, _m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

// Partículas: chispas, polvo y confeti (sin violencia gráfica)
export class Particles {
  constructor(scene, max = 900) {
    const geo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
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
      _m.compose(_p.set(p.x, p.y, p.z), _q.setFromEuler(_e.set(p.rot, p.rot * 0.7, 0)), _s.set(s, s, s));
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
