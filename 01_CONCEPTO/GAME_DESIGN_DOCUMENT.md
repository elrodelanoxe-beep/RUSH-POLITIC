# RUSH_POLITIC

**Documento maestro de concepto y diseño del videojuego (GDD)**

| Campo | Valor |
|---|---|
| Versión | 0.1 – Concepto inicial |
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

### 8.2. Puertas de selección

Se propone incorporar puertas de bonus que permitan elegir entre dos o más mejoras.

Ejemplo:

- Puerta izquierda: x2 daño.
- Puerta derecha: +100 municiones.

El jugador tendrá que decidir cuál le interesa más en función de la situación.

Esta mecánica añadirá estrategia al movimiento lateral.

## 9. SISTEMA DE VIDA Y DAÑO

Vida inicial del protagonista: **100 puntos**.

El sistema de vida será proporcional y fácilmente comprensible.

Reglas iniciales:

- Cada enemigo que consigue alcanzar al protagonista provoca una pérdida de 1 punto de vida.
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
13. Puertas de bonus.
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
