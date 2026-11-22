import * as THREE from 'three';
import { Builder, canvasTexture } from './geom.js';
import { ROAD } from './config.js';

const WATER_Y = -14;
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3();
const _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0);

function beam(builder, a, b, t, color) {
  _d.subVectors(b, a);
  const len = _d.length();
  _q.setFromUnitVectors(_up, _d.normalize());
  const e = new THREE.Euler().setFromQuaternion(_q);
  const mid = _a.addVectors(a, b).multiplyScalar(0.5);
  builder.box(t, len, t, mid.x, mid.y, mid.z, color, e.x, e.y, e.z);
}

export class World {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;
    this.horizon = new THREE.Color(0xbfe3f2);
    scene.fog = new THREE.Fog(this.horizon, 45, 175);
    scene.background = this.horizon;

    const hemi = new THREE.HemisphereLight(0xdff4ff, 0x35506b, 1.35);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1d6, 2.1);
    sun.position.set(-30, 60, -20);
    scene.add(sun);
    this.sun = sun;

    this.vcMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    this._makeSky();
    this._makeWater();
    this._makeSegments();
    this._makeTowers();
    this._makeSkyline();
    this._makeCars();
  }

  _makeSky() {
    const geo = new THREE.SphereGeometry(400, 24, 12);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        top: { value: new THREE.Color(0x3d8fd6) },
        bottom: { value: this.horizon.clone() },
        sunDir: { value: new THREE.Vector3(-0.35, 0.25, -1).normalize() },
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 bottom; uniform vec3 sunDir; varying vec3 vDir;
        void main(){ float h = clamp(vDir.y*1.6, 0.0, 1.0); vec3 c = mix(bottom, top, pow(h, 0.7));
          float s = max(dot(normalize(vDir), sunDir), 0.0); c += vec3(1.0,0.9,0.7) * (pow(s, 400.0)*2.0 + pow(s, 12.0)*0.25);
          gl_FragColor = vec4(c, 1.0); }`,
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.sky.renderOrder = -10;
    this.scene.add(this.sky);
  }

  _makeWater() {
    const geo = new THREE.PlaneGeometry(900, 900, 1, 1);
    geo.rotateX(-Math.PI / 2);
    const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 },
      deep: { value: new THREE.Color(0x0b4f7a) },
      shallow: { value: new THREE.Color(0x2aa3c9) },
    }]);
    const mat = new THREE.ShaderMaterial({
      fog: true, uniforms,
      vertexShader: `varying vec3 vW;
        #include <fog_pars_vertex>
        void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
        }`,
      fragmentShader: `uniform float uTime; uniform vec3 deep; uniform vec3 shallow; varying vec3 vW;
        #include <fog_pars_fragment>
        void main(){
          vec2 p = vW.xz * 0.08;
          float w = sin(p.x*1.7 + uTime*0.9) * 0.5 + sin(p.y*1.3 - uTime*1.1 + p.x*0.4) * 0.5;
          w += sin((p.x + p.y)*3.1 + uTime*1.7) * 0.25;
          float k = smoothstep(-1.0, 1.4, w);
          vec3 c = mix(deep, shallow, k*0.6);
          float spark = smoothstep(1.05, 1.25, w + sin(p.x*9.0 - uTime*2.3)*0.2);
          c += vec3(0.8,0.9,1.0) * spark * 0.35;
          gl_FragColor = vec4(c, 1.0);
          #include <fog_fragment>
        }`,
    });
    this.water = new THREE.Mesh(geo, mat);
    this.water.position.y = WATER_Y;
    this.scene.add(this.water);
  }

  _segmentGeometry() {
    const L = ROAD.segmentLength, hw = ROAD.halfWidth;
    const b = new Builder();
    // tablero y estructura
    b.box(hw * 2 + 4, 0.8, L, 0, -0.4, -L / 2, 0x3b3f47);
    b.box(hw * 2 - 1, 1.8, L, 0, -1.7, -L / 2, 0x707a86);
    for (const s of [-1, 1]) {
      b.box(2, 0.22, L, s * (hw + 1), 0.11, -L / 2, 0x9aa1ab);         // acera
      b.box(0.18, 0.02, L, s * (hw - 0.15), 0.012, -L / 2, 0xf2f2f2);  // línea de borde
      b.box(0.25, 0.12, L, s * (hw + 1.95), 1.1, -L / 2, 0xd9dde3);    // barandilla superior
      b.box(0.12, 0.08, L, s * (hw + 1.95), 0.6, -L / 2, 0xb8bec7);    // barandilla media
      for (let z = 0; z < L; z += 3) b.box(0.14, 1.1, 0.14, s * (hw + 1.95), 0.6, -z, 0xb8bec7);
      // pilares sobre el mar
      b.box(1.6, 13, 1.6, s * 5, WATER_Y + 5.5, -L / 2, 0x8d96a1);
    }
    b.box(12, 1.2, 1.4, 0, -2.9, -L / 2, 0x7d8692);
    // líneas discontinuas de carril
    for (const x of [-hw / 2, hw / 2]) for (let z = 1; z < L; z += 6) b.box(0.15, 0.02, 3, x, 0.012, -z - 1.5, 0xf2f2f2);
    b.box(0.14, 0.02, L, -0.12, 0.012, -L / 2, 0xffcc33);
    b.box(0.14, 0.02, L, 0.12, 0.012, -L / 2, 0xffcc33);
    // farolas
    for (const [s, z] of [[-1, 5], [1, 20]]) {
      const x = s * (hw + 1.4);
      b.cyl(0.09, 0.12, 6.5, 6, x, 3.25, -z, 0x59606b);
      b.box(1.8, 0.12, 0.14, x - s * 0.85, 6.45, -z, 0x59606b);
      b.box(0.6, 0.16, 0.34, x - s * 1.6, 6.35, -z, 0xfff6cf);
    }
    return b.build();
  }

  _makeSegments() {
    const geo = this._segmentGeometry();
    this.segments = [];
    for (let i = 0; i < ROAD.segments; i++) {
      const m = new THREE.Mesh(geo, this.vcMat);
      m.position.z = 30 - i * ROAD.segmentLength;
      this.scene.add(m);
      this.segments.push(m);
    }
  }

  _makeTowers() {
    const b = new Builder();
    const top = 38, x = 10.6;
    for (const s of [-1, 1]) {
      b.box(2.2, top - WATER_Y, 2.2, s * x, (top + WATER_Y) / 2, 0, 0xd94f3d);
      b.box(2.8, 1.2, 2.8, s * x, top + 0.6, 0, 0xb8402f);
    }
    for (const y of [13, 25, 35]) b.box(x * 2, 1.4, 1.6, 0, y, 0, 0xc4473a);
    // tirantes
    for (const s of [-1, 1]) for (const dz of [-60, -45, -30, -18, 18, 30, 45, 60]) {
      _b.set(s * x, top - 2 - Math.abs(dz) * 0.04, 0);
      beam(b, _b.clone(), new THREE.Vector3(s * (ROAD.halfWidth + 2.2), 1.3, dz), 0.14, 0xe9edf2);
    }
    const geo = b.build();
    const signTex = canvasTexture(512, 160, (ctx, w, h) => {
      ctx.fillStyle = '#1f7a4a'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 64px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('OCEAN BRIDGE', w / 2, h / 2 - 8);
      ctx.font = 'bold 30px sans-serif'; ctx.fillText('NIVEL 1  ·  SALIDA SIN RETORNO', w / 2, h - 34);
    });
    const signGeo = new THREE.PlaneGeometry(7, 2.2);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    this.towers = [];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(geo, this.vcMat);
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 11.2, 0.85);
      m.add(sign);
      m.position.z = -60 - i * 150;
      this.scene.add(m);
      this.towers.push(m);
    }
  }

  _makeSkyline() {
    const b = new Builder();
    let x = -150;
    while (x < 150) {
      const w = 6 + Math.random() * 12, h = 8 + Math.random() * 40;
      b.box(w, h, 8, x + w / 2, WATER_Y + h / 2, 0, 0x7fa6bf);
      x += w + Math.random() * 4;
    }
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, transparent: true, opacity: 0.55 });
    this.skyline = new THREE.Mesh(b.build(), mat);
    this.skyline.renderOrder = -5;
    this.scene.add(this.skyline);
  }

  _carGeometry(color) {
    const b = new Builder();
    b.box(1.9, 0.7, 4.2, 0, 0.65, 0, color);
    b.box(1.7, 0.6, 2.2, 0, 1.3, 0.2, color);
    b.box(1.62, 0.5, 2.0, 0, 1.3, 0.2, 0x2a3b4c);
    b.box(1.95, 0.25, 0.2, 0, 0.55, 2.1, 0xdddddd);
    for (const sx of [-0.85, 0.85]) for (const sz of [-1.35, 1.35]) b.cyl(0.36, 0.36, 0.3, 8, sx, 0.36, sz, 0x1a1a1a, 0, 0, Math.PI / 2);
    b.box(0.4, 0.15, 0.1, -0.6, 0.75, 2.12, 0xfff0b0);
    b.box(0.4, 0.15, 0.1, 0.6, 0.75, 2.12, 0xfff0b0);
    return b.build();
  }

  _makeCars() {
    const colors = [0xc0392b, 0x2e86de, 0xf1c40f, 0xecf0f1, 0x27ae60, 0x8e44ad, 0x555d66];
    const geos = colors.map(c => this._carGeometry(c));
    this.cars = [];
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(geos[i % geos.length], this.vcMat);
      m.visible = false;
      this.scene.add(m);
      this.cars.push({ mesh: m, active: false, hit: false });
    }
  }

  spawnCar(x, z) {
    const c = this.cars.find(c => !c.active);
    if (!c) return;
    c.active = true; c.hit = false;
    c.mesh.visible = true;
    c.mesh.position.set(x, 0, z);
    c.mesh.rotation.set(0, (Math.random() - 0.5) * 0.9 + (Math.random() < 0.3 ? Math.PI : 0), (Math.random() - 0.5) * 0.06);
  }

  clearCars() { for (const c of this.cars) { c.active = false; c.mesh.visible = false; } }

  // Devuelve el coche con el que choca el jugador (si lo hay).
  carCollision(px, pz, r) {
    for (const c of this.cars) {
      if (!c.active || c.hit) continue;
      const p = c.mesh.position;
      if (Math.abs(pz - p.z) < 2.0 + r && Math.abs(px - p.x) < 1.1 + r) return c;
    }
    return null;
  }

  update(dt, playerZ, camera) {
    this.time += dt;
    this.water.material.uniforms.uTime.value = this.time;
    this.water.position.x = 0; this.water.position.z = playerZ - 200;
    this.sky.position.copy(camera.position);
    this.skyline.position.set(0, 0, playerZ - 330);
    const L = ROAD.segmentLength, total = L * this.segments.length;
    for (const s of this.segments) if (s.position.z - L > playerZ + 25) s.position.z -= total;
    for (const t of this.towers) if (t.position.z > playerZ + 70) t.position.z -= 450;
    for (const c of this.cars) if (c.active && c.mesh.position.z > playerZ + 15) { c.active = false; c.mesh.visible = false; }
  }
}
