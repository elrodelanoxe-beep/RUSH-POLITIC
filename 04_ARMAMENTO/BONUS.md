# Bonus y mejoras

> Contenido extraído del [GDD v0.1](../01_CONCEPTO/GAME_DESIGN_DOCUMENT.md) (sección 8). El GDD es la fuente de referencia; si hay diferencias, prevalece el GDD.

## 8. SISTEMA DE BONUS Y MEJORAS

Una de las mecánicas principales del juego será la recogida de potenciadores durante el recorrido.

Las mejoras aparecerán en puntos estratégicos de la carretera.

El jugador deberá desplazarse lateralmente para recogerlas.

### 8.1. Tipos de mejoras

**Potencia:**

- x2 daño.
- x3 daño.
- x5 daño.
- Multiplicadores especiales.

**Munición:**

- +50 balas.
- +100 balas.
- Munición explosiva.
- Munición perforante.

**Cadencia:**

- +20 % velocidad de disparo.
- +40 % velocidad de disparo.
- Disparo continuo.

**Ataques especiales:**

- Disparo múltiple.
- Explosión en área.
- Ataque eléctrico.
- Proyectiles especiales.
- Ataque de gran potencia.

### 8.2. Bonus del carril derecho (v0.2)

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

## Duración y apilamiento

> **Pendiente de definir.** Duración de cada mejora y cómo se combinan entre sí.
