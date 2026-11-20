# Verificación · 6 de noviembre de 2026

## Código del HelpDesk

| Comprobación | Resultado | Alcance / límite |
|---|---|---|
| Instalación con lockfiles (`npm ci`) | Correcta en backend y frontend | Primer intento aislado falló por entorno; se repitió con acceso a red. Lockfiles sin cambios. |
| Backend `npm run typecheck` | Correcta | TypeScript de aplicación y pruebas. |
| Backend `npm test -- --reporter=dot` | 137 pruebas correctas; 135 omitidas; 0 fallidas en ejecución final | 13 archivos correctos y 7 omitidos. Integración PostgreSQL no ejecutada por ausencia de DATABASE_URL de pruebas. |
| Frontend `ng test --watch=false` | 188 pruebas correctas; 14 archivos | Node 24.22.1 del runtime; componentes y servicios, con dobles de HTTP. |
| Frontend build de producción | Correcto | 304,32 kB iniciales; salida local ignorada en verificacion/frontend-build. |

El Node predeterminado 24.13.0 no cumple el mínimo de Angular CLI 22.2. Se usó Node 24.22.1 incluido en el entorno, sin modificar Node global, package.json o lockfiles. El primer test backend dentro del sandbox tuvo 19 fallos `EACCES` por conexiones HTTP locales de Supertest. Repetido con permiso de conexión local: todos los 137 casos ejecutables pasaron. Los fallos del primer intento no se atribuyen al producto.

No se ejecutó `npm run check` completo (lint, formato y otros scripts). No se afirma que el CI remoto haya pasado. No se modificó la lógica de negocio ni las pruebas existentes.

## Presentaciones

El script `herramientas/verificar.cjs` comprueba las dos páginas en Microsoft Edge headless y deja la evidencia en [navegador.json](navegador.json):

- 20 diapositivas de Clientes y 25 de IT.
- Una diapositiva activa; contador, selector, anterior/siguiente y límites.
- Flechas del teclado, pantalla completa y salida de pantalla completa.
- Carga de todas las imágenes y ausencia de errores JavaScript.
- Todos los contenidos dentro del área de la diapositiva, sin invadir el pie.
- Viewports 1600×1000, 390×844 y 844×390; sin desbordamiento horizontal y proporción 16:9 conservada.
- PDF generado desde la misma vista HTML con todas las diapositivas, aunque la activa sea otra.
- Descarga real del archivo con nombre correcto y sin fallo del navegador.

Los PNG de QA se generan en `verificacion/vistas/` (ignorados en Git). Se revisaron portadas, gráficos, tablas, diagramas e interfaces, y se corrigieron un desbordamiento móvil y una nota de sprint que invadía el pie antes de generar la versión final.

La comprobación adicional `herramientas/verificar_enlaces.cjs` pasó: apertura directa con `file://`, enlaces HTTP, menú de recursos, Home/End/PageUp/PageDown, flechas después de pulsar un botón y navegación existente de Épicas y HU (backlog, sprints, avances). Sin errores JavaScript. Evidencia: [enlaces.json](enlaces.json).

## PDF

`herramientas/verificar_pdf.py` abre ambos PDF con PyMuPDF, comprueba cantidad de páginas, proporción 16:9, texto no vacío y límites del texto, y renderiza cada página. Guarda [pdf.json](pdf.json) y una hoja de contacto por presentación. La revisión visual complementa estos checks; no se considera suficiente que exista un archivo con extensión PDF.

La descarga incluye fuentes locales, fondos y capturas; excluye navegación, selector, barra de progreso y botones. La generación y descarga fueron comprobadas en Edge; no se comprobó la impresión manual ni Fullscreen API en todos los navegadores.

Resultado final: Clientes 20 páginas, IT 25 páginas; ambas con tamaño 960×540 puntos (16:9). Las 45 páginas se abrieron, extrajeron y renderizaron correctamente; sin páginas vacías ni texto fuera de los límites. Se revisaron las hojas de contacto y páginas representativas a tamaño legible. `git diff --check` y la sintaxis de los scripts también pasaron.

## Capturas

`acceso.png`, `tickets.png`, `nuevo-ticket.png`, `detalle.png` y `actividad.png`: frontend real compilado, datos sintéticos. La sesión y API de las pantallas autenticadas son simuladas exclusivamente en Playwright. No se utilizaron credenciales ni registros reales. Las capturas no acreditan una prueba extremo a extremo.

## No verificado

- Migraciones y operaciones reales sobre PostgreSQL 17 en este equipo: no hay DATABASE_URL de pruebas ni Podman/Docker disponible en PATH.
- Flujo completo con cuentas reales, persistencia y concurrencia de base de datos.
- SMTP externo/Brevo y Telegram con dos cuentas reales.
- Hosting, TLS desplegado, configuración de proxy productivo, CI remoto, monitoreo, backups y restauración.
- Aceptación del cliente, rendimiento en carga y satisfacción.

Los conteos del análisis describen cobertura de código y brechas de criterios, no aceptación formal ni porcentaje certificado de entrega.

## Ajuste liquid glass y PDF optimizado

- Estilo compartido liquid glass con la paleta original y controles translúcidos.
- Pantalla completa: stage ocupa todo el viewport; las barras no reservan espacio, desaparecen fuera de su zona y se revelan con hover o foco de teclado. Comprobado en ambas presentaciones.
- Eliminado el enlace «Análisis y matriz de 98 HU» del menú Recursos en ambas páginas.
- Exportación: fondos decorativos JPEG compartidos, superficies opacas sin filtros caros, texto vectorial seleccionable y compresión/deduplicación con PyMuPDF.
- Clientes: 1.367.863 → 554.856 bytes (59,4% menos); IT: 1.258.162 → 431.413 bytes (65,7% menos). Referencias: pdf-antes.json y pdf-despues.json. Los tiempos registrados miden renderizado local con PyMuPDF, no garantizan tiempos de apertura en todos los lectores.
- Se repitieron navegación, fullscreen/hover, móvil, límites de contenido y descarga. Se abrieron y renderizaron las 45 páginas finales; conservan 16:9, sin páginas vacías ni texto recortado. Los reflejos de vidrio se simplifican solo en PDF para reducir complejidad.
