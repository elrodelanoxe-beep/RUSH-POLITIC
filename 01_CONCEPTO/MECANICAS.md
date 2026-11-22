# Mecánicas

> Contenido extraído del [GDD v0.1](../01_CONCEPTO/GAME_DESIGN_DOCUMENT.md) (secciones 4, 6 y 8.2). El GDD es la fuente de referencia; si hay diferencias, prevalece el GDD.

## 4. SISTEMA DE MOVIMIENTO DEL PROTAGONISTA

**Decisión confirmada (v0.2): tres carriles con movimiento lateral libre.**

El protagonista avanza automáticamente por la carretera. La calzada se divide en **tres carriles**, cada uno con una función:

| Carril | Qué aparece | Qué hace el jugador |
|---|---|---|
| Izquierdo | Armas especiales | Dispararlas hasta dejar su contador a 0 para conseguirlas |
| Central | Las hordas | Frenarlas a tiros antes de que le alcancen |
| Derecho | Bonus +1 / +2 | Tocarlos para recogerlos |

El jugador se desplaza libremente a izquierda y derecha entre los carriles. La estrategia consiste en decidir cuándo salir del carril central para conseguir armas o bonus, sabiendo que mientras tanto la horda se acerca.

Características:

- Avance longitudinal automático.
- Desplazamiento lateral libre entre los tres carriles.
- Límites físicos de desplazamiento.
- Posibilidad de esquivar enemigos.
- Recogida de bonus tocándolos.
- Animaciones naturales de carrera y desplazamiento lateral.

### 4.1. Controles móviles

Arrastre táctil: el personaje sigue al dedo a izquierda y derecha.

El jugador no controla el avance ni el disparo, solo la posición lateral.

El sistema deberá ser preciso, fluido y responder correctamente a los movimientos del dedo.

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

## 8.2. Bonus del carril derecho (v0.2)

**Sustituye a las puertas de selección de la versión 0.1.**

En el carril derecho aparecen bonus con valores como +1, +1, +2, +2, +1… El jugador los recoge tocándolos.

Cada punto suma **potencia de fuego**: +4 % de daño para todas las armas. Los puntos se acumulan durante toda la partida.

## Resumen del ciclo principal

Avance automático, desplazamiento lateral libre, disparo automático y recogida de mejoras mientras llegan las oleadas (ver sección 1 del GDD). Detalles en [Armas](../04_ARMAMENTO/ARMAS.md), [Bonus](../04_ARMAMENTO/BONUS.md) y [Sistema de daño](../04_ARMAMENTO/SISTEMA_DE_DANO.md).
