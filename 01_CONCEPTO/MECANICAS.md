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

En el carril derecho aparecen paneles de bonus con valores como +1, +1, +2, +2, +1… (v0.3 del GDD):

- **Cada impacto de tus disparos suma 1 al número del panel** y se ve al instante (al revés que las armas del carril izquierdo, que bajan). **No hay máximo:** si el ejército llena la pantalla, se llena.
- **(v0.6 del GDD)** Las balas de los soldados también suben el panel (0,25 por bala), y basta con que **el protagonista o cualquier soldado** atraviese el panel para cogerlo (o para recibir la penalización si es rojo y sigue en negativo). No hace falta colocarse en un punto exacto.
- **Formación del ejército:** cuanto más grande, más ancha (de 4 a 16 columnas, casi toda la carretera). Se desplaza para no salirse de la calzada.
- **Valores iniciales (v0.5 del GDD):** los paneles azules y verdes siempre empiezan en **+1**; los rojos empiezan en negativo (de −4 a −20 en Normal). Nunca aparece un +2 o más de inicio: el número solo crece disparando.
- **Tipos de panel:**
  - **Azul (+N):** al atravesarlo se suman N **soldados**. Corren en formación junto al protagonista (la formación se ensancha cuanto más grande es), llevan la misma arma y disparan recto hacia delante con **menos alcance** que el protagonista.
  - **Rojo (−N):** empieza en negativo y hay que dispararle mucho para llevarlo a positivo (cuanto más grande es tu ejército, más negativo aparece). Si lo tocas mientras sigue en negativo, **pierdes N soldados** (o vida si no te quedan). Al pasar a positivo se vuelve azul.
  - **Verde (+N ❤):** recupera N puntos de vida.
- **Proporcionalidad:** cuantos más soldados lleva el jugador, más resistentes y numerosas son las hordas y más negativos los paneles rojos. Por encima de 50 soldados, la potencia de fuego del ejército crece más despacio (raíz cuadrada).
- Las **armas especiales** del carril izquierdo son **amarillas** para distinguirlas de los paneles de soldados.

### 8.3. Niveles de dificultad (v0.5 del GDD)

Se eligen en el menú principal:

| Nivel | Vida | Paneles rojos | Hordas (resistencia) | Hordas (aparición) | Minijefes | Jefe |
|---|---|---|---|---|---|---|
| Fácil | 150 | 30 % (−4 a −10) | 80 % | 90 % | 80 % | 80 % |
| Normal | 100 | 45 % (−4 a −20) | 125 % | 115 % | 100 % | 100 % |
| Difícil | 70 | 50 % (−6 a −22) | 135 % | 120 % | 100 % | 125 % |

## Resumen del ciclo principal

Avance automático, desplazamiento lateral libre, disparo automático y recogida de mejoras mientras llegan las oleadas (ver sección 1 del GDD). Detalles en [Armas](../04_ARMAMENTO/ARMAS.md), [Bonus](../04_ARMAMENTO/BONUS.md) y [Sistema de daño](../04_ARMAMENTO/SISTEMA_DE_DANO.md).
