// Parámetros de juego del MVP de RUSH POLITIC.
// Los valores marcados en el GDD como "Pendiente de definir" se fijan aquí
// para poder jugar, y se pueden ajustar sin tocar el resto del código.

// Versión del juego que se muestra en el menú. Súbela con cada cambio publicado
// (y también VERSION en sw.js) para comprobar en el móvil qué versión ha cargado.
export const GAME_VERSION = '1.1';

export const ROAD = {
  halfWidth: 7,        // anchura de la calzada: 14 m
  playerLimit: 6.2,    // límite físico del movimiento lateral
  segmentLength: 30,
  segments: 11,
};

export const PLAYER = {
  maxHp: 100,          // GDD sección 9
  forwardSpeed: 9,     // m/s de avance automático
  lateralSpeed: 20,    // m/s máximo de desplazamiento lateral
  radius: 0.55,
  dragMetersPerScreen: 15, // metros que recorre al arrastrar el ancho de la pantalla
};

export const CAMERA = {
  height: 7.2,
  distance: 10,
  lookAhead: 14,
  followX: 0.55,
  targetHFov: 50,      // grados horizontales deseados (se adapta a la pantalla)
};

// Tres carriles: izquierda armas especiales, centro hordas, derecha bonus +1/+2
export const LANES = { left: -4.67, center: 0, right: 4.67, width: 4.67 };

// Progresión de armas del carril izquierdo (orden del GDD, sección 7).
// Cada arma nueva mejora una sola cosa respecto a la anterior: daño, cadencia o disparos.
// counter = disparos de daño que hay que meterle a la caja para conseguirla.
export const WEAPON_TIERS = [
  { id: 'pistola',       name: 'PISTOLA',          damage: 1,   rate: 4,  shots: 1, counter: 0,    up: null,       color: 0xffe066, model: 'pistola',       sound: 'pistola' },
  { id: 'subfusil',      name: 'SUBFUSIL',         damage: 1,   rate: 8,  shots: 1, counter: 8,    up: 'CADENCIA', color: 0x7cf0ff, model: 'subfusil',      sound: 'subfusil' },
  { id: 'escopeta',      name: 'ESCOPETA',         damage: 2.5, rate: 8,  shots: 1, counter: 18,   up: 'DAÑO',     color: 0xff9f43, model: 'escopeta',      sound: 'escopeta' },
  { id: 'rifle',         name: 'RIFLE DE ASALTO',  damage: 2.5, rate: 8,  shots: 2, counter: 40,   up: 'DISPAROS', color: 0xa3ff7c, model: 'rifle',         sound: 'subfusil' },
  { id: 'ametralladora', name: 'AMETRALLADORA',    damage: 2.5, rate: 14, shots: 2, counter: 75,   up: 'CADENCIA', color: 0x7cf0ff, model: 'ametralladora', sound: 'subfusil' },
  { id: 'lanzacohetes',  name: 'LANZACOHETES',     damage: 6,   rate: 14, shots: 2, counter: 130,  up: 'DAÑO',     color: 0xff7b3b, model: 'lanzacohetes',  sound: 'escopeta', splash: 1.6 },
  { id: 'energetica',    name: 'ARMA ENERGÉTICA',  damage: 6,   rate: 14, shots: 3, counter: 220,  up: 'DISPAROS', color: 0xc77dff, model: 'energetica',    sound: 'subfusil', splash: 1.6 },
  { id: 'canon',         name: 'CAÑÓN PESADO',     damage: 14,  rate: 14, shots: 3, counter: 350,  up: 'DAÑO',     color: 0xff4d6d, model: 'canon',         sound: 'escopeta', splash: 2.2 },
];
export const SHOT = { speed: 90, range: 60, spacing: 0.38 };

// Paneles del carril derecho: empiezan en +1/+2, suben al dispararles y al tocarlos
// dan ese número de soldados. step = disparos del protagonista para subir +1.
// Paneles del carril derecho. Cada impacto suma 1 al número (se ve en cada disparo).
//  azul  (+N): N soldados · rojo (−N): empieza en negativo; si lo tocas en negativo pierdes N soldados
//  verde (+N ❤): recupera N puntos de vida
// Sin máximo: los azules y verdes siempre empiezan en +1; los rojos en negativo.
export const BONUS = { every: [42, 60], healChance: 0.1 };
// Soldados: disparan recto con el arma del protagonista (cadencia máxima por soldado).
export const SQUAD = { maxRate: 4, damage: 0.6, start: 0, range: 34, fullFire: 50, panelHit: 0.25 };  // soldado: máx. 4 disparos/s al 60 % del daño; cada bala suma 0,25 al panel

// Tres niveles de dificultad (se eligen en el menú)
export const DIFFICULTY = {
  facil:   { label: 'FÁCIL',   hp: 150, horde: 0.8,  rate: 0.9,  boss: 0.8, negChance: 0.3,  negStart: [4, 10],  squadScale: 60, squadSpawn: 140, mini: 0.8 },
  normal:  { label: 'NORMAL',  hp: 100, horde: 1.25, rate: 1.15, boss: 1.0, negChance: 0.45, negStart: [4, 20],  squadScale: 40, squadSpawn: 100, mini: 1.0 },
  dificil: { label: 'DIFÍCIL', hp: 70,  horde: 1.35, rate: 1.2,  boss: 1.25, negChance: 0.5,  negStart: [6, 22],  squadScale: 30, squadSpawn: 65, mini: 1.0 },
};
export const CRATE = { every: [70, 85], firstAt: 40 };

// Tres armas iniciales (GDD sección 17, punto 12)
export const WEAPONS = {
  pistola: {
    name: 'PISTOLA', damage: 1, rate: 4.2, range: 48, speed: 75,
    pellets: 1, spread: 0.0, ammo: Infinity, color: 0xffe066, size: 1,
  },
  subfusil: {
    name: 'SUBFUSIL', damage: 1, rate: 11, range: 44, speed: 85,
    pellets: 1, spread: 0.05, ammo: 320, color: 0x7cf0ff, size: 0.9,
  },
  escopeta: {
    name: 'ESCOPETA', damage: 1.4, rate: 1.7, range: 28, speed: 70,
    pellets: 8, spread: 0.32, ammo: 70, color: 0xff9f43, size: 1.1,
  },
};

// Tipos de enemigo (GDD sección 5.3). hp = impactos de daño 1.
export const ENEMY_TYPES = {
  normal:   { hp: 2,  speed: 4.0, lateral: 1.6, scale: 1.0,  width: 1.0, contact: 1, score: 10 },
  corredor: { hp: 1,  speed: 7.5, lateral: 2.4, scale: 0.92, width: 0.85, contact: 1, score: 15 },
  grande:   { hp: 9,  speed: 2.4, lateral: 0.8, scale: 1.45, width: 1.35, contact: 3, score: 40 },
  blindado: { hp: 7,  speed: 3.2, lateral: 1.0, scale: 1.08, width: 1.15, contact: 2, score: 35 },
  agil:     { hp: 2,  speed: 5.0, lateral: 3.4, scale: 0.95, width: 0.9, contact: 1, score: 25, dodge: 0.35 },
  lider:    { hp: 14, speed: 3.0, lateral: 1.2, scale: 1.2,  width: 1.2, contact: 5, score: 80 },
};

// Oleadas del nivel 1, Ocean Bridge (GDD secciones 14 y 17)
// hpMul: la horda se hace más resistente en cada oleada, al ritmo de las armas
export const WAVES = [
  { duration: 11, rate: 1.6, hpMul: 1,   mix: { normal: 0.8, corredor: 0.2 }, groups: 0.15 },
  { duration: 12, rate: 2.4, hpMul: 1.5, mix: { normal: 0.6, corredor: 0.25, grande: 0.15 }, groups: 0.25 },
  { duration: 13, rate: 3.2, hpMul: 2.4, mix: { normal: 0.45, corredor: 0.2, grande: 0.12, agil: 0.13, blindado: 0.1 }, groups: 0.3, leaders: 1 },
  { duration: 13, rate: 4.0, hpMul: 3.6, mix: { normal: 0.4, corredor: 0.2, grande: 0.12, agil: 0.14, blindado: 0.14 }, groups: 0.35, leaders: 2 },
  { duration: 14, rate: 4.8, hpMul: 5.5, mix: { normal: 0.35, corredor: 0.22, grande: 0.14, agil: 0.14, blindado: 0.15 }, groups: 0.4, leaders: 2 },
];
export const BREAK_DURATION = 3;  // (v1.0) partidas más cortas: el jefe llega antes
export const SPAWN_DISTANCE = 125;
export const MAX_ENEMIES = 420;

// Jefe final y minijefes: SOLO ataques cuerpo a cuerpo (avisan con una zona roja en el suelo)
export const BOSS = {
  name: 'EL GRAN PERROFLAUTA',
  scale: 3.3, radius: 1.7,
  startDist: 26, approachSpeed: 9, lateral: 2.6, reach: 5.5, zoneWidth: 5.2, windup: 1.0, backoff: 9,
  damage: 12,      // soldados que caen dentro de la zona: todos; el protagonista recibe este daño si está dentro
  summon: 12,      // cada 3 golpes llama a la horda
};
export const MINIBOSS = {
  // aparecen a mitad de cada oleada desde la 2ª
  fromWave: 1, at: 0.45,
  hpFactor: 0.08,  // respecto a la vida del jefe final
  kinds: {
    porra:   { name: 'EL DE LA PORRA',   scale: 2.2, radius: 1.1, startDist: 60, approachSpeed: 10, lateral: 2.2, reach: 3.6, zoneWidth: 3.4, windup: 0.9, backoff: 6, damage: 8 },
    botella: { name: 'EL DE LA BOTELLA', scale: 2.1, radius: 1.05, startDist: 60, approachSpeed: 11, lateral: 2.8, reach: 3.2, zoneWidth: 2.8, windup: 0.75, backoff: 6, damage: 6 },
  },
};
