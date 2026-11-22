# Sistema de vida y daño

> Contenido extraído del [GDD v0.1](../01_CONCEPTO/GAME_DESIGN_DOCUMENT.md) (sección 9). El GDD es la fuente de referencia; si hay diferencias, prevalece el GDD.

## 9. SISTEMA DE VIDA Y DAÑO

Vida inicial del protagonista: **100 puntos**.

El sistema de vida será proporcional y fácilmente comprensible.

Reglas iniciales:

- **Los soldados hacen de escudo (v0.3 del GDD):** cada golpe recibido elimina primero soldados (1 por enemigo normal, más por enemigos especiales y ataques del jefe). Solo cuando no queda ningún soldado se pierde vida.
- Cada enemigo que consigue alcanzar al protagonista sin soldados provoca una pérdida de 1 punto de vida.
- Los enemigos especiales podrán provocar más daño.
- Determinados ataques de los jefes podrán restar varios puntos.
- Se podrán recoger potenciadores de recuperación.
- Al alcanzar 0 puntos de vida, termina la partida.

La interfaz mostrará permanentemente la vida restante mediante una barra de estado.

El sistema de daño deberá estar equilibrado según la cantidad de enemigos, la velocidad de las oleadas y las mejoras disponibles.
