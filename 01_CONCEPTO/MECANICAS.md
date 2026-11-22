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

- **Cada impacto de tus disparos suma 1 al número del panel** y se ve al instante (las balas de los soldados lo atraviesan; cada soldado dispara al 60 % del daño de tu arma) (al revés que las armas del carril izquierdo, que bajan). Cada panel tiene un máximo según la dificultad.
- **Tipos de panel (v0.4 del GDD):**
  - **Azul (+N):** al atravesarlo se suman N **soldados**. Corren en formación junto al protagonista, llevan la misma arma y disparan recto hacia delante.
  - **Rojo (−N):** empieza en negativo y hay que dispararle mucho para llevarlo a positivo (cuanto más grande es tu ejército, más negativo aparece). Si lo tocas mientras sigue en negativo, **pierdes N soldados** (o vida si no te quedan). Al pasar a positivo se vuelve azul.
  - **Verde (+N ❤):** recupera N puntos de vida.
- **Proporcionalidad:** cuantos más soldados lleva el jugador, más resistentes son las hordas y más negativos los paneles rojos, para que el ejército no rompa el equilibrio.
- Las **armas especiales** del carril izquierdo son **amarillas** para distinguirlas de los paneles de soldados.

### 8.3. Niveles de dificultad (v0.4 del GDD)

Se eligen en el menú principal:

| Nivel | Vida | Máx. soldados | Panel máx. | Paneles rojos | Hordas | Jefe |
|---|---|---|---|---|---|---|
| Fácil | 150 | 40 | +12 | 20 % (−3 a −6) | 70 % | 70 % |
| Normal | 100 | 30 | +9 | 35 % (−6 a −12) | 100 % | 100 % |
| Difícil | 70 | 24 | +7 | 50 % (−10 a −18) | 135 %, +20 % de aparición | 115 % |

## Resumen del ciclo principal

Avance automático, desplazamiento lateral libre, disparo automático y recogida de mejoras mientras llegan las oleadas (ver sección 1 del GDD). Detalles en [Armas](../04_ARMAMENTO/ARMAS.md), [Bonus](../04_ARMAMENTO/BONUS.md) y [Sistema de daño](../04_ARMAMENTO/SISTEMA_DE_DANO.md).
