import * as THREE from 'three';

// Esqueleto humano compartido por protagonista, horda y jefe.
// Proporciones realistas (~1,79 m). Delante = +Z local.

export const JOINTS = [
  // nombre, padre, desplazamiento respecto al padre
  ['pelvis', null, [0, 0.95, 0]],
  ['spine', 'pelvis', [0, 0.07, 0]],
  ['head', 'spine', [0, 0.575, 0.015]],
  ['hipL', 'pelvis', [-0.095, -0.04, 0]], ['kneeL', 'hipL', [0, -0.44, 0]], ['ankleL', 'kneeL', [0, -0.42, 0]],
  ['hipR', 'pelvis', [0.095, -0.04, 0]], ['kneeR', 'hipR', [0, -0.44, 0]], ['ankleR', 'kneeR', [0, -0.42, 0]],
  ['shoulderL', 'spine', [-0.215, 0.45, 0]], ['elbowL', 'shoulderL', [0, -0.29, 0]], ['wristL', 'elbowL', [0, -0.26, 0]],
  ['shoulderR', 'spine', [0.215, 0.45, 0]], ['elbowR', 'shoulderR', [0, -0.29, 0]], ['wristR', 'elbowR', [0, -0.26, 0]],
];
export const JOINT_INDEX = Object.fromEntries(JOINTS.map((j, i) => [j[0], i]));

// ---------- utilidades de geometría ----------
export function mergeGeos(list) {
  const pos = [], nor = [], col = [];
  let anyColor = false;
  for (const g0 of list) if (g0.userData.color !== undefined) anyColor = true;
  const c = new THREE.Color();
  for (const g0 of list) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    const p = g.attributes.position.array, n = g.attributes.normal.array;
    for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); }
    if (anyColor) { c.set(g0.userData.color ?? 0xffffff); for (let i = 0; i < p.length / 3; i++) col.push(c.r, c.g, c.b); }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (anyColor) out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}
export const T = (g, x, y, z) => { g.translate(x, y, z); return g; };
export const S = (g, x, y, z) => { g.scale(x, y, z); return g; };
export const R = (g, x, y, z) => { if (x) g.rotateX(x); if (y) g.rotateY(y); if (z) g.rotateZ(z); return g; };
export const tint = (g, color) => { g.userData.color = color; return g; };
export const cyl = (rt, rb, h, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);
export const sph = (r, w = 12, h = 9) => new THREE.SphereGeometry(r, w, h);
export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
export const capsule = (r, l, s = 8) => new THREE.CapsuleGeometry(r, l, 3, s);

// extremidad cónica con articulación redondeada y pivote arriba
function limb(rt, rb, h, seg = 9) {
  return mergeGeos([T(cyl(rt, rb, h, seg), 0, -h / 2, 0), sph(rt * 1.02, seg, 6)]);
}

// Geometrías base del cuerpo (pivote en su articulación)
export function bodyGeometries() {
  return {
    pelvis: mergeGeos([S(T(cyl(0.15, 0.145, 0.2, 12), 0, -0.02, 0), 1.25, 1, 0.82)]),
    torso: mergeGeos([
      S(T(cyl(0.18, 0.155, 0.46, 12), 0, 0.23, 0), 1.3, 1, 0.8),
      S(T(sph(0.175, 12, 8), 0, 0.46, 0), 1.3, 0.42, 0.8),
      T(cyl(0.055, 0.06, 0.08, 8), 0, 0.53, 0),
    ]),
    head: mergeGeos([
      S(T(sph(0.112, 14, 11), 0, 0.12, 0), 1, 1.14, 1.06),
      T(R(cyl(0.014, 0.024, 0.05, 6), Math.PI / 2 - 0.3, 0, 0), 0, 0.11, 0.12),   // nariz
      S(T(sph(0.026, 6, 5), -0.112, 0.115, 0), 0.5, 1, 0.8),                     // orejas
      S(T(sph(0.026, 6, 5), 0.112, 0.115, 0), 0.5, 1, 0.8),
      S(T(sph(0.07, 10, 6), 0, 0.045, 0.035), 1.05, 0.7, 1),                     // mandíbula
    ]),
    thigh: limb(0.1, 0.072, 0.44),
    shin: limb(0.074, 0.054, 0.42),
    upperArm: limb(0.066, 0.054, 0.29),
    foreArm: limb(0.054, 0.042, 0.26),
    hand: mergeGeos([S(T(sph(0.042, 8, 6), 0, -0.045, 0), 0.85, 1.25, 0.6), T(R(capsule(0.016, 0.04, 6), 0, 0, 0.5), 0.03, -0.03, 0.02)]),
    shoe: mergeGeos([
      S(T(sph(0.072, 10, 7), 0, -0.03, 0.05), 0.95, 0.62, 1.95),
      T(box(0.13, 0.03, 0.27), 0, -0.065, 0.05),
    ]),
    hair: mergeGeos([S(T(new THREE.SphereGeometry(0.12, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), 0, 0.14, -0.006), 1.03, 1.1, 1.1)]),
    cap: mergeGeos([
      S(T(new THREE.SphereGeometry(0.123, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.5), 0, 0.17, 0), 1.02, 0.95, 1.08),
      S(T(cyl(0.1, 0.1, 0.014, 12), 0, 0.17, 0.1), 0.95, 1, 0.75),
    ]),
    helmet: mergeGeos([
      S(T(new THREE.SphereGeometry(0.145, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), 0, 0.15, 0), 1, 1, 1.08),
      T(box(0.24, 0.07, 0.02), 0, 0.12, 0.15),
    ]),
    hood: mergeGeos([S(T(new THREE.SphereGeometry(0.15, 12, 8, Math.PI, Math.PI, 0, Math.PI * 0.75), 0, 0.12, -0.03), 1.05, 1.05, 1)]),
    backpack: mergeGeos([
      T(box(0.3, 0.38, 0.13), 0, 0.27, -0.2),
      T(box(0.24, 0.14, 0.05), 0, 0.17, -0.28),
      T(box(0.04, 0.3, 0.03), -0.11, 0.33, -0.13), T(box(0.04, 0.3, 0.03), 0.11, 0.33, -0.13),
    ]),
    vest: mergeGeos([
      S(T(cyl(0.19, 0.17, 0.4, 10), 0, 0.27, 0), 1.25, 1, 0.85),
      T(box(0.1, 0.1, 0.05), -0.08, 0.2, 0.15), T(box(0.1, 0.1, 0.05), 0.08, 0.2, 0.15),
    ]),
    // detalles de la horda (v0.8): cara, barba, braga/pañuelo, gorro de lana, bufanda, estampado, cinturón, suelas, megáfono
    face: mergeGeos([
      S(T(sph(0.016, 8, 6), -0.042, 0.135, 0.1), 1, 1.2, 0.6), S(T(sph(0.016, 8, 6), 0.042, 0.135, 0.1), 1, 1.2, 0.6),   // ojos
      T(R(box(0.05, 0.012, 0.012), 0, 0, 0.18), -0.044, 0.165, 0.105), T(R(box(0.05, 0.012, 0.012), 0, 0, -0.18), 0.044, 0.165, 0.105), // cejas
      T(box(0.045, 0.012, 0.01), 0, 0.07, 0.11),                                                                     // boca
    ]),
    beard: mergeGeos([S(T(sph(0.085, 10, 7), 0, 0.04, 0.03), 1.15, 0.95, 1.05), T(box(0.07, 0.018, 0.02), 0, 0.085, 0.112)]),
    bandana: mergeGeos([
      S(T(new THREE.CylinderGeometry(0.118, 0.105, 0.09, 14, 1, true), 0, 0.07, 0.01), 1, 1, 1.12),
      T(R(new THREE.ConeGeometry(0.06, 0.09, 4), Math.PI, 0, 0), 0, 0.01, 0.1),
    ]),
    beanie: mergeGeos([
      S(T(new THREE.SphereGeometry(0.126, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), 0, 0.165, -0.005), 1.02, 1.15, 1.08),
      T(cyl(0.127, 0.127, 0.04, 14), 0, 0.17, -0.005), T(sph(0.04, 8, 6), 0, 0.31, -0.01),
    ]),
    scarf: mergeGeos([T(new THREE.TorusGeometry(0.085, 0.035, 6, 14).rotateX(Math.PI / 2), 0, 0.52, 0.01), T(R(box(0.07, 0.22, 0.03), 0.1, 0, 0.1), 0.06, 0.4, 0.14)]),
    print: mergeGeos([T(box(0.17, 0.15, 0.02), 0, 0.31, 0.145)]),
    belt: mergeGeos([S(T(cyl(0.155, 0.155, 0.04, 12), 0, 0.06, 0), 1.26, 1, 0.84), T(box(0.05, 0.035, 0.02), 0, 0.06, 0.13)]),
    sole: mergeGeos([T(box(0.135, 0.028, 0.275), 0, -0.085, 0.05)]),
    megaphone: mergeGeos([
      T(R(new THREE.CylinderGeometry(0.08, 0.03, 0.22, 12, 1, true), Math.PI / 2, 0, 0), 0, -0.09, 0.14),
      T(box(0.03, 0.08, 0.04), 0, -0.07, 0.03),
    ]),
    // pancarta en alto y bandera del líder, relativas al tronco
    sign: mergeGeos([T(cyl(0.018, 0.018, 1.25, 6), 0.27, 1.05, 0.05), T(box(0.8, 0.5, 0.025), 0.27, 1.55, 0.07)]),
    flag: mergeGeos([T(cyl(0.022, 0.022, 2.2, 6), 0.27, 1.25, 0.05), T(box(0.95, 0.6, 0.02), 0.76, 2.0, 0.05)]),
  };
}

// Qué pieza va en qué articulación
export const PART_JOINT = {
  pelvis: 'pelvis', torso: 'spine', head: 'head', hair: 'head', cap: 'head', helmet: 'head', hood: 'head',
  thighL: 'hipL', shinL: 'kneeL', shoeL: 'ankleL', thighR: 'hipR', shinR: 'kneeR', shoeR: 'ankleR',
  upperArmL: 'shoulderL', foreArmL: 'elbowL', handL: 'wristL', upperArmR: 'shoulderR', foreArmR: 'elbowR', handR: 'wristR',
  backpack: 'spine', vest: 'spine', sign: 'spine', flag: 'spine',
  face: 'head', beard: 'head', bandana: 'head', beanie: 'head', scarf: 'spine', print: 'spine', belt: 'pelvis',
  soleL: 'ankleL', soleR: 'ankleR', megaphone: 'wristL',
};
export const PART_GEO = { soleL: 'sole', soleR: 'sole', thighL: 'thigh', thighR: 'thigh', shinL: 'shin', shinR: 'shin', shoeL: 'shoe', shoeR: 'shoe', upperArmL: 'upperArm', upperArmR: 'upperArm', foreArmL: 'foreArm', foreArmR: 'foreArm', handL: 'hand', handR: 'hand' };

// Pose: rotaciones [x, y, z] por articulación (Float32Array de 15*3) + altura extra de la pelvis
export function makePose() { return { r: new Float32Array(JOINTS.length * 3), bob: 0 }; }
const J = JOINT_INDEX;
function setR(p, name, x, y = 0, z = 0) { const i = J[name] * 3; p.r[i] = x; p.r[i + 1] = y; p.r[i + 2] = z; }

// Ciclo de carrera natural: rodillas que se flexionan, brazos doblados, inclinación del tronco
export function runPose(p, phase, intensity = 1, opts = {}) {
  const s = Math.sin(phase), c = Math.cos(phase);
  const k = intensity;
  p.bob = Math.abs(c) * 0.06 * k;
  setR(p, 'pelvis', 0.12 * k, s * 0.12 * k, 0);
  setR(p, 'spine', 0.08 * k, -s * 0.2 * k, 0);
  setR(p, 'head', -0.15 * k, s * 0.12 * k, 0);
  setR(p, 'hipL', -s * 0.75 * k); setR(p, 'hipR', s * 0.75 * k);
  setR(p, 'kneeL', (0.25 + 1.25 * Math.max(0, Math.sin(phase - 0.9))) * k);
  setR(p, 'kneeR', (0.25 + 1.25 * Math.max(0, Math.sin(phase + Math.PI - 0.9))) * k);
  setR(p, 'ankleL', -0.2 * s * k); setR(p, 'ankleR', 0.2 * s * k);
  setR(p, 'shoulderL', s * 0.7 * k, 0, -0.12); setR(p, 'shoulderR', -s * 0.7 * k, 0, 0.12);
  setR(p, 'elbowL', -1.35 * k - 0.1); setR(p, 'elbowR', -1.35 * k - 0.1);
  setR(p, 'wristL', 0); setR(p, 'wristR', 0);
  if (opts.raiseR) { setR(p, 'shoulderR', -2.85, 0, 0.18); setR(p, 'elbowR', -0.25); }
  if (opts.armsUp) { setR(p, 'shoulderL', -2.6, 0, -0.3); setR(p, 'shoulderR', -2.6, 0, 0.3); setR(p, 'elbowL', -0.3); setR(p, 'elbowR', -0.3); }
  if (opts.aim) {
    // sujeta el arma con las dos manos apuntando al frente
    setR(p, 'spine', 0.05, -0.15 + opts.aimYaw * 0.6, 0);
    setR(p, 'shoulderR', -1.5, 0.1, 0.05); setR(p, 'elbowR', -0.12, 0, 0);
    setR(p, 'shoulderL', -1.3, 0.6, -0.1); setR(p, 'elbowL', -0.5, 0, 0);
    setR(p, 'wristR', 0); setR(p, 'wristL', 0);
  }
  return p;
}

const _e = new THREE.Euler(), _l = new THREE.Matrix4();
// Calcula las matrices de mundo de cada articulación a partir de una matriz base
export function solve(base, pose, out) {
  for (let i = 0; i < JOINTS.length; i++) {
    const [, parent, off] = JOINTS[i];
    _l.makeRotationFromEuler(_e.set(pose.r[i * 3], pose.r[i * 3 + 1], pose.r[i * 3 + 2], 'YXZ'));
    _l.setPosition(off[0], off[1] + (i === 0 ? pose.bob : 0), off[2]);
    out[i].multiplyMatrices(parent ? out[J[parent]] : base, _l);
  }
  return out;
}
export function makeJointMatrices() { return JOINTS.map(() => new THREE.Matrix4()); }
