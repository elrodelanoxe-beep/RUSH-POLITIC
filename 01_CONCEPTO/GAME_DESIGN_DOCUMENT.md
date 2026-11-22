# RUSH_POLITIC

**Documento maestro de concepto y diseño del videojuego (GDD)**

| Campo | Valor |
|---|---|
| Versión | 0.5 – Paneles sin límite, minijefes y jefe cuerpo a cuerpo |
| Estado | Diseño conceptual |
| Tipo | Videojuego 3D de acción, supervivencia y runner |
| Plataforma objetivo | Móviles (Android / iOS) |
| Perspectiva | Tercera persona |
| Motor propuesto | Unity 3D |

---

## 1. DESCRIPCIÓN GENERAL DEL PROYECTO

RUSH_POLITIC es un videojuego móvil 3D de acción y supervivencia basado en mecánicas de runner de defensa y shooter.

El jugador controla a un protagonista que avanza automáticamente por una carretera de grandes dimensiones, normalmente situada sobre un puente gigantesco que atraviesa el mar.

Desde el horizonte aparecen grandes oleadas de manifestantes ficticios que avanzan hacia el protagonista. El objetivo consiste en eliminar las hordas antes de que consigan alcanzar nuestra posición.

Durante el recorrido, el jugador debe desplazarse lateralmente para esquivar enemigos, recoger mejoras, conseguir munición y seleccionar potenciadores de armamento.

El juego combinará:

- Movimiento automático hacia delante.
- Desplazamiento lateral libre.
- Combate automático.
- Gestión estratégica de mejoras.
- Oleadas progresivas de enemigos.
- Diferentes tipos de armamento.
- Jefes finales de gran tamaño.
- Progresión de dificultad.
- Recompensas y desbloqueos.

El objetivo es conseguir una experiencia visualmente atractiva, dinámica, adictiva y con una sensación constante de progresión.

## 2. AMBIENTACIÓN Y ESCENARIOS

### 2.1. Escenario principal

El escenario inicial será una carretera gigantesca situada sobre un puente que atraviesa el océano.

Características:

- Puentes de gran longitud.
- Carreteras amplias con varios metros de anchura.
- Barandillas laterales.
- Farolas y señalización.
- Vehículos abandonados.
- Elementos urbanos y estructuras auxiliares.
- Océano visible a ambos lados.
- Horizonte lejano.
- Sensación de profundidad y escala.

El escenario debe transmitir amplitud y permitir visualizar las grandes oleadas de enemigos aproximándose desde la distancia.

### 2.2. Variaciones de escenarios

Se podrán incorporar progresivamente nuevos mapas:

1. Ocean Bridge: puente marítimo.
2. Urban Highway: autopista urbana.
3. Dark Tunnel: túneles de carretera.
4. Industrial Zone: instalaciones industriales.
5. Night Bridge: puente durante la noche.
6. Final Assault: escenario especial para enfrentamientos finales.

Cada escenario podrá disponer de iluminación, climatología, obstáculos, ambientación y características propias.

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

## 5. SISTEMA DE ENEMIGOS: LAS HORDAS

Los enemigos estarán representados por grandes grupos de manifestantes ficticios que avanzan hacia el protagonista.

La estética será urbana y callejera.

### 5.1. Apariencia de los enemigos

Características visuales:

- Sudaderas.
- Camisetas.
- Pantalones deportivos.
- Zapatillas.
- Gorras.
- Mochilas.
- Diferentes peinados.
- Diferentes complexiones físicas.
- Diferentes alturas.
- Cara con ojos, cejas y boca; barbas; caras tapadas con braga o pañuelo; gorros de lana; bufandas; camisetas estampadas; cinturones; suelas de zapatilla; algunos con megáfono (v0.5 del GDD).
- Diversidad de modelos y vestimentas.

Se deberá evitar que todos los enemigos tengan exactamente la misma apariencia.

Se propone utilizar variaciones de modelos, texturas, colores y accesorios para conseguir hordas visualmente diversas.

### 5.2. Comportamiento

Los enemigos aparecerán desde el horizonte y avanzarán hacia el protagonista.

Sus comportamientos incluirán:

- Carrera hacia el jugador.
- Agrupaciones de diferentes tamaños.
- Cambios de trayectoria.
- Animaciones de ataque.
- Reacciones a los disparos.
- Caídas y desapariciones.
- Variaciones de velocidad.
- Aparición de enemigos especiales.

### 5.3. Tipos de enemigos

| Tipo | Características |
|---|---|
| Corredor | Muy rápido, poca resistencia |
| Grande | Lento, mayor resistencia |
| Blindado | Necesita más impactos |
| Ágil | Puede esquivar determinados ataques |
| Élite | Más resistencia y habilidades especiales |
| Líder | Coordina o acompaña a grupos de enemigos |

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

### 7.1. Progresión de armas en el carril izquierdo (v0.2)

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

- **Cada impacto de tus disparos suma 1 al número del panel** y se ve al instante (al revés que las armas del carril izquierdo, que bajan). **No hay máximo:** si el ejército llena la pantalla, se llena. Las balas de los soldados atraviesan los paneles.
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

## 10. SISTEMA DE JEFES FINALES (BOSS FIGHTS)

Al finalizar determinadas fases aparecerán enemigos de grandes dimensiones.

Estos jefes tendrán una presencia visual muy superior a los enemigos normales.

Características:

- Tamaño considerablemente superior.
- Modelo 3D exclusivo.
- Animaciones propias.
- Barra de vida independiente.
- Mayor resistencia.
- Ataques especiales.
- Comportamientos diferenciados.

**MVP (v0.5 del GDD):** todos los ataques de jefes y minijefes son **cuerpo a cuerpo**, nunca a distancia. Antes de cada golpe aparece una **zona roja** en el suelo: si el protagonista sale de ella, esquiva el golpe. Cada golpe derriba a los soldados que estén dentro de la zona (hasta un máximo por golpe) y, si el protagonista está dentro, también le golpea.

- **Minijefes:** a mitad de cada oleada, desde la 2ª, aparece un minijefe que se acerca corriendo: **EL DE LA PORRA** (porra gigante, zona de golpe ancha) o **EL DE LA BOTELLA** (botella de vidrio rota, más rápido).
- **Jefe final del Ocean Bridge: EL GRAN PERROFLAUTA** (ficticio y satírico): rastas, cinta en el pelo, barba, poncho de rayas, pantalón bombacho y sandalias, con un **bate de béisbol con pinchos**. Se acerca, golpea, retrocede y, cada tres golpes, llama a la horda. Por debajo de la mitad de vida golpea más rápido.
- La vida de jefes y minijefes se ajusta a la potencia de fuego del jugador (arma + soldados) y a la dificultad.
- Secuencia de presentación.
- Recompensas especiales al derrotarlos.

### 10.1. Ejemplos de jefes

**EL GRAN PORTAVOZ**

- Personaje de dimensiones gigantescas.
- Bandera sindical ficticia de color rojo.
- Mayor resistencia que los enemigos normales.
- Ataques especiales.
- Animaciones propias.

**EL DEMOLEDOR**

- Enemigo de gran tamaño.
- Ataques de área.
- Capacidad para alterar el escenario.

**EL COMANDANTE**

- Personaje especializado en dirigir grandes oleadas.
- Invoca o acompaña grupos adicionales de enemigos.

Los personajes y sus organizaciones serán ficticios, con una estética satírica y elementos visuales propios del universo del juego.

## 11. PROGRESIÓN Y RECOMPENSAS

El juego deberá incorporar un sistema de progresión para incentivar la repetición de partidas.

Se proponen:

- Monedas por enemigos eliminados.
- Recompensas por completar niveles.
- Desbloqueo de nuevas armas.
- Mejoras permanentes.
- Nuevos personajes.
- Nuevos escenarios.
- Aumento de vida máxima.
- Potenciadores temporales.
- Clasificación por puntuación.
- Récords personales.

## 12. INTERFAZ DE USUARIO (HUD)

La interfaz deberá ser moderna, clara y adaptada a pantallas móviles.

Elementos principales:

- Barra de vida.
- Arma equipada.
- Nivel de munición.
- Indicador de daño.
- Contador de enemigos eliminados.
- Indicador de oleada.
- Indicador de jefe final.
- Bonus activos.
- Puntuación.
- Distancia recorrida.

La interfaz no deberá ocupar demasiado espacio visual ni impedir la visibilidad de la carretera.

## 13. CALIDAD GRÁFICA Y ANIMACIONES

Uno de los objetivos principales de RUSH_POLITIC será conseguir un acabado gráfico de alta calidad.

Se buscará un entorno 3D detallado y visualmente atractivo.

### 13.1. Escenarios

- Texturas de alta resolución.
- Asfalto detallado.
- Barandillas y estructuras realistas.
- Agua con movimiento y reflejos.
- Iluminación dinámica.
- Sombras.
- Partículas ambientales.
- Elementos decorativos.
- Climatología variable.

### 13.2. Personajes

- Modelos 3D detallados.
- Texturas de ropa.
- Diferentes accesorios.
- Animaciones naturales.
- Animaciones de carrera.
- Animaciones de ataque.
- Reacciones a los impactos.
- Animaciones de eliminación.

### 13.3. Armamento y efectos

- Modelos independientes.
- Animaciones de disparo.
- Destellos.
- Humo.
- Explosiones.
- Partículas.
- Efectos de impacto.
- Efectos especiales diferenciados por arma.

La calidad gráfica deberá equilibrarse con el rendimiento para garantizar una experiencia fluida en dispositivos móviles.

## 14. ESTRUCTURA DE NIVELES

Se propone una campaña inicial organizada en diferentes escenarios.

| Nivel | Escenario | Dificultad |
|---|---|---|
| 1 | Ocean Bridge | Inicial |
| 2 | Urban Highway | Media |
| 3 | Dark Tunnel | Media-alta |
| 4 | Industrial Zone | Alta |
| 5 | Final Assault | Jefe final |

Cada nivel tendrá una duración, número de oleadas, enemigos y recompensas específicas.

La dificultad aumentará progresivamente.

## 15. TECNOLOGÍA Y DESARROLLO

### Motor de desarrollo propuesto

Unity 3D.

Motivos:

- Adecuado para videojuegos móviles.
- Buen soporte para entornos 3D.
- Gestión de físicas y colisiones.
- Animaciones de personajes.
- Sistema de partículas.
- Gestión de cámaras.
- Optimización de grandes cantidades de enemigos.
- Posibilidad de exportación para Android e iOS.

### Consideraciones técnicas

Será importante implementar:

- Object Pooling para enemigos y proyectiles.
- Sistemas de generación de oleadas.
- Gestión eficiente de animaciones.
- Optimización de modelos 3D.
- Control de memoria.
- Gestión de colisiones.
- Sistema modular de armas.
- Sistema configurable de dificultad.
- Guardado de progresión.

## 16. ESTRUCTURA PROPUESTA DEL PROYECTO

El repositorio principal será RUSH_POLITIC.

Organización documental prevista:

```
RUSH_POLITIC/
│
├── 01_CONCEPTO/
│   ├── GAME_DESIGN_DOCUMENT.md
│   ├── OBJETIVO_DEL_JUEGO.md
│   ├── MECANICAS.md
│   └── REFERENCIAS_VISUALES.md
│
├── 02_DISENO/
│   ├── INTERFAZ_HUD.md
│   ├── CAMARA_Y_MOVIMIENTO.md
│   └── EXPERIENCIA_USUARIO.md
│
├── 03_PERSONAJES/
│   ├── PROTAGONISTA.md
│   ├── ENEMIGOS.md
│   └── JEFES_FINALES.md
│
├── 04_ARMAMENTO/
│   ├── ARMAS.md
│   ├── BONUS.md
│   └── SISTEMA_DE_DANO.md
│
├── 05_ESCENARIOS/
│   ├── MAPAS.md
│   └── ELEMENTOS_AMBIENTALES.md
│
├── 06_PROGRESION/
│   ├── NIVELES.md
│   ├── RECOMPENSAS.md
│   └── DIFICULTAD.md
│
└── 07_TECNOLOGIA/
    ├── ARQUITECTURA.md
    ├── OPTIMIZACION.md
    └── PLAN_DESARROLLO.md
```

## 17. PRIMERA VERSIÓN FUNCIONAL (MVP)

La primera versión deberá centrarse en conseguir una experiencia jugable completa, aunque limitada en contenido.

Funcionalidades iniciales:

1. Escenario 3D de un puente sobre el mar.
2. Protagonista en tercera persona.
3. Avance automático.
4. Movimiento libre lateral.
5. Controles táctiles.
6. Cámara de seguimiento.
7. Hordas de enemigos.
8. Variaciones visuales de enemigos.
9. Sistema de disparo automático.
10. Sistema de vida de 100 puntos.
11. Sistema de colisiones.
12. Tres armas iniciales.
13. Armas especiales (carril izquierdo) y bonus +1/+2 (carril derecho). En la v0.1 eran puertas de bonus.
14. Contador de enemigos eliminados.
15. Una oleada final con un jefe.
16. Pantalla de victoria y derrota.

La prioridad será conseguir que el ciclo principal del juego funcione correctamente antes de ampliar el número de escenarios, armas y enemigos.

## 18. PRINCIPIOS FUNDAMENTALES DEL PROYECTO

RUSH_POLITIC deberá mantener los siguientes principios:

- Jugabilidad sencilla de comprender.
- Controles móviles intuitivos.
- Movimiento fluido.
- Combate visualmente satisfactorio.
- Sensación de progresión constante.
- Variedad de enemigos.
- Mejoras que tengan consecuencias reales en el combate.
- Dificultad progresiva y equilibrada.
- Escenarios visualmente atractivos.
- Calidad gráfica cuidada.
- Rendimiento estable en móviles.

---

**FIN DEL DOCUMENTO DE CONCEPTO – RUSH_POLITIC**

Este documento constituye la base inicial del proyecto. Las características marcadas como propuestas podrán modificarse durante las siguientes fases de diseño y desarrollo.
