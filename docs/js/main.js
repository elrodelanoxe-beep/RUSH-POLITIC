import * as THREE from 'three';
import { ROAD, PLAYER, CAMERA, WEAPONS, ENEMY_TYPES, WAVES, BREAK_DURATION, SPAWN_DISTANCE, BOSS, GAME_VERSION } from './config.js';
import { World } from './world.js';
import { Horde } from './enemies.js';
import { Bullets, Particles, Shockwaves, Flashes } from './combat.js';
import { PlayerModel, FLASH_TEX, GLOW_TEX } from './player.js';
import { Gates, GOOD, BAD } from './gates.js';
import { Boss } from './boss.js';
import { Sfx } from './audio.js';

const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);

// ---------- Render ----------
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(pixelRatio);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 1, 0.3, 900);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const hf = THREE.MathUtils.degToRad(CAMERA.targetHFov);
  camera.fov = clamp(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hf / 2) / camera.aspect)), 55, 88);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const world = new World(scene);
const horde = new Horde(scene);
const bullets = new Bullets(scene);
const particles = new Particles(scene);
const sparks = new Particles(scene, 700, true, new THREE.BoxGeometry(0.05, 0.05, 0.05));
const glowTex = GLOW_TEX();
const flashes = new Flashes(scene, glowTex, 90);
const muzzleFx = new Flashes(scene, FLASH_TEX(), 24);
const shock = new Shockwaves(scene);
const hero = new PlayerModel(scene);
const gates = new Gates(scene);
const boss = new Boss(scene);
const sfx = new Sfx();

// ---------- Estado de la partida ----------
const G = {
  mode: 'menu', phase: 'intro', phaseT: 0,
  px: 0, pz: 0, vx: 0, targetX: 0, aimYaw: 0,
  hp: PLAYER.maxHp, kills: 0, killScore: 0, time: 0,
  weaponId: 'pistola', ammo: Infinity,
  dmgMult: 1, rateMult: 1, multishot: 1, pierce: 0, fireCd: 0,
  waveIndex: 0, spawnAcc: 0, leadersDone: 0, midGate: false,
  nextCarZ: -90, shake: 0, camBoss: 0, endT: 0, won: false,
};

function resetGame() {
  horde.clear(); bullets.clear(); particles.clear(); sparks.clear(); flashes.clear(); muzzleFx.clear(); gates.clear(); world.clearCars(); boss.reset();
  Object.assign(G, {
    phase: 'intro', phaseT: 0, px: 0, pz: 0, vx: 0, targetX: 0, aimYaw: 0,
    hp: PLAYER.maxHp, kills: 0, killScore: 0, time: 0,
    weaponId: 'pistola', ammo: Infinity, dmgMult: 1, rateMult: 1, multishot: 1, pierce: 0, fireCd: 0,
    waveIndex: 0, spawnAcc: 0, leadersDone: 0, midGate: false, nextCarZ: -90, shake: 0, camBoss: 0, endT: 0, won: false,
  });
  hero.setWeapon('pistola');
  hero.group.rotation.set(0, 0, 0);
  world.segments.forEach((s, i) => s.position.z = 30 - i * ROAD.segmentLength);
  world.towers.forEach((t, i) => t.position.z = -60 - i * 150);
  gates.spawn(-55, OPTIONS.find(o => o.id === 'smg'), OPTIONS.find(o => o.id === 'dmg2'));
  ui.bossBar.classList.add('hidden');
}

function equip(id) {
  const w = WEAPONS[id];
  if (G.weaponId === id) G.ammo += w.ammo; else { G.weaponId = id; G.ammo = w.ammo; }
  hero.setWeapon(id);
}

// ---------- Mejoras (GDD sección 8) ----------
const OPTIONS = [
  { id: 'dmg2', label: 'x2', sub: 'DAÑO', w: 3, ok: g => g.dmgMult < 6, apply: g => { g.dmgMult = Math.min(6, g.dmgMult * 2); } },
  { id: 'dmg3', label: 'x3', sub: 'DAÑO', w: 1, ok: g => g.dmgMult <= 2 && g.waveIndex >= 2, apply: g => { g.dmgMult = Math.min(6, g.dmgMult * 3); } },
  { id: 'rate20', label: '+20%', sub: 'CADENCIA', w: 2, ok: g => g.rateMult < 2, apply: g => { g.rateMult = Math.min(2, g.rateMult + 0.2); } },
  { id: 'rate40', label: '+40%', sub: 'CADENCIA', w: 1.4, ok: g => g.rateMult < 2 && g.waveIndex >= 1, apply: g => { g.rateMult = Math.min(2, g.rateMult + 0.4); } },
  { id: 'smg', label: 'SUBFUSIL', sub: 'ALTA CADENCIA', w: 2.2, ok: g => g.weaponId !== 'subfusil', apply: () => equip('subfusil') },
  { id: 'sg', label: 'ESCOPETA', sub: 'DAÑO CERCANO', w: 1.8, ok: g => g.weaponId !== 'escopeta', apply: () => equip('escopeta') },
  { id: 'ammo100', label: g => g.weaponId === 'escopeta' ? '+30' : '+100', sub: g => g.weaponId === 'escopeta' ? 'CARTUCHOS' : 'BALAS', w: 2.2, ok: g => g.weaponId !== 'pistola' && g.ammo < 400, apply: g => { g.ammo += g.weaponId === 'escopeta' ? 30 : 100; } },
  { id: 'ammo50', label: g => g.weaponId === 'escopeta' ? '+15' : '+50', sub: g => g.weaponId === 'escopeta' ? 'CARTUCHOS' : 'BALAS', w: 1, ok: g => g.weaponId !== 'pistola', apply: g => { g.ammo += g.weaponId === 'escopeta' ? 15 : 50; } },
  { id: 'multi', label: '+1', sub: 'DISPARO MÚLTIPLE', w: 1.5, ok: g => g.multishot < 3, apply: g => { g.multishot++; } },
  { id: 'pierce', label: '+1', sub: 'BALA PERFORANTE', w: 1.1, ok: g => g.pierce < 2, apply: g => { g.pierce++; } },
  { id: 'heal', label: '+25', sub: 'VIDA', w: 2.2, ok: g => g.hp < 85, apply: g => { g.hp = Math.min(PLAYER.maxHp, g.hp + 25); } },
  { id: 'bomb', label: 'BOMBA', sub: 'EXPLOSIÓN EN ÁREA', w: 1.2, ok: g => g.waveIndex >= 1, apply: () => bomb() },
  // trampas en rojo: obligan a fijarse antes de cruzar
  { id: 'badRate', bad: true, label: '-20%', sub: 'CADENCIA', w: 1, ok: g => g.rateMult > 0.8, apply: g => { g.rateMult = Math.max(0.6, g.rateMult - 0.2); } },
  { id: 'badHp', bad: true, label: '-15', sub: 'VIDA', w: 1, ok: g => g.hp > 30, apply: g => { g.hp = Math.max(1, g.hp - 15); } },
  { id: 'badDmg', bad: true, label: '÷2', sub: 'DAÑO', w: 1, ok: g => g.dmgMult >= 2, apply: g => { g.dmgMult = Math.max(1, g.dmgMult / 2); } },
  { id: 'badAmmo', bad: true, label: '-50', sub: 'BALAS', w: 0.8, ok: g => g.weaponId === 'subfusil' && g.ammo > 80, apply: g => { g.ammo -= 50; } },
];

function resolveOpt(o) {
  const r = { ...o, label: typeof o.label === 'function' ? o.label(G) : o.label, sub: typeof o.sub === 'function' ? o.sub(G) : o.sub };
  return r;
}

function pickOptions() {
  const withTrap = G.waveIndex >= 1 && Math.random() < 0.35;
  const pool = OPTIONS.filter(o => o.ok(G) && !o.bad);
  const traps = OPTIONS.filter(o => o.ok(G) && o.bad);
  const take = () => {
    const tot = pool.reduce((s, o) => s + o.w, 0);
    let r = Math.random() * tot;
    for (let i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) return pool.splice(i, 1)[0]; }
    return pool.pop();
  };
  const a = take();
  let b = withTrap && traps.length ? traps[(Math.random() * traps.length) | 0] : take();
  if (a.id.startsWith('ammo') && b && b.id.startsWith('ammo')) b = take() || b;
  return Math.random() < 0.5 ? [resolveOpt(a), resolveOpt(b)] : [resolveOpt(b), resolveOpt(a)];
}

function spawnGate(z) { const [l, r] = pickOptions(); gates.spawn(z, l, r); }

function bomb() {
  sfx.play('bomb'); G.shake = 0.5;
  shock.emit(G.px, G.pz - 12, 26, 0xffc04d, 0.6);
  particles.emit(G.px, 1, G.pz - 14, 40, [0xffd166, 0xff7b00, 0xffffff], 10, 0.9, 1.6);
  for (const e of horde.list) {
    if (!e.active || e.state !== 'run') continue;
    const d = G.pz - e.z;
    if (d > 0 && d < 38) { e.hp -= 25; if (e.hp <= 0) enemyDown(e); else e.flash = 0.1; }
  }
}

// ---------- Oleadas ----------
const TYPE_KEYS = Object.keys(ENEMY_TYPES);
function pickType(mix) {
  let r = Math.random();
  for (const [k, v] of Object.entries(mix)) { r -= v; if (r <= 0) return k; }
  return 'normal';
}

function spawnOne(wave) {
  const z = G.pz - SPAWN_DISTANCE - rand(0, 10);
  if (Math.random() < wave.groups) {
    const n = 4 + (Math.random() * 6 | 0), cx = rand(-5, 5), type = pickType(wave.mix);
    for (let i = 0; i < n; i++) horde.spawn(i === 0 ? type : (Math.random() < 0.7 ? 'normal' : type), clamp(cx + rand(-1.8, 1.8), -6.3, 6.3), z - rand(0, 4));
    return n;
  }
  horde.spawn(pickType(wave.mix), rand(-6.3, 6.3), z);
  return 1;
}

function spawnLeaderGroup() {
  const z = G.pz - SPAWN_DISTANCE - 6, cx = rand(-4, 4);
  horde.spawn('lider', cx, z);
  for (let i = 0; i < 10; i++) horde.spawn(Math.random() < 0.3 ? 'corredor' : 'normal', clamp(cx + rand(-2.5, 2.5), -6.3, 6.3), z + rand(-3, 3), { speedMul: 1.1 });
}

function setPhase(p) { G.phase = p; G.phaseT = 0; }

function updateDirector(dt) {
  G.phaseT += dt;
  const W = WAVES[G.waveIndex];
  switch (G.phase) {
    case 'intro':
      if (G.phaseT > 2.2) { setPhase('wave'); banner('OLEADA 1', 'Arrastra el dedo para moverte'); }
      break;
    case 'wave': {
      G.spawnAcc += W.rate * dt * (0.7 + 0.6 * G.phaseT / W.duration);
      while (G.spawnAcc >= 1) G.spawnAcc -= spawnOne(W);
      const leaders = W.leaders || 0;
      if (G.leadersDone < leaders && G.phaseT > (G.leadersDone + 0.5) * W.duration / leaders) { G.leadersDone++; spawnLeaderGroup(); }
      if (!G.midGate && G.phaseT > W.duration * 0.5) { G.midGate = true; spawnGate(G.pz - 95); }
      if (G.phaseT > W.duration) {
        if (G.waveIndex >= WAVES.length - 1) { setPhase('preboss'); banner('¡ATENCIÓN!', 'Algo grande se acerca...'); spawnGate(G.pz - 70); }
        else { setPhase('break'); spawnGate(G.pz - 70); }
      }
      break;
    }
    case 'break':
      if (G.phaseT > BREAK_DURATION) {
        G.waveIndex++; G.leadersDone = 0; G.midGate = false;
        setPhase('wave');
        banner('OLEADA ' + (G.waveIndex + 1), G.waveIndex === WAVES.length - 1 ? 'Última oleada' : '');
      }
      break;
    case 'preboss':
      if (G.phaseT > 6) { setPhase('boss'); boss.start(G.pz, bossHp()); sfx.play('boss'); banner(BOSS.name, 'JEFE FINAL', true); ui.bossBar.classList.remove('hidden'); }
      break;
    case 'boss':
      break;
  }
  if (G.phase !== 'boss' && G.pz < G.nextCarZ + 40) {
    world.spawnCar(Math.random() < 0.5 ? rand(-6, -2) : rand(2, 6), G.nextCarZ - 100);
    G.nextCarZ -= rand(70, 120);
  }
}

// Vida del jefe ajustada a la potencia del jugador para que el combate dure lo mismo
function bossHp() {
  const w = WEAPONS[G.weaponId];
  const dps = w.rate * G.rateMult * G.multishot * w.pellets * (w.pellets > 1 ? 0.55 : 1) * w.damage * G.dmgMult;
  return Math.round(clamp(dps * 24, BOSS.hp * 0.5, BOSS.hp * 4));
}

// ---------- Combate ----------
function enemyDown(e) {
  if (e.state !== 'run') return;
  horde.kill(e);
  G.kills++; G.killScore += e.t.score;
  sfx.play('down');
}

function hurt(d, x, z) {
  if (G.phase === 'dead' || G.phase === 'won') return;
  G.hp = Math.max(0, G.hp - d);
  G.shake = Math.min(0.6, G.shake + 0.15 + d * 0.03);
  hero.hurt(); sfx.play('hurt');
  ui.vignette.classList.remove('flash'); void ui.vignette.offsetWidth; ui.vignette.classList.add('flash');
  floatText('-' + d, 'dmg');
  if (G.hp <= 0) lose();
}

function findTarget(range) {
  let best = null, bd = Infinity;
  horde.query(G.pz - range, G.pz - 0.8, e => {
    const dz = G.pz - e.z, dx = e.x - G.px;
    const d = dz + Math.abs(dx) * 1.6;
    if (Math.abs(dx) < dz * 0.9 + 2 && d < bd) { bd = d; best = e; }
  });
  return best;
}

const _dir = new THREE.Vector2(), _muz = new THREE.Vector3();
function shoot(dt) {
  const w = WEAPONS[G.weaponId];
  G.fireCd -= dt;
  if (G.fireCd > 0) return;
  let tx, tz, extraRange = 0;
  const t = findTarget(w.range);
  if (t) { tx = t.x + t.vx * 0.15; tz = t.z + 1; }
  else if (boss.vulnerable) { tx = boss.x; tz = boss.z + 1; extraRange = (G.pz - boss.z) + 4 - w.range; }
  else { G.aimYaw *= 0.9; return; }
  G.fireCd = 1 / (w.rate * G.rateMult);
  hero.group.updateMatrixWorld(true);
  hero.muzzleWorld(_muz);
  const gx = _muz.x, gz = _muz.z;
  _dir.set(tx - gx, tz - gz).normalize();
  G.aimYaw = Math.atan2(-_dir.x, -_dir.y);
  const base = Math.atan2(_dir.x, _dir.y);
  const wr = extraRange > 0 ? { ...w, range: w.range + extraRange } : w;
  const dmg = w.damage * G.dmgMult;
  const shots = [];
  for (let m = 0; m < G.multishot; m++) {
    const off = (m - (G.multishot - 1) / 2) * 0.09;
    for (let p = 0; p < w.pellets; p++) {
      const sp = w.pellets > 1 ? (p / (w.pellets - 1) - 0.5) * w.spread + rand(-0.03, 0.03) : rand(-w.spread, w.spread);
      shots.push(base + off + sp);
    }
  }
  for (const a of shots) bullets.fire(gx, _muz.y, gz, Math.sin(a), Math.cos(a), wr, dmg, G.pierce);
  hero.muzzle(); sfx.play(G.weaponId);
  const big = G.weaponId === 'escopeta' ? 1.6 : 0.9;
  flashes.emit(_muz.x, _muz.y, _muz.z, big * 0.8, w.color, 0.06, 0.4);
  muzzleFx.emit(_muz.x, _muz.y, _muz.z - 0.15, big * 0.5, 0xffffff, 0.05, 0.3);
  sparks.emit(_muz.x, _muz.y, _muz.z - 0.2, G.weaponId === 'escopeta' ? 6 : 2, [0xffe9a8, 0xffb347], 5, 0.12, 1, 0);
  particles.emit(_muz.x + 0.08, _muz.y + 0.05, _muz.z + 0.25, 1, 0xd4a017, 2.2, 0.5, 0.35, 12);  // casquillo
  if (G.weaponId !== 'pistola') {
    G.ammo -= 1;
    if (G.ammo <= 0) { toast('SIN MUNICIÓN', '#ff7675'); sfx.play('empty'); equip('pistola'); G.ammo = Infinity; }
  }
}

const SPARK = [0xfff3b0, 0xffd166, 0xffffff, 0xffa040];
function impact(x, y, z, dmg) {
  flashes.emit(x, y, z, 0.7 + Math.min(1, dmg * 0.08), 0xffd27a, 0.1, 1.4);
  sparks.emit(x, y, z, 4, SPARK, 6, 0.22, 1, 6);
}
const CONFETTI = [0xff4d6d, 0xffd166, 0x06d6a0, 0x4cc9f0, 0xffffff];
function bulletHit(b, x0, z0, x1, z1) {
  let consumed = false;
  const zmin = Math.min(z0, z1) - 0.6, zmax = Math.max(z0, z1) + 0.6;
  horde.query(zmin, zmax, e => {
    if (e.i === b.lastHit) return;
    const k = (e.z - z0) / ((z1 - z0) || 1e-6);
    if (k < -0.3 || k > 1.3) return;
    const bx = x0 + (x1 - x0) * clamp(k, 0, 1);
    const r = 0.38 * e.width * e.scale + 0.12;
    if (Math.abs(bx - e.x) > r) return;
    if (e.t.dodge && e.dodgeCd <= 0 && Math.random() < e.t.dodge) {
      e.dodgeCd = 1.2; e.vx = (e.x > bx ? 1 : -1) * 9;
      particles.emit(e.x, 0.3, e.z, 3, 0xdddddd, 2, 0.3, 0.6);
      return;
    }
    e.hp -= b.dmg; e.flash = 0.07; e.z -= 0.25 * Math.min(2, b.dmg); e.recoil = 1;
    impact(bx, b.y, e.z + 0.25, b.dmg);
    sfx.play('hit');
    if (e.hp <= 0) enemyDown(e);
    b.lastHit = e.i;
    if (b.pierce > 0) { b.pierce--; return; }
    consumed = true; return true;
  });
  if (consumed) return true;
  if (boss.vulnerable && z1 <= boss.z + 1 && Math.abs(x1 - boss.x) < BOSS.radius) {
    impact(x1, b.y + rand(1, 4), boss.z + 2, b.dmg);
    sfx.play('hit');
    if (boss.damage(b.dmg)) {
      G.killScore += 2000; sfx.play('win');
      banner('¡DERROTADO!', BOSS.name, true);
      for (let i = 0; i < 6; i++) particles.emit(boss.x + rand(-2, 2), rand(2, 7), boss.z + rand(-1, 1), 25, CONFETTI, 9, 1.6, 1.5, 6);
      shock.emit(boss.x, boss.z, 20, 0xff4d6d, 0.9);
      for (const e of horde.list) if (e.active && e.state === 'run') enemyDown(e);
    }
    return true;
  }
  return false;
}

const bossCb = {
  onFight: () => {},
  onShout: () => sfx.play('shout'),
  onPamphlet: () => {},
  onSummon: (n, bx, bz) => {
    for (let i = 0; i < n; i++) horde.spawn(Math.random() < 0.35 ? 'corredor' : (Math.random() < 0.15 ? 'agil' : 'normal'), clamp(bx + rand(-6, 6), -6.3, 6.3), bz + rand(0, 6));
  },
  onHazard: (d) => hurt(d),
  onDefeated: () => win(),
};

// ---------- Fin de partida ----------
function finalScore() { return G.killScore + Math.floor(-G.pz) + (G.won ? G.hp * 20 : 0); }

function win() {
  if (G.mode !== 'play') return;
  G.won = true; setPhase('won');
  setTimeout(() => showEnd(true), 900);
}

function lose() {
  setPhase('dead'); sfx.play('lose');
  G.endT = 0;
  setTimeout(() => showEnd(false), 1300);
}

function showEnd(victory) {
  G.mode = 'end';
  const score = finalScore();
  let best = 0;
  try { best = +(localStorage.getItem('rp_best') || 0); if (score > best) { localStorage.setItem('rp_best', score); } } catch (e) {}
  const record = score > best;
  ui.endTitle.textContent = victory ? '¡VICTORIA!' : 'DERROTA';
  ui.endTitle.className = 'title ' + (victory ? 'win' : 'lose');
  ui.endSub.textContent = victory ? 'Has silenciado a ' + BOSS.name + '.' : 'La horda te ha alcanzado.';
  ui.endStats.innerHTML = `
    <div><span>Puntuación</span><b>${score.toLocaleString('es-ES')}</b></div>
    <div><span>Récord</span><b>${Math.max(best, score).toLocaleString('es-ES')}${record ? ' ★' : ''}</b></div>
    <div><span>Eliminados</span><b>${G.kills}</b></div>
    <div><span>Distancia</span><b>${Math.floor(-G.pz)} m</b></div>
    <div><span>Oleada</span><b>${G.phase === 'won' || G.waveIndex >= WAVES.length - 1 && G.phase !== 'wave' ? 'Jefe' : (G.waveIndex + 1) + '/' + WAVES.length}</b></div>
    <div><span>Vida</span><b>${G.hp}</b></div>`;
  ui.hud.classList.add('hidden');
  ui.end.classList.remove('hidden');
}

// ---------- Interfaz ----------
const ui = {
  hud: $('hud'), hpFill: $('hpFill'), hpText: $('hpText'), wave: $('wave'), kills: $('kills'), score: $('score'), dist: $('dist'),
  progFill: $('progFill'), weapon: $('weapon'), ammo: $('ammo'), bonuses: $('bonuses'),
  bossBar: $('bossBar'), bossFill: $('bossFill'), banner: $('banner'), toasts: $('toasts'), vignette: $('vignette'),
  start: $('start'), pause: $('pause'), end: $('end'), endTitle: $('endTitle'), endSub: $('endSub'), endStats: $('endStats'),
};
const cache = {};
function setText(el, key, v) { if (cache[key] !== v) { cache[key] = v; el.textContent = v; } }

const TOTAL_TIME = WAVES.reduce((s, w) => s + w.duration, 0) + BREAK_DURATION * (WAVES.length - 1);
function updateHud() {
  const hpPct = G.hp / PLAYER.maxHp;
  if (cache.hp !== G.hp) {
    cache.hp = G.hp;
    ui.hpFill.style.transform = `scaleX(${hpPct})`;
    ui.hpFill.style.background = hpPct > 0.5 ? 'linear-gradient(90deg,#2ecc71,#7bed9f)' : hpPct > 0.25 ? 'linear-gradient(90deg,#f39c12,#fdcb6e)' : 'linear-gradient(90deg,#e74c3c,#ff7675)';
    ui.hpText.textContent = G.hp;
  }
  const waveTxt = G.phase === 'boss' || G.phase === 'won' ? 'JEFE FINAL' : G.phase === 'preboss' ? '¡JEFE!' : `OLEADA ${G.waveIndex + 1}/${WAVES.length}`;
  setText(ui.wave, 'wave', waveTxt);
  setText(ui.kills, 'kills', String(G.kills));
  setText(ui.score, 'score', finalScore().toLocaleString('es-ES'));
  setText(ui.dist, 'dist', Math.floor(-G.pz) + ' m');
  let elapsed = 0;
  for (let i = 0; i < G.waveIndex; i++) elapsed += WAVES[i].duration + BREAK_DURATION;
  if (G.phase === 'wave') elapsed += G.phaseT; else if (G.phase === 'break') elapsed += WAVES[G.waveIndex].duration + G.phaseT;
  const prog = G.phase === 'preboss' || G.phase === 'boss' || G.phase === 'won' ? 1 : clamp(elapsed / TOTAL_TIME, 0, 1);
  const pk = Math.round(prog * 200);
  if (cache.prog !== pk) { cache.prog = pk; ui.progFill.style.transform = `scaleX(${prog})`; }
  const w = WEAPONS[G.weaponId];
  setText(ui.weapon, 'weapon', w.name);
  setText(ui.ammo, 'ammo', G.ammo === Infinity ? '∞' : String(G.ammo));
  const bon = [];
  if (G.dmgMult > 1) bon.push(`<i class="b-dmg">DAÑO x${G.dmgMult}</i>`);
  if (G.rateMult > 1) bon.push(`<i class="b-rate">CADENCIA +${Math.round((G.rateMult - 1) * 100)}%</i>`);
  if (G.multishot > 1) bon.push(`<i class="b-multi">MÚLTIPLE x${G.multishot}</i>`);
  if (G.pierce > 0) bon.push(`<i class="b-pierce">PERFORANTE ${G.pierce}</i>`);
  const bh = bon.join('');
  if (cache.bon !== bh) { cache.bon = bh; ui.bonuses.innerHTML = bh; }
  if (boss.active) {
    const bp = Math.round(boss.hp / boss.maxHp * 1000);
    if (cache.boss !== bp) { cache.boss = bp; ui.bossFill.style.transform = `scaleX(${bp / 1000})`; }
  }
}

let bannerTimer = 0;
function banner(title, sub = '', big = false) {
  ui.banner.innerHTML = `<div class="t ${big ? 'big' : ''}">${title}</div>${sub ? `<div class="s">${sub}</div>` : ''}`;
  ui.banner.classList.remove('show'); void ui.banner.offsetWidth; ui.banner.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => ui.banner.classList.remove('show'), 2200);
}

function toast(text, color = '#fff') {
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = text; d.style.color = color;
  ui.toasts.appendChild(d);
  setTimeout(() => d.remove(), 1200);
}
function floatText(text, cls) {
  const d = document.createElement('div');
  d.className = 'float ' + cls; d.textContent = text;
  ui.hud.appendChild(d);
  setTimeout(() => d.remove(), 900);
}

// ---------- Controles táctiles ----------
let drag = null;
const keys = {};
function onDown(e) {
  if (G.mode !== 'play') return;
  sfx.unlock();
  drag = { id: e.pointerId, x: e.clientX, start: G.targetX };
}
function onMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = (e.clientX - drag.x) / window.innerWidth * PLAYER.dragMetersPerScreen;
  G.targetX = clamp(drag.start + dx, -ROAD.playerLimit, ROAD.playerLimit);
  // si se pasa del borde, reajusta el ancla para que volver sea inmediato
  if (Math.abs(drag.start + dx) > ROAD.playerLimit) { drag.x = e.clientX; drag.start = G.targetX; }
}
function onUp(e) { if (drag && e.pointerId === drag.id) drag = null; }
canvas.addEventListener('pointerdown', onDown);
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onUp);
window.addEventListener('pointercancel', onUp);
window.addEventListener('keydown', e => { keys[e.key] = true; if (e.key === 'Escape' || e.key === 'p') togglePause(); });
window.addEventListener('keyup', e => { keys[e.key] = false; });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());

function togglePause(force) {
  if (G.mode === 'play' && force !== false) { G.mode = 'pause'; ui.pause.classList.remove('hidden'); }
  else if (G.mode === 'pause' && force !== true) { G.mode = 'play'; ui.pause.classList.add('hidden'); last = performance.now(); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) togglePause(true); });

function startGame() {
  sfx.unlock();
  resetGame();
  for (const k in cache) delete cache[k];
  ui.start.classList.add('hidden'); ui.end.classList.add('hidden'); ui.pause.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  G.mode = 'play';
  banner('¡CORRE!', 'Dispara solo. Tú esquiva y elige mejoras.');
  last = performance.now();
}

$('playBtn').addEventListener('click', startGame);
$('againBtn').addEventListener('click', startGame);
$('menuBtn').addEventListener('click', () => { ui.end.classList.add('hidden'); ui.start.classList.remove('hidden'); G.mode = 'menu'; showBest(); });
$('pauseBtn').addEventListener('click', () => togglePause(true));
$('resumeBtn').addEventListener('click', () => togglePause(false));
$('quitBtn').addEventListener('click', () => { ui.pause.classList.add('hidden'); ui.hud.classList.add('hidden'); ui.start.classList.remove('hidden'); G.mode = 'menu'; resetGame(); showBest(); });
const soundBtn = $('soundBtn');
function paintSound() { soundBtn.textContent = sfx.muted ? '🔇 Sonido: no' : '🔊 Sonido: sí'; }
soundBtn.addEventListener('click', () => { sfx.unlock(); sfx.setMuted(!sfx.muted); paintSound(); });
paintSound();
function showBest() { let b = 0; try { b = +(localStorage.getItem('rp_best') || 0); } catch (e) {} $('best').textContent = b ? 'Récord: ' + b.toLocaleString('es-ES') : ''; }
showBest();
$('version').textContent = 'Versión ' + GAME_VERSION;
const standalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches;
if (!standalone && /iPhone|iPad|iPod/.test(navigator.userAgent)) $('installHint').classList.remove('hidden');

// ---------- Bucle principal ----------
let last = performance.now();
let perfAcc = 0, perfFrames = 0;
const camPos = new THREE.Vector3(0, CAMERA.height, CAMERA.distance), camLook = new THREE.Vector3();

function step(dt) {
  G.time += dt;
  const alive = G.phase !== 'dead';
  const speed = G.phase === 'won' ? PLAYER.forwardSpeed * 0.5 : alive ? PLAYER.forwardSpeed : 0;
  G.pz -= speed * dt;
  // movimiento lateral libre (GDD sección 4)
  const kb = (keys.ArrowRight || keys.d || keys.D ? 1 : 0) - (keys.ArrowLeft || keys.a || keys.A ? 1 : 0);
  if (kb) G.targetX = clamp(G.targetX + kb * 11 * dt, -ROAD.playerLimit, ROAD.playerLimit);
  if (alive) {
    const want = clamp((G.targetX - G.px) * 14, -PLAYER.lateralSpeed, PLAYER.lateralSpeed);
    G.vx += (want - G.vx) * Math.min(1, dt * 20);
    G.px = clamp(G.px + G.vx * dt, -ROAD.playerLimit, ROAD.playerLimit);
  } else G.vx = 0;

  if (alive && G.phase !== 'won') { updateDirector(dt); shoot(dt); }
  horde.update(dt, G.px, G.pz, e => particles.emit(e.x, 0.6, e.z, 5, CONFETTI, 3, 0.5, 0.8));
  // contacto con la horda (GDD sección 9)
  if (alive) {
    horde.query(G.pz - 0.7, G.pz + 1.0, e => {
      if (Math.abs(e.x - G.px) < 0.4 * e.width * e.scale + PLAYER.radius) {
        hurt(e.t.contact); horde.kill(e);
        particles.emit(e.x, 1, e.z, 6, [0xffffff, 0xff7675], 4, 0.4, 0.8);
      }
    });
    const car = world.carCollision(G.px, G.pz, PLAYER.radius);
    if (car) { car.hit = true; hurt(5); sfx.play('car'); particles.emit(G.px, 0.8, G.pz - 1, 12, [0xaaaaaa, 0x666666, 0xffd166], 5, 0.6, 1); }
  }
  bullets.update(dt, bulletHit);
  particles.update(dt);
  sparks.update(dt);
  shock.update(dt);
  gates.update(dt, G.px, G.pz, opt => {
    const o = OPTIONS.find(o => o.id === opt.id);
    o.apply(G); sfx.play('gate');
    toast(`${opt.label} ${opt.sub}`, opt.bad ? '#ff6b6b' : '#6ec1ff');
    if (opt.bad) { sfx.play('hurt'); G.shake = 0.3; }
    particles.emit(G.px, 1.5, G.pz - 0.5, 18, [0xffffff, 0x9be7ff, 0xffe066], 5, 0.7, 0.9);
  });
  boss.update(dt, G.px, G.pz, bossCb);
  hero.update(dt, G.px, G.pz, G.vx, G.aimYaw, alive);
  if (!alive) { hero.group.rotation.x = Math.max(-1.4, hero.group.rotation.x - dt * 4); }

  // cámara de seguimiento con ajuste para el jefe (GDD sección 3)
  const bossMode = G.phase === 'boss' || G.phase === 'preboss' ? 1 : 0;
  G.camBoss += (bossMode - G.camBoss) * Math.min(1, dt * 1.5);
  const intro = boss.state === 'intro' ? 1 : 0;
  const h = CAMERA.height + G.camBoss * 1.8 + intro * 1.5, d = CAMERA.distance + G.camBoss * 2.5;
  camPos.set(G.px * CAMERA.followX, h, G.pz + d);
  G.shake = Math.max(0, G.shake - dt * 1.6);
  const sh = G.shake * G.shake;
  camera.position.copy(camPos).add(new THREE.Vector3(rand(-1, 1) * sh, rand(-1, 1) * sh, 0));
  camLook.set(G.px * 0.4, 1 + intro * 3, G.pz - CAMERA.lookAhead - G.camBoss * 6);
  camera.lookAt(camLook);
  world.update(dt, G.pz, camera);
  flashes.update(dt, camera); muzzleFx.update(dt, camera);
}

function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000; last = now;
  if (dt > 0.05) dt = 0.05;
  if (G.mode === 'play' || G.mode === 'end') {
    step(dt);
    if (G.mode === 'play') updateHud();
  } else if (G.mode === 'menu') {
    // cámara de presentación
    G.pz -= dt * 4;
    world.update(dt, G.pz, camera);
    hero.update(dt, 0, G.pz, 0, 0, true);
    const a = performance.now() / 4000;
    camera.position.set(Math.sin(a) * 6, 4.5, G.pz + 9);
    camera.lookAt(0, 2, G.pz - 12);
  }
  renderer.render(scene, camera);
  // calidad adaptativa para mantener la fluidez
  perfAcc += dt; perfFrames++;
  if (perfAcc > 2.5) {
    const avg = perfAcc / perfFrames;
    if (avg > 1 / 45 && pixelRatio > 1) { pixelRatio = Math.max(1, pixelRatio - 0.25); renderer.setPixelRatio(pixelRatio); resize(); }
    perfAcc = 0; perfFrames = 0;
  }
}
requestAnimationFrame(frame);

// utilidades de prueba (no afectan al juego)
window.__rp = { G, horde, boss, startGame, WAVES, renderer, scene, camera, hero, gates, sim: (sec, bot) => { for (let t = 0; t < sec && G.mode === 'play'; t += 1 / 60) { if (bot) bot(G); step(1 / 60); } updateHud(); } };

// Actualización automática: busca versión nueva al abrir y al volver a la app,
// y recarga una vez cuando el service worker nuevo toma el control.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded || G.mode === 'play') return;
    reloaded = true; location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
      reg.update();
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update(); });
    }).catch(() => {});
  });
}
