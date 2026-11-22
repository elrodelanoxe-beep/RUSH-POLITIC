// Parámetros de juego del MVP de RUSH POLITIC.
// Los valores marcados en el GDD como "Pendiente de definir" se fijan aquí
// para poder jugar, y se pueden ajustar sin tocar el resto del código.

// Versión del juego que se muestra en el menú. Súbela con cada cambio publicado
// (y también VERSION en sw.js) para comprobar en el móvil qué versión ha cargado.
export const GAME_VERSION = '0.4';

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
export const WAVES = [
  { duration: 18, rate: 2.6, mix: { normal: 0.8, corredor: 0.2 }, groups: 0.15 },
  { duration: 20, rate: 4.0, mix: { normal: 0.6, corredor: 0.25, grande: 0.15 }, groups: 0.25 },
  { duration: 22, rate: 5.5, mix: { normal: 0.45, corredor: 0.2, grande: 0.12, agil: 0.13, blindado: 0.1 }, groups: 0.3, leaders: 1 },
  { duration: 22, rate: 7.0, mix: { normal: 0.4, corredor: 0.2, grande: 0.12, agil: 0.14, blindado: 0.14 }, groups: 0.4, leaders: 2 },
  { duration: 24, rate: 8.5, mix: { normal: 0.35, corredor: 0.22, grande: 0.14, agil: 0.14, blindado: 0.15 }, groups: 0.45, leaders: 3 },
];
export const BREAK_DURATION = 6;
export const SPAWN_DISTANCE = 125;
export const MAX_ENEMIES = 420;

export const BOSS = {
  name: 'EL GRAN PORTAVOZ',
  hp: 900,   // vida base; en partida se ajusta a la potencia del jugador
  distance: 34,
  radius: 3.0,
  shoutDamage: 10,
  pamphletDamage: 4,
};
