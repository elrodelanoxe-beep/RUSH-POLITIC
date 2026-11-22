# Armas

> Contenido extraído del [GDD v0.1](../01_CONCEPTO/GAME_DESIGN_DOCUMENT.md) (secciones 6 y 7). El GDD es la fuente de referencia; si hay diferencias, prevalece el GDD.

## 6. SISTEMA DE COMBATE

**Decisión confirmada (v0.2): disparo continuo y recto hacia delante.**

El protagonista dispara sin parar y siempre en línea recta hacia delante. No hay apuntado automático: para acertar a un enemigo o a un arma especial, el jugador tiene que colocarse delante.

La munición es **infinita**.

El sistema de combate tendrá que ser visualmente satisfactorio y permitir observar claramente los impactos, las eliminaciones y los efectos de las diferentes armas.

Características:

- Disparo automático continuo, recto hacia delante.
- Munición infinita.
- Gestión de cadencia.
- Gestión de daño.
- Disparos múltiples en paralelo.
- Animaciones de disparo.
- Efectos de impacto.
- Efectos de explosión.
- Eliminación de enemigos.

La parte estratégica está en el movimiento entre carriles.

## 7. SISTEMA DE ARMAMENTO

Se plantea una progresión de armas que permita aumentar la potencia de combate.

| Arma | Característica |
|---|---|
| Pistola | Daño básico |
| Subfusil | Alta cadencia |
| Rifle de asalto | Equilibrio entre daño y velocidad |
| Escopeta | Daño elevado a corta distancia |
| Ametralladora | Disparo continuado |
| Lanzacohetes | Daño explosivo en área |
| Arma energética | Daño especial |
| Cañón pesado | Gran potencia de ataque |

Cada arma tendrá atributos independientes:

- Daño por impacto.
- Cadencia de disparo.
- Alcance.
- Capacidad de munición.
- Tiempo de recarga.
- Radio de explosión.
- Multiplicadores de daño.

El armamento deberá tener modelos 3D detallados y efectos visuales diferenciados.

## 7.1. Progresión de armas en el carril izquierdo (v0.2)

Las armas especiales aparecen de vez en cuando en el carril izquierdo, con un **contador**. El jugador tiene que dispararles hasta que el contador llegue a 0; en ese momento consigue el arma automáticamente. Si pasa de largo sin terminar, el arma se pierde y vuelve a aparecer más adelante.

Cada arma nueva es más potente que la anterior y mejora una sola cosa: la cadencia, el daño o el número de disparos.

| Nivel | Arma | Mejora | Contador |
|---|---|---|---|
| 0 | Pistola | Arma inicial | — |
| 1 | Subfusil | Cadencia | 12 |
| 2 | Escopeta | Daño | 30 |
| 3 | Rifle de asalto | Disparos múltiples | 70 |
| 4 | Ametralladora | Cadencia | 130 |
| 5 | Lanzacohetes | Daño (con explosión) | 230 |
| 6 | Arma energética | Disparos múltiples | 400 |
| 7 | Cañón pesado | Daño | 650 |

Los valores están en `docs/js/config.js` y se pueden ajustar.

## Valores por arma

> Los valores de daño, cadencia y disparos de cada arma están en `docs/js/config.js` (`WEAPON_TIERS`). La munición es infinita (sección 6).
