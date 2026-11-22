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

## Parámetros

> **Pendiente de definir.** Altura y distancia de cámara, velocidad de avance, velocidad lateral y anchura transitable.
