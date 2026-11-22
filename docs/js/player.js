import * as THREE from 'three';
import { JOINTS, bodyGeometries, mergeGeos, T, S, R, cyl, sph, box, tint, makePose, runPose } from './rig.js';

const lam = c => new THREE.MeshLambertMaterial({ color: c });
const vcm = new THREE.MeshLambertMaterial({ vertexColors: true });

function radialTexture(stops, size = 128, star = 0) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  if (star) {
    ctx.translate(size / 2, size / 2);
    ctx.beginPath();
    for (let i = 0; i < star * 2; i++) {
      const r = i % 2 ? size * 0.14 : size * 0.5;
      const a = i / (star * 2) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.translate(-size / 2, -size / 2); ctx.fill();
  } else ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export const FLASH_TEX = () => radialTexture([[0, 'rgba(255,255,240,1)'], [0.25, 'rgba(255,230,140,0.95)'], [0.6, 'rgba(255,150,40,0.5)'], [1, 'rgba(255,90,0,0)']], 128, 7);
export const GLOW_TEX = () => radialTexture([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']], 64);

// Modelos de armas detallados (cañón hacia +Z)
function gunGeometry(id) {
  const metal = 0x2b2f36, dark = 0x16181c, wood = 0x7a4b28, accent = 0x4a5565;
  const parts = [];
  const add = (g, c) => parts.push(tint(g, c));
  if (id === 'pistola') {
    add(T(box(0.05, 0.07, 0.24), 0, 0.03, 0.08), metal);
    add(T(R(cyl(0.012, 0.012, 0.06, 8), Math.PI / 2, 0, 0), 0, 0.035, 0.22), dark);
    add(T(R(box(0.045, 0.12, 0.06), -0.25, 0, 0), 0, -0.04, -0.01), dark);
    add(T(box(0.015, 0.02, 0.02), 0, 0.075, 0.18), dark);
  } else if (id === 'subfusil') {
    add(T(box(0.06, 0.09, 0.36), 0, 0.03, 0.1), metal);
    add(T(R(cyl(0.016, 0.016, 0.16, 8), Math.PI / 2, 0, 0), 0, 0.04, 0.35), dark);
    add(T(R(cyl(0.024, 0.024, 0.1, 8), Math.PI / 2, 0, 0), 0, 0.04, 0.29), accent);
    add(T(R(box(0.04, 0.2, 0.05), 0.15, 0, 0), 0, -0.1, 0.12), dark);               // cargador
    add(T(R(box(0.045, 0.11, 0.05), -0.25, 0, 0), 0, -0.05, -0.02), dark);           // empuñadura
    add(T(box(0.035, 0.04, 0.2), 0, 0.02, -0.17), accent);                            // culata
    add(T(box(0.03, 0.04, 0.08), 0, 0.1, 0.06), dark);                                // mira
  } else {
    add(T(R(cyl(0.022, 0.022, 0.62, 8), Math.PI / 2, 0, 0), 0, 0.05, 0.3), dark);
    add(T(R(cyl(0.018, 0.018, 0.5, 8), Math.PI / 2, 0, 0), 0, 0.01, 0.27), metal);
    add(T(box(0.06, 0.08, 0.2), 0, 0.03, 0.02), metal);
    add(T(box(0.06, 0.06, 0.16), 0, 0.0, 0.28), wood);                                // corredera
    add(T(R(box(0.05, 0.1, 0.32), 0.18, 0, 0), 0, -0.03, -0.2), wood);               // culata
  }
  return mergeGeos(parts);
}
const GUN_TIP = { pistola: 0.26, subfusil: 0.44, escopeta: 0.62 };

// Protagonista detallado sobre el mismo esqueleto que la horda
export class PlayerModel {
  constructor(scene) {
    const g = this.group = new THREE.Group();
    this.rig = new THREE.Group(); this.rig.rotation.y = Math.PI; g.add(this.rig);
    const G = bodyGeometries();
    const suit = lam(0x1f5fa8), suitDark = lam(0x163f70), skin = lam(0xe2a97e), boots = lam(0x1a1c20), vestM = lam(0x3b4048), glove = lam(0x222428);
    this.mats = [suit, suitDark];
    this.joints = {};
    for (const [name, parent, off] of JOINTS) {
      const j = new THREE.Group(); j.position.set(...off); j.rotation.order = 'YXZ';
      (parent ? this.joints[parent] : this.rig).add(j);
      this.joints[name] = j;
    }
    const at = (joint, geo, mat) => { const m = new THREE.Mesh(geo, mat); this.joints[joint].add(m); return m; };
    at('pelvis', G.pelvis, suitDark);
    at('spine', G.torso, suit);
    at('head', G.head, skin);
    for (const s of ['L', 'R']) {
      at('hip' + s, G.thigh, suitDark); at('knee' + s, G.shin, suitDark); at('ankle' + s, G.shoe, boots);
      at('shoulder' + s, G.upperArm, suit); at('elbow' + s, G.foreArm, suit); at('wrist' + s, G.hand, glove);
      // rodilleras y coderas
      at('knee' + s, S(T(sph(0.07, 8, 6), 0, 0, 0.03), 1, 1, 0.8), vestM);
      at('elbow' + s, S(T(sph(0.05, 8, 6), 0, 0, -0.02), 1, 1, 0.8), vestM);
    }
    // chaleco táctico, cinturón y mochila con antena
    at('spine', mergeGeos([
      tint(S(T(cyl(0.192, 0.165, 0.38, 12), 0, 0.26, 0), 1.25, 1, 0.86), 0x3b4048),
      tint(T(box(0.09, 0.1, 0.05), -0.1, 0.18, 0.16), 0x2b3036), tint(T(box(0.09, 0.1, 0.05), 0, 0.18, 0.165), 0x2b3036), tint(T(box(0.09, 0.1, 0.05), 0.1, 0.18, 0.16), 0x2b3036),
      tint(T(box(0.12, 0.05, 0.02), 0.08, 0.36, 0.16), 0xffffff),                  // placa identificativa
      tint(T(box(0.3, 0.36, 0.14), 0, 0.27, -0.21), 0x2b3036),
      tint(T(cyl(0.008, 0.008, 0.35, 5), 0.11, 0.6, -0.24), 0x111111),
      tint(T(sph(0.016, 6, 4), 0.11, 0.78, -0.24), 0xff3b3b),
      tint(T(box(0.26, 0.02, 0.02), 0, 0.42, -0.28), 0x5ff3ff),                     // tira luminosa
    ]), vcm);
    at('pelvis', mergeGeos([
      tint(S(T(cyl(0.155, 0.155, 0.06, 12), 0, 0.05, 0), 1.27, 1, 0.84), 0x15171a),
      tint(T(box(0.07, 0.11, 0.07), 0.2, -0.03, 0.02), 0x15171a),                   // funda
    ]), vcm);
    // casco con gafas
    at('head', mergeGeos([
      tint(S(T(new THREE.SphereGeometry(0.138, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), 0, 0.15, -0.005), 1, 1, 1.08), 0x2b3036),
      tint(T(box(0.2, 0.045, 0.03), 0, 0.165, 0.125), 0x111111),
      tint(T(box(0.21, 0.012, 0.02), 0, 0.19, 0.127), 0xffa21a),
      tint(T(box(0.02, 0.05, 0.12), -0.12, 0.09, 0.03), 0x2b3036), tint(T(box(0.02, 0.05, 0.12), 0.12, 0.09, 0.03), 0x2b3036),
    ]), vcm);
    // armas en la mano derecha
    this.gunHolder = new THREE.Group();
    this.gunHolder.position.set(0, -0.07, 0.01);
    this.gunHolder.rotation.x = Math.PI / 2;
    this.joints.wristR.add(this.gunHolder);
    this.guns = {};
    for (const id of ['pistola', 'subfusil', 'escopeta']) { const m = new THREE.Mesh(gunGeometry(id), vcm); m.visible = false; this.gunHolder.add(m); this.guns[id] = m; }
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLASH_TEX(), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.flash.visible = false;
    this.gunHolder.add(this.flash);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 18).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.32, depthWrite: false }));
    sh.position.y = 0.03; g.add(sh);
    this.pose = makePose();
    this.phase = 0; this.flashT = 0; this.hurtT = 0; this.kick = 0;
    scene.add(g);
    this.setWeapon('pistola');
  }

  setWeapon(id) {
    this.weapon = id;
    for (const [k, m] of Object.entries(this.guns)) m.visible = k === id;
    this.flash.position.set(0, 0.04, GUN_TIP[id] + 0.08);
  }

  // posición de la boca del arma en el mundo
  muzzleWorld(out) { return this.flash.getWorldPosition(out); }

  muzzle() {
    this.flashT = 0.055;
    const big = this.weapon === 'escopeta' ? 1.9 : this.weapon === 'subfusil' ? 1.1 : 1.2;
    this.flash.scale.setScalar(big * (0.3 + Math.random() * 0.14));
    this.flash.material.rotation = Math.random() * Math.PI;
    this.kick = this.weapon === 'escopeta' ? 1 : 0.4;
  }
  hurt() { this.hurtT = 0.25; }

  update(dt, x, z, vx, aimYaw, running = true) {
    const g = this.group;
    g.position.set(x, 0, z);
    if (running) this.phase += dt * 11.5;
    runPose(this.pose, this.phase, running ? 1 : 0, { aim: true, aimYaw });
    this.kick = Math.max(0, this.kick - dt * 10);
    const J = this.joints;
    const r = this.pose.r;
    JOINTS.forEach(([name], i) => J[name].rotation.set(r[i * 3], r[i * 3 + 1], r[i * 3 + 2]));
    J.pelvis.position.y = 0.95 + this.pose.bob;
    J.shoulderR.rotation.x -= this.kick * 0.25; J.shoulderL.rotation.x -= this.kick * 0.2;
    g.rotation.z = -vx * 0.01;
    g.rotation.y = aimYaw * 0.35;
    this.flashT -= dt; this.flash.visible = this.flashT > 0;
    this.hurtT -= dt;
    const red = this.hurtT > 0 && Math.floor(this.hurtT * 30) % 2 === 0;
    for (const m of this.mats) m.emissive.setHex(red ? 0x880000 : 0x000000);
  }
}
