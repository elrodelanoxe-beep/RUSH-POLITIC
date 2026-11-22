import * as THREE from 'three';
import { ROAD, PLAYER, CAMERA, ENEMY_TYPES, WAVES, BREAK_DURATION, SPAWN_DISTANCE, BOSS, GAME_VERSION, LANES, WEAPON_TIERS, SHOT, BONUS, CRATE, SQUAD, DIFFICULTY, MINIBOSS } from './config.js';
import { Squad, slot } from './squad.js';
import { World } from './world.js';
import { Horde } from './enemies.js';
import { Bullets, Particles, Shockwaves, Flashes } from './combat.js';
import { PlayerModel, FLASH_TEX, GLOW_TEX } from './player.js';
import { WeaponCrates, BonusTokens } from './pickups.js';
import { Boss, Brute } from './boss.js';
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
const crates = new WeaponCrates(scene);
const bonuses = new BonusTokens(scene);
const squad = new Squad(scene);
const boss = new Boss(scene);
const minis = [new Brute(scene, 'porra'), new Brute(scene, 'botella')];
const sfx = new Sfx();

// ---------- Estado de la partida ----------
let diffKey = 'normal';
try { const d = localStorage.getItem('rp_diff'); if (DIFFICULTY[d]) diffKey = d; } catch (e) {}
const D = () => DIFFICULTY[diffKey];

const G = {
  mode: 'menu', maxHp: PLAYER.maxHp, phase: 'intro', phaseT: 0,
  px: 0, pz: 0, vx: 0, targetX: 0, aimYaw: 0,
  hp: PLAYER.maxHp, kills: 0, killScore: 0, time: 0,
  tier: 0, power: 0, bonusIdx: 0, fireCd: 0, nextCrateZ: -CRATE.firstAt, nextBonusZ: -40,
  waveIndex: 0, spawnAcc: 0, leadersDone: 0,
  shake: 0, camBoss: 0, endT: 0, won: false,
};

function resetGame() {
  horde.clear(); bullets.clear(); particles.clear(); sparks.clear(); flashes.clear(); muzzleFx.clear(); crates.clear(); bonuses.clear(); squad.clear(); world.clearCars(); boss.reset(); for (const m of minis) m.reset();
  Object.assign(G, {
    phase: 'intro', phaseT: 0, px: 0, pz: 0, vx: 0, targetX: 0, aimYaw: 0,
    hp: D().hp, maxHp: D().hp, kills: 0, killScore: 0, time: 0,
    tier: 0, power: 0, bonusIdx: 0, fireCd: 0, nextCrateZ: -CRATE.firstAt, nextBonusZ: -40,
    waveIndex: 0, spawnAcc: 0, leadersDone: 0, miniDone: false, minisBeaten: 0, shake: 0, camBoss: 0, endT: 0, won: false,
  });
  hero.setWeapon(WEAPON_TIERS[0].model); squad.setWeapon(WEAPON_TIERS[0].model);
  if (SQUAD.start) squad.add(SQUAD.start, 0, 0);
  hero.group.rotation.set(0, 0, 0);
  world.segments.forEach((s, i) => s.position.z = 30 - i * ROAD.segmentLength);
  world.towers.forEach((t, i) => t.position.z = -60 - i * 150);
  ui.bossBar.classList.add('hidden');
}

const weapon = () => WEAPON_TIERS[G.tier];
const powerMult = () => 1;

function equipTier(i) {
  G.tier = i;
  const w = weapon();
  hero.setWeapon(w.model); squad.setWeapon(w.model);
  sfx.play('gate');
  banner(w.name, '+ ' + w.up, true);
  particles.emit(G.px, 1.5, G.pz - 0.5, 24, [0xffffff, 0x9be7ff, 0xffe066], 6, 0.8, 1);
}

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
    const n = 4 + (Math.random() * 5 | 0), cx = rand(-0.8, 0.8), type = pickType(wave.mix);
    for (let i = 0; i < n; i++) horde.spawn(i === 0 ? type : (Math.random() < 0.7 ? 'normal' : type), clamp(cx + rand(-1.4, 1.4), -MID, MID), z - rand(0, 5), { hpMul: hordeMul(wave) });
    return n;
  }
  horde.spawn(pickType(wave.mix), rand(-MID, MID), z, { hpMul: hordeMul(wave) });
  return 1;
}

const MID = 1.9;  // mitad útil del carril central
function spawnLeaderGroup(wave) {
  const z = G.pz - SPAWN_DISTANCE - 6, cx = 0;
  horde.spawn('lider', cx, z, { hpMul: hordeMul(wave) });
  for (let i = 0; i < 9; i++) horde.spawn(Math.random() < 0.3 ? 'corredor' : 'normal', clamp(cx + rand(-1.8, 1.8), -MID, MID), z + rand(-3, 3), { speedMul: 1.1, hpMul: hordeMul(wave) });
}

// Proporcionalidad: la horda aguanta más cuantos más soldados llevas y según la dificultad
function squadEff() { return squad.count <= SQUAD.fullFire ? squad.count : SQUAD.fullFire * Math.sqrt(squad.count / SQUAD.fullFire); }
function hordeMul(wave) { return wave.hpMul * D().horde * (1 + squadEff() / D().squadScale); }

function setPhase(p) { G.phase = p; G.phaseT = 0; }

function updateDirector(dt) {
  G.phaseT += dt;
  const W = WAVES[G.waveIndex];
  switch (G.phase) {
    case 'intro':
      if (G.phaseT > 2.2) { setPhase('wave'); banner('OLEADA 1', 'Izquierda: armas · Centro: horda · Derecha: bonus'); }
      break;
    case 'wave': {
      G.spawnAcc += W.rate * D().rate * (1 + squad.count / D().squadSpawn) * dt * (0.7 + 0.6 * G.phaseT / W.duration);
      while (G.spawnAcc >= 1) G.spawnAcc -= spawnOne(W);
      const leaders = W.leaders || 0;
      if (G.leadersDone < leaders && G.phaseT > (G.leadersDone + 0.5) * W.duration / leaders) { G.leadersDone++; spawnLeaderGroup(W); }
      // minijefe a mitad de oleada (desde la 2ª)
      if (!G.miniDone && G.waveIndex >= MINIBOSS.fromWave && G.phaseT > W.duration * MINIBOSS.at) {
        G.miniDone = true;
        const m = minis[G.waveIndex % 2];
        if (!m.active) {
          m.start(G.px, G.pz, Math.round(bossHp() / D().boss * MINIBOSS.hpFactor * D().mini));
          banner('¡MINIJEFE!', m.name); sfx.play('boss');
        }
      }
      if (G.phaseT > W.duration) {
        if (G.waveIndex >= WAVES.length - 1) { setPhase('preboss'); banner('¡ATENCIÓN!', 'Algo grande se acerca...'); }
        else setPhase('break');
      }
      break;
    }
    case 'break':
      if (G.phaseT > BREAK_DURATION) {
        G.waveIndex++; G.leadersDone = 0; G.miniDone = false;
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
  // carril izquierdo: la siguiente arma, cada vez más potente
  if (G.phase !== 'boss' && G.phase !== 'preboss' && G.pz < G.nextCrateZ + 110) {
    const next = Math.max(G.tier, ...crates.pool.filter(c => c.active).map(c => c.tierIndex)) + 1;
    if (next < WEAPON_TIERS.length && !crates.pool.some(c => c.active)) crates.spawn(G.nextCrateZ, next, WEAPON_TIERS[next]);
    G.nextCrateZ -= rand(...CRATE.every);
  }
  // carril derecho: bonus +1 / +2
  if (G.phase !== 'boss' && G.pz < G.nextBonusZ + 110) {
    const d = D(), roll = G.bonusIdx++ < 1 ? 1 : Math.random();
    if (roll < BONUS.healChance) bonuses.spawn(G.nextBonusZ, 1, 'heal', Infinity);
    else if (roll < BONUS.healChance + d.negChance) {
      // los negativos cuestan más: empiezan más abajo cuanto más grande es tu ejército
      const neg = Math.round(rand(...d.negStart) + squad.count * 0.3);
      bonuses.spawn(G.nextBonusZ, -neg, 'minus', Infinity);
    } else bonuses.spawn(G.nextBonusZ, 1, 'plus', Infinity);
    G.nextBonusZ -= rand(...BONUS.every);
  }
}

// Vida del jefe ajustada a la potencia del jugador para que el combate dure lo mismo
function bossHp() {
  const w = weapon();
  const eff = squadEff();
  const dps = (w.rate * w.shots + eff * Math.min(w.rate, SQUAD.maxRate) * SQUAD.damage) * w.damage * 0.7;
  return Math.round(clamp(dps * 16 * D().boss, 300, 200000));
}

// ---------- Combate ----------
function enemyDown(e) {
  if (e.state !== 'run') return;
  horde.kill(e);
  G.kills++; G.killScore += e.t.score;
  sfx.play('down');
}

// El daño quita soldados (1 por punto de daño); sin soldados, quita vida al protagonista
function takeHit(d) {
  if (G.phase === 'dead' || G.phase === 'won') return;
  if (squad.count > 0) {
    const lost = squad.remove(d);
    for (const m of lost) particles.emit(m.x, 1, m.z, 8, [0xffffff, 0x1f5fa8, 0xff7675], 4, 0.5, 0.8);
    sfx.play('hurt'); G.shake = Math.min(0.5, G.shake + 0.12);
    floatText('-' + lost.length + ' 👤', 'dmg');
    return;
  }
  hurt(d);
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

// Disparo continuo y recto hacia delante; munición infinita
const _muz = new THREE.Vector3();
function shoot(dt) {
  const w = weapon();
  G.fireCd -= dt;
  if (G.fireCd > 0) return;
  G.fireCd += 1 / w.rate;
  if (G.fireCd < 0) G.fireCd = 0;
  hero.group.updateMatrixWorld(true);
  hero.muzzleWorld(_muz);
  const dmg = w.damage * powerMult();
  const props = { speed: SHOT.speed, range: SHOT.range, size: 1 + w.damage * 0.04, color: w.color };
  for (let m = 0; m < w.shots; m++) {
    const off = (m - (w.shots - 1) / 2) * SHOT.spacing;
    const b = bullets.fire(G.px + off, _muz.y, _muz.z, 0, -1, props, dmg, 0);
    if (b) b.splash = w.splash || 0;
  }
  hero.muzzle(); sfx.play(w.sound);
  const big = w.damage > 5 ? 1.6 : w.damage > 2 ? 1.2 : 0.9;
  flashes.emit(_muz.x, _muz.y, _muz.z, big * 0.8, w.color, 0.06, 0.4);
  muzzleFx.emit(_muz.x, _muz.y, _muz.z - 0.15, big * 0.5, 0xffffff, 0.05, 0.3);
  sparks.emit(_muz.x, _muz.y, _muz.z - 0.2, 2, [0xffe9a8, 0xffb347], 5, 0.12, 1, 0);
  particles.emit(_muz.x + 0.08, _muz.y + 0.05, _muz.z + 0.25, 1, 0xd4a017, 2.2, 0.5, 0.35, 12);  // casquillo
}

function squadFire(m) {
  const w = weapon();
  // con muchos soldados disparan menos balas pero más fuertes (mismo daño total, mejor rendimiento)
  // y por encima de 50 soldados la potencia total crece más despacio (raíz cuadrada) para mantener el equilibrio
  const k = Math.max(1, squad.count / SQUAD.fullFire);
  const rate = Math.min(w.rate, SQUAD.maxRate) / k;
  const props = { speed: SHOT.speed, range: SQUAD.range, size: 0.9, color: w.color };
  const b = bullets.fire(m.x + 0.3, 1.38, m.z - 0.9, 0, -1, props, w.damage * SQUAD.damage * Math.sqrt(k), 0);
  if (b) { b.splash = w.splash || 0; b.ally = true; }
  if (Math.random() < 0.3) flashes.emit(m.x + 0.3, 1.38, m.z - 1, 0.5, w.color, 0.05, 0.4);
  return 1 / rate;
}

const SPARK = [0xfff3b0, 0xffd166, 0xffffff, 0xffa040];
function impact(x, y, z, dmg) {
  flashes.emit(x, y, z, 0.7 + Math.min(1, dmg * 0.08), 0xffd27a, 0.1, 1.4);
  sparks.emit(x, y, z, 4, SPARK, 6, 0.22, 1, 6);
}
const CONFETTI = [0xff4d6d, 0xffd166, 0x06d6a0, 0x4cc9f0, 0xffffff];
function splashDamage(b, x, z) {
  shock.emit(x, z, b.splash * 2, 0xffa040, 0.25);
  horde.query(z - b.splash, z + b.splash, e => {
    if (Math.abs(e.x - x) < b.splash && e.i !== b.lastHit) { e.hp -= b.dmg * 0.5; e.flash = 0.07; if (e.hp <= 0) enemyDown(e); }
  });
}

function bulletHit(b, x0, z0, x1, z1) {
  let consumed = false;
  // los paneles solo suben con tus disparos (las balas de los soldados los atraviesan)
  const bon = b.ally ? null : bonuses.hitTest(x1, z0, z1);
  if (bon) {
    if (bonuses.hit(bon)) sfx.play('hit');
    flashes.emit(x1, b.y, bon.z + 0.2, 0.6, 0x6ec1ff, 0.08, 1.2);
    return true;
  }
  const crate = crates.hitTest(x1, z0, z1);
  if (crate) {
    crate.hp -= b.dmg; crate.pop = 1;
    impact(x1, b.y, crate.z + 0.2, b.dmg);
    sfx.play('hit');
    if (crate.hp <= 0) { crate.done = true; crate.fade = 0; equipTier(crate.tierIndex); }
    return true;
  }
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
    if (b.splash) splashDamage(b, bx, e.z);
    if (b.pierce > 0) { b.pierce--; return; }
    consumed = true; return true;
  });
  if (consumed) return true;
  for (const m of minis) {
    if (m.vulnerable && z1 <= m.z + 0.6 && z0 >= m.z - 2 && Math.abs(x1 - m.x) < m.radius) {
      impact(x1, b.y + rand(0.5, 2.5), m.z + 0.8, b.dmg); sfx.play('hit');
      if (m.damage(b.dmg)) {
        G.killScore += 500; G.minisBeaten++; sfx.play('win');
        banner('¡MINIJEFE DERROTADO!', m.name);
        particles.emit(m.x, 2, m.z, 30, CONFETTI, 8, 1.2, 1.4, 6);
      }
      return true;
    }
  }
  if (boss.vulnerable && z1 <= boss.z + 1 && z0 >= boss.z - 3 && Math.abs(x1 - boss.x) < BOSS.radius) {
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

// Golpe cuerpo a cuerpo: caen los soldados que estén en la zona roja; si el protagonista está dentro, recibe el golpe
function meleeStrike(zone, dmg) {
  const inZone = (x, z) => Math.abs(x - zone.x) < zone.w / 2 + 0.2 && z >= zone.z0 - 0.5 && z <= zone.z1 + 0.5;
  // cada golpe derriba como mucho 'dmg' soldados de la zona (proporcional)
  let n = 0;
  const lost = squad.removeWhere(m => n < dmg && inZone(m.x, m.z) && ++n);
  for (const m of lost) particles.emit(m.x, 1, m.z, 6, [0xffffff, 0x1f5fa8, 0xff7675], 4, 0.5, 0.8);
  if (lost.length) floatText('-' + lost.length + ' 👤', 'dmg');
  G.shake = Math.min(0.7, G.shake + 0.35);
  shock.emit(zone.x, (zone.z0 + zone.z1) / 2, zone.w * 0.8, 0xff4d6d, 0.35);
  sfx.play('car');
  if (inZone(G.px, G.pz)) takeHit(dmg);
}
const summon = (n, bx, bz) => {
  for (let i = 0; i < n; i++) horde.spawn(Math.random() < 0.35 ? 'corredor' : (Math.random() < 0.15 ? 'agil' : 'normal'), clamp(bx + rand(-6, 6), -6.3, 6.3), bz - rand(2, 8), { hpMul: hordeMul(WAVES[WAVES.length - 1]) * 0.5 });
};
const bossCb = {
  onFight: () => {},
  onWindup: () => sfx.play('shout'),
  onStrike: meleeStrike,
  onSummon: summon,
  onDefeated: () => win(),
};
const miniCb = { onWindup: () => sfx.play('shout'), onStrike: meleeStrike };

// ---------- Fin de partida ----------
function finalScore() { return G.killScore + Math.floor(-G.pz) + (G.won ? G.hp * 20 + squad.count * 100 : 0); }

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
  ui.endSub.textContent = victory ? 'Has derrotado a ' + BOSS.name + '.' : 'La horda te ha alcanzado.';
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
  bossBar: $('bossBar'), bossFill: $('bossFill'), bossName: $('bossName'), banner: $('banner'), toasts: $('toasts'), vignette: $('vignette'),
  start: $('start'), pause: $('pause'), end: $('end'), endTitle: $('endTitle'), endSub: $('endSub'), endStats: $('endStats'),
};
const cache = {};
function setText(el, key, v) { if (cache[key] !== v) { cache[key] = v; el.textContent = v; } }

const TOTAL_TIME = WAVES.reduce((s, w) => s + w.duration, 0) + BREAK_DURATION * (WAVES.length - 1);
function updateHud() {
  const hpPct = G.hp / G.maxHp;
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
  const w = weapon();
  setText(ui.weapon, 'weapon', w.name);
  setText(ui.ammo, 'ammo', '∞');
  const bon = [];
  bon.push(`<i class="b-dmg">DAÑO ${+(w.damage * powerMult()).toFixed(1)}</i>`);
  bon.push(`<i class="b-rate">CADENCIA ${w.rate}/s</i>`);
  bon.push(`<i class="b-multi">DISPAROS x${w.shots}</i>`);
  bon.push(`<i class="b-pierce">SOLDADOS ${squad.count}</i>`);
  const bh = bon.join('');
  if (cache.bon !== bh) { cache.bon = bh; ui.bonuses.innerHTML = bh; }
  const big = boss.active ? boss : minis.find(m => m.active);
  ui.bossBar.classList.toggle('hidden', !big);
  if (big) {
    setText(ui.bossName, 'bossName', big.name);
    const bp = Math.round(big.hp / big.maxHp * 1000);
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
  banner('¡CORRE!', 'Disparas sin parar hacia delante');
  last = performance.now();
}

$('playBtn').addEventListener('click', startGame);
function paintDiff() {
  for (const b of document.querySelectorAll('#diff button')) b.classList.toggle('on', b.dataset.d === diffKey);
  const d = D();
  $('diffInfo').textContent = `Vida ${d.hp} · Hordas ${Math.round(d.horde * 100)} % · Paneles rojos ${Math.round(d.negChance * 100)} %`;
}
function setDiff(k) { if (!DIFFICULTY[k]) return; diffKey = k; try { localStorage.setItem('rp_diff', k); } catch (e) {} paintDiff(); }
for (const b of document.querySelectorAll('#diff button')) b.addEventListener('click', () => setDiff(b.dataset.d));
paintDiff();
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
    const depth = squad.count ? slot(squad.count - 1, squad.count)[1] + 0.6 : 1.0;
    horde.query(G.pz - 0.7, G.pz + depth, e => {
      const r = 0.4 * e.width * e.scale;
      let hit = Math.abs(e.z - G.pz) < 0.85 && Math.abs(e.x - G.px) < r + PLAYER.radius;
      if (!hit) for (const m of squad.members) if (Math.abs(e.z - m.z) < 0.6 && Math.abs(e.x - m.x) < r + 0.35) { hit = true; break; }
      if (hit) {
        takeHit(e.t.contact); horde.kill(e);
        particles.emit(e.x, 1, e.z, 6, [0xffffff, 0xff7675], 4, 0.4, 0.8);
      }
    });
    const car = world.carCollision(G.px, G.pz, PLAYER.radius);
    if (car) { car.hit = true; takeHit(5); sfx.play('car'); particles.emit(G.px, 0.8, G.pz - 1, 12, [0xaaaaaa, 0x666666, 0xffd166], 5, 0.6, 1); }
  }
  bullets.update(dt, bulletHit);
  particles.update(dt);
  sparks.update(dt);
  shock.update(dt);
  crates.update(dt, G.pz, G.time);
  bonuses.update(dt, G.px, G.pz, (v, b) => {
    if (b.kind === 'heal') {
      if (v <= 0) return;
      const gain = Math.min(v, G.maxHp - G.hp); G.hp += gain; sfx.play('gate');
      toast(`+${gain} VIDA`, '#5be37d');
      particles.emit(G.px, 1.5, G.pz - 0.5, 14, [0xffffff, 0x9cffb0, 0x22b24c], 5, 0.6, 0.8);
    } else if (v > 0) {
      const before = squad.count; squad.add(v, G.px, G.pz + 1); sfx.play('gate');
      const got = squad.count - before;
      toast(got > 0 ? `+${got} SOLDADO${got > 1 ? 'S' : ''}` : 'EJÉRCITO COMPLETO', '#6ec1ff');
      particles.emit(G.px, 1.5, G.pz - 0.5, 14, [0xffffff, 0x9be7ff, 0x1e88ff], 5, 0.6, 0.8);
    } else if (v < 0) {
      // penalización: tocar un panel negativo quita soldados (o vida si no quedan)
      G.negHits = (G.negHits || 0) + 1; toast(`¡PANEL NEGATIVO! −${-v}`, '#ff6b6b');
      particles.emit(G.px, 1.5, G.pz - 0.5, 14, [0xffffff, 0xff8a80, 0xe53935], 5, 0.6, 0.8);
      takeHit(-v);
    }
  });
  boss.update(dt, G.px, G.pz, bossCb);
  for (const m of minis) m.update(dt, G.px, G.pz, miniCb);
  hero.update(dt, G.px, G.pz, G.vx, 0, alive);
  squad.update(dt, G.px, G.pz, alive && G.phase !== 'won' && G.phase !== 'intro' ? squadFire : null);
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
window.__rp = { G, horde, boss, minis, startGame, setDiff, WAVES, WT: WEAPON_TIERS, renderer, scene, camera, hero, crates, bonuses, squad, sim: (sec, bot) => { for (let t = 0; t < sec && G.mode === 'play'; t += 1 / 60) { if (bot) bot(G); step(1 / 60); } updateHud(); } };

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
