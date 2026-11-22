# Mecánicas

> Contenido extraído del [GDD v0.1](../01_CONCEPTO/GAME_DESIGN_DOCUMENT.md) (secciones 4, 6 y 8.2). El GDD es la fuente de referencia; si hay diferencias, prevalece el GDD.

## 4. SISTEMA DE MOVIMIENTO DEL PROTAGONISTA

**Decisión confirmada: movimiento libre lateral.**

El protagonista avanzará automáticamente por la carretera, pero podrá desplazarse libremente hacia la izquierda y la derecha.

No se utilizará un sistema de carriles predeterminados.

Características:

- Avance longitudinal automático.
- Desplazamiento lateral libre.
- Movimiento por toda la anchura transitable de la carretera.
- Límites físicos de desplazamiento.
- Posibilidad de esquivar obstáculos.
- Posibilidad de evitar ataques.
- Recogida de potenciadores y objetos.
- Animaciones naturales de carrera y desplazamiento lateral.

### 4.1. Controles móviles

Se propone utilizar un joystick virtual o un sistema de arrastre táctil.

El jugador podrá controlar el desplazamiento lateral sin necesidad de gestionar manualmente el avance.

El sistema deberá ser preciso, fluido y responder correctamente a los movimientos del dedo.

## 6. SISTEMA DE COMBATE

El protagonista dispondrá de armas que dispararán automáticamente contra los enemigos.

El sistema de combate tendrá que ser visualmente satisfactorio y permitir observar claramente los impactos, las eliminaciones y los efectos de las diferentes armas.

Características:

- Disparo automático.
- Selección de objetivos.
- Detección de enemigos dentro del alcance.
- Gestión de cadencia.
- Gestión de daño.
- Animaciones de disparo.
- Efectos de impacto.
- Efectos de explosión.
- Eliminación de enemigos.

El jugador no tendrá que apuntar individualmente a cada enemigo. La parte estratégica estará principalmente en el movimiento lateral y en la selección de mejoras.

## 8.2. Puertas de selección

Se propone incorporar puertas de bonus que permitan elegir entre dos o más mejoras.

Ejemplo:

- Puerta izquierda: x2 daño.
- Puerta derecha: +100 municiones.

El jugador tendrá que decidir cuál le interesa más en función de la situación.

Esta mecánica añadirá estrategia al movimiento lateral.

## Resumen del ciclo principal

Avance automático, desplazamiento lateral libre, disparo automático y recogida de mejoras mientras llegan las oleadas (ver sección 1 del GDD). Detalles en [Armas](../04_ARMAMENTO/ARMAS.md), [Bonus](../04_ARMAMENTO/BONUS.md) y [Sistema de daño](../04_ARMAMENTO/SISTEMA_DE_DANO.md).
