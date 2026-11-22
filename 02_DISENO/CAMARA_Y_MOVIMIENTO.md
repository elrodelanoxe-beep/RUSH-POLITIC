# Cámara y movimiento

> Contenido extraído del [GDD v0.1](../01_CONCEPTO/GAME_DESIGN_DOCUMENT.md) (secciones 3 y 4). El GDD es la fuente de referencia; si hay diferencias, prevalece el GDD.

## 3. CÁMARA Y PERSPECTIVA

**Decisión confirmada: tercera persona.**

La cámara estará situada detrás del protagonista, ligeramente elevada, permitiendo visualizar tanto al personaje como a las hordas que se aproximan.

Características:

- Cámara 3D en tercera persona.
- Seguimiento automático del protagonista.
- Perspectiva ligeramente elevada.
- Visualización de la carretera y del horizonte.
- Profundidad suficiente para anticipar las oleadas.
- Ajuste dinámico de la cámara en situaciones especiales.
- Posibilidad de utilizar planos cinematográficos durante los enfrentamientos contra jefes.

El protagonista deberá permanecer suficientemente visible durante toda la partida.

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

## Parámetros

> **Pendiente de definir.** Altura y distancia de cámara, velocidad de avance, velocidad lateral y anchura transitable.
