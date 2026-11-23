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

- **Cada impacto de tus disparos suma 1 al número del panel** y se ve al instante (al revés que las armas del carril izquierdo, que bajan). **No hay máximo:** si el ejército llena la pantalla, se llena.
- **(v0.6 del GDD)** Las balas de los soldados también suben el panel (0,25 por bala), y basta con que **el protagonista o cualquier soldado** atraviese el panel para cogerlo (o para recibir la penalización si es rojo y sigue en negativo). No hace falta colocarse en un punto exacto.
- **Formación del ejército:** cuanto más grande, más ancha (de 4 a 16 columnas, casi toda la carretera). Se desplaza para no salirse de la calzada.
- **(v0.7 del GDD) Sin límite de soldados.** Cada grupo reclutado en un panel tiene su **propio contador de disparo**, desfasado y con una cadencia ligeramente distinta, para que los grupos nunca disparen a la vez y el fuego parezca continuo.
- **Partidas más cortas (v0.8 del GDD):** las oleadas duran 11–14 s y los descansos 3 s, así que el jefe final aparece hacia los 75 segundos y el ejército no crece sin control.
- **Disparo desincronizado:** además del ritmo propio de cada grupo, cada soldado empieza en un momento distinto y cada disparo lleva un pequeño desfase aleatorio (±15 %), para que nunca vuelvan a disparar a la vez.
- **Proyectiles con forma según el arma:** balas con punta metálica y estela corta (pistola a ametralladora), cohetes con aletas, llama y humo (lanzacohetes y cañón) y orbes brillantes que palpitan (arma energética).
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

## Duración y apilamiento

> **Pendiente de definir.** Duración de cada mejora y cómo se combinan entre sí.
