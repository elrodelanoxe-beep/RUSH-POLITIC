# RUSH_POLITIC

Videojuego móvil 3D (Android / iOS) de acción, supervivencia y runner de defensa en tercera persona, desarrollado con Unity 3D.

El protagonista avanza automáticamente por una carretera gigantesca sobre un puente que cruza el océano, se desplaza lateralmente para recoger mejoras y dispara de forma automática contra oleadas de manifestantes ficticios que llegan desde el horizonte. Todos los personajes y organizaciones del juego son ficticios, con una estética satírica propia del universo del juego.

**Estado:** diseño conceptual (GDD v0.1) y primera versión jugable (MVP) en formato web.

## Jugar (MVP web)

El MVP de la sección 17 del GDD está en la carpeta [`docs/`](docs/). Es una aplicación web (HTML5 + Three.js) que se puede instalar en el móvil como si fuera una app, a pantalla completa y sin conexión.

- **Publicarlo:** en GitHub, *Settings → Pages → Build and deployment*, elegir *Deploy from a branch*, rama `main` y carpeta `/docs`. La dirección será `https://<usuario>.github.io/<repositorio>/`.
- **Instalarlo en iPhone:** abrir esa dirección en Safari, pulsar *Compartir* y luego *Añadir a pantalla de inicio*.
- **Probarlo en el ordenador:** servir la carpeta `docs/` con cualquier servidor web local (por ejemplo `python3 -m http.server` dentro de `docs/`) y abrir `http://localhost:8000`. Se mueve con las flechas o A/D.

Los valores de juego (vida, armas, enemigos, oleadas, jefe) están en [`docs/js/config.js`](docs/js/config.js) para poder ajustarlos sin tocar el resto del código.

> Nota: el GDD propone Unity 3D (sección 15). Para el MVP se ha usado una app web para poder probarlo en el iPhone sin tiendas de aplicaciones ni Mac.

## Documentación

El documento maestro es el [Game Design Document](01_CONCEPTO/GAME_DESIGN_DOCUMENT.md). El resto de archivos recogen sus secciones por tema; los apartados marcados como *Pendiente de definir* aún no están cubiertos por el GDD.

| Carpeta | Contenido |
|---|---|
| [01_CONCEPTO](01_CONCEPTO/) | [GDD](01_CONCEPTO/GAME_DESIGN_DOCUMENT.md), [objetivo](01_CONCEPTO/OBJETIVO_DEL_JUEGO.md), [mecánicas](01_CONCEPTO/MECANICAS.md), [referencias visuales](01_CONCEPTO/REFERENCIAS_VISUALES.md) |
| [02_DISENO](02_DISENO/) | [HUD](02_DISENO/INTERFAZ_HUD.md), [cámara y movimiento](02_DISENO/CAMARA_Y_MOVIMIENTO.md), [experiencia de usuario](02_DISENO/EXPERIENCIA_USUARIO.md) |
| [03_PERSONAJES](03_PERSONAJES/) | [protagonista](03_PERSONAJES/PROTAGONISTA.md), [enemigos](03_PERSONAJES/ENEMIGOS.md), [jefes finales](03_PERSONAJES/JEFES_FINALES.md) |
| [04_ARMAMENTO](04_ARMAMENTO/) | [armas](04_ARMAMENTO/ARMAS.md), [bonus](04_ARMAMENTO/BONUS.md), [sistema de daño](04_ARMAMENTO/SISTEMA_DE_DANO.md) |
| [05_ESCENARIOS](05_ESCENARIOS/) | [mapas](05_ESCENARIOS/MAPAS.md), [elementos ambientales](05_ESCENARIOS/ELEMENTOS_AMBIENTALES.md) |
| [06_PROGRESION](06_PROGRESION/) | [niveles](06_PROGRESION/NIVELES.md), [recompensas](06_PROGRESION/RECOMPENSAS.md), [dificultad](06_PROGRESION/DIFICULTAD.md) |
| [07_TECNOLOGIA](07_TECNOLOGIA/) | [arquitectura](07_TECNOLOGIA/ARQUITECTURA.md), [optimización](07_TECNOLOGIA/OPTIMIZACION.md), [plan de desarrollo (MVP)](07_TECNOLOGIA/PLAN_DESARROLLO.md) |
