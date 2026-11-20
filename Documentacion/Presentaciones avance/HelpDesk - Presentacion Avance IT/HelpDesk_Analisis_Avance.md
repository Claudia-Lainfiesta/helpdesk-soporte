# HelpDesk · Análisis y respaldo de avance

Corte: 6 de noviembre de 2026. Fuentes: código local y planificación versionada. No es aceptación del cliente ni certificación de producción.

## Método

Se rastreó cada HU desde data.js hacia rutas Angular, HttpClient, rutas Express, autorización, servicio SQL, migraciones y pruebas existentes. Se revisaron sus criterios completos (reproducidos abajo). «Implementada en código» indica una cadena coherente para el alcance acordado; no equivale a una prueba E2E ejecutada. «Parcial» identifica criterios cubiertos y brechas. «Pendiente» indica ausencia de flujo integrado, aunque pueda existir una POC o una pantalla. Ninguna HU se acredita como completada y aceptada por el cliente.

No se ponderan historias ni se asigna 50% a las parciales. Los gráficos cuentan HU por estado. No se calcula un porcentaje de producto terminado: faltan validaciones integrales y los criterios tienen esfuerzos distintos.

## Resultado general

98 HU: 5 implementadas en código, 27 parciales, 66 pendientes. MVP de 20 HU: 3 en código, 11 parciales, 6 pendientes. No hay certificación de aceptación integral.

## Arquitectura y tecnologías

SPA Angular 22.2, TypeScript 6, RxJS 7.8 y Tailwind 4. Componentes standalone, OnPush, signals, formularios reactivos, rutas lazy, guardas y un interceptor de sesión. La API es Express 5 sobre Node (package.json exige >=22.23.1), con Zod 4, pg, Helmet, CORS y rate limiting. PostgreSQL 17, SQL directo sin ORM, trece migraciones. Tablas: roles, users, sessions, categories, ticket_statuses, tickets, ticket_events y audit_events, además del seguimiento de migraciones. Relaciones: rol 1:N usuarios; usuario 1:N sesiones; categoría/estado 1:N tickets; usuario como solicitante/agente/actor; ticket 1:N eventos.

La SPA llama /api; Express aplica protección de origen y JSON, carga de sesión, cambio obligatorio y permisos. Servicios escriben SQL parametrizado y transacciones. Asignación/transiciones bloquean ticket FOR UPDATE y actores/agentes FOR SHARE, y escriben actividad y auditoría de manera atómica. La concurrencia no usa versión del cliente.

## Funciones y límites

- Núcleo conectado: acceso local, cierre de sesión, cambio de contraseña, usuarios, cuentas temporales, categorías, alta/lista/detalle de tickets, asignación y nueve transiciones, actividad estructurada.
- Recuperación asistida: respuesta genérica, SMTP al administrador, identidad externa y reset manual. No hay enlaces de recuperación.
- Seguridad: Argon2id; token opaco aleatorio cuyo SHA-256 se persiste; cookie HttpOnly, SameSite=Lax y Secure en producción; expiración y revocación, CSRF por Origin/Referer, JSON obligatorio, límites, Zod estricto y SQL parametrizado. Guardas del frontend complementan los controles de servidor.
- Sesión por defecto: 30 minutos de inactividad/8 horas absolutas; bloqueo de 15 minutos tras 5 fallos. Parámetros configurables en auth/config.ts.
- Roles: solicitante ve sus tickets; agente/supervisor/administrador leen todos. Agente toma un caso libre y atiende los asignados. Supervisor/administrador asignan y gestionan. Propiedad permite cerrar/reabrir Resuelto y cancelar Creado/En espera. Solo administrador gestiona usuarios y categorías.
- Pendiente: solución escrita obligatoria, notas, archivos, equipos, prioridad/SLA, artículos, reportes reales, encuestas y Telegram integrado.
- POC Telegram con grammY: sesiones Map en memoria, sin FK/identidad HelpDesk; no prueba notificaciones reales ni autorización integrada.
- SMTP con Nodemailer, Mailpit local y configuración Brevo. No se acredita entrega externa.

## Infraestructura

backend/compose.yaml define PostgreSQL 17 y Mailpit con puertos locales y volumen de datos. .github/workflows/ci.yml contiene jobs de frontend/backend, PostgreSQL de prueba y npm run check. La existencia del workflow no demuestra ejecución exitosa remota. Proxy de desarrollo Angular; build frontend estático y backend tsc. No se halló evidencia de hosting operativo, TLS real, backups programados ni restauración validada. No se reproducen secretos ni valores de .env.

## Planificación y discrepancias

La fuente de agrupación para estas presentaciones es el escenario alternativo de pagina Epicas y HU/plan.js, sin sustituir el backlog principal: S01 acceso (6), S02 portal e identidad Telegram (4), S03 asignación/atención (4), S04 resolución/tiempos (5), S05 avisos (1), S06 entrega (0). Sprint 0 tiene 9 tareas y no HU. Las fechas son propuestas, no ejecución acreditada.

SprintBacklog.md utiliza otra distribución: S1 acceso; S2 portal+asignación; S3 atención/cierre; S4 prioridad+Telegram; S5 entrega. No se mezclan denominadores. HU-05-09: Markdown S4 → página S2; HU-03-02/03: S2 → S3; HU-02-05/06 y HU-01-08: S3 → S4; HU-06-08: S4 → S5.

status.js conserva estados que no reflejan todos los cambios: historial HU-01-06 y espera HU-02-04 tienen núcleo parcial; petición Telegram HU-02-03 no tiene flujo integrado; HU-10-05 no acredita protección integrada por tener una POC; auditoría HU-10-06/07 tiene almacenamiento parcial. Esta revisión no modifica la planificación original. Algunas HU de cierre/reapertura tienen criterios actualizados al núcleo el 6-nov y se distinguen de criterios más amplios de otras HU.

## Avance por sprint de la página

| Sprint | HU | En código | Parciales | Pendientes |
|---|---:|---:|---:|---:|
| 1: Base y acceso | 6 | 1 | 5 | 0 |
| 2: Portal e identidad Telegram | 4 | 1 | 2 | 1 |
| 3: Asignación y atención | 4 | 0 | 3 | 1 |
| 4: Resolución y tiempos | 5 | 1 | 1 | 3 |
| 5: Avisos e integración | 1 | 0 | 0 | 1 |
| 6: Validación y entrega | 0 | 0 | 0 | 0 |

Sprint 0 y Sprint 6 no se convierten en porcentajes de HU. Hay estructura, migraciones y CI; entorno de otros equipos, hosting, prueba real Telegram y aceptación no acreditados.

## Matriz completa

| Sprint | Épica | HU | Funcionalidad | Estado real | Evidencia |
|---|---|---|---|---|---|
| S2 | EP-01 | HU-01-01 | Registrar una solicitud de soporte | Implementada en código; integración por revalidar | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Alta conectada a sesión, validación estricta, referencia SQL, transacción y conservación del formulario ante error. Falta repetir la integración con PostgreSQL en este entorno. |
| Fuera del MVP | EP-01 | HU-01-02 | Adjuntar evidencia a una solicitud | Pendiente | Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/. No se encontró un flujo integrado que cumpla esta HU. |
| S2 | EP-01 | HU-01-03 | Consultar mis solicitudes | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Listado propio y estados finales sin exclusión. Política de conservación y verificación integral pendientes. |
| Fuera del MVP | EP-01 | HU-01-04 | Filtrar mis solicitudes | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Estado, categoría, búsqueda y paginación conectados; no hay filtro por período. |
| S2 | EP-01 | HU-01-05 | Consultar el detalle y la responsabilidad de atención | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Detalle y agente visibles con autorización; equipos y protección de adjuntos aún no implementados. |
| Fuera del MVP | EP-01 | HU-01-06 | Consultar el historial autorizado del ticket | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Actividad estructurada y paginada; faltan notas, motivos, solución y archivos. Presenta lo más reciente primero. |
| Fuera del MVP | EP-01 | HU-01-07 | Acceder a la conversación de atención por Telegram | Pendiente | Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/. No se encontró un flujo integrado que cumpla esta HU. |
| S4 | EP-01 | HU-01-08 | Consultar la solución de una solicitud | Pendiente | Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-01 | HU-01-09 | Solicitar la reapertura de un ticket | Implementada en código; integración por revalidar | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Criterios del núcleo revisado el 6-nov: confirmación, propiedad, transición, fechas y actividad conectados. Falta repetir la integración con PostgreSQL. |
| Fuera del MVP | EP-01 | HU-01-10 | Registrar una solicitud en nombre de otro solicitante | Pendiente | Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/. No se encontró un flujo integrado que cumpla esta HU. |
| S3 | EP-02 | HU-02-01 | Actualizar el estado de un ticket | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Seis estados y nueve transiciones transaccionales; sin versión optimista: una acción todavía válida puede aceptar un estado cambiado desde la lectura. Motivos pendientes. |
| S3 | EP-02 | HU-02-02 | Registrar el trabajo realizado en una solicitud | Pendiente | Sin captura/persistencia de trabajo o petición de información; los eventos automáticos no equivalen a notas de atención. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-02 | HU-02-03 | Solicitar información para continuar la atención | Pendiente | Sin captura/persistencia de trabajo o petición de información; los eventos automáticos no equivalen a notas de atención. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-02 | HU-02-04 | Dejar un ticket en espera y continuar su atención | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Espera/reanudación conectadas; falta motivo textual y tratamiento SLA. |
| S4 | EP-02 | HU-02-05 | Documentar la solución y resolver el ticket | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Resolver establece estado y fecha; permite hacerlo sin solución escrita. Criterio obligatorio de explicación no cumplido. |
| S4 | EP-02 | HU-02-06 | Cerrar un ticket cuando termina su atención | Implementada en código; integración por revalidar | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Criterios del núcleo revisado el 6-nov: confirmación, propiedad, transición, fechas y actividad conectados. Falta repetir la integración con PostgreSQL. |
| Fuera del MVP | EP-02 | HU-02-07 | Cancelar una solicitud con una razón clara | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Cancela Creado/En espera por propiedad o gestión; no solicita razón escrita. |
| Fuera del MVP | EP-02 | HU-02-08 | Gestionar la reapertura de una solicitud | Implementada en código; integración por revalidar | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Criterios del núcleo revisado el 6-nov: confirmación, propiedad, transición, fechas y actividad conectados. Falta repetir la integración con PostgreSQL. |
| Fuera del MVP | EP-02 | HU-02-09 | Consultar la historia de atención de un caso | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Actividad estructurada y paginada; faltan notas, motivos, solución y archivos. Presenta lo más reciente primero. |
| Fuera del MVP | EP-03 | HU-03-01 | Consultar las colas de trabajo | Pendiente | Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones. No se encontró un flujo integrado que cumpla esta HU. |
| S3 | EP-03 | HU-03-02 | Identificar solicitudes que todavía necesitan asignación | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Listado y detalle muestran sin agente; no hay bandeja/filtro sin asignar ni equipos. |
| S3 | EP-03 | HU-03-03 | Asignar un ticket al equipo y agente adecuados | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Asignación manual y toma propia con bloqueos; faltan equipos, colas y niveles. |
| Fuera del MVP | EP-03 | HU-03-04 | Tomar un ticket de una cola autorizada | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Asignación manual y toma propia con bloqueos; faltan equipos, colas y niveles. |
| Fuera del MVP | EP-03 | HU-03-05 | Consultar la carga de trabajo antes de distribuir casos | Pendiente | Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-03 | HU-03-06 | Reasignar un ticket a otro agente | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Reasignación e historial anterior/nuevo; faltan equipos, motivos, reglas y detección optimista completa. |
| Fuera del MVP | EP-03 | HU-03-07 | Transferir un ticket a otro equipo o nivel | Pendiente | Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-03 | HU-03-08 | Dirigir solicitudes mediante reglas básicas | Pendiente | Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-03 | HU-03-09 | Consultar quién ha sido responsable del caso | Parcial | backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Reasignación e historial anterior/nuevo; faltan equipos, motivos, reglas y detección optimista completa. |
| Fuera del MVP | EP-03 | HU-03-10 | Mantener la comunicación dirigida a las personas correctas | Pendiente | Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones. No se encontró un flujo integrado que cumpla esta HU. |
| S4 | EP-04 | HU-04-01 | Determinar la prioridad de una solicitud | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-02 | Ajustar la prioridad con una explicación | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| S4 | EP-04 | HU-04-03 | Conocer las fechas límite de atención | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-04 | Reconocer la primera respuesta de atención | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-05 | Conocer si la resolución cumplió el tiempo comprometido | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-06 | Pausar y reanudar los tiempos cuando corresponda | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-07 | Identificar solicitudes en riesgo o fuera de tiempo | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-08 | Escalar un caso que necesita intervención | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-09 | Recibir avisos de riesgo, incumplimiento y escalamiento | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-04 | HU-04-10 | Revisar cómo cambiaron la prioridad y los tiempos | Pendiente | Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/. No se encontró un flujo integrado que cumpla esta HU. |
| S1 | EP-05 | HU-05-01 | Habilitar una cuenta para un usuario | Parcial | backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts Alta administrativa, rol y clave temporal de una sola visualización; vencimiento. Verificación externa y entrega segura por procedimiento por concretar. |
| Fuera del MVP | EP-05 | HU-05-02 | Mantener actualizados los datos del usuario | Parcial | backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts Edición conserva ID y valida campos; no hay versión optimista ni historial de nombres. |
| S1 | EP-05 | HU-05-03 | Entrar al HelpDesk y cerrar la sesión | Implementada en código; integración por revalidar | backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts Login/logout, revocación, vigencia y guardas conectados. Falta repetir la integración con PostgreSQL en este entorno. |
| Fuera del MVP | EP-05 | HU-05-04 | Recuperar el acceso a la cuenta | Parcial | backend/src/auth/recovery/; backend/src/mail/; backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts Solicitud genérica SMTP y reset administrativo; identidad se verifica fuera del sistema, procedimiento y entrega real no acreditados. |
| S1 | EP-05 | HU-05-05 | Asignar y ajustar roles según la responsabilidad del usuario | Parcial | backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts Un rol vigente, protección del último administrador y revocaciones; falta motivo obligatorio de cambio de rol. |
| Fuera del MVP | EP-05 | HU-05-06 | Asociar agentes y supervisores con equipos y niveles de soporte | Pendiente | Sin modelos/rutas de equipos ni vinculación de identidad Telegram. No se encontró un flujo integrado que cumpla esta HU. |
| S1 | EP-05 | HU-05-07 | Acceder únicamente a las funciones y datos autorizados | Parcial | backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts; backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts Autorización en servidor y guardas para el núcleo; faltan módulos futuros para completar la matriz de acceso. |
| Fuera del MVP | EP-05 | HU-05-08 | Desactivar una cuenta sin perder su historia | Parcial | backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts Baja revoca sesiones y conserva referencias; integración Telegram y motivo de baja pendientes. |
| S2 | EP-05 | HU-05-09 | Vincular una identidad de Telegram de forma verificable | Pendiente | Sin modelos/rutas de equipos ni vinculación de identidad Telegram. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-05 | HU-05-10 | Cambiar o retirar la vinculación con Telegram | Pendiente | Sin modelos/rutas de equipos ni vinculación de identidad Telegram. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-01 | Identificar el ticket de cada conversación | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-02 | Enviar información del solicitante a soporte | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-03 | Responder al solicitante desde Telegram | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-04 | Compartir archivos durante la atención | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-06 | Registrar notas internas para el equipo de soporte | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-07 | Dirigir la comunicación a destinatarios autorizados | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| S5 | EP-06 | HU-06-08 | Recibir los avisos relevantes en la aplicación y en Telegram | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-09 | Consultar qué ocurrió con cada envío | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-06 | HU-06-10 | Recuperar envíos pendientes sin repetir contenido | Pendiente | backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-01 | Buscar artículos que ayuden a resolver una duda | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-02 | Consultar instrucciones y soluciones publicadas | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-03 | Crear y clasificar un borrador de artículo | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-04 | Revisar un artículo antes de publicarlo | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-05 | Publicar un artículo aprobado | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-06 | Definir quién puede consultar un artículo | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-07 | Relacionar un artículo con un ticket | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-08 | Preparar un artículo a partir de una solución de soporte | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-09 | Retirar contenido que ya no debe utilizarse | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-07 | HU-07-10 | Actualizar artículos y mantener un responsable identificable | Pendiente | Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-01 | Consultar un panorama del servicio | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-02 | Filtrar la información que se necesita revisar | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-03 | Reconocer cómo cambia la demanda de soporte | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-04 | Analizar la distribución y acumulación del trabajo | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-05 | Consultar los tiempos de primera respuesta y resolución | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-06 | Revisar el cumplimiento y los incumplimientos de SLA | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-07 | Recibir una invitación para valorar la atención | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-08 | Valorar la atención recibida | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-09 | Consultar la satisfacción junto con la participación | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-08 | HU-08-10 | Exportar un reporte autorizado | Pendiente | /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas. No se encontró un flujo integrado que cumpla esta HU. |
| S1 | EP-09 | HU-09-01 | Mantener categorías y opciones de clasificación | Parcial | backend/src/categories/; frontend/src/app/features/categorias/; backend/test/integration/users-and-categories.test.ts Categorías planas con activación; sin subcategorías ni dependencias de enrutamiento. |
| Fuera del MVP | EP-09 | HU-09-02 | Configurar los estados y los cambios permitidos | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-03 | Mantener la estructura de equipos y niveles | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-04 | Configurar reglas básicas para dirigir solicitudes | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-05 | Configurar los criterios de prioridad | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-06 | Configurar los SLA, horarios y reglas de conteo | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-07 | Configurar riesgos y reglas de escalamiento | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-08 | Mantener eventos, plantillas y respuestas frecuentes | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-09 | Configurar y supervisar la integración con Telegram | Pendiente | No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-09 | HU-09-10 | Aplicar cambios y desactivar opciones sin perder antecedentes | Parcial | backend/src/categories/service.ts; backend/src/users/service.ts; backend/db/migrations/ Inactivación conserva referencias; configuración restante y antecedentes completos pendientes. |
| S1 | EP-10 | HU-10-01 | Proteger el acceso y las sesiones del HelpDesk | Parcial | backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts; backend/src/app.ts; backend/src/config/env.ts Hash, sesiones, CSRF, CORS y controles del núcleo; HTTPS desplegado, módulos futuros y protección operacional no verificados. |
| Fuera del MVP | EP-10 | HU-10-02 | Proteger la información y las credenciales | Parcial | backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts; backend/src/app.ts; backend/src/config/env.ts Hash, sesiones, CSRF, CORS y controles del núcleo; HTTPS desplegado, módulos futuros y protección operacional no verificados. |
| Fuera del MVP | EP-10 | HU-10-03 | Validar los datos y archivos antes de procesarlos | Parcial | backend/src/http/validation.ts; backend/src/tickets/validation.ts; backend/src/users/validation.ts Zod estricto, límites y SQL parametrizado; no existe carga ni análisis de archivos. |
| Fuera del MVP | EP-10 | HU-10-04 | Comprobar el origen y la autorización de los intercambios de Telegram | Pendiente | Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-10 | HU-10-05 | Evitar que se envíe información no autorizada a Telegram | Pendiente | Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-10 | HU-10-06 | Registrar las acciones sensibles para poder revisarlas | Parcial | backend/src/audit/audit.ts; backend/db/migrations/0009_audit_events.sql; backend/src/tickets/operations.ts Registro global estructurado y transaccional; sin API/UI de consulta, retención, respaldo ni garantía de inmutabilidad operacional. |
| Fuera del MVP | EP-10 | HU-10-07 | Consultar y proteger los registros de auditoría | Parcial | backend/src/audit/audit.ts; backend/db/migrations/0009_audit_events.sql; backend/src/tickets/operations.ts Registro global estructurado y transaccional; sin API/UI de consulta, retención, respaldo ni garantía de inmutabilidad operacional. |
| Fuera del MVP | EP-10 | HU-10-08 | Ejecutar respaldos protegidos y comprobar su resultado | Pendiente | Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-10 | HU-10-09 | Probar la restauración del servicio y registrar sus resultados | Pendiente | Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk. No se encontró un flujo integrado que cumpla esta HU. |
| Fuera del MVP | EP-10 | HU-10-10 | Reanudar Telegram después de una recuperación | Pendiente | Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk. No se encontró un flujo integrado que cumpla esta HU. |

## Revisión de criterios por HU

Se conserva el texto fuente para permitir revisar el criterio preciso junto a la evidencia y las brechas. Una prueba presente en el repositorio no se describe como ejecutada: los resultados de esta sesión están en verificacion/RESULTADOS.md.

### HU-01-01 · Registrar una solicitud de soporte

**Dictamen:** Implementada en código; integración por revalidar. Alta conectada a sesión, validación estricta, referencia SQL, transacción y conservación del formulario ante error. Falta repetir la integración con PostgreSQL en este entorno.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Cuando un solicitante necesita ayuda, puede registrar su problema en el portal indicando un asunto, una descripción y una categoría. Al terminar, recibe un número de ticket que le permite volver a consultar el caso y seguir su atención.

**Para revisar con el equipo:**

- El solicitante debe haber iniciado sesión y tener su cuenta habilitada. Las categorías disponibles son las que el servicio permite usar.
- Si falta un dato obligatorio, contiene solo espacios o la categoría no es válida, el portal señala qué debe corregirse antes de crear el ticket.
- La solicitud queda a nombre del solicitante, con una referencia única `TK-XXXXXX` de al menos seis dígitos, sin truncar números largos, fecha de creación y estado Creado. La confirmación permite abrir su detalle.
- Si el registro falla y el ticket no se crea, se informa el problema y se conservan los textos ingresados para volver a intentarlo.

Propuesta para la entrega 1. Se apoya en EP-02 para crear el ticket, EP-05 para identificar al solicitante, EP-09 para las categorías y EP-10 para proteger la información. Los avisos del registro corresponden a EP-06.

</details>

### HU-01-02 · Adjuntar evidencia a una solicitud

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede acompañar su solicitud con archivos, por ejemplo una captura del error, para que soporte entienda mejor lo que ocurre. Antes de enviarla, puede revisar qué archivos seleccionó y retirar los que no necesita.

**Para revisar con el equipo:**

- Los archivos deben cumplir las reglas de tipo, tamaño, cantidad y seguridad que acuerde el servicio. Si alguno se rechaza, el portal explica el motivo que pueda comunicarse y conserva el texto de la solicitud.
- Los archivos aceptados quedan asociados al ticket y pueden consultarse desde su detalle según los permisos de cada persona.
- Un enlace directo a un archivo tampoco permite descargarlo sin autorización.
- Se puede registrar una solicitud sin adjuntos, salvo que el equipo acuerde expresamente que sean obligatorios en algún caso.

Propuesta para la entrega 2. Complementa HU-01-01 y utiliza los controles de archivos de EP-10. Falta definir la política de adjuntos y qué ocurre con el envío si falla una carga. Esta historia cubre los archivos del registro; los que se comparten después en la conversación corresponden a EP-06.

</details>

### HU-01-03 · Consultar mis solicitudes

**Dictamen:** Parcial. Listado propio y estados finales sin exclusión. Política de conservación y verificación integral pendientes.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El solicitante encuentra sus casos en «Tickets» y puede ver en qué estado está cada uno sin tener que preguntar a soporte. Desde el listado puede abrir el caso que le interesa.

**Para revisar con el equipo:**

- El listado muestra únicamente los tickets donde el solicitante figura como solicitante, con su identificador, asunto, fecha de creación y estado actual.
- Al seleccionar un ticket, se abre la información que el solicitante tiene permiso de consultar.
- Si todavía no tiene solicitudes, el portal lo indica y ofrece registrar una nueva.
- Los casos resueltos o cerrados siguen disponibles mientras se encuentren dentro del período de conservación del servicio.

Propuesta para la entrega 1. Utiliza los estados de EP-02 y los permisos y controles de EP-05 y EP-10. La disponibilidad de casos antiguos depende de la política de conservación.

</details>

### HU-01-04 · Filtrar mis solicitudes

**Dictamen:** Parcial. Estado, categoría, búsqueda y paginación conectados; no hay filtro por período.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Cuando el solicitante tiene varias solicitudes, puede reducir el listado para encontrar las que necesita revisar. Se propone permitir filtros por estado, categoría y fechas de creación.

**Para revisar con el equipo:**

- Los filtros pueden combinarse y solo muestran solicitudes propias que cumplen todos los criterios elegidos.
- El período incluye las fechas de inicio y fin, según la zona horaria acordada para el servicio. Si la fecha inicial es posterior a la final, el portal pide corregirla antes de aplicar el filtro.
- Si no hay coincidencias, el portal lo explica y permite cambiar o quitar los filtros.
- Al limpiar los filtros, vuelven a estar disponibles todas las solicitudes propias que se conservan.

Propuesta para la entrega 2. Complementa HU-01-03 y utiliza los estados de EP-02 y las categorías de EP-09. El núcleo actual filtra por estado y categoría, busca por número/asunto y ordena por creación e ID descendentes; muestra fechas en la zona del navegador. El filtro por período de esta historia sigue pendiente.

</details>

### HU-01-05 · Consultar el detalle y la responsabilidad de atención

**Dictamen:** Parcial. Detalle y agente visibles con autorización; equipos y protección de adjuntos aún no implementados.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Al abrir una solicitud, el solicitante puede revisar lo que reportó, conocer su estado y saber quién la está atendiendo. Así encuentra en un mismo lugar la información necesaria para entender la situación de su caso.

**Para revisar con el equipo:**

- El detalle incluye identificador, asunto, descripción, categoría, fecha de creación y un estado fácil de entender.
- Se muestra el equipo o agente responsable según la información que el solicitante tenga permitido conocer. Si aún no hay responsable, se indica claramente.
- Al volver a consultar el caso, se muestran los cambios de estado o responsable que ya se hayan confirmado.
- No se puede acceder al contenido ni a los archivos de un ticket sin permiso, aunque se conozca su identificador o enlace.

Propuesta para la entrega 1. El estado proviene de EP-02, la asignación de EP-03 y las reglas de acceso de EP-05 y EP-10.

</details>

### HU-01-06 · Consultar el historial autorizado del ticket

**Dictamen:** Parcial. Actividad estructurada y paginada; faltan notas, motivos, solución y archivos. Presenta lo más reciente primero.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede revisar lo que ha ocurrido durante la atención de su solicitud. El historial reúne las actividades que puede conocer; los mensajes de Telegram no forman parte de él.

**Para revisar con el equipo:**

- Las actividades aparecen en orden cronológico, con fecha, descripción y autor o responsable cuando corresponda y se permita mostrarlo.
- Las notas internas y sus adjuntos permanecen restringidos, incluso si alguien intenta abrirlos mediante un enlace directo.
- Si todavía no hay novedades visibles después del registro, el portal lo indica.
- El historial es de consulta; la conversación de atención ocurre en Telegram y no se conserva en él.

Propuesta para la entrega 2. Complementa HU-01-05. EP-02 conserva el historial y EP-05 y EP-10 controlan qué puede consultar cada persona.

</details>

### HU-01-07 · Acceder a la conversación de atención por Telegram

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/.

<details><summary>Criterios de la planificación revisados</summary>

Desde el detalle de su ticket, el solicitante puede continuar la atención en Telegram con una referencia clara al caso. Esto le ayuda a conversar con soporte sin confundir solicitudes cuando tiene varias abiertas.

**Para revisar con el equipo:**

- Con una cuenta de Telegram vinculada correctamente, el acceso utiliza el mecanismo que se defina en EP-06 e identifica el ticket seleccionado.
- Tener varios tickets no debe provocar que la conversación se asocie a otro caso por error.
- Si falta vincular la cuenta, el portal explica cómo hacerlo antes de habilitar la conversación.
- Si la integración no está disponible, se informa el problema y el solicitante puede seguir consultando su ticket en el portal.
- No se habilita una conversación ni se muestra información de un caso al que el solicitante no tenga acceso.

Propuesta para la entrega 2. Complementa HU-01-05 y necesita la vinculación de EP-05, la integración de EP-06 y los controles de EP-10. Queda por definir cómo se abre la conversación, qué ocurre si no hay agente asignado y en qué estados está disponible. Solo se contemplan conversaciones gestionadas por la integración.

</details>

### HU-01-08 · Consultar la solución de una solicitud

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede leer cómo se resolvió su solicitud para entender la atención recibida y comprobar si el problema quedó solucionado. La solución sigue disponible al consultar el caso después de su cierre.

**Para revisar con el equipo:**

- Cuando existe una solución documentada y disponible para el solicitante, el detalle muestra su contenido y la fecha de resolución.
- Si todavía no se ha registrado una solución, el portal lo indica sin presentar el caso como resuelto.
- La solución de un caso cerrado se puede consultar mientras la información se conserve y el solicitante mantenga el permiso de acceso.
- Leer la solución no cuenta por sí solo como una aceptación del solicitante ni cambia el estado del ticket.

Propuesta para la entrega 1. Complementa HU-01-05. EP-02 gestiona la solución y la resolución del caso; EP-05 y EP-10 controlan el acceso.

</details>

### HU-01-09 · Solicitar la reapertura de un ticket

**Dictamen:** Implementada en código; integración por revalidar. Criterios del núcleo revisado el 6-nov: confirmación, propiedad, transición, fechas y actividad conectados. Falta repetir la integración con PostgreSQL.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Si el problema continúa y el ticket está Resuelto, el propietario puede pulsar «El problema continúa» y confirmar su reapertura a En proceso. Conserva el agente y la actividad anterior.

**Para revisar con el equipo:**

- Solo Resuelto ofrece reapertura; Cerrado y Cancelado son terminales.
- La acción es directa después de confirmar, sin aprobación ni motivo textual.
- Se comprueba la propiedad real y no se admite actor/estado anterior enviados por el cliente.
- Si el estado cambió, se informa el conflicto y se recargan los datos.

El núcleo está implementado mediante HU-02-08; futuras comunicaciones y comentarios siguen fuera de alcance.

</details>

### HU-01-10 · Registrar una solicitud en nombre de otro solicitante

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin formulario, contrato API y persistencia para esta capacidad en frontend/src/app/features/tickets/ y backend/src/tickets/.

<details><summary>Criterios de la planificación revisados</summary>

Un agente autorizado puede ayudar a un solicitante registrando la solicitud en su nombre. El caso queda a nombre de quien necesita el soporte y conserva también la referencia de quién lo registró.

**Para revisar con el equipo:**

- Esta opción solo funciona si la empresa decide habilitarla y el agente tiene permiso para usarla.
- El agente selecciona a un solicitante habilitado dentro de su alcance autorizado y completa los mismos datos requeridos para una solicitud normal.
- El registro distingue al solicitante del agente que ingresó la solicitud. El solicitante encuentra el ticket en «Mis solicitudes».
- Si la opción está deshabilitada o el agente no tiene permiso, el registro se rechaza también cuando se intenta mediante una solicitud directa.
- Registrar el caso no otorga al agente permisos adicionales para consultarlo o atenderlo.

Esta historia queda fuera de las entregas propuestas hasta confirmar que se habilitará. Se relaciona con HU-01-01 y HU-01-03, con los permisos de EP-05 y con la trazabilidad de EP-10.

</details>

### HU-02-01 · Actualizar el estado de un ticket

**Dictamen:** Parcial. Seis estados y nueve transiciones transaccionales; sin versión optimista: una acción todavía válida puede aceptar un estado cambiado desde la lectura. Motivos pendientes.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El agente puede indicar en qué situación se encuentra una solicitud para que quienes participan en ella sepan si ya se está atendiendo, está pendiente de algo o ha llegado a otra etapa del proceso. El sistema ofrece las acciones válidas del estado actual, según rol, propiedad y agente asignado; la máquina vigente está en [tickets](../../backend/docs/tickets.md).

**Para revisar con el equipo:**

- Cada ticket comienza en Creado y conserva un único estado vigente entre los seis acordados.
- Solo se admiten las nueve transiciones acordadas. Iniciar, esperar, reanudar y resolver corresponden al agente asignado, supervisor o administrador; cerrar/reabrir Resuelto y cancelar Creado/En espera corresponden al propietario, supervisor o administrador.
- Antes de aceptar el cambio se comprueban estado, permisos y agente cuando corresponde. Documentar una solución de texto sigue fuera del núcleo actual.
- Cada cambio confirmado conserva el estado anterior, el nuevo, la persona o proceso que lo realizó y la fecha, junto con el motivo cuando corresponda.
- Si otra persona ya cambió el estado mientras el agente revisaba el ticket, se informa la situación y se pide revisar los datos vigentes antes de continuar. No se sobrescribe el cambio anterior sin advertencia.
- Si la operación falla, no se presenta el cambio como completado ni se deja un estado sin su registro correspondiente en el historial.

Propuesta para la entrega 1. EP-09 define las reglas configurables, EP-05 y EP-10 controlan los accesos y EP-06 entrega los avisos aplicables. Las historias siguientes detallan las condiciones de algunos cambios. Los seis estados, nueve transiciones y permisos del núcleo están implementados; motivos de texto y solución documentada siguen pendientes.

</details>

### HU-02-02 · Registrar el trabajo realizado en una solicitud

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin captura/persistencia de trabajo o petición de información; los eventos automáticos no equivalen a notas de atención.

<details><summary>Criterios de la planificación revisados</summary>

El agente puede dejar constancia de las revisiones, pruebas y acciones que realiza durante la atención. Esto permite que él mismo o un compañero autorizado retomen el caso entendiendo qué se ha intentado y qué resultado tuvo.

**Para revisar con el equipo:**

- Cada actividad queda asociada al ticket con una descripción, su autor y la fecha de registro.
- Una descripción vacía o formada solo por espacios no se acepta como actividad.
- Las actividades se incorporan al historial sin sustituir las anteriores. Los cambios relevantes realizados desde otras funciones, como un cambio de estado, se registran desde esas funciones sin obligar al agente a volver a escribirlos.
- Registrar una actividad no cambia por sí solo el estado, la prioridad o el responsable del ticket.
- El contenido solo se muestra a quienes tengan permiso. Registrar una actividad tampoco la envía automáticamente al solicitante como mensaje.

Propuesta para la entrega 1. Se relaciona con HU-02-09 y con los permisos de EP-05 y la protección de EP-10. Las notas internas y la conversación conservan su tratamiento en EP-06. Falta acordar cómo corregir una actividad registrada sin perder su trazabilidad y cuáles de estas actividades podrá ver el solicitante.

</details>

### HU-02-03 · Solicitar información para continuar la atención

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin captura/persistencia de trabajo o petición de información; los eventos automáticos no equivalen a notas de atención.

<details><summary>Criterios de la planificación revisados</summary>

Cuando necesita aclaraciones, el agente puede pedir al solicitante la información que falta y dejar constancia de qué necesita para continuar. Así se evita que una solicitud quede detenida sin una razón comprensible.

**Para revisar con el equipo:**

- La petición explica qué información se necesita y queda vinculada al ticket, con autor y fecha. No se acepta una petición sin contenido.
- La comunicación se realiza mediante la integración con Telegram de EP-06 y se dirige al caso correcto.
- Una petición registrada no se presenta como entregada si el envío está pendiente o falló. El estado de entrega proviene de EP-06 y permite distinguir esa situación.
- La respuesta del solicitante llega por Telegram, pero no se conserva en el historial del ticket; el agente registra en una actividad lo que resulte relevante.
- Recibir una respuesta no implica automáticamente que la información sea suficiente ni cambia el estado del ticket. El agente revisa lo recibido y decide la siguiente acción permitida.

Propuesta para la entrega 2. Necesita EP-06 para la comunicación. Si el caso debe quedar en espera, el agente utiliza HU-02-04. Falta acordar cómo se identifica que una petición de información ya fue atendida.

</details>

### HU-02-04 · Dejar un ticket en espera y continuar su atención

**Dictamen:** Parcial. Espera/reanudación conectadas; falta motivo textual y tratamiento SLA.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Cuando no puede avanzar, el agente puede dejar el caso en espera explicando qué está pendiente. Cuando se resuelve ese impedimento, puede continuar la atención sin perder el contexto de la pausa.

**Para revisar con el equipo:**

- El agente puede elegir En espera con las transiciones y permisos de la máquina vigente y debe indicar un motivo que explique qué impide continuar.
- El historial conserva el motivo, la fecha y la persona que dejó el caso en espera.
- Al retomar el trabajo, se elige explícitamente el estado y queda constancia de cuándo se retomó, quién lo hizo y qué permitió continuar.
- La información sobre la espera respeta los permisos del solicitante y del equipo de soporte.
- Los tiempos de atención se tratan según EP-04. La espera no pausa el SLA por el solo hecho de cambiar el estado.

Propuesta para la entrega 2. Complementa HU-02-01 y HU-02-03; utiliza las reglas de EP-09 y se relaciona con EP-04. Falta acordar los motivos de espera y qué esperas afectan los tiempos del servicio; En proceso pasa a En espera; desde En espera se reanuda, resuelve o cancela según los permisos vigentes.

</details>

### HU-02-05 · Documentar la solución y resolver el ticket

**Dictamen:** Parcial. Resolver establece estado y fecha; permite hacerlo sin solución escrita. Criterio obligatorio de explicación no cumplido.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Cuando termina de atender el problema, el agente explica qué hizo y cuál fue el resultado antes de marcar la solicitud como resuelta. El solicitante recibe una explicación que le permite entender la solución, y soporte conserva una referencia útil del trabajo realizado.

**Para revisar con el equipo:**

- La solución debe contener una explicación; no se permite resolver un ticket con el campo vacío o compuesto solo por espacios.
- El agente asignado, supervisor o administrador resuelve solo desde En proceso o En espera y con agente asignado. La solución de texto aún no se implementa.
- La solución, la persona que la registró y la fecha de resolución quedan asociadas al ticket y disponibles en su historial.
- La explicación destinada al solicitante no debe exponer notas internas ni archivos restringidos. El contenido se presenta según los permisos acordados.
- Marcar el ticket como resuelto no equivale a cerrarlo ni a afirmar que el solicitante aceptó la solución.

Propuesta para la entrega 1. Complementa la consulta de solución de HU-01-08 y utiliza HU-02-01 y HU-02-09. EP-06 gestiona los avisos de resolución. Falta acordar si se requiere información adicional para documentar una solución y cómo se corrige posteriormente conservando los antecedentes.

</details>

### HU-02-06 · Cerrar un ticket cuando termina su atención

**Dictamen:** Implementada en código; integración por revalidar. Criterios del núcleo revisado el 6-nov: confirmación, propiedad, transición, fechas y actividad conectados. Falta repetir la integración con PostgreSQL.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El propietario confirma que el problema terminó y cierra el ticket Resuelto. Supervisor y administrador también pueden cerrarlo. Ser agente asignado no permite cerrar un ticket ajeno.

**Para revisar con el equipo:**

- Solo se permite Resuelto → Cerrado, con confirmación en pantalla.
- El historial registra actor, estado anterior/nuevo y fecha; conserva la resolución y fija la fecha de cierre.
- Cerrado es terminal: no se reabre ni cambia asignación.
- Leer el detalle o recibir un aviso no confirma automáticamente el cierre.

El núcleo está implementado. Solución de texto, adjuntos y notificaciones siguen fuera de esta etapa; se coordina con HU-02-01 y HU-02-09.

</details>

### HU-02-07 · Cancelar una solicitud con una razón clara

**Dictamen:** Parcial. Cancela Creado/En espera por propiedad o gestión; no solicita razón escrita.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Cuando no corresponde continuar, el propietario de cualquier rol, supervisor o administrador puede cancelar únicamente desde Creado o En espera. Un agente no cancela tickets ajenos por estar asignado.

**Para revisar con el equipo:**

- Se comprueban rol, propiedad y estado actuales, también mediante acceso directo.
- La pantalla pide confirmación; el núcleo no recibe motivos o comentarios de texto.
- La operación fija canceled_at y registra actor/antes/después en actividad y auditoría sin simular resolución o cierre exitoso.
- No se permite desde En proceso, Resuelto, Cerrado o Cancelado. Cancelado es terminal.

Implementado el núcleo de cancelación de HU-02-01 y HU-02-09. El catálogo de motivos y su captura textual quedan pendientes para una etapa posterior.

</details>

### HU-02-08 · Gestionar la reapertura de una solicitud

**Dictamen:** Implementada en código; integración por revalidar. Criterios del núcleo revisado el 6-nov: confirmación, propiedad, transición, fechas y actividad conectados. Falta repetir la integración con PostgreSQL.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El propietario, supervisor o administrador puede reabrir directamente un ticket Resuelto si el problema continúa. El agente solo puede hacerlo sobre un ticket propio, no por ser su agente asignado.

**Para revisar con el equipo:**

- Solo se permite Resuelto → En proceso; Cerrado y Cancelado no se reabren.
- La pantalla confirma la operación; no hay aprobación, plazos ni solicitud separada.
- Se conserva el agente asignado y se limpia resolved_at.
- La resolución anterior permanece en el historial como evento; no se inventan ni borran transiciones.
- No hay motivos de texto, SLA ni cálculo de primera respuesta en esta etapa.

El núcleo está implementado y se coordina con HU-01-09, HU-02-01 y HU-02-09.

</details>

### HU-02-09 · Consultar la historia de atención de un caso

**Dictamen:** Parcial. Actividad estructurada y paginada; faltan notas, motivos, solución y archivos. Presenta lo más reciente primero.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El agente o supervisor autorizado puede revisar el recorrido de una solicitud para entender qué se hizo, quién participó y por qué cambió su situación. Esto facilita continuar la atención y explicar cómo se llegó al resultado del caso.

**Para revisar con el equipo:**

- El historial reúne el registro inicial, las actividades y los cambios relevantes, con sus fechas y responsables, en un orden que permita reconstruir la atención. Cada cambio de estado conserva quién lo hizo, de cuál a cuál y cuándo; HU-04-04 consulta ese historial para calcular la primera entrada en En proceso, sin una columna aparte.
- Las soluciones, esperas, cancelaciones y reaperturas conservan sus motivos y antecedentes cuando correspondan. Una nueva etapa no borra las anteriores.
- Los cambios originados en otras funciones, como la asignación de EP-03, se incorporan con su referencia al caso; el historial no ejecuta esas acciones.
- Cada persona ve solo el contenido que tiene permitido consultar. Agente, supervisor y administrador consultan todos los casos; solicitante solo los propios.
- Las notas internas y los archivos restringidos mantienen sus controles de acceso, incluso mediante enlaces directos. La vista del solicitante sigue lo definido en HU-01-06.

Propuesta para la entrega 1. Reúne la información producida por las funciones del ticket y aplica EP-05 y EP-10. Este historial sirve para seguir la atención; la auditoría de seguridad conserva su alcance propio en EP-10.

</details>

### HU-03-01 · Consultar las colas de trabajo

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones.

<details><summary>Criterios de la planificación revisados</summary>

El agente o supervisor puede revisar las solicitudes organizadas por equipo, categoría o nivel de atención, según la estructura del servicio. Así encuentra el trabajo que le corresponde sin tener que recorrer todos los tickets del sistema.

**Para revisar con el equipo:**

- Cada persona puede consultar únicamente las colas y los casos que tiene autorizados.
- Se propone mostrar identificador, asunto, categoría, estado, equipo y agente responsable, distinguiendo cuándo todavía no hay agente asignado.
- Desde la cola se puede abrir el detalle autorizado del ticket. Ver un caso en una cola no concede por sí solo permiso para tomarlo o reasignarlo.
- Al volver a consultar una cola, se reflejan las asignaciones y transferencias confirmadas. Un mismo ticket visible en distintas agrupaciones sigue siendo un solo caso.
- Si una cola no contiene solicitudes, se indica claramente.

Propuesta para la entrega 1. Utiliza la estructura de EP-09, los accesos de EP-05 y EP-10 y los estados de EP-02. Falta acordar las agrupaciones, los datos visibles, el orden y qué estados forman parte del trabajo pendiente.

</details>

### HU-03-02 · Identificar solicitudes que todavía necesitan asignación

**Dictamen:** Parcial. Listado y detalle muestran sin agente; no hay bandeja/filtro sin asignar ni equipos.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El supervisor puede localizar los casos que aún no tienen equipo o que ya llegaron a un equipo pero siguen sin agente. Esto le permite intervenir antes de que una solicitud quede olvidada entre las demás.

**Para revisar con el equipo:**

- Se distingue entre una solicitud sin equipo responsable y otra con equipo pero sin agente, cuando esas situaciones estén permitidas.
- La consulta muestra solo los casos del alcance autorizado del supervisor y permite abrirlos para asignarlos.
- Se propone mostrar la fecha de registro para ayudar a reconocer cuánto tiempo lleva el caso pendiente, sin interpretarla como un cálculo de incumplimiento de SLA.
- Un ticket con agente asignado deja de aparecer como pendiente de agente cuando se actualiza la consulta.
- Un caso que no pudo dirigirse mediante una regla automática permanece localizable por el personal autorizado; no desaparece por falta de coincidencia.

Propuesta para la entrega 1. Se relaciona con HU-03-01, HU-03-03 y HU-03-08. Falta acordar quién revisa los casos sin equipo y cuáles requieren asignación según su estado. Los riesgos y vencimientos corresponden a EP-04.

</details>

### HU-03-03 · Asignar un ticket al equipo y agente adecuados

**Dictamen:** Parcial. Asignación manual y toma propia con bloqueos; faltan equipos, colas y niveles.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El supervisor o la persona autorizada puede dirigir una solicitud al equipo que debe atenderla y, cuando corresponda, elegir un agente. El caso queda con una responsabilidad visible para que el trabajo pueda comenzar.

**Para revisar con el equipo:**

- Solo se pueden elegir equipos y agentes habilitados y autorizados para atender el caso. Se comprueba que la combinación de equipo, nivel y agente sea válida según las reglas del servicio.
- Si se permite asignar primero al equipo, el ticket queda identificado como pendiente de agente. No se presenta como una asignación personal completada.
- Antes de guardar, se vuelven a comprobar los permisos, la situación del ticket y la disponibilidad de la asignación elegida. No basta con que la opción haya aparecido al abrir el formulario.
- La asignación confirmada queda visible en el caso y registra quién o qué proceso la realizó y cuándo. Cualquier cambio de estado asociado se valida mediante EP-02.
- Si otra persona ya modificó la asignación, se informa y se pide revisar la situación vigente antes de reemplazarla. Si la operación falla, no se confirma una asignación que no quedó guardada.

Propuesta para la entrega 1. Utiliza EP-05 y EP-09 para las opciones permitidas, EP-02 para estados e historial y EP-10 para protección. HU-03-10 mantiene la comunicación al día. Falta acordar si todos los casos necesitan equipo y agente desde el inicio y qué relación existe entre asignación y estado.

</details>

### HU-03-04 · Tomar un ticket de una cola autorizada

**Dictamen:** Parcial. Asignación manual y toma propia con bloqueos; faltan equipos, colas y niveles.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El agente puede tomar una solicitud disponible de su cola cuando las reglas le permiten elegir su siguiente caso. Así puede empezar a atender trabajo pendiente sin esperar una asignación individual del supervisor.

**Para revisar con el equipo:**

- La opción solo está disponible para agentes habilitados que pueden atender el ticket y para casos que cumplen las condiciones acordadas.
- Al tomarlo, el agente queda como responsable y el cambio se refleja en el detalle, la cola y el historial.
- Si dos agentes intentan tomar el mismo caso, solo una operación puede completarse. El otro agente recibe la información de que el ticket ya no está disponible para tomarlo.
- Tomar un caso no permite desplazar al responsable de un ticket ya asignado; ese cambio utiliza las reglas de reasignación.
- La acción no cambia por sí sola la prioridad ni evita la validación del estado en EP-02.

Propuesta para la entrega 2. Complementa HU-03-01 y utiliza los controles de HU-03-03 y la continuidad de HU-03-10. Falta acordar qué colas permiten esta modalidad y si habrá límites de casos que un agente puede tomar.

</details>

### HU-03-05 · Consultar la carga de trabajo antes de distribuir casos

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones.

<details><summary>Criterios de la planificación revisados</summary>

El supervisor puede ver cómo se reparte el trabajo entre sus equipos y agentes para decidir dónde asignar una nueva solicitud o cuándo conviene redistribuir casos. La información sirve como apoyo a su criterio y permite revisar los tickets que explican cada cantidad.

**Para revisar con el equipo:**

- Se propone mostrar la cantidad de tickets pendientes por equipo y agente, con una separación por estado y una identificación de los casos sin agente.
- Las cantidades se calculan con los estados y el alcance que acuerde el servicio. La vista deja claro qué incluye, especialmente respecto a tickets en espera o resueltos que todavía no están cerrados.
- Un ticket se cuenta una sola vez dentro de cada total correspondiente, aunque aparezca en más de una agrupación de consulta.
- Desde una cantidad se pueden revisar los casos que la componen, siempre dentro de los permisos vigentes.
- La cantidad de tickets no se presenta como una medida automática de esfuerzo, productividad o disponibilidad. Consultar la carga no reasigna casos por sí solo.

Propuesta para la entrega 2. Se relaciona con HU-03-01, HU-03-03 y HU-03-06. EP-02 aporta los estados y EP-05 limita el alcance. Esta vista apoya la distribución actual; los reportes históricos y la evaluación del servicio pertenecen a EP-08. Falta acordar qué cuenta como carga y qué detalle podrá ver cada rol.

</details>

### HU-03-06 · Reasignar un ticket a otro agente

**Dictamen:** Parcial. Reasignación e historial anterior/nuevo; faltan equipos, motivos, reglas y detección optimista completa.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Si cambia la disponibilidad del agente o conviene que otra persona continúe, el supervisor o personal autorizado puede reasignar el caso dentro del equipo. La nueva persona recibe el contexto necesario y queda claro por qué cambió la responsabilidad.

**Para revisar con el equipo:**

- Se elige un agente habilitado y autorizado para atender el caso dentro del equipo correspondiente.
- La reasignación requiere un motivo con contenido y conserva el responsable anterior, el nuevo, la persona que hizo el cambio y la fecha.
- El historial, la solución previa y las notas internas del caso se conservan. El nuevo agente accede únicamente a la información permitida para su función.
- Antes de guardar se comprueba que la asignación no haya cambiado desde que se inició la operación. Un conflicto se informa antes de reemplazar al responsable vigente.
- Si la reasignación no se completa, se conserva la responsabilidad anterior. Reasignar tampoco reinicia los tiempos del caso ni supone volver a crearlo.

Propuesta para la entrega 1. Complementa HU-03-03, HU-03-09 y HU-03-10. EP-02 conserva la historia, EP-04 trata los tiempos y EP-05 los permisos. Los cambios de equipo o nivel se cubren en HU-03-07. Falta acordar si un agente puede devolver un caso a la cola y cómo se gestionan las solicitudes de agentes desactivados.

</details>

### HU-03-07 · Transferir un ticket a otro equipo o nivel

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones.

<details><summary>Criterios de la planificación revisados</summary>

Cuando el problema necesita la intervención de otro equipo o nivel de soporte, el personal autorizado puede transferirlo explicando la razón. El caso continúa con sus antecedentes y con una responsabilidad identificable durante el cambio.

**Para revisar con el equipo:**

- Solo se puede transferir a equipos o niveles habilitados para recibir el caso, y se exige un motivo.
- Se define el equipo de destino y, cuando corresponda, un agente válido para ese destino. Si queda pendiente de agente, se muestra claramente en la cola correspondiente.
- No se conserva por descuido un agente que no puede atender en el destino. La responsabilidad resultante debe cumplir las reglas del servicio.
- Si se exige aceptación del equipo receptor, el caso mantiene identificable a su responsable durante la espera. No se muestra la transferencia como completada antes de esa aceptación.
- Se conservan el origen, el destino, el motivo, la persona o proceso que hizo la transferencia y sus fechas, sin borrar las actividades anteriores.
- Una transferencia fallida no elimina la asignación vigente. Si nace de un escalamiento, se conserva la referencia al evento de EP-04 que la motivó.

Propuesta para la entrega 2. Utiliza HU-03-09 y HU-03-10 y se coordina con EP-02, EP-04, EP-05 y EP-09. Falta acordar los destinos permitidos, si la transferencia es inmediata o requiere aceptación y quién conserva la responsabilidad mientras se decide.

</details>

### HU-03-08 · Dirigir solicitudes mediante reglas básicas

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones.

<details><summary>Criterios de la planificación revisados</summary>

El equipo puede recibir las solicitudes en la cola adecuada sin que un supervisor tenga que elegir el destino de cada una, cuando existe una regla configurada para ello. Por ejemplo, una categoría puede dirigir los casos a un equipo definido por el servicio.

**Para revisar con el equipo:**

- Solo se aplican reglas habilitadas y configuradas en EP-09, según los datos del ticket y el momento de aplicación que se acuerde.
- El destino debe estar habilitado y ser válido para el caso. Una regla no permite ignorar los controles de acceso o asignar a una persona no autorizada.
- La asignación conserva la regla que se utilizó, el resultado y la fecha para que el equipo pueda entender por qué llegó a ese destino.
- Si no hay coincidencia, el destino no está disponible o existen reglas incompatibles sin una precedencia definida, el caso queda visible para revisión autorizada. No se elige un destino arbitrario ni se informa un enrutamiento exitoso.
- Volver a procesar el mismo evento no genera reasignaciones ni entradas repetidas. Tampoco reemplaza una asignación manual posterior sin una regla expresa que lo permita.

Propuesta para la entrega 2. Se apoya en HU-03-02, HU-03-03, HU-03-09 y HU-03-10. EP-09 administra las reglas; esta historia las aplica. Falta acordar cuándo se ejecutan, su precedencia y el tratamiento de cambios de categoría o de configuración sobre tickets existentes. No incluye reparto inteligente ni asignación automática por menor carga.

</details>

### HU-03-09 · Consultar quién ha sido responsable del caso

**Dictamen:** Parcial. Reasignación e historial anterior/nuevo; faltan equipos, motivos, reglas y detección optimista completa.

**Evidencia:** backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El agente o supervisor autorizado puede revisar por qué equipos y agentes ha pasado un ticket y por qué se hicieron los cambios. Esto ayuda a retomar el trabajo y entender las decisiones de distribución sin reconstruirlas a partir de mensajes sueltos.

**Para revisar con el equipo:**

- La asignación inicial y cada toma, reasignación o transferencia confirmada aparecen en orden cronológico dentro del historial del caso.
- Cada registro identifica la responsabilidad anterior y la nueva cuando corresponda, la fecha y la persona o proceso que realizó la acción. Los cambios que requieren motivo lo conservan.
- Las asignaciones por reglas permiten reconocer la regla aplicada; las transferencias por escalamiento conservan la referencia correspondiente.
- Desactivar a un agente o equipo no elimina su referencia histórica. La responsabilidad actual se distingue de las anteriores.
- Cada persona consulta únicamente la información autorizada. Haber atendido el ticket en el pasado no garantiza acceso permanente a su contenido.

Propuesta para la entrega 1. Amplía el historial de HU-02-09 con los datos de distribución; no crea un historial independiente. Se relaciona con la consulta del responsable en HU-01-05 y aplica los permisos y la protección de EP-05 y EP-10.

</details>

### HU-03-10 · Mantener la comunicación dirigida a las personas correctas

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin equipos, colas, métricas de carga, reglas de enrutamiento o continuidad Telegram en backend/src/ y migraciones.

<details><summary>Criterios de la planificación revisados</summary>

Después de una asignación o transferencia, el solicitante puede continuar la atención con las personas que ahora tienen responsabilidad sobre el caso. El equipo evita que los nuevos mensajes se dirijan a alguien que ya no tiene permiso para recibirlos.

**Para revisar con el equipo:**

- Una asignación confirmada pone a disposición de EP-06 la responsabilidad vigente para actualizar los destinatarios autorizados del caso.
- Antes de enviar o reenviar contenido se comprueban los permisos y la vinculación vigente. Una identidad desvinculada o un agente que perdió acceso no recibe nuevos contenidos del ticket por haber sido responsable anteriormente.
- Cambiar al responsable no da al nuevo agente acceso a conversaciones anteriores de Telegram; el contexto del caso lo obtiene del historial del ticket conforme a sus permisos.
- Si el nuevo responsable no tiene una vinculación válida de Telegram o falla la actualización del canal, la asignación sigue siendo visible en el HelpDesk y se registra la incidencia para su recuperación. No se presenta el envío como completado ni se utiliza como sustituto a un destinatario sin permiso.
- Los mensajes pendientes se revisan según la responsabilidad y los permisos vigentes antes de enviarse. Los reintentos no deben producir avisos duplicados del mismo evento en un mismo canal.
- Los avisos de asignación o transferencia clasificados como relevantes se envían por aplicación y Telegram mediante EP-06, con seguimiento independiente de sus resultados.

Propuesta para la entrega 1 y para cualquier entrega que cambie responsables con Telegram integrado. EP-03 aporta el cambio de responsabilidad, EP-05 la identidad y los permisos, y EP-06 dirige los mensajes y gestiona los envíos y fallos. EP-10 protege la información. Falta acordar los destinatarios de cada evento y el tratamiento de conversaciones sin agente asignado o con transferencias pendientes.

</details>

### HU-04-01 · Determinar la prioridad de una solicitud

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

El agente o la persona autorizada puede indicar el impacto del problema y la urgencia de atenderlo. Con esos datos, el sistema determina la prioridad según los criterios del servicio, para que el equipo tenga una base común al decidir qué atender primero.

**Para revisar con el equipo:**

- Las opciones de impacto y urgencia incluyen una explicación que ayude a elegirlas de manera consistente. Sus valores y combinaciones provienen de la configuración aprobada.
- La prioridad resultante corresponde a la combinación seleccionada y queda visible para quienes tengan permiso de consultarla.
- Se conservan los datos utilizados, la regla aplicada, la fecha y la persona o proceso que realizó la evaluación.
- Si falta información o no existe una regla válida para la combinación, se indica que la prioridad está pendiente de determinar. No se asigna una prioridad por suposición ni se presenta el caso como correctamente evaluado.
- Evaluar la prioridad no cambia por sí solo el responsable ni el estado del ticket.

Propuesta para la entrega 1. EP-09 define los criterios y EP-05 controla quién puede evaluarlos. Falta acordar la matriz de impacto y urgencia, los nombres de las prioridades y quién realiza la evaluación inicial. La prioridad alimenta el SLA cuando así lo establezca la política del servicio.

</details>

### HU-04-02 · Ajustar la prioridad con una explicación

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

Si cambia la situación del problema o la evaluación inicial no refleja su importancia, el supervisor puede ajustar la prioridad explicando la razón. El equipo puede reconocer el cambio y entender cómo afecta los compromisos del caso.

**Para revisar con el equipo:**

- El ajuste requiere un motivo con contenido y lo realiza el supervisor. Se distingue entre corregir impacto o urgencia y aplicar una excepción a la prioridad calculada; el supervisor también concede las excepciones de tiempo de SLA.
- Se conservan la prioridad anterior, la nueva, el motivo, la fecha y quién hizo el cambio, junto con los datos de evaluación que correspondan.
- El efecto sobre el SLA se aplica según la política acordada. Se conserva el vencimiento anterior y se muestra el nuevo cuando haya un recálculo.
- Un cambio de prioridad no borra un incumplimiento previo ni reinicia el tiempo transcurrido por suposición.
- Si alguien ya modificó la prioridad mientras se revisaba el caso, se informa la situación y se pide revisar el dato vigente antes de reemplazarlo.

Propuesta para la entrega 2. Complementa HU-04-01, HU-04-03 y HU-04-10. EP-09 define el efecto del cambio y EP-06 entrega los avisos aplicables. El supervisor concede las excepciones; falta acordar cómo se calculan los tiempos al aumentar o disminuir la prioridad.

</details>

### HU-04-03 · Conocer las fechas límite de atención

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

El agente o supervisor puede consultar qué compromiso de primera respuesta y de resolución corresponde a un ticket y cuándo vence cada uno. Así puede organizar el trabajo con fechas comprensibles y conocer las reglas que explican esos tiempos.

**Para revisar con el equipo:**

- Se identifica la política de SLA aplicable al caso y se calculan por separado los vencimientos de primera respuesta y resolución.
- El cálculo utiliza el evento de inicio, los objetivos, la zona horaria, los horarios laborales y los días no laborables acordados. Fuera del horario aplicable solo se cuenta tiempo si la política así lo establece.
- Cuando corresponda, se incorporan las pausas válidas de HU-04-06. Las excepciones de tiempo las concede el supervisor y quedan justificadas en el historial de HU-04-10. Los ajustes y reaperturas se tratan según reglas expresas; la primera respuesta nunca se reinicia.
- Se conservan la política y el calendario utilizados para poder explicar el resultado, aunque la configuración cambie después.
- Si falta una política válida o hay reglas incompatibles sin una precedencia definida, se indica que el cálculo no está disponible y requiere revisión. No se muestra un vencimiento inventado ni un cumplimiento confirmado.
- Un cambio de equipo o agente no altera por sí solo el inicio del conteo ni elimina tiempo ya consumido.

Propuesta para la entrega 1. EP-09 aporta políticas y calendarios; EP-02 los eventos del caso. Falta definir los valores de SLA, su selección, el inicio de cada conteo y el efecto de cambios de configuración sobre tickets existentes.

</details>

### HU-04-04 · Reconocer la primera respuesta de atención

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

El equipo puede comprobar cuándo el ticket pasó por primera vez a En proceso. Ese primer cambio de estado acredita la primera respuesta de atención y se calcula a partir del historial de estados, sin depender de Telegram ni de una columna aparte.

**Para revisar con el equipo:**

- Se utiliza el primer cambio confirmado a En proceso del ticket, registrado mediante HU-02-01 y consultable en HU-02-09. El historial identifica quién lo hizo, el estado anterior, el nuevo y cuándo ocurrió.
- Se toma la fecha del cambio registrada en el historial, no la del procesamiento posterior. No se mantiene una columna independiente para acreditar la primera respuesta.
- Solo cuenta la primera vez: volver a otro estado y luego a En proceso, o reabrir el ticket, no reinicia esa primera respuesta.
- Las notificaciones automáticas, las notas internas y los mensajes de Telegram, incluidos sus reintentos, no cuentan. Un ticket sin cambio confirmado a En proceso no tiene una primera respuesta acreditada.
- La respuesta se compara con el vencimiento correspondiente. Si llegó tarde, se registra como realizada fuera de tiempo; atender después no elimina el atraso.
- Si se incorpora tarde un cambio válido al historial, se utiliza la fecha en que ocurrió y se conserva la explicación de cualquier corrección; no se confunde el orden de procesamiento con el de los hechos.

Propuesta para la entrega 1. Depende del registro y la consulta del historial de estados de HU-02-01 y HU-02-09, con identidades y permisos de EP-05; no depende de EP-06. Queda pendiente cómo se cuenta exactamente la primera vez en En proceso cuando el cambio lo hace alguien distinto del agente asignado.

</details>

### HU-04-05 · Conocer si la resolución cumplió el tiempo comprometido

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

Cuando el agente documenta la solución y resuelve el ticket, el equipo puede saber si lo hizo dentro del tiempo acordado. El resultado queda asociado al caso para revisar tanto las solicitudes atendidas a tiempo como aquellas que se resolvieron después del vencimiento.

**Para revisar con el equipo:**

- Se utiliza la resolución válida registrada mediante HU-02-05, con su fecha y referencia al caso; un comentario o una notificación no sustituyen ese evento.
- Se compara el tiempo de resolución con el compromiso aplicable, considerando el calendario y las pausas autorizadas.
- Un ticket que se resuelve después del vencimiento conserva el incumplimiento y la fecha real en que fue atendido.
- El cierre posterior no reemplaza la fecha de resolución. Una cancelación no se contabiliza automáticamente como resolución satisfactoria.
- Si el caso se reabre, se mantienen las resoluciones y resultados anteriores. El compromiso de la nueva atención sigue la política acordada y no borra el recorrido previo.

Propuesta para la entrega 1. Se relaciona con HU-04-03, HU-04-06, HU-02-05, HU-02-06 y HU-02-08. Falta acordar el tratamiento de cancelaciones y reaperturas y cómo se interpreta un evento ocurrido exactamente en el límite del compromiso.

</details>

### HU-04-06 · Pausar y reanudar los tiempos cuando corresponda

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

El equipo puede distinguir las esperas que detienen un compromiso de tiempo de aquellas en las que el conteo continúa. Esto permite explicar cuánto tiempo se consumió realmente según las reglas del servicio, sin tratar todas las esperas de la misma manera.

**Para revisar con el equipo:**

- Solo se pausa un compromiso cuando se cumplen las condiciones y permisos acordados. El estado «en espera» por sí solo no basta.
- Se registra el motivo, el inicio y el compromiso afectado: primera respuesta, resolución o ambos, según la política. También se identifica a la persona o proceso que aplicó la pausa.
- Al reanudar, se registra la fecha y la causa, se conserva el tiempo ya consumido y se actualiza el vencimiento conforme al calendario aplicable.
- Los períodos superpuestos o eventos repetidos no descuentan tiempo dos veces. Los tramos fuera del horario de servicio tampoco se vuelven a descontar como si hubieran sido tiempo laborable.
- Una pausa posterior a un incumplimiento no elimina el atraso que ya ocurrió.
- El equipo puede consultar si el conteo está activo o pausado y por qué, dentro de sus permisos.

Propuesta para la entrega 2, o para la primera si la política inicial admite pausas. Se coordina con la espera de HU-02-04 y utiliza las reglas de EP-09. Falta definir causas, permisos de las pausas ordinarias, eventos de reanudación y si se permite corregir una pausa, conservando siempre el registro de la corrección. Las excepciones de tiempo las concede el supervisor.

</details>

### HU-04-07 · Identificar solicitudes en riesgo o fuera de tiempo

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

El agente y el supervisor pueden reconocer los tickets que se acercan a su vencimiento y aquellos que ya incumplieron un compromiso. Así pueden intervenir con información concreta sobre qué plazo necesita atención.

**Para revisar con el equipo:**

- Se distinguen los compromisos de primera respuesta y resolución. Cumplir uno no implica que el otro también esté cumplido.
- Los avisos de proximidad se basan en los umbrales configurados; no se aplica un porcentaje o una cantidad de minutos sin acuerdo previo.
- La consulta permite identificar el ticket, el compromiso afectado, su vencimiento y la situación calculada, respetando el acceso de cada persona.
- El seguimiento detecta vencimientos aunque nadie abra el detalle del ticket. Si el conteo está pausado, se respeta la pausa válida y se mantiene visible su motivo.
- Si no hay datos suficientes para calcular, se muestra esa limitación en lugar de clasificar el caso como cumplido.
- Un compromiso completado deja de tratarse como pendiente de atender, pero su resultado de cumplimiento o atraso permanece disponible. Resolver tarde no borra el incumplimiento.

Propuesta para la entrega 1. Utiliza HU-04-03 a HU-04-06 y alimenta HU-04-08 y HU-04-09. Falta acordar los umbrales de riesgo y la frecuencia con la que debe actualizarse la detección. Los indicadores agregados del servicio corresponden a EP-08.

</details>

### HU-04-08 · Escalar un caso que necesita intervención

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

Cuando una solicitud alcanza una condición de riesgo o incumplimiento definida, el supervisor o nivel de atención correspondiente puede recibir el caso para intervenir. El escalamiento deja claro qué lo originó y qué acción se necesita, sin confundir una alerta con una transferencia ya realizada.

**Para revisar con el equipo:**

- Solo se activa un escalamiento cuando se cumple una regla habilitada. Se conserva el ticket, el compromiso afectado, la condición detectada, la regla y la fecha.
- El destino y la acción corresponden a la política: por ejemplo, avisar a un supervisor o solicitar una transferencia a otro nivel autorizado.
- Si hace falta cambiar la asignación, se utiliza EP-03. El escalamiento no presenta una transferencia como completada mientras esté pendiente o haya fallado.
- Si el destino no está disponible, se deja visible la incidencia para revisión y se mantiene identificable la responsabilidad actual. No se deriva a un destino arbitrario.
- Evaluar repetidamente la misma condición no crea escalamientos duplicados. Un nuevo nivel o recordatorio solo se activa si está previsto por una regla distinta o por las condiciones de repetición acordadas.
- Escalar no reinicia el SLA ni elimina un incumplimiento previo. Si el caso cambia antes de ejecutar una acción pendiente, se revisa si la acción todavía corresponde y se registra el resultado.

Propuesta para la entrega 2, o antes si la política inicial exige escalamiento. EP-09 configura las reglas, EP-03 ejecuta las transferencias y EP-06 entrega los avisos. Falta definir niveles, destinatarios, acciones, repetición y el tratamiento de escalamientos pendientes cuando el problema ya fue atendido.

</details>

### HU-04-09 · Recibir avisos de riesgo, incumplimiento y escalamiento

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

Las personas responsables pueden recibir los avisos relevantes de tiempo tanto en la aplicación como en Telegram. Cada aviso les permite reconocer el caso y el compromiso afectado para decidir la siguiente acción.

**Para revisar con el equipo:**

- El evento identifica el ticket, el tipo de situación, el compromiso afectado y la fecha, con la información necesaria y permitida para actuar.
- Los eventos clasificados como importantes o relevantes generan avisos en ambos canales mediante EP-06, para los destinatarios autorizados y vigentes.
- Se conserva la referencia al mismo evento en los dos canales. Tener una copia en la aplicación y otra en Telegram es el comportamiento esperado, no un duplicado indebido.
- Si falla Telegram o falta una vinculación válida, el aviso de la aplicación sigue disponible y se registra el envío pendiente o fallido para su recuperación. No se marca como entregado por ambos canales.
- Los reintentos no crean avisos repetidos del mismo evento en un mismo canal. Un recordatorio adicional necesita una regla que lo justifique.
- Recibir o leer un aviso no cuenta como primera respuesta del agente, no cambia el estado del ticket y no resuelve por sí solo el riesgo o incumplimiento.

Propuesta para la entrega 1. EP-04 origina los eventos y EP-06 administra su entrega y seguimiento, con identidades y permisos de EP-05. Se amplía la definición de destinatarios y eventos pendiente en D-08; no se presupone que todos los avisos se envíen al solicitante.

</details>

### HU-04-10 · Revisar cómo cambiaron la prioridad y los tiempos

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin prioridad, políticas SLA, cálculo, escalamiento o endpoints del módulo en backend/src/ y backend/db/migrations/.

<details><summary>Criterios de la planificación revisados</summary>

El agente, supervisor o responsable autorizado puede revisar qué prioridad y SLA tuvo una solicitud, qué pausas se aplicaron y por qué se registró un atraso. Esto permite explicar el resultado con datos del caso y no solo con su situación actual.

**Para revisar con el equipo:**

- El historial conserva las evaluaciones y ajustes de prioridad, políticas y calendarios aplicados, vencimientos, pausas, reanudaciones, respuestas, resoluciones, incumplimientos y escalamientos que correspondan al caso.
- Cada cambio identifica su fecha, la persona o proceso responsable y el motivo cuando aplique. Los recálculos mantienen el resultado anterior y explican el nuevo.
- Se pueden relacionar los resultados con los eventos que los sustentan, como el primer cambio a En proceso del historial de EP-02, la resolución o la transferencia solicitada por escalamiento.
- Cambiar una prioridad, política o calendario no reescribe silenciosamente la historia ni elimina un incumplimiento ocurrido bajo el compromiso anterior.
- Si se corrige un dato erróneo o se incorpora evidencia tardía válida, quedan visibles la corrección, su fundamento y el resultado anterior. No se confunde una corrección documentada con borrar antecedentes.
- La consulta respeta los permisos y no expone mensajes o archivos restringidos a quien solo puede ver datos de tiempos.

Propuesta para la entrega 1, ampliándose con los eventos de las siguientes entregas. Se integra con HU-02-09 y la protección de EP-10; EP-08 utiliza estos datos para sus indicadores. Falta acordar quién puede corregir datos y revisar esa información, junto con la retención ya pendiente en D-09.

</details>

### HU-05-01 · Habilitar una cuenta para un usuario

**Dictamen:** Parcial. Alta administrativa, rol y clave temporal de una sola visualización; vencimiento. Verificación externa y entrega segura por procedimiento por concretar.

**Evidencia:** backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El administrador autorizado puede habilitar a un usuario para utilizar el HelpDesk. La cuenta ordinaria queda asociada a una persona de la empresa y le permite comenzar a usar las funciones que se le hayan concedido; las cuentas temporales de auditoría siguen la excepción acordada en S0-08.

**Para revisar con el equipo:**

- El alta requiere identificar al usuario mediante los datos y la fuente de verificación que acuerde la empresa. No se habilitan cuentas mediante registro público.
- Se comprueba que los datos obligatorios estén completos y que el identificador de acceso no esté asociado a otra cuenta. Si el usuario ya tiene una cuenta, se informa para evitar duplicar su identidad.
- Los permisos iniciales siguen las reglas aprobadas. Dar de alta una cuenta no concede automáticamente funciones de agente, supervisor o administrador.
- El usuario recibe las indicaciones necesarias para su primer acceso mediante el procedimiento acordado, sin exponer credenciales en registros o mensajes sin protección.
- Se conserva quién o qué proceso realizó el alta y cuándo. Si la operación falla, no se presenta la cuenta como habilitada.
- El administrador puede indicar una fecha de vencimiento para cuentas temporales, por ejemplo de auditoría; al llegar esa fecha, la cuenta deja de poder iniciar sesión y sus sesiones abiertas se invalidan automáticamente.

Propuesta para la entrega 1. Se apoya en HU-05-05 y los controles de EP-10. El alta implementada exige nombre completo, correo único sin distinguir mayúsculas y uno de los cuatro roles; solo la realiza el administrador y genera una contraseña temporal que se muestra una vez. La validación externa de la pertenencia a la empresa sigue siendo un procedimiento administrativo.

</details>

### HU-05-02 · Mantener actualizados los datos del usuario

**Dictamen:** Parcial. Edición conserva ID y valida campos; no hay versión optimista ni historial de nombres.

**Evidencia:** backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El administrador autorizado puede corregir o actualizar los datos de una cuenta para que el HelpDesk refleje la información vigente del usuario. La persona sigue siendo la misma en los tickets y actividades que ya había registrado.

**Para revisar con el equipo:**

- Solo se pueden modificar los campos permitidos y se validan los datos obligatorios y los identificadores que deban ser únicos.
- La actualización conserva la identidad interna de la cuenta y las referencias de sus solicitudes, actividades y decisiones anteriores.
- Cambiar datos de contacto o presentación no concede nuevos roles, cambia equipos ni vincula una identidad de Telegram por coincidencia de nombre.
- En la implementación actual el administrador edita nombre, rol, vencimiento y notas. El correo es inmutable; no hay autoedición de perfil.
- Se registra quién o qué proceso hizo el cambio y cuándo. Si otra persona ya actualizó los datos, se pide revisar la versión vigente antes de reemplazarla.

Propuesta para la entrega 1. Los cambios de roles, equipos y Telegram se realizan mediante sus historias específicas. Los campos editables actuales son los indicados arriba. No hay historial de nombres ni control de versiones optimista: la detección de una edición concurrente descrita como criterio objetivo sigue pendiente.

</details>

### HU-05-03 · Entrar al HelpDesk y cerrar la sesión

**Dictamen:** Implementada en código; integración por revalidar. Login/logout, revocación, vigencia y guardas conectados. Falta repetir la integración con PostgreSQL en este entorno.

**Evidencia:** backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El usuario puede identificarse para entrar al HelpDesk y encontrar las funciones que tiene autorizadas. Al terminar, puede cerrar su sesión para evitar que otra persona continúe utilizándola en ese dispositivo.

**Para revisar con el equipo:**

- El acceso utiliza el mecanismo de autenticación acordado y requiere una cuenta habilitada. Identificarse correctamente no habilita una cuenta desactivada.
- Después del acceso se muestran las funciones permitidas para el usuario. Las consultas y operaciones vuelven a comprobar sus permisos vigentes.
- Si la autenticación falla, se presenta una indicación comprensible sin revelar información innecesaria sobre otras cuentas.
- Al cerrar sesión, esa sesión deja de permitir nuevas consultas u operaciones protegidas. Volver a una dirección guardada no recupera el acceso sin autenticarse de nuevo.
- Una sesión vencida exige volver a identificarse. El portal no presenta una operación como guardada si no pudo completarse por falta de sesión válida.

Propuesta para la entrega 1. EP-10 establece la protección de credenciales y sesiones. El acceso implementado es correo y contraseña local, con cookie HttpOnly y token opaco cuyo hash se guarda en PostgreSQL. Por defecto vence tras 30 minutos de inactividad u 8 horas absolutas, configurables. Logout revoca la sesión y borra la cookie.

</details>

### HU-05-04 · Recuperar el acceso a la cuenta

**Dictamen:** Parcial. Solicitud genérica SMTP y reset administrativo; identidad se verifica fuera del sistema, procedimiento y entrega real no acreditados.

**Evidencia:** backend/src/auth/recovery/; backend/src/mail/; backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts

<details><summary>Criterios de la planificación revisados</summary>

Si un usuario no puede entrar, puede seguir un procedimiento claro para recuperar el acceso a su propia cuenta. El proceso comprueba su identidad antes de permitir cualquier cambio que le devuelva el acceso.

**Para revisar con el equipo:**

- La recuperación implementada recibe un correo y responde genéricamente. Para una cuenta activa y no vencida avisa por SMTP al administrador, quien comprueba la identidad y restablece o desbloquea desde Usuarios.
- No basta con conocer el nombre o identificador de otra persona para recuperar su cuenta. Se exige la verificación acordada.
- No hay enlaces ni códigos de recuperación. Restablecer revoca todas las sesiones y genera una contraseña temporal que obliga a cambiarla. Se muestra una vez al administrador y se entrega por otro medio, nunca por correo.
- Recuperar el acceso no reactiva una cuenta deshabilitada ni concede roles o permisos nuevos.
- Si no puede completar la verificación, se indica el procedimiento de asistencia autorizado, sin omitir la comprobación de identidad.

Propuesta para la entrega 1. Se coordina con EP-10 y HU-05-03. El administrador presta asistencia y verifica la identidad mediante el procedimiento externo autorizado, aún por concretar. La solicitud no modifica cuentas ni sesiones; el reset revoca todas las sesiones y el desbloqueo solo limpia fallos y bloqueo.

</details>

### HU-05-05 · Asignar y ajustar roles según la responsabilidad del usuario

**Dictamen:** Parcial. Un rol vigente, protección del último administrador y revocaciones; falta motivo obligatorio de cambio de rol.

**Evidencia:** backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El administrador con permiso puede asignar o cambiar el rol que necesita un usuario para realizar su trabajo. Cada usuario tiene un solo rol vigente; no se combinan roles simultáneamente.

**Para revisar con el equipo:**

- Se asigna exactamente uno de los roles de solicitante, agente de soporte, supervisor o administrador.
- Antes de guardar, se comprueba que quien hace el cambio tenga permiso para conceder o retirar esos roles. Tener acceso a la administración no permite ampliar sus propios privilegios sin autorización.
- Se registra el rol anterior, el nuevo, la persona que lo modificó, la fecha y el motivo del cambio.
- Los permisos resultantes se aplican también a las siguientes operaciones de una sesión ya abierta. Una pantalla que quedó abierta no conserva una autorización retirada.
- En el núcleo actual agente, supervisor y administrador leen todos los tickets; el solicitante solo los propios. No existen mensajes o archivos del ticket implementados.

Propuesta para la entrega 1. Se complementa con HU-05-06 y HU-05-07 y la auditoría de EP-10. El rol único ya está acordado. La matriz del núcleo está implementada: solo el administrador gestiona cuentas y categorías; no puede cambiar su propio rol ni retirar al último administrador activo sin vencimiento. Los permisos de funcionalidades futuras siguen pendientes.

</details>

### HU-05-06 · Asociar agentes y supervisores con equipos y niveles de soporte

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin modelos/rutas de equipos ni vinculación de identidad Telegram.

<details><summary>Criterios de la planificación revisados</summary>

El administrador autorizado puede indicar en qué equipos y niveles participa un agente o supervisor. Así el sistema puede mostrarle el trabajo que le corresponde y permitir asignaciones coherentes con su función.

**Para revisar con el equipo:**

- Se seleccionan equipos y niveles habilitados en EP-09 y se comprueba que la asociación sea válida para el rol del usuario.
- Las asociaciones determinan el alcance que corresponda según las reglas de acceso; pertenecer a un equipo no concede automáticamente todas las acciones sobre sus tickets.
- Se conserva el cambio de pertenencia, con su fecha, autor y motivo. Las participaciones anteriores siguen identificables cuando sean necesarias para la trazabilidad.
- Al retirar una asociación, se revisan los accesos vigentes y se identifican los tickets cuya responsabilidad necesita atención. No se transfieren silenciosamente a otro agente.
- La redistribución de los casos pendientes se realiza mediante EP-03. El cambio de equipo no borra el historial del usuario ni le garantiza acceso permanente a los casos anteriores.

Propuesta para la entrega 1. Se relaciona con HU-03-01, HU-03-03, HU-03-06 y HU-03-07. Falta acordar si una persona puede pertenecer a varios equipos o niveles y qué ocurre con sus asignaciones al retirarla de uno de ellos, en coordinación con D-20.

</details>

### HU-05-07 · Acceder únicamente a las funciones y datos autorizados

**Dictamen:** Parcial. Autorización en servidor y guardas para el núcleo; faltan módulos futuros para completar la matriz de acceso.

**Evidencia:** backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts; backend/src/tickets/{routes,service,repository,operations,policy,activity}.ts; frontend/src/app/core/tickets/tickets-api.ts; frontend/src/app/features/tickets/; backend/test/integration/tickets.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El usuario puede consultar y utilizar lo que le corresponde según su rol, equipos y relación con cada caso. Esto le permite trabajar sin acceder a información de otras personas que no necesita conocer.

**Para revisar con el equipo:**

- Las reglas distinguen entre ver información y realizar acciones. Poder consultar un ticket no permite necesariamente asignarlo, cambiar su prioridad, cancelarlo o modificar sus datos.
- En «Mis solicitudes» el solicitante consulta sus propios casos. El acceso operativo a otros tickets depende de permisos específicos; lo mismo ocurre con reportes, artículos y configuración.
- Las restricciones se aplican también a archivos, búsquedas, cantidades, exportaciones y accesos mediante enlaces directos. No basta con ocultar botones o registros en pantalla.
- Las notas internas y sus archivos permanecen restringidos al personal autorizado. Un cambio de rol no debe exponerlas a un solicitante sin permiso para ese contenido.
- Se comprueba la autorización vigente al consultar o modificar información y antes de registrar o reenviar contenido mediante la integración. Una asignación anterior o una vinculación de Telegram no sustituyen ese permiso.
- Si se retira un rol, una asociación o un permiso, las siguientes operaciones respetan el cambio y no continúan usando el acceso anterior por una sesión o enlace conservado.

Propuesta para la entrega 1 y requisito de todas las funciones del proyecto. EP-05 define las autorizaciones y EP-10 sus controles técnicos; cada módulo las aplica. La matriz del núcleo permite crear tickets propios a todos los roles y consultar todos a agente, supervisor y administrador; la matriz de módulos futuros sigue pendiente.

</details>

### HU-05-08 · Desactivar una cuenta sin perder su historia

**Dictamen:** Parcial. Baja revoca sesiones y conserva referencias; integración Telegram y motivo de baja pendientes.

**Evidencia:** backend/src/users/{routes,service,validation}.ts; frontend/src/app/features/usuarios/; backend/test/integration/users-and-categories.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El administrador autorizado puede retirar el acceso de un usuario cuando ya no debe utilizar el HelpDesk. Los tickets y actividades en los que participó se conservan para que el equipo pueda entender quién hizo cada acción y continuar la atención pendiente.

**Para revisar con el equipo:**

- La desactivación requiere permiso y conserva la fecha, el motivo y quién la realizó.
- Desde que se confirma, la cuenta no puede iniciar sesión ni ejecutar nuevas operaciones protegidas mediante sesiones que ya estuvieran abiertas.
- La integración deja de aceptar acciones de esa cuenta y de enviar nuevos contenidos a su identidad de Telegram. Los envíos pendientes se revisan antes de entregarse y no se consideran completados si el destinatario dejó de estar habilitado.
- Los tickets y actividades conservan la referencia al usuario desactivado. La desactivación no elimina sus registros ni cambia su autoría.
- Los casos que tenía asignados quedan identificables para su revisión y redistribución mediante EP-03. No se presentan como resueltos ni se borran por desactivar la cuenta.
- Si falla la desactivación, se comunica el resultado real y no se confirma una revocación que no se aplicó.

Propuesta para la entrega 1, incluyendo la integración en cuanto esté disponible. Se coordina con HU-03-06, HU-03-09, HU-03-10, EP-06 y EP-10. Falta acordar quién autoriza bajas, cómo se revisan las asignaciones pendientes y si habrá reactivación; de habilitarse, deberá definirse qué accesos se vuelven a conceder sin restaurarlos por suposición.

</details>

### HU-05-09 · Vincular una identidad de Telegram de forma verificable

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin modelos/rutas de equipos ni vinculación de identidad Telegram.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante o el agente puede conectar su identidad de Telegram con su cuenta del HelpDesk para conversar sobre sus solicitudes y recibir avisos. El proceso confirma que esa identidad le corresponde antes de utilizarla en la atención.

**Para revisar con el equipo:**

- La vinculación requiere una cuenta del HelpDesk habilitada y un procedimiento que compruebe el control de la identidad de Telegram. Escribir un nombre de usuario o un teléfono no basta como verificación.
- La integración utiliza una referencia estable de identidad, sin depender solo del nombre visible que pueda cambiar.
- No se permite que una identidad ya vinculada a otro usuario se reasocie silenciosamente. El conflicto debe resolverse mediante el procedimiento autorizado, sin revelar datos innecesarios de la otra cuenta.
- Hasta completar la verificación, la vinculación se muestra como pendiente y no habilita conversación ni envíos como si ya fuera válida.
- Una vinculación confirmada permite utilizar EP-06 únicamente dentro de los permisos del usuario sobre cada caso. No concede nuevos roles ni acceso a tickets ajenos.
- Se conserva cuándo se confirmó la vinculación y la evidencia necesaria para revisarla, sin guardar secretos o códigos de verificación en el historial visible de los tickets.

Propuesta para la entrega 2, o para cualquier entrega anterior que use Telegram. Habilita HU-01-07 y la comunicación prevista en EP-06. EP-10 protege el proceso. Falta definir el mecanismo de verificación, quién puede iniciarlo y la relación permitida entre cuentas del HelpDesk e identidades de Telegram.

</details>

### HU-05-10 · Cambiar o retirar la vinculación con Telegram

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin modelos/rutas de equipos ni vinculación de identidad Telegram.

<details><summary>Criterios de la planificación revisados</summary>

Si el solicitante o el agente cambia de cuenta de Telegram o deja de querer utilizar la vinculada, puede seguir un procedimiento controlado para actualizarla o retirarla. El HelpDesk evita seguir enviando información a una identidad que ya no está autorizada.

**Para revisar con el equipo:**

- El cambio o la desvinculación requieren verificar la identidad y los permisos de quien los solicita. El administrador solo puede intervenir dentro del procedimiento que la empresa autorice.
- Una nueva identidad debe completar la verificación de HU-05-09 antes de quedar habilitada. La anterior deja de tener acceso desde que se confirma su revocación; no se habilitan dos identidades por accidente durante el cambio.
- Antes de aceptar un mensaje o realizar un envío pendiente, EP-06 comprueba la vinculación vigente. Una identidad desvinculada no puede continuar actuando en nombre del usuario ni recibir nuevos contenidos por un reintento.
- Si el usuario queda sin una vinculación válida, puede seguir usando el portal según sus permisos. Los avisos de la aplicación se mantienen y la falta de entrega por Telegram se registra como incidencia, no como envío completado.
- Se conservan fecha, responsable y motivo de la modificación. El resultado informa qué vinculación quedó vigente y cuáles fueron retiradas, sin exponer secretos.

Propuesta para la entrega 2 y parte necesaria de cualquier uso de Telegram. Se coordina con HU-03-10 y EP-06 para los destinatarios y envíos, y con EP-10 para revocación y auditoría. Falta acordar el tratamiento de envíos pendientes hacia una identidad anterior y cómo se verifica al usuario si perdió el acceso a esa cuenta.

</details>

### HU-06-01 · Identificar el ticket de cada conversación

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante o el agente puede reconocer a qué solicitud corresponde una conversación y confirmar el caso cuando no esté claro. Así evita que una explicación o un archivo termine en otro ticket cuando tiene varias solicitudes abiertas.

**Para revisar con el equipo:**

- Al continuar desde HU-01-07, la integración conserva una referencia clara al ticket seleccionado y comprueba el acceso de la persona.
- Si un intercambio no permite identificar el caso con certeza, se pide seleccionar o confirmar un ticket autorizado antes de dirigirlo a otra persona.
- No se elige automáticamente el último ticket usado ni se supone que un caso es el correcto solo porque esté abierto.
- La selección no revela títulos, identificadores ni contenido de tickets sin permiso. Conocer un número de ticket tampoco habilita la conversación sobre él.
- Si no hay un caso válido al que asociar el mensaje, se orienta al solicitante para consultar o registrar su solicitud en el portal. No se crea un ticket desde Telegram.

Propuesta para la entrega 1. Utiliza las identidades y permisos de EP-05. Falta acordar el mecanismo de selección, cómo se mantiene el contexto entre mensajes y qué ocurre con el contenido recibido mientras se espera una aclaración.

</details>

### HU-06-02 · Enviar información del solicitante a soporte

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede escribir por Telegram al equipo que atiende su ticket para explicar mejor el problema o responder una pregunta. El mensaje llega a quienes pueden atender el caso, identificando la solicitud correspondiente.

**Para revisar con el equipo:**

- Se requiere una identidad vinculada y habilitada, acceso al ticket y un origen de comunicación validado por la integración.
- El mensaje se relaciona con el caso mediante HU-06-01 y se dirige según la responsabilidad y los permisos vigentes de HU-06-07.
- Un mensaje sin contenido útil no se presenta como información de atención; los archivos se tratan según HU-06-04 cuando esa capacidad esté habilitada.
- Se distingue entre haber recibido el mensaje en la integración y haberlo enviado al destinatario. Una recepción no se presenta como lectura o respuesta del agente.
- Si falta un agente o no se puede completar el envío, se muestra la situación del envío para su tratamiento; no se dirige a una persona elegida por suposición.
- Escribir un mensaje no modifica automáticamente el estado, la prioridad o el responsable del ticket.

Propuesta para la entrega 1. Complementa la solicitud de información de HU-02-03 y necesita HU-06-07, HU-06-09 y HU-06-10. Falta acordar qué estados permiten conversar y cómo se atienden mensajes de casos sin agente asignado.

</details>

### HU-06-03 · Responder al solicitante desde Telegram

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El agente puede responder por Telegram a un solicitante para orientarlo, pedir aclaraciones o explicar una acción de soporte. La respuesta se identifica con el caso para llegar al solicitante correcto.

**Para revisar con el equipo:**

- El agente debe estar vinculado, habilitado y autorizado para atender el caso. Ser agente de soporte no basta para responder en cualquier ticket.
- Antes de dirigir la respuesta, se confirma el ticket y se comprueba la identidad vigente del solicitante. No se usa una vinculación retirada ni un destinatario anterior por conservar un mensaje pendiente.
- La integración identifica al agente autor y la fecha del envío para distinguir la respuesta de un aviso automático; no conserva el contenido del mensaje.
- El resultado visible distingue el procesamiento, el envío y los fallos según la evidencia disponible. Un envío aceptado no se anuncia como leído.
- Los reintentos de la misma respuesta no generan envíos duplicados ni se cuentan como respuestas adicionales de atención.
- Comunicar una solución por Telegram no marca por sí solo el ticket como resuelto. La resolución se registra mediante HU-02-05.

Propuesta para la entrega 1. Se relaciona con HU-06-07, HU-06-09 y HU-06-10. No acredita la primera respuesta de HU-04-04, que se obtiene del historial de estados de EP-02. El mecanismo de conversación debe permitir esta dirección además de los mensajes del solicitante.

</details>

### HU-06-04 · Compartir archivos durante la atención

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante y el agente pueden compartir archivos por Telegram cuando ayudan a comprender o resolver el caso, como una captura del problema o una instrucción permitida. Los archivos se reenvían a la otra persona sin guardarse en el ticket.

**Para revisar con el equipo:**

- Los archivos pasan las validaciones acordadas de tipo, tamaño, cantidad y protección antes de reenviarse. Si se rechazan, se explica el motivo que pueda comunicarse.
- Cada archivo aceptado se dirige al caso y a los destinatarios correctos según su autor; no se asocia solo por su nombre de archivo.
- Un enlace directo a un archivo compartido tampoco permite abrirlo o descargarlo sin autorización.
- Los archivos de notas internas o de contenido restringido no se publican en Telegram por incluirlos en una conversación o notificación.
- Si una carga o descarga falla, se identifica el archivo afectado y no se presenta como disponible. Un reintento no crea copias indebidas del mismo adjunto.

Propuesta para la entrega 2, o desde que se acepten archivos por Telegram. Complementa los adjuntos del registro de HU-01-02, con un origen diferente. EP-10 aplica los controles. Falta acordar límites y el tratamiento del mensaje cuando uno de sus archivos falla.

</details>

### HU-06-06 · Registrar notas internas para el equipo de soporte

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El agente o supervisor autorizado puede dejar una nota dentro del HelpDesk para compartir contexto de trabajo con otros integrantes autorizados de soporte. Esto permite comentar detalles de la atención que deben permanecer dentro del equipo.

**Para revisar con el equipo:**

- La nota queda asociada al ticket con su autor y fecha, y requiere contenido. Sus archivos, si se habilitan, siguen los controles de protección y permisos.
- Solo el personal con permiso sobre las notas internas del caso puede escribirlas o consultarlas. Tener el rol de soporte no concede acceso a todas las notas de todos los tickets.
- El solicitante sin ese permiso no ve la nota, su contenido en búsquedas, sus adjuntos ni vistas previas, incluso mediante un enlace directo.
- Las notas internas permanecen en el HelpDesk y no se publican en Telegram ni se incluyen como contenido de avisos enviados al solicitante.
- Registrar una nota no cuenta como respuesta al solicitante ni cambia automáticamente el estado, el responsable o la prioridad del ticket.
- La consulta se integra al historial autorizado del ticket, manteniendo clara la diferencia entre nota interna y conversación de atención, que no forma parte del historial.

Propuesta para la entrega 2, o desde que soporte utilice notas internas. Se relaciona con HU-02-02, HU-02-09 y HU-05-07. Falta acordar quién puede corregir notas, si se aceptan adjuntos y cómo se conserva la trazabilidad de sus modificaciones.

</details>

### HU-06-07 · Dirigir la comunicación a destinatarios autorizados

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante o el agente puede confiar en que sus mensajes y avisos se dirigen a las personas que corresponden al caso en ese momento. La integración considera el evento, la relación con el ticket y los permisos actuales, incluso si la responsabilidad cambió después de preparar el envío.

**Para revisar con el equipo:**

- Los destinatarios se determinan según el tipo de intercambio o evento y las reglas configuradas, sin asumir que todos los agentes, supervisores o administradores deben recibirlo.
- Antes de reenviar contenido se comprueban permisos y vinculaciones vigentes. Las cuentas desactivadas y las identidades desvinculadas no reciben nuevos contenidos.
- Una asignación o transferencia actualiza el destino de la comunicación conforme a HU-03-10. Haber sido responsable anteriormente no garantiza seguir recibiendo mensajes.
- Los mensajes pendientes se vuelven a evaluar antes de enviarse. Si cambiaron los destinatarios, se aplica el tratamiento acordado sin reenviar por defecto a la persona anterior.
- Cada destinatario recibe únicamente la información necesaria y autorizada. Una plantilla o vista previa no puede exponer notas internas ni archivos restringidos.
- Si no existe un destinatario válido, se registra la incidencia para revisión. No se elige una cuenta alternativa sin autorización.

Propuesta para la entrega 1. Aplica las reglas de EP-09, las identidades de EP-05 y la responsabilidad de EP-03. Retoma D-08 y D-39 sobre destinatarios y envíos pendientes; el acceso a los registros operativos tampoco concede permiso para leer el contenido restringido.

</details>

### HU-06-08 · Recibir los avisos relevantes en la aplicación y en Telegram

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante, agente o supervisor autorizado puede enterarse de los eventos que necesitan su atención tanto desde el HelpDesk como desde Telegram. Cada aviso identifica el caso y explica qué ocurrió para que la persona sepa dónde continuar.

**Para revisar con el equipo:**

- Se notifican los eventos incluidos en el catálogo aprobado, como registro, asignación, respuesta que requiere atención, cambio de estado, resolución, riesgo o escalamiento, según sus destinatarios definidos.
- Cada evento importante o relevante genera una notificación en la aplicación y otra por Telegram para el destinatario autorizado. Ambas conservan la referencia al mismo evento y ticket.
- El contenido utiliza las plantillas aprobadas y respeta los permisos. El acceso al ticket desde un aviso vuelve a comprobar la autorización actual.
- Los avisos de la aplicación pueden consultarse aunque Telegram esté caído o el solicitante, agente o supervisor destinatario no tenga una vinculación válida. El problema de ese canal queda pendiente o fallido, no completado.
- Recibir un mensaje de conversación no sustituye por suposición la notificación de un evento relevante. Se acuerda qué respuestas generan avisos para evitar mensajes redundantes sin omitir los dos canales requeridos.
- La notificación no cambia el ticket ni cuenta como respuesta de atención del agente. Tampoco genera nuevos avisos de sí misma en un ciclo repetido.

Propuesta para la entrega 1. Recibe los eventos de EP-01 a EP-04 y utiliza HU-06-07, HU-06-09 y HU-06-10. EP-09 administra el catálogo y las plantillas. Falta concretar los eventos y destinatarios, incluyendo cuándo una respuesta necesita un aviso adicional.

</details>

### HU-06-09 · Consultar qué ocurrió con cada envío

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

El personal autorizado puede revisar si un mensaje o aviso sigue pendiente, fue aceptado por el canal o tuvo un fallo. Esto le permite atender incidencias sin confundir la existencia de un aviso con que el solicitante, agente o supervisor destinatario lo haya leído.

**Para revisar con el equipo:**

- Los mensajes de conversación muestran solo su estado de procesamiento y envío por Telegram, sin su contenido. Las notificaciones muestran resultados separados para la aplicación y Telegram, por destinatario.
- Se conservan las fechas, los intentos, el resultado y una explicación útil del fallo, con referencia al intercambio o evento original.
- Los nombres de los estados reflejan la evidencia disponible. Un envío aceptado por el canal no se presenta como entrega o lectura confirmada si no existe esa evidencia.
- Si solo un canal completó su parte, se distingue del que sigue pendiente o falló. La falta de una vinculación válida se identifica como incidencia de Telegram.
- La consulta protege datos personales, contenido restringido y credenciales. Tener permiso para supervisar fallos no habilita la lectura completa de cualquier ticket.
- Si el resultado de un intento es incierto, se indica esa incertidumbre para su tratamiento; no se marca como éxito ni se presupone un fallo seguro.

Propuesta para la entrega 1. Se relaciona con los avisos de HU-04-09; sus resultados de envío no acreditan la primera respuesta de HU-04-04. EP-10 protege los registros y EP-09 define los parámetros operativos. Falta acordar los estados de procesamiento y quién puede revisar cada nivel de detalle.

</details>

### HU-06-10 · Recuperar envíos pendientes sin repetir contenido

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** backend/src/integrations/telegram/ es POC independiente en memoria, sin usuarios/tickets ni notificaciones de aplicación.

<details><summary>Criterios de la planificación revisados</summary>

Cuando un mensaje o aviso no puede completarse, el personal autorizado puede dar seguimiento a su recuperación. La integración permite reintentarlo según las reglas acordadas, conservando lo que ya se completó y evitando duplicados por reprocesamiento.

**Para revisar con el equipo:**

- Los reintentos mantienen la referencia al mismo intercambio o evento y registran cada intento con su resultado. La política distingue fallos recuperables de situaciones que necesitan intervención.
- Antes de reintentar, se comprueban de nuevo el ticket, los permisos, la vinculación y los destinatarios vigentes. Un cambio de cuenta o responsable no deja habilitado al destinatario anterior.
- En una notificación, se recupera el canal o destinatario pendiente sin repetir por defecto el que ya completó el envío. Las copias requeridas en aplicación y Telegram no son duplicados indebidos.
- Reprocesar un mensaje no lo duplica ni lo cuenta como una nueva respuesta del agente.
- Si no se conoce el resultado de un intento anterior, se verifica la evidencia disponible y se aplica el procedimiento acordado antes de repetirlo. No se garantiza una entrega sin duplicados cuando el canal no permite comprobarla; la incertidumbre queda visible para resolverla.
- Agotar los intentos no elimina la incidencia ni la presenta como completada. Se conserva el motivo y se deja disponible el procedimiento de recuperación autorizado.
- El fallo de Telegram no elimina las notificaciones ya disponibles en la aplicación.

Propuesta para la entrega 1. Se apoya en HU-06-07 y HU-06-09. EP-09 configura intervalos y límites; EP-10 contempla la recuperación de pendientes tras una restauración. Falta definir reintentos automáticos, intervención manual, tratamiento de avisos que dejaron de ser pertinentes y resolución de resultados inciertos.

</details>

### HU-07-01 · Buscar artículos que ayuden a resolver una duda

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede buscar en la base de conocimiento por título, categoría o palabras clave para encontrar una respuesta relacionada con su problema. Así puede orientarse sin depender siempre de una consulta a soporte.

**Para revisar con el equipo:**

- La búsqueda habitual del solicitante devuelve artículos publicados que tenga permiso de consultar. No muestra borradores, contenido retirado ni artículos restringidos fuera de su alcance.
- Se pueden combinar los criterios acordados y abrir un resultado para leer su contenido. Cada resultado identifica el artículo y su categoría de forma comprensible.
- Los títulos, resúmenes, sugerencias y cantidades mostradas respetan los mismos permisos; no revelan la existencia o contenido de artículos restringidos mediante la búsqueda.
- Si no hay coincidencias, se informa y se permite cambiar o limpiar los criterios. La ausencia de resultados no impide registrar una solicitud de soporte.
- Al retirar un artículo o reducir su visibilidad, deja de aparecer en las consultas de quienes ya no pueden verlo.

Propuesta para la entrega 1. Se relaciona con HU-07-02 y HU-07-06. Falta acordar las categorías, el alcance de la búsqueda por palabras clave, los filtros concretos y el orden de los resultados, sin presuponer búsqueda inteligente.

</details>

### HU-07-02 · Consultar instrucciones y soluciones publicadas

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede abrir un artículo y leer una explicación que le ayude a resolver su duda. El contenido presenta el problema al que aplica y las instrucciones o respuestas necesarias para entender qué puede hacer.

**Para revisar con el equipo:**

- Se muestra la versión publicada y autorizada del artículo, con título, contenido, categoría y fecha de actualización. La identificación visible del responsable sigue los permisos acordados.
- Las instrucciones permiten reconocer a qué situación aplican; un artículo no debe presentarse como respuesta válida para cualquier problema parecido.
- El acceso vuelve a comprobarse al abrir un enlace directo o uno compartido desde un ticket. Un enlace no evita las restricciones del artículo.
- Si el artículo fue retirado o ya no está disponible para el solicitante, se informa sin exponer su contenido restringido o presentar instrucciones obsoletas como vigentes.
- Leer el artículo no crea un ticket, no cambia el estado de uno existente y no cuenta como confirmación de que el problema quedó resuelto.

Propuesta para la entrega 1. Aplica HU-05-07 y los controles de EP-10. La consulta puede apoyar al solicitante antes o durante una solicitud de EP-01, sin obligarlo a completar pasos de autoservicio para pedir ayuda.

</details>

### HU-07-03 · Crear y clasificar un borrador de artículo

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

El agente autorizado puede preparar un artículo con instrucciones, una solución o preguntas frecuentes para que el conocimiento del equipo pueda reutilizarse. Mientras trabaja, el contenido permanece como borrador y no se confunde con información aprobada para los solicitantes.

**Para revisar con el equipo:**

- Se propone registrar título, contenido y categoría, con palabras clave cuando ayuden a encontrarlo. Los campos obligatorios se validan antes de guardar y no aceptan solo espacios.
- El borrador conserva su autor y fechas de creación y modificación. Puede retomarse para continuar la redacción sin publicarlo.
- La categoría debe estar habilitada para su uso. Su elección organiza el contenido, pero no concede permisos de lectura por sí sola.
- Solo las personas autorizadas pueden consultar o editar el borrador. No aparece en la búsqueda habitual de artículos publicados.
- Si otra persona ya modificó el contenido, se informa y se pide revisar la versión vigente antes de reemplazarla. Un fallo al guardar no se presenta como un borrador guardado correctamente.

Propuesta para la entrega 1. Se relaciona con HU-07-04 y HU-07-06. Falta acordar campos obligatorios, categorías, palabras clave y quién puede colaborar en la edición; no se incluyen ediciones simultáneas en tiempo real por defecto.

</details>

### HU-07-04 · Revisar un artículo antes de publicarlo

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

El supervisor puede comprobar que un artículo sea claro, correcto y apropiado para sus destinatarios. Si necesita cambios, puede explicar qué debe corregirse para que el autor lo prepare antes de publicarlo.

**Para revisar con el equipo:**

- Se identifica el contenido enviado a revisión y la persona responsable de revisarlo, según el procedimiento acordado.
- La revisión considera la claridad de las instrucciones, su vigencia, la audiencia y la ausencia de información personal o sensible que no deba publicarse.
- La decisión queda registrada con responsable y fecha. Si se devuelve para corrección, se conserva una explicación útil para el autor.
- La aprobación corresponde al contenido revisado. Modificarlo después no permite presentar los cambios como aprobados sin aplicar las reglas de revisión acordadas.
- La aprobación del supervisor no publica el artículo automáticamente; la publicación corresponde al administrador.

Propuesta para la entrega 1. Se apoya en HU-07-03 y HU-07-05. Revisa el supervisor y publica el administrador. Falta acordar las condiciones de aprobación y cómo participa el autor en las correcciones.

</details>

### HU-07-05 · Publicar un artículo aprobado

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

El administrador puede poner un artículo revisado por el supervisor a disposición de sus destinatarios. El equipo sabe qué contenido quedó publicado y los solicitantes pueden encontrarlo sin acceder a borradores todavía pendientes de revisión.

**Para revisar con el equipo:**

- Antes de publicar se comprueba que el contenido cumple las condiciones de revisión y que la persona tiene permiso para publicarlo con la visibilidad elegida.
- La publicación conserva la fecha, quién la realizó y la versión del contenido que quedó disponible.
- El artículo aparece en las consultas de su audiencia autorizada, manteniendo restringidos los borradores, comentarios de revisión y contenidos internos que no formen parte de la publicación.
- Si el contenido aprobado cambió o falta una condición, se explica el impedimento y no se publica como si ya estuviera revisado.
- Si la publicación falla, se conserva el estado anterior y no se anuncia el artículo como disponible.

Propuesta para la entrega 1. Depende de HU-07-04 y HU-07-06. La publicación no genera por defecto un aviso a toda la empresa; si el equipo la incorpora al catálogo de eventos relevantes, sus avisos se gestionan mediante EP-06 y EP-09.

</details>

### HU-07-06 · Definir quién puede consultar un artículo

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

La persona autorizada puede indicar si un artículo está dirigido a los solicitantes en general o si contiene información reservada al soporte autorizado. Así cada lector encuentra contenido adecuado para su función sin que se divulguen instrucciones internas restringidas.

**Para revisar con el equipo:**

- La visibilidad se define según las opciones y permisos acordados antes de publicar. Un artículo general sigue siendo interno de la empresa; no se convierte en contenido público.
- Los permisos se comprueban al buscar, abrir o compartir una referencia al artículo. Publicarlo o vincularlo a un ticket no amplía su audiencia.
- Cambiar la audiencia requiere permiso y conserva quién hizo el cambio, cuándo y por qué. Ampliarla debe cumplir la revisión de contenido que corresponda a los nuevos destinatarios.
- Al restringir un artículo, las siguientes consultas respetan la nueva autorización, aunque alguien conserve su enlace o haya accedido anteriormente.
- Pertenecer al soporte no concede por sí solo acceso a cualquier artículo restringido; se aplica el alcance aprobado en EP-05.

Propuesta para la entrega 1. Complementa HU-05-07 y se aplica a todas las historias de esta épica. Falta acordar si el contenido de soporte se restringe también por equipo o nivel y quién puede ampliar o reducir la audiencia.

</details>

### HU-07-07 · Relacionar un artículo con un ticket

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

El agente autorizado puede relacionar un artículo útil con una solicitud para dejar claro qué conocimiento ayudó durante la atención. Si el artículo está permitido para el solicitante, este puede consultarlo desde su caso y recuperar las instrucciones cuando las necesite.

**Para revisar con el equipo:**

- El agente necesita permiso sobre el ticket y el artículo para crear la relación. Se identifica qué artículo se vinculó, quién lo hizo y cuándo.
- La relación permite consultar el contenido autorizado desde el caso. No copia automáticamente el artículo a un mensaje ni lo envía por Telegram.
- El solicitante solo ve las referencias y el contenido que tenga permitido conocer. Relacionar un artículo interno no revela su título o contenido a quien no puede consultarlo.
- La relación conserva una referencia a la versión utilizada para entender qué instrucciones apoyaron la atención. La consulta de una versión anterior sigue los permisos y reglas de conservación acordados.
- Si el artículo se actualiza o retira, el vínculo mantiene su trazabilidad sin presentar instrucciones retiradas como vigentes. La relación no se elimina silenciosamente del historial.
- Vincular un artículo no sustituye la documentación de la solución de HU-02-05 ni marca el ticket como resuelto.

Propuesta para la entrega 2. Se integra con HU-02-09 y la consulta de EP-01. Falta acordar dónde se muestran los vínculos y cómo se presenta una referencia histórica cuando existe una versión más reciente o el contenido fue retirado.

</details>

### HU-07-08 · Preparar un artículo a partir de una solución de soporte

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

Después de resolver un caso, el agente autorizado puede aprovechar lo aprendido para preparar una explicación que sirva a otros solicitantes. La solución se transforma en un borrador general, sin trasladar detalles personales o sensibles del ticket original.

**Para revisar con el equipo:**

- El agente debe tener acceso al caso de origen y permiso para crear contenido. Selecciona y redacta la información que resulte reutilizable; no se publica el ticket completo.
- El borrador describe el problema y la solución de forma general, excluyendo nombres, datos personales, credenciales, conversaciones y otros detalles sensibles del caso.
- Los archivos y notas internas del ticket no se copian ni se adjuntan automáticamente al artículo.
- Se conserva una referencia de origen para el personal autorizado cuando corresponda. Esa referencia no concede acceso al ticket ni aparece a lectores sin permiso.
- El borrador pasa por las mismas reglas de revisión, visibilidad y publicación que cualquier otro artículo. Que una solución haya funcionado en un caso no la convierte por sí sola en contenido aprobado.

Propuesta para la entrega 2. Utiliza HU-02-05, HU-07-03 y HU-07-04, con protección de EP-10. No incluye generación automática de textos o respuestas. Falta acordar cómo se registra la referencia al caso de origen y quién verifica que no se publique información sensible.

</details>

### HU-07-09 · Retirar contenido que ya no debe utilizarse

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

El responsable autorizado puede retirar un artículo que quedó obsoleto, contiene un error o ya no corresponde al servicio. Los solicitantes dejan de encontrarlo como una respuesta vigente y el equipo conserva el contexto de su retiro.

**Para revisar con el equipo:**

- El retiro requiere permiso y un motivo. Se conservan la fecha y la persona que lo realizó.
- El artículo deja de aparecer como contenido vigente en las búsquedas y consultas habituales de su audiencia.
- Un enlace guardado o asociado a un ticket no permite presentar el artículo retirado como si siguiera publicado. Se informa su indisponibilidad sin exponer contenido restringido.
- El retiro no borra silenciosamente la relación con tickets ni los registros de autoría, revisión o publicación. La conservación y el acceso histórico siguen las políticas acordadas.
- Si se permite volver a publicar, el artículo debe cumplir nuevamente las condiciones de revisión y publicación aplicables; no se reactiva por abrir un enlace antiguo.

Propuesta para la entrega 1. Se relaciona con HU-07-05, HU-07-07 y EP-10. Falta acordar quién puede retirar contenido de forma inmediata, el acceso a versiones retiradas y el procedimiento para una posible republicación.

</details>

### HU-07-10 · Actualizar artículos y mantener un responsable identificable

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin módulo, tablas ni rutas de artículos en frontend/src/app/app.routes.ts y backend/src/app.ts.

<details><summary>Criterios de la planificación revisados</summary>

La persona responsable puede revisar sus artículos y preparar cambios cuando las instrucciones ya no coinciden con la operación del servicio. El equipo puede saber quién mantiene cada contenido y cuándo se actualizó por última vez, para evitar que el conocimiento quede sin seguimiento.

**Para revisar con el equipo:**

- Se conserva un responsable de mantenimiento y las fechas de actualización. Las personas autorizadas pueden consultar esa información para organizar la revisión del contenido.
- Editar un artículo publicado prepara cambios que no se muestran como instrucciones aprobadas antes de completar la revisión correspondiente. Si el contenido vigente es incorrecto, puede retirarse mediante HU-07-09 mientras se corrige.
- Al publicar la actualización, se identifica la versión vigente y se conservan los antecedentes necesarios para explicar qué cambió, quién lo cambió y cuándo.
- No se sobrescribe silenciosamente el contenido que sirvió de referencia a tickets anteriores. Las referencias históricas se tratan como se acuerde en HU-07-07.
- Si el responsable cambia de función o se desactiva, la autoría histórica se mantiene y el contenido que necesita un nuevo responsable queda identificable para revisión autorizada.
- Las modificaciones concurrentes se revisan antes de reemplazar cambios ajenos. Un fallo de guardado o publicación no se presenta como actualización completada.

Propuesta para la entrega 2, o desde la primera si se requiere actualizar contenido publicado. Se apoya en HU-07-03 a HU-07-06 y en los cambios de cuentas de EP-05. Falta acordar cómo se asigna o sustituye al responsable, si habrá revisiones periódicas y qué cambios requieren una nueva aprobación. No se presupone una caducidad automática.

</details>

### HU-08-01 · Consultar un panorama del servicio

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El supervisor o responsable autorizado puede abrir un tablero para conocer las solicitudes recibidas, pendientes, resueltas, cerradas y reabiertas. Esta vista le ayuda a reconocer la situación general antes de revisar los casos que requieren más atención.

**Para revisar con el equipo:**

- Cada indicador identifica qué cuenta, qué período o fecha de corte utiliza y cuándo se actualizaron los datos.
- Se distingue entre eventos ocurridos durante un período y la cantidad de casos que están en una situación a una fecha determinada. Los pendientes no se calculan solo a partir de las solicitudes creadas en el período si existen casos anteriores todavía abiertos.
- Un ticket puede aparecer en indicadores distintos por haber sido recibido, resuelto y cerrado en el mismo período. No se presenta la suma de esas cantidades como si fueran tickets únicos.
- Las reaperturas se reconocen por los eventos del historial, sin exigir un estado llamado «reabierto». Se aclara si se cuentan casos distintos o eventos de reapertura.
- Solo se presentan datos dentro del alcance autorizado. Un error de carga o falta de información no se muestra como cero solicitudes.
- Cuando se permite revisar el detalle que explica una cifra, la consulta mantiene el mismo período, definición y alcance, sin conceder acceso adicional al contenido restringido.

Propuesta para la entrega 1. Utiliza el historial de EP-02 y los permisos de EP-05. Falta acordar la definición de cada indicador, los estados considerados pendientes y la frecuencia de actualización.

</details>

### HU-08-02 · Filtrar la información que se necesita revisar

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El responsable puede elegir un período, categoría, prioridad, equipo y otros criterios autorizados para concentrarse en la parte del servicio que necesita analizar. Los resultados dejan claro qué selección está utilizando para evitar comparar cifras de alcances distintos.

**Para revisar con el equipo:**

- Los filtros disponibles y sus opciones respetan los permisos de la persona. No permiten descubrir equipos, personas o casos fuera de su alcance.
- Los criterios elegidos se combinan y se muestran junto a los resultados. Al limpiarlos, se vuelve al alcance inicial autorizado.
- Se indica qué fecha utiliza cada indicador: creación, resolución, cierre u otra definida. Seleccionar un período no cambia silenciosamente el significado de la métrica.
- Las fechas se interpretan con la zona horaria y los límites acordados. Un rango cuya fecha inicial sea posterior a la final requiere corrección antes de consultar.
- Si no hay coincidencias, se informa como ausencia de datos para esos filtros, diferenciándola de un fallo de consulta.
- El detalle y la exportación conservan los filtros utilizados, sujetos a sus respectivos permisos.

Propuesta para la entrega 1. Aplica a las demás consultas de EP-08. Falta acordar los filtros específicos, la selección inicial y si categoría, prioridad y equipo se evalúan con su valor actual o con el que tenían al ocurrir el evento analizado.

</details>

### HU-08-03 · Reconocer cómo cambia la demanda de soporte

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El responsable puede revisar cuántas solicitudes llegan y qué categorías se repiten a lo largo del tiempo. Esto le permite identificar necesidades frecuentes y períodos de mayor demanda para orientar mejoras del servicio.

**Para revisar con el equipo:**

- Se muestra el volumen de solicitudes recibidas por los períodos y categorías acordados, con la definición de qué casos se incluyen.
- Cada solicitud se cuenta una sola vez como recibida. Una transferencia, reapertura o mensaje adicional no se presenta como un ticket nuevo.
- Los períodos comparados indican su duración y si están completos. No se presenta un período parcial como directamente equivalente a uno completo sin señalarlo.
- Los casos sin clasificación y las categorías desactivadas mantienen un tratamiento explícito; no desaparecen de los totales por falta de una categoría vigente.
- Si una categoría cambió durante la atención, se aplica la regla acordada para el análisis y se informa qué clasificación se utilizó.
- Los resultados permiten identificar patrones, sin afirmar por sí solos cuál fue la causa del aumento o disminución de solicitudes.

Propuesta para la entrega 1. Se apoya en los registros de EP-01, el historial de EP-02 y los catálogos de EP-09. Falta definir la agrupación temporal y el tratamiento histórico de cambios de categoría.

</details>

### HU-08-04 · Analizar la distribución y acumulación del trabajo

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El supervisor puede revisar cómo se reparte el trabajo entre equipos y agentes para reconocer concentraciones de casos y solicitudes que siguen sin responsable. Puede distinguir la carga actual de lo que ocurrió en períodos anteriores cuando exista evidencia para reconstruirlo.

**Para revisar con el equipo:**

- La vista identifica si muestra la situación actual o una fecha de corte histórica y qué estados considera como trabajo pendiente.
- Se distinguen casos sin equipo, con equipo pero sin agente y con agente asignado, según las situaciones permitidas por el servicio.
- Las cantidades por equipo o agente se basan en la responsabilidad que corresponda al momento analizado. Una transferencia no duplica un ticket dentro de un mismo total.
- Si se presenta actividad de varios responsables durante un período, se aclara que un caso pudo pasar por más de uno y que sus subtotales no necesariamente suman tickets únicos.
- Las referencias a equipos o usuarios desactivados se conservan cuando forman parte del período consultado, respetando los permisos.
- El número de tickets no se presenta por sí solo como esfuerzo, productividad o calidad del agente. Consultar el análisis no reasigna trabajo.

Propuesta para la entrega 1. Complementa la vista operativa de HU-03-05 y utiliza HU-03-09. Falta acordar los cortes históricos disponibles, las agrupaciones y la atribución de trabajo ante transferencias, en coordinación con D-19.

</details>

### HU-08-05 · Consultar los tiempos de primera respuesta y resolución

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El responsable puede revisar cuánto tarda el servicio en responder y resolver las solicitudes. La información distingue ambas etapas para que una respuesta rápida no oculte un problema de resolución, ni una resolución posterior cambie lo que ocurrió al iniciar la atención.

**Para revisar con el equipo:**

- Los tiempos provienen de los eventos y reglas de EP-04, con los horarios, pausas y unidades acordados. La consulta indica si utiliza tiempo de servicio o tiempo transcurrido de calendario.
- La primera respuesta utiliza el primer cambio a En proceso registrado en el historial de estados de EP-02. No se reinicia y no cuentan avisos automáticos, notas internas ni mensajes de Telegram.
- La resolución utiliza el evento válido de EP-02; el cierre posterior no sustituye su fecha.
- Los casos sin respuesta o resolución todavía se distinguen de los ya completados. Su falta de duración final no se convierte en cero ni se mezcla silenciosamente con los tiempos terminados.
- Cada resultado agregado identifica cuántos casos o ciclos se incluyeron y qué datos se excluyeron o no pudieron calcularse. No se publica un promedio, mediana u otra medida sin definir su fórmula y población.
- Las reaperturas y las correcciones de evidencia siguen el tratamiento acordado, conservando la posibilidad de explicar el resultado a partir del historial.

Propuesta para la entrega 1. Utiliza HU-04-03 a HU-04-06 y HU-04-10. Falta acordar las medidas estadísticas, la población analizada y el tratamiento de ciclos de atención y datos incompletos.

</details>

### HU-08-06 · Revisar el cumplimiento y los incumplimientos de SLA

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El supervisor puede consultar en qué medida se cumplieron los compromisos de primera respuesta y resolución y qué casos presentan atrasos. Esto le permite revisar resultados con evidencia y orientar acciones de mejora.

**Para revisar con el equipo:**

- Se presentan por separado los compromisos de respuesta y resolución. Cumplir uno no implica cumplir ambos.
- Los resultados se basan en las políticas y eventos conservados por EP-04. Un cambio posterior de prioridad o configuración no elimina un incumplimiento previo.
- Se distinguen compromisos cumplidos, incumplidos, todavía pendientes y aquellos sin datos suficientes o sin SLA aplicable. Estar pendiente y aún dentro del plazo no se presenta como cumplimiento ya conseguido.
- Cualquier porcentaje informa el numerador, el denominador y las exclusiones acordadas. Si no existen compromisos evaluables, se muestra que no hay base para calcularlo, no un cumplimiento del cien por ciento.
- Una resolución tardía conserva el incumplimiento aunque el caso ya no esté pendiente. Las cancelaciones y reaperturas siguen las reglas de medición aprobadas.
- La consulta permite revisar la evidencia autorizada de los casos incluidos sin modificar sus datos ni las políticas del servicio.

Propuesta para la entrega 1. Utiliza HU-04-07 y HU-04-10. Falta acordar cómo se agrupan compromisos y ciclos, qué población integra cada porcentaje y cómo se presentan casos con varios incumplimientos.

</details>

### HU-08-07 · Recibir una invitación para valorar la atención

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

Al concluir un caso, el solicitante puede recibir una invitación para compartir cómo fue su experiencia con soporte. La invitación identifica la solicitud y deja claro que responder es voluntario.

**Para revisar con el equipo:**

- La invitación se genera al ocurrir el evento de conclusión que acuerde el servicio, sin asumir que resolución y cierre son equivalentes.
- Se asocia al solicitante y al ticket o ciclo de atención definido. Otro participante del caso no queda habilitado para responder en su nombre.
- La invitación explica su carácter voluntario y permite acceder a la encuesta mediante el mecanismo autorizado.
- Reprocesar el mismo evento no genera invitaciones o encuestas duplicadas. Una reapertura no crea automáticamente otra encuesta sin una regla que lo permita.
- Si el evento se clasifica como importante o relevante, EP-06 envía el aviso tanto en la aplicación como en Telegram. Un fallo de entrega no se interpreta como respuesta del solicitante.
- La falta de respuesta no impide concluir el caso ni modifica su estado, prioridad o cumplimiento de SLA.

Propuesta para la entrega 2. Se apoya en EP-02, EP-05 y EP-06. Falta acordar el momento de invitación, los casos elegibles, la vigencia de la encuesta y los posibles recordatorios, sin fijar un plazo por defecto.

</details>

### HU-08-08 · Valorar la atención recibida

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede indicar cómo percibió la atención de su caso y, si lo desea, dejar un comentario. También puede decidir no responder, sin que eso se tome como una opinión positiva o negativa.

**Para revisar con el equipo:**

- La encuesta identifica el caso y permite elegir una valoración dentro de la escala acordada. El comentario es opcional y no se exige para enviar una valoración válida.
- Se comprueba que la persona esté autorizada para responder esa encuesta y que siga disponible según las reglas acordadas. Conocer o compartir el enlace no permite responder por otro solicitante.
- Abrir la encuesta o dejarla incompleta no genera una valoración. Solo un envío válido y confirmado se registra como respuesta.
- Reintentar el mismo envío no aumenta el número de respuestas. Si se permite corregir una valoración, se conserva su trazabilidad y se aplica la regla acordada sin contar dos respuestas independientes.
- Se informa al solicitante el tratamiento de su respuesta y quién puede consultar su comentario. No se promete anonimato sin una decisión y un mecanismo que lo respalden.
- La respuesta queda asociada al caso o ciclo definido y no cambia el ticket ni sus resultados de atención. Un error al guardar no se anuncia como valoración recibida.

Propuesta para la entrega 2. Complementa HU-08-07 y utiliza los permisos de EP-05 y la protección de EP-10. Falta acordar escala, límites del comentario, posibilidad de corrección y visibilidad de los datos del encuestado.

</details>

### HU-08-09 · Consultar la satisfacción junto con la participación

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El responsable puede revisar las valoraciones de los solicitantes y saber cuántas personas respondieron. Así interpreta la satisfacción conociendo la participación que respalda el resultado y puede revisar los comentarios que tenga permitido consultar.

**Para revisar con el equipo:**

- Los resultados de satisfacción incluyen únicamente respuestas válidas, con la distribución de valoraciones y el número de respuestas que las sustentan.
- Se muestran el volumen de encuestas y la tasa de respuesta, indicando qué población se utiliza como denominador. Se distinguen invitaciones generadas, su situación de entrega y respuestas recibidas cuando sea necesario para explicar la participación.
- Una encuesta sin respuesta no se convierte en una valoración ni se incluye como cero en el cálculo de satisfacción. Si no hay respuestas, se informa esa ausencia en lugar de mostrar un resultado positivo o negativo.
- Si el denominador de la tasa de respuesta es cero, se indica que no puede calcularse. Las copias de una invitación en dos canales y los reintentos no duplican encuestas ni participantes.
- Los filtros y períodos indican si agrupan por conclusión del caso, invitación o fecha de respuesta, según la definición acordada.
- Los comentarios y cualquier detalle identificable respetan permisos específicos. El acceso a un resultado agregado no concede acceso automático a comentarios o identidades.
- El resultado se presenta como la percepción de quienes respondieron, sin afirmar que representa necesariamente a todos los solicitantes atendidos.

Propuesta para la entrega 2. Utiliza HU-08-07 y HU-08-08. Falta acordar la fórmula de satisfacción, el denominador de participación, el tratamiento de encuestas vencidas y las restricciones para grupos con pocas respuestas.

</details>

### HU-08-10 · Exportar un reporte autorizado

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** /reportes carga pagina-informativa.ts; sin servicio de reportes, métricas ni encuestas.

<details><summary>Criterios de la planificación revisados</summary>

El responsable con permiso puede descargar los resultados que está revisando para compartirlos o analizarlos fuera del HelpDesk. El archivo permite entender qué datos contiene y conserva los límites de acceso de la consulta.

**Para revisar con el equipo:**

- Exportar requiere un permiso específico y no amplía el alcance de lectura. Se vuelven a comprobar los accesos al generar y descargar el archivo.
- El reporte identifica el período, los filtros, la fecha de generación y el corte de datos utilizado. Sus cifras coinciden con la consulta para ese mismo corte o explican si los datos se actualizaron.
- Solo se incluyen las columnas y el nivel de detalle autorizados. Comentarios de encuestas, información personal y contenido de tickets no se agregan por defecto a una exportación de indicadores.
- Las definiciones necesarias para interpretar los resultados acompañan al reporte, incluidos datos no calculables y exclusiones relevantes. No se reemplazan por ceros para completar el archivo.
- Los enlaces de descarga, si se utilizan, no eluden los permisos. EP-10 aplica protección al archivo y al contenido exportado según el formato elegido.
- Si la generación falla o queda incompleta, se informa y no se presenta un archivo parcial como un reporte completo. La exportación no modifica los datos operativos.

Propuesta para la entrega 2. Aplica HU-05-07 y los controles de EP-10. Falta acordar formatos, campos, límites de volumen, conservación de archivos generados y permisos para exportar información detallada.

</details>

### HU-09-01 · Mantener categorías y opciones de clasificación

**Dictamen:** Parcial. Categorías planas con activación; sin subcategorías ni dependencias de enrutamiento.

**Evidencia:** backend/src/categories/; frontend/src/app/features/categorias/; backend/test/integration/users-and-categories.test.ts

<details><summary>Criterios de la planificación revisados</summary>

El responsable autorizado puede organizar las categorías, subcategorías y opciones que utilizan los solicitantes para describir sus solicitudes. Esto facilita que los casos se clasifiquen de manera consistente y lleguen al equipo adecuado.

El núcleo actual permite al administrador mantener categorías planas, sin subcategorías ni reglas de enrutamiento. Los criterios jerárquicos siguientes siguen pendientes.

**Para revisar con el equipo:**

- Se pueden crear y actualizar las opciones permitidas, con nombres comprensibles y relaciones válidas entre categorías y subcategorías.
- Se validan los datos obligatorios, las duplicidades según la regla acordada y las relaciones que no tengan sentido, como una categoría que dependa de sí misma.
- Las opciones habilitadas quedan disponibles para nuevos registros según su alcance. Desactivar una opción impide nuevos usos conforme a HU-09-10, sin eliminar la clasificación de los casos anteriores.
- Antes de retirar o modificar una opción usada por reglas de enrutamiento u otras funciones, se identifican sus dependencias y se exige resolver las incompatibilidades.
- Renombrar o reorganizar una categoría no cambia silenciosamente el significado histórico de los reportes. Su efecto se define antes de aplicar el cambio.

Propuesta para la entrega 1. Se relaciona con HU-01-01, HU-03-08 y las consultas de EP-08. Falta acordar el catálogo inicial, la profundidad de subcategorías y si los artículos de EP-07 utilizan este catálogo o uno separado, en coordinación con D-01 y D-47.

</details>

### HU-09-02 · Configurar los estados y los cambios permitidos

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El responsable del servicio mantiene los seis estados acordados y sus permisos por rol. El estado se elige explícitamente, con las transiciones y permisos de la máquina vigente ni un recorrido obligatorio.

**Para revisar con el equipo:**

- Se mantienen Creado, En proceso, En espera, Resuelto, Cerrado y Cancelado. Creado es inicial; Cerrado y Cancelado son finales.
- Cada acción conserva sus condiciones y referencias de autorización: propietario, supervisor o administrador cierra Resuelto y cancela Creado/En espera. Configurar un estado no concede permiso para ejecutarla.
- Las reglas no permiten omitir condiciones obligatorias, como documentar una solución antes de resolver un caso, ni confundir resolución, cierre y cancelación.
- Se valida que el estado elegido sea uno de los seis acordados. No se restringen los destinos según el estado de origen; se comprueban los permisos y las condiciones propias de la acción.
- Antes de modificar o desactivar un estado utilizado, se define qué ocurre con los tickets que ya están en él. No se cambia su estado de forma silenciosa ni se borra su historial.

Propuesta para la entrega 1. EP-02 ejecuta los cambios y EP-05 controla los permisos, con las transiciones y permisos de la máquina vigente. Retoma D-10 y las condiciones pendientes de espera, solución, confirmación de cierre y reapertura. No incluye un diseñador libre de procesos o condiciones arbitrarias.

</details>

### HU-09-03 · Mantener la estructura de equipos y niveles

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El administrador autorizado puede mantener los equipos y niveles de soporte para que las colas y destinos de atención reflejen la organización de la empresa. El equipo operativo puede utilizar esa estructura al distribuir las solicitudes.

**Para revisar con el equipo:**

- Se crean y actualizan equipos y niveles con identificadores estables y nombres que permitan distinguirlos.
- Las relaciones entre equipos y niveles cumplen la estructura acordada. No se habilitan combinaciones que la operación de asignación no pueda utilizar.
- La pertenencia de agentes y supervisores se administra en HU-05-06. Editar la estructura no agrega integrantes ni concede permisos por sí solo.
- Al desactivar un equipo o nivel se identifican agentes y supervisores asociados, tickets y reglas que lo utilizan. El tratamiento de esas dependencias debe resolverse antes de aplicar un cambio incompatible.
- Las referencias históricas se conservan en asignaciones y reportes. Renombrar un equipo no crea un responsable nuevo ni transfiere sus tickets automáticamente.

Propuesta para la entrega 1. Se relaciona con EP-03 y HU-05-06. Falta acordar las relaciones permitidas, los datos de cada equipo y el tratamiento de su desactivación, en coordinación con D-16, D-17 y D-20.

</details>

### HU-09-04 · Configurar reglas básicas para dirigir solicitudes

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El responsable autorizado puede indicar a qué equipo debe dirigirse una solicitud cuando cumple ciertos criterios admitidos, como una categoría. Esto permite aplicar una distribución consistente sin elegir manualmente el destino de cada caso.

**Para revisar con el equipo:**

- Cada regla identifica sus criterios, destino, momento de aplicación y condición de habilitación, dentro de las opciones soportadas.
- Los destinos deben existir y estar habilitados. Una regla no puede eludir los permisos o las combinaciones válidas de asignación.
- Si varias reglas pueden coincidir, se define una precedencia o se señala el conflicto antes de habilitarlas. No se deja que el orden accidental de procesamiento elija el destino.
- Se establece qué ocurre cuando ninguna regla coincide o el destino deja de estar disponible. Los casos deben seguir identificables para revisión autorizada.
- Un cambio de regla indica si aplica a nuevos casos o si se permite revisar casos existentes. No reemplaza una asignación manual posterior sin una política expresa.

Propuesta para la entrega 2, o antes si se utiliza enrutamiento desde el inicio. HU-03-08 aplica estas reglas y conserva su referencia. Retoma D-22; no incluye reparto mediante inteligencia artificial ni optimización avanzada de carga.

</details>

### HU-09-05 · Configurar los criterios de prioridad

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El responsable del servicio puede definir cómo se combinan el impacto y la urgencia para obtener una prioridad. El equipo dispone de criterios comunes para evaluar los casos y explicar por qué uno requiere atención antes que otro.

**Para revisar con el equipo:**

- Se mantienen los valores de impacto, urgencia y prioridad con descripciones que ayuden a utilizarlos de forma consistente.
- La matriz identifica la prioridad correspondiente a cada combinación admitida. Se señalan combinaciones sin definición o con resultados contradictorios antes de habilitar la configuración.
- Se configura el tratamiento permitido de las excepciones dentro de las capacidades del sistema; quién puede aplicarlas sigue dependiendo de EP-05.
- Los cambios conservan la referencia a la configuración anterior. No se recalculan prioridades de tickets existentes ni se eliminan incumplimientos por editar la matriz.
- Si una prioridad participa en políticas de SLA o escalamiento, se comprueba que el cambio mantenga válidas esas relaciones.

Propuesta para la entrega 1. HU-04-01 y HU-04-02 aplican los criterios y los ajustes. Falta acordar los valores, combinaciones y tratamiento de excepciones, en coordinación con D-23 y D-28.

</details>

### HU-09-06 · Configurar los SLA, horarios y reglas de conteo

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El responsable autorizado puede establecer los compromisos de primera respuesta y resolución junto con los horarios en que cuentan sus tiempos. Esto permite que el seguimiento de cada caso utilice una política explícita y comprensible.

**Para revisar con el equipo:**

- Cada política identifica cuándo aplica y sus objetivos separados de primera respuesta y resolución, con unidades y eventos de inicio definidos.
- Se mantienen zona horaria, horarios laborales y días no laborables. Los valores y calendarios se validan para evitar rangos imposibles o condiciones incompatibles.
- Las políticas definen las pausas y reanudaciones permitidas y el tratamiento de cambios de prioridad, cancelaciones y reaperturas dentro de lo soportado por el sistema.
- Si varias políticas pueden aplicar al mismo caso, se establece una selección inequívoca o se informa el conflicto antes de habilitarlas.
- La modificación conserva la política y el calendario anteriores para explicar cálculos históricos. Se declara el efecto sobre casos en curso antes de aplicar un recálculo autorizado.
- Cambiar un objetivo o calendario no elimina un incumplimiento previo ni presenta como cumplido un compromiso que no puede evaluarse.

Propuesta para la entrega 1. EP-04 selecciona la política y calcula los tiempos; EP-08 utiliza sus resultados. Retoma D-24 a D-28. No se fijan valores de tiempo ni reglas de pausa por defecto en esta historia.

</details>

### HU-09-07 · Configurar riesgos y reglas de escalamiento

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El responsable del servicio puede indicar cuándo un compromiso necesita atención especial y qué intervención corresponde. Así los riesgos e incumplimientos tienen una respuesta acordada en lugar de depender de una decisión improvisada en cada caso.

**Para revisar con el equipo:**

- Cada regla identifica el compromiso afectado, la condición de riesgo o incumplimiento y la acción admitida, como avisar a un supervisor o solicitar una transferencia de nivel.
- Los umbrales, destinatarios y destinos deben ser válidos y compatibles con las políticas de SLA y la estructura de soporte.
- Se definen la precedencia, las condiciones de repetición y los límites que correspondan para evitar ciclos de escalamiento o avisos repetidos sin justificación.
- Se establece qué ocurre si el destino no está disponible o si el caso deja de cumplir la condición antes de ejecutar una acción pendiente.
- Modificar una regla no borra escalamientos anteriores ni ejecuta transferencias directamente desde la configuración.

Propuesta para la entrega 2, o desde que la política exija escalamientos. HU-04-07 y HU-04-08 detectan y activan las condiciones; EP-03 realiza transferencias y EP-06 entrega avisos. Retoma D-29 y D-30 y su coordinación con D-21.

</details>

### HU-09-08 · Mantener eventos, plantillas y respuestas frecuentes

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El responsable autorizado puede definir qué eventos requieren avisos, quién debe recibirlos y cómo se redactan. También puede mantener textos frecuentes para que soporte los reutilice con un lenguaje consistente durante la atención.

**Para revisar con el equipo:**

- El catálogo utiliza eventos que los módulos pueden producir e identifica cuáles son importantes o relevantes. Para estos se requieren avisos en la aplicación y Telegram; no se puede guardar una configuración que deje habilitado solo un canal.
- Los destinatarios se definen por relaciones o responsabilidades admitidas y siempre quedan sujetos a los permisos vigentes al enviar. La configuración no autoriza a revelar contenido de cualquier ticket.
- Las plantillas por canal utilizan únicamente datos y campos disponibles y permitidos. Una referencia inválida o contenido restringido para la audiencia debe corregirse antes de habilitarlas.
- Se puede revisar una vista previa con datos de ejemplo para comprobar el texto sin enviar avisos reales ni exponer información de tickets.
- Las respuestas frecuentes se identifican como textos reutilizables, distintos de una notificación automática y de un artículo publicado. Su mantenimiento no envía mensajes ni acredita una respuesta de atención.
- Se conservan los cambios de textos y reglas para explicar qué configuración se utilizó. Se acuerda su efecto sobre los avisos que ya estaban pendientes, sin reescribir el contenido de envíos completados.

Propuesta para la entrega 1. EP-06 selecciona destinatarios y realiza los envíos; la utilización de respuestas frecuentes debe ajustarse al mecanismo de conversación que se valide. Retoma D-08 y D-40. Falta concretar el catálogo, los campos por plantilla y cómo se pondrán los textos frecuentes a disposición de los agentes.

</details>

### HU-09-09 · Configurar y supervisar la integración con Telegram

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** No hay servicio/API de esta configuración; estados fijos en policy.ts no equivalen a configuración editable.

<details><summary>Criterios de la planificación revisados</summary>

El personal autorizado puede mantener los parámetros necesarios para operar la integración y revisar si presenta problemas de comunicación. Esto permite atender fallos sin exponer credenciales a quienes solo necesitan consultar el estado del servicio.

**Para revisar con el equipo:**

- Solo los permisos específicos permiten cambiar parámetros sensibles o credenciales. Consultar incidencias de envío no habilita por sí solo su lectura o modificación.
- Las credenciales se protegen y no aparecen completas en pantallas de consulta, registros de auditoría, mensajes de error o exportaciones.
- Los parámetros de intentos, intervalos y recuperación se validan dentro de los límites que soporte la integración. Se identifican configuraciones incompletas antes de presentarlas como operativas.
- La revisión del estado distingue una configuración guardada de una conexión comprobada y de la entrega de mensajes concretos. Una comprobación satisfactoria no garantiza que todos los envíos pendientes se hayan completado.
- Se dispone de acceso autorizado al seguimiento de fallos de HU-06-09 y al procedimiento de recuperación de HU-06-10, sin duplicar sus registros ni conceder acceso indiscriminado a conversaciones.
- Un cambio de credenciales o parámetros conserva la trazabilidad y define qué ocurre con los envíos pendientes. Si Telegram queda indisponible, los avisos de la aplicación permanecen disponibles y los envíos pendientes no se marcan como completados.

Propuesta para la entrega 1 en cuanto se utilice Telegram. EP-06 opera la integración y EP-10 protege secretos y registros. La vinculación de cada usuario sigue en EP-05. Retoma D-45 y D-46; falta definir los parámetros admitidos y el procedimiento de comprobación y sustitución de credenciales.

</details>

### HU-09-10 · Aplicar cambios y desactivar opciones sin perder antecedentes

**Dictamen:** Parcial. Inactivación conserva referencias; configuración restante y antecedentes completos pendientes.

**Evidencia:** backend/src/categories/service.ts; backend/src/users/service.ts; backend/db/migrations/

<details><summary>Criterios de la planificación revisados</summary>

El responsable autorizado puede revisar el efecto de un ajuste antes de aplicarlo y retirar opciones que ya no deben utilizarse. El sistema conserva los antecedentes para que el equipo entienda con qué reglas se atendieron los casos anteriores.

**Para revisar con el equipo:**

- Antes de aplicar un cambio se validan los datos, los permisos y las dependencias relevantes, indicando qué impide guardarlo o qué efecto necesita definirse.
- Se identifica si el ajuste afecta a nuevos usos, a casos existentes o a operaciones pendientes. No se aplica una migración, reasignación o recálculo sin una regla explícita y la autorización correspondiente.
- La desactivación impide nuevos usos según la política acordada, pero conserva las referencias históricas. No se eliminan opciones que los registros existentes necesitan para mantener su significado.
- Cada cambio conserva quién lo realizó, cuándo, su motivo y los valores o versiones anteriores y posteriores que permitan reconstruirlo. Los secretos se excluyen de esos registros.
- Si otra persona modificó la configuración durante la edición, se informa antes de reemplazar sus cambios. Si la operación falla, se mantiene una configuración coherente y no se presenta como aplicada.
- Los ajustes relacionados que necesitan activarse juntos no dejan temporalmente reglas incompatibles en uso. El mecanismo concreto de aplicación debe acordarse según las capacidades del sistema.
- Consultar una configuración anterior permite entender la historia; no implica que pueda restaurarse automáticamente sobre casos actuales sin validar nuevamente su efecto.

Propuesta para la entrega 1 y condición común a todas las historias de EP-09. Cada módulo aplica sus reglas y EP-10 audita las operaciones. Falta acordar la vigencia de los cambios, los permisos para modificar casos existentes y si se necesitan aprobación adicional o programación de cambios; no se dan por obligatorias sin definirlas.

</details>

### HU-10-01 · Proteger el acceso y las sesiones del HelpDesk

**Dictamen:** Parcial. Hash, sesiones, CSRF, CORS y controles del núcleo; HTTPS desplegado, módulos futuros y protección operacional no verificados.

**Evidencia:** backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts; backend/src/app.ts; backend/src/config/env.ts

<details><summary>Criterios de la planificación revisados</summary>

El usuario puede utilizar su cuenta con la confianza de que otra persona no podrá continuar su sesión o realizar acciones fuera de los permisos que tiene. El equipo responsable puede comprobar que esas restricciones funcionan también cuando se intenta acceder directamente a una operación o archivo.

**Para revisar con el equipo:**

- Las funciones protegidas comprueban la identidad, la vigencia de la cuenta y los permisos necesarios para la acción y el dato solicitado. La validación no depende solo de lo que muestra la pantalla.
- Cerrar sesión, vencer su vigencia o desactivar la cuenta impide nuevas operaciones con esa sesión según las reglas de EP-05. Un enlace guardado no recupera una autorización retirada.
- Las operaciones que modifican información verifican que la solicitud corresponda a una sesión válida y no sea una acción inducida sin autorización del usuario.
- Los intentos de autenticación abusivos o repetidos se tratan con los controles acordados, sin exponer credenciales ni revelar innecesariamente la existencia de otras cuentas.
- La recuperación de acceso exige la verificación definida en HU-05-04 y no permite omitir la desactivación o elevar privilegios.
- Se comprueba el rechazo de consultas y acciones no autorizadas en tickets, archivos, artículos, reportes, configuración e integración, incluyendo accesos directos.

Necesaria desde el primer acceso protegido. Implementa los controles que respaldan HU-05-03, HU-05-04 y HU-05-07. Los parámetros actuales son 30 minutos de inactividad, 8 horas máximas y bloqueo de 15 minutos tras 5 fallos, todos configurables; D-34 recoge el alcance; las cuentas y los roles siguen administrándose en EP-05.

</details>

### HU-10-02 · Proteger la información y las credenciales

**Dictamen:** Parcial. Hash, sesiones, CSRF, CORS y controles del núcleo; HTTPS desplegado, módulos futuros y protección operacional no verificados.

**Evidencia:** backend/src/auth/{routes,service,session,middlewares,password}.ts; frontend/src/app/core/auth/; frontend/src/app/features/acceso/; backend/test/integration/auth.test.ts; backend/src/app.ts; backend/src/config/env.ts

<details><summary>Criterios de la planificación revisados</summary>

El responsable tecnológico puede mantener protegidos los datos del servicio y las credenciales que permiten operarlo. Las personas consultan solo la información necesaria para su función, sin que las pantallas o los registros revelen secretos de acceso.

**Para revisar con el equipo:**

- Las comunicaciones de la aplicación y de sus integraciones utilizan mecanismos de protección acordes con la sensibilidad de los datos. Las credenciales no se transmiten mediante enlaces o mensajes sin protección.
- Los datos almacenados, archivos y copias de respaldo tienen controles de acceso y protección definidos según su clasificación. Se comprueba que no queden expuestos como recursos públicos por su ubicación o configuración.
- Los secretos de integración solo pueden administrarse con permisos específicos y no aparecen completos en pantallas de consulta, errores, auditorías o exportaciones.
- HelpDesk administra contraseñas locales mediante hashes Argon2id; no conserva el texto original ni permite recuperarlo mediante una consulta administrativa.
- Se define cómo sustituir o revocar credenciales y cómo recuperar de forma autorizada el material necesario para restaurar datos protegidos, sin colocarlo en registros de auditoría.
- Los errores informan lo necesario para resolver el problema sin exponer credenciales, contenido privado u otros detalles sensibles.

Necesaria desde que se almacene o transmita información real. Se relaciona con HU-09-09, los archivos de las otras épicas y las exportaciones de HU-08-10. Falta acordar la clasificación de datos, la protección por categoría y la gestión del material de acceso y recuperación.

</details>

### HU-10-03 · Validar los datos y archivos antes de procesarlos

**Dictamen:** Parcial. Zod estricto, límites y SQL parametrizado; no existe carga ni análisis de archivos.

**Evidencia:** backend/src/http/validation.ts; backend/src/tickets/validation.ts; backend/src/users/validation.ts

<details><summary>Criterios de la planificación revisados</summary>

El solicitante puede registrar información y aportar archivos sin que una entrada inválida comprometa el servicio o exponga datos de otras personas. El sistema rechaza lo que no cumple las reglas y permite entender qué debe corregirse.

**Para revisar con el equipo:**

- Los datos se validan al recibirlos, aunque se envíen por fuera del formulario habitual. Se comprueban formato, longitud, valores permitidos y reglas aplicables a cada operación.
- El contenido ingresado se trata como datos y no como instrucciones ejecutables. Su presentación y uso en consultas, artículos, mensajes o exportaciones mantiene los controles apropiados para cada destino.
- Los archivos se comprueban por sus características y contenido según la política acordada, sin confiar solo en el nombre o extensión que aporta el usuario.
- Un archivo rechazado o pendiente de validación no queda disponible para descarga o reenvío como si ya hubiera sido aceptado. La carga no permite reemplazar archivos ajenos o escribir fuera del espacio autorizado.
- Abrir o descargar un archivo vuelve a comprobar los permisos sobre su contenido, incluidos los adjuntos de tickets, conversaciones y notas internas.
- Si la validación no puede completarse, se informa esa situación y no se presenta el contenido como seguro o aceptado sin evidencia.

Necesaria desde que se reciban entradas o archivos. Aplica a HU-01-02, HU-06-04, HU-06-06, EP-07 y HU-08-10. Falta definir límites y tratamiento de contenido rechazado, coordinados con D-02, D-42 y las necesidades de cada módulo.

</details>

### HU-10-04 · Comprobar el origen y la autorización de los intercambios de Telegram

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk.

<details><summary>Criterios de la planificación revisados</summary>

El equipo puede confiar en que los mensajes que la integración recibe y dirige provienen del mecanismo autorizado y de usuarios habilitados para el caso. Esto evita aceptar mensajes ajenos o asociarlos a una solicitud por una identidad no verificada.

**Para revisar con el equipo:**

- La recepción valida el origen mediante el mecanismo que se acuerde y pruebe para la integración. Un nombre visible o un identificador aportado sin verificación no bastan para acreditar al emisor.
- Antes de reenviar contenido, se comprueban la cuenta habilitada, la vinculación vigente y el permiso del usuario sobre ese ticket.
- Una asociación ambigua sigue el procedimiento de HU-06-01 y no dirige contenido al caso por suposición.
- Los intercambios rechazados no se reenvían ni aparecen como atención válida. La incidencia conserva la evidencia mínima necesaria para revisión sin copiar secretos o contenido sensible innecesario.
- Reprocesar un intercambio válido no permite repetir acciones ni enviar contenido adicional; se utiliza la referencia de origen y el control de duplicados de EP-06.
- Una identidad revocada no vuelve a quedar habilitada por un mensaje pendiente o por haber participado anteriormente en el caso.

Necesaria antes de habilitar Telegram. Complementa HU-05-09, HU-05-10 y HU-06-01. Falta validar técnicamente la comprobación de origen y el tratamiento de comunicaciones rechazadas, en coordinación con D-38 y D-40.

</details>

### HU-10-05 · Evitar que se envíe información no autorizada a Telegram

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk.

<details><summary>Criterios de la planificación revisados</summary>

El solicitante y el equipo pueden comunicarse sin que la integración publique notas internas, archivos restringidos o información que el destinatario no necesita conocer. La comprobación se aplica también cuando un mensaje se preparó antes de un cambio de permisos.

**Para revisar con el equipo:**

- Antes de cada envío o reintento se comprueban el destinatario, su vinculación y sus permisos vigentes, no solo los que tenía al preparar el mensaje.
- El contenido y las plantillas se limitan a los datos necesarios y autorizados para el evento o conversación. Las notas internas y sus adjuntos permanecen dentro del HelpDesk.
- Los enlaces a archivos o tickets no evitan la autorización. Los archivos enviados directamente deben haber pasado la validación y estar permitidos para el destinatario.
- Una reasignación, desvinculación o desactivación impide nuevos envíos a quien perdió acceso, conforme a las reglas de EP-05 y EP-06.
- Si no puede comprobarse el permiso, el envío no se completa por suposición. Se identifica la incidencia sin divulgar el contenido a un destinatario alternativo.
- Se comprueba que avisos, vistas previas y errores no revelen información restringida. Revocar el acceso no se presenta como garantía de borrar copias que un destinatario ya recibió fuera del HelpDesk.

Necesaria junto con los primeros envíos de Telegram. Refuerza HU-03-10, HU-06-07 y HU-06-08. Falta acordar los datos permitidos por tipo de mensaje y la evidencia que se conservará de las verificaciones.

</details>

### HU-10-06 · Registrar las acciones sensibles para poder revisarlas

**Dictamen:** Parcial. Registro global estructurado y transaccional; sin API/UI de consulta, retención, respaldo ni garantía de inmutabilidad operacional.

**Evidencia:** backend/src/audit/audit.ts; backend/db/migrations/0009_audit_events.sql; backend/src/tickets/operations.ts

<details><summary>Criterios de la planificación revisados</summary>

El supervisor y el administrador pueden consultar quién realizó una acción relevante, cuándo ocurrió y cuál fue su resultado mediante las funciones técnicas de auditoría. En la práctica, la revisión la realiza presencialmente el auditor externo con cuentas temporales de auditoría creadas por el administrador, una por cada rol existente y con vencimiento automático. Esto permite investigar cambios de acceso o configuración y revisar incidentes con evidencia, sin depender únicamente del historial de un ticket.

**Para revisar con el equipo:**

- El catálogo de auditoría incluye los accesos y acciones acordados, los cambios de permisos, configuración, vinculaciones y desvinculaciones, así como operaciones sensibles y fallos de envío relevantes.
- Cada registro identifica al usuario o proceso, la fecha, la acción, el recurso afectado y el resultado. Las acciones del auditor externo se registran a nombre de la cuenta temporal de auditoría utilizada. Cuando corresponda, conserva el motivo y los cambios necesarios para entender la operación.
- Las fechas y referencias permiten relacionar acciones entre módulos y distinguir el momento del evento del procesamiento posterior cuando sean diferentes.
- Los registros no almacenan contraseñas, credenciales de integración, códigos de verificación ni copias completas de contenido privado sin necesidad justificada.
- Si falla el registro de auditoría, se detecta la incidencia y se aplica el tratamiento acordado para la operación afectada. No se afirma que una acción quedó auditada cuando falta su evidencia.
- La auditoría distingue acciones intentadas, rechazadas y completadas cuando corresponda, sin atribuir éxito a una operación fallida.

Necesaria desde las primeras operaciones sensibles. Complementa el historial de HU-02-09 y los cambios de EP-05 y EP-09. Falta acordar el catálogo, la precisión temporal y qué operaciones deben detenerse si no pueden conservar su evidencia.

</details>

### HU-10-07 · Consultar y proteger los registros de auditoría

**Dictamen:** Parcial. Registro global estructurado y transaccional; sin API/UI de consulta, retención, respaldo ni garantía de inmutabilidad operacional.

**Evidencia:** backend/src/audit/audit.ts; backend/db/migrations/0009_audit_events.sql; backend/src/tickets/operations.ts

<details><summary>Criterios de la planificación revisados</summary>

El supervisor y el administrador pueden revisar los registros necesarios para investigar una acción; en la práctica los revisa el auditor externo, presencialmente y con cuentas temporales de auditoría creadas por el administrador, una por cada rol existente y con vencimiento automático. El acceso y la conservación están controlados para que una persona no pueda ocultar sus cambios editando o eliminando esa evidencia sin autorización.

**Para revisar con el equipo:**

- La consulta corresponde técnicamente al supervisor y al administrador y limita el alcance de información visible. El administrador crea cuentas temporales de auditoría, una por cada rol existente y con vencimiento automático; no se agrega un rol de auditor.
- Se propone buscar por período, actor, acción o recurso, respetando los mismos límites en los resultados y en cualquier exportación que se habilite.
- Las funciones habituales del HelpDesk no permiten sobrescribir o borrar registros de auditoría. Su protección impide modificaciones no autorizadas y permite detectar las alteraciones contempladas por el mecanismo acordado.
- Una aclaración o corrección autorizada conserva el registro original y su trazabilidad; no lo sustituye silenciosamente.
- La retención y eliminación autorizada siguen un procedimiento definido. Tener permiso de consulta no concede permiso para modificar o depurar registros.
- El acceso y las acciones sensibles sobre la propia auditoría dejan evidencia protegida. La recuperación de un respaldo no debe utilizarse para ocultar cambios o incidentes posteriores.

Necesaria desde que exista auditoría. Se relaciona con HU-10-06 y HU-10-09. Los roles técnicos de revisión ya son supervisor y administrador. Falta acordar protección de integridad, retención y procedimiento de eliminación, sin prometer una inmutabilidad que no haya sido implementada y comprobada.

</details>

### HU-10-08 · Ejecutar respaldos protegidos y comprobar su resultado

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk.

<details><summary>Criterios de la planificación revisados</summary>

El supervisor y el administrador disponen de las funciones técnicas para respaldar los datos y archivos necesarios para recuperar el HelpDesk; en la práctica, el auditor externo realiza los respaldos y las comprobaciones presencialmente, con cuentas temporales de auditoría creadas por el administrador, una por cada rol existente y con vencimiento automático. Pueden revisar qué se respaldó, de qué momento es la copia y si el proceso terminó correctamente.

**Para revisar con el equipo:**

- El respaldo incluye los datos, archivos y configuración necesarios para recuperar una versión coherente del servicio. Se contemplan tickets, identidades y permisos, historial, auditoría, conocimiento y encuestas según las funciones habilitadas.
- Cuando exista Telegram, también se incluye el estado de procesamiento y envíos pendientes. Los mensajes de la conversación no se respaldan porque el HelpDesk no los conserva.
- Se identifican las dependencias externas y el material protegido necesario para restaurar, sin asumir que una copia de datos recupera cuentas, mensajes o servicios externos de Telegram.
- Las copias tienen acceso y retención controlados y la protección acordada frente a exposición, pérdida o alteración. No se depende únicamente de una copia vulnerable al mismo fallo que el servicio principal.
- Cada ejecución conserva fecha, alcance y resultado. Una copia incompleta o fallida no se presenta como respaldo válido; la incidencia queda disponible para su atención.
- Se comprueba la integridad de la copia con el mecanismo acordado, distinguiendo esa comprobación de una prueba completa de restauración.

Necesaria antes de operar con datos reales, con ampliaciones cuando se incorporen nuevas funciones. Se relaciona con HU-10-09 y HU-10-10. Falta acordar frecuencia, ubicación, retención, responsables y pérdida máxima de datos aceptable.

</details>

### HU-10-09 · Probar la restauración del servicio y registrar sus resultados

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk.

<details><summary>Criterios de la planificación revisados</summary>

El supervisor o administrador puede seguir un procedimiento de recuperación y demostrar que el HelpDesk vuelve a funcionar con datos coherentes; la comprobación presencial corresponde en la práctica al auditor externo, usando cuentas temporales de auditoría creadas por el administrador, una por cada rol existente y con vencimiento automático. La prueba permite conocer el tiempo necesario, las limitaciones y los problemas que deben corregirse antes de depender de una recuperación real.

**Para revisar con el equipo:**

- Existe un procedimiento que identifica responsables, copias necesarias, dependencias, pasos de restauración y comprobaciones antes de devolver el servicio a los usuarios.
- Las pruebas se realizan en un entorno controlado, con acceso protegido y sin sobrescribir la operación vigente ni enviar mensajes reales por accidente.
- Se verifican relaciones entre tickets, archivos, identidades, permisos, historial y las demás funciones habilitadas. Recuperar solo la base de datos no se presenta como suficiente si faltan archivos o configuración necesaria.
- Se mide el tiempo de recuperación y se identifica hasta qué momento se recuperaron datos para compararlos con los objetivos acordados. Cualquier pérdida o inconsistencia se registra explícitamente.
- Antes de habilitar el acceso se revisan sesiones, permisos, cuentas desactivadas y credenciales: una copia anterior no debe reactivar silenciosamente autorizaciones que ya se habían revocado. Si falta evidencia vigente, se resuelve antes de habilitar el acceso afectado.
- La prueba conserva fecha, copia utilizada, verificaciones, resultados y acciones pendientes. Solo una restauración comprobada permite afirmar que ese procedimiento funcionó bajo las condiciones ensayadas.
- La recuperación real sigue el procedimiento y la autorización definidos para el incidente; contar con un respaldo no autoriza por sí solo reemplazar datos actuales.

Necesaria antes del primer uso y repetida según el programa acordado y los cambios relevantes del sistema. Falta definir el tiempo objetivo de recuperación, la pérdida aceptable, la frecuencia de pruebas y quién autoriza volver a operar.

</details>

### HU-10-10 · Reanudar Telegram después de una recuperación

**Dictamen:** Pendiente. No se encontró un flujo integrado que cumpla esta HU.

**Evidencia:** Sin implementación integrada de este control/recuperación en módulos, migraciones o scripts; POC no acredita seguridad del HelpDesk.

<details><summary>Criterios de la planificación revisados</summary>

El responsable autorizado puede reanudar la integración después de restaurar el HelpDesk, revisando qué envíos faltan. Esto evita repetir mensajes ya enviados o dirigir pendientes a personas que dejaron de tener acceso.

**Para revisar con el equipo:**

- Antes de reanudar, se revisan los envíos recuperados, sus referencias de origen y sus estados de envío. Se identifican posibles diferencias entre la copia restaurada y lo ocurrido después.
- No se reenvían todos los envíos por el solo hecho de restaurar. Se distinguen los completados, pendientes, fallidos y aquellos cuyo resultado no se puede confirmar.
- Se comparan las evidencias disponibles para resolver resultados inciertos. Cuando el canal no permite comprobar lo ocurrido, se mantiene visible la incertidumbre y se sigue el procedimiento autorizado antes de repetir contenido.
- Se vuelven a comprobar cuentas, vinculaciones, responsables y permisos vigentes antes de aceptar o enviar nuevos contenidos. Las referencias de una copia antigua no rehabilitan destinatarios revocados.
- Los reintentos utilizan los controles de HU-06-10 para evitar duplicados en mensajes y notificaciones. Los mensajes de Telegram, originales o reprocesados, no cuentan como primera respuesta de SLA; esta se calcula con el primer cambio a En proceso del historial de EP-02.
- Las notificaciones conservadas en la aplicación siguen disponibles según los permisos. Un envío que todavía no puede recuperarse por Telegram no se marca como completado en ese canal.
- La prueba de recuperación incluye la reanudación controlada de la integración y registra los casos que requieren intervención, sin enviar mensajes reales desde un entorno de prueba por defecto.

Necesaria antes de habilitar Telegram y en las pruebas de recuperación que lo incluyan. Se coordina con EP-05, HU-06-09, HU-06-10 y HU-10-09. Falta acordar la comprobación posterior a una restauración y el tratamiento de eventos que quedaron fuera de la copia recuperada.

</details>

## Riesgos y próximos pasos

1. Ejecutar integración PostgreSQL 17 y recorrido real con los cuatro roles antes de acreditar aceptación.
2. Resolver la divergencia de calendarios y acordar criterios de solución/motivos, equipos, retención y concurrencia.
3. Completar solución textual y condiciones de resolución; luego prioridad/SLA con reglas aprobadas.
4. Vincular Telegram de forma persistente y autorizada; comprobar con dos cuentas reales y fallos de envío.
5. Preparar HTTPS, configuración segura de proxy, copias y restauración probada, monitoreo y entrega al cliente.

## Diseño y PDF

Referencia: styles.css/theme.css de Épicas y HU: Manrope y DM Sans, carmín #bf2039, azul #164fb3, navy #09285f, tarjetas translúcidas, bordes claros y gradientes. Su exportación invoca window.print(). Las nuevas páginas tienen una vista de impresión de todas las diapositivas 16:9 y PDFs precompilados descargables, generados desde la misma vista HTML; sin controles y con fondos. Todo el material nuevo permanece en Presentaciones.

## Verificación y capturas

Consultar [resultados reproducibles](verificacion/RESULTADOS.md) y [ejecución](README.md). Las capturas indican explícitamente si hay datos de demostración. No prueban persistencia ni sustituyen pruebas E2E.
