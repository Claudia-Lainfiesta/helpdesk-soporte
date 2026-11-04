# HelpDesk: Sprint Backlog (MVP)

Fuente: `Requerimientos/UserStoryMapping.md`, `Requerimientos/Epics.md` y la página de planificación (`Planificacion/epicas_hu_backlog_page/plan.js`). El MVP son 20 de las 98 historias, repartidas en seis sprints (S01 a S06) y un Sprint 0 preparatorio.

**Estado de cada ítem:** Por hacer / En curso / Hecho. **Responsables:** A (backend y base de datos), B (interfaz) y C (pruebas).

## S00 · Cimientos

**Objetivo:** dejar lista la arquitectura, el entorno, las herramientas y los acuerdos para que los tres integrantes puedan trabajar e integrar sus cambios. Sin historias de usuario.

| # | Tarea | Responsable | Estado |
|---|---|---|---|
| S0-01 | Confirmar tecnologías, arquitectura y despliegue (plataforma web acordada) | A + B | Por hacer |
| S0-02 | Organizar repositorio, ramas y revisiones | Los tres | Por hacer |
| S0-03 | Preparar un entorno reproducible para el equipo | C | Por hacer |
| S0-04 | Provisionar PostgreSQL y comprobar el esquema | A | Por hacer |
| S0-05 | Preparar hosting de pruebas e integración continua | A + C | En curso |
| S0-06 | Configurar y validar el bot Telegram de pruebas | C | En curso |
| S0-07 | Diseñar prototipos de los flujos del MVP | B | Por hacer |
| S0-08 | Revisar acuerdos de producto y pendientes | Los tres | Hecho |
| S0-09 | Revisar ubicación del repositorio y documentación | B + C | Por hacer |

S0-05 y S0-06 siguen en curso: falta comprobar la ejecución de CI y probar el relevo de Telegram con dos cuentas reales.

**Decisiones del cliente cerradas el 29-oct-2026:**

- Primera respuesta: primer cambio a En proceso, calculado con el historial de estados, sin columna aparte ni dependencia de Telegram.
- El agente cierra los tickets terminados con éxito y solo el supervisor cancela, con motivo, cuando se decide no continuar.
- El supervisor ajusta prioridades y concede excepciones de tiempo.
- Plataforma web.
- El supervisor revisa artículos y el administrador publica. Auditoría y respaldo corresponden técnicamente a supervisor y administrador; en la práctica los realiza presencialmente un tercero externo, con acceso local mediante cuentas temporales de auditoría creadas por el administrador, una por cada rol existente y con vencimiento automático, sin quinto rol y con las acciones registradas a nombre de la cuenta de auditoría utilizada.

Los acuerdos y las consideraciones todavía pendientes están en [Decisiones-de-producto.md](../Decisiones-de-producto.md).

## S01 · Base y acceso

**Objetivo:** Integrar el acceso, los permisos y la administración básica sobre el código existente.

| ID | Épica | Historia | Responsable | Estado |
|---|---|---|---|---|
| HU-10-01 | EP-10 | Proteger el acceso y las sesiones del HelpDesk | A | Por hacer |
| HU-05-03 | EP-05 | Entrar al HelpDesk y cerrar la sesión | B | Por hacer |
| HU-05-01 | EP-05 | Habilitar una cuenta para un usuario | A | Por hacer |
| HU-05-05 | EP-05 | Asignar y ajustar roles según la responsabilidad del usuario | A | Por hacer |
| HU-05-07 | EP-05 | Acceder únicamente a las funciones y datos autorizados | C | Por hacer |
| HU-09-01 | EP-09 | Mantener categorías y opciones de clasificación | B | Por hacer |

## S02 · Portal e identidad Telegram

**Objetivo:** Registrar y consultar solicitudes, mientras se prepara una identidad Telegram verificable.

| ID | Épica | Historia | Responsable | Estado |
|---|---|---|---|---|
| HU-01-01 | EP-01 | Registrar una solicitud de soporte | A | Por hacer |
| HU-01-03 | EP-01 | Consultar mis solicitudes | B | Por hacer |
| HU-01-05 | EP-01 | Consultar el detalle y la responsabilidad de atención | B | Por hacer |
| HU-05-09 | EP-05 | Vincular una identidad de Telegram de forma verificable | C | Por hacer |

## S03 · Asignación y atención

**Objetivo:** Asignar cada caso y registrar sus estados y actividades.

| ID | Épica | Historia | Responsable | Estado |
|---|---|---|---|---|
| HU-03-02 | EP-03 | Identificar solicitudes que todavía necesitan asignación | B | Por hacer |
| HU-03-03 | EP-03 | Asignar un ticket al equipo y agente adecuados | A | Por hacer |
| HU-02-01 | EP-02 | Actualizar el estado de un ticket | A | Por hacer |
| HU-02-02 | EP-02 | Registrar el trabajo realizado en una solicitud | B | Por hacer |

## S04 · Resolución y tiempos

**Objetivo:** Completar solución y cierre, y presentar prioridades y vencimientos.

| ID | Épica | Historia | Responsable | Estado |
|---|---|---|---|---|
| HU-02-05 | EP-02 | Documentar la solución y resolver el ticket | A | Por hacer |
| HU-02-06 | EP-02 | Cerrar un ticket cuando termina su atención | C | Por hacer |
| HU-01-08 | EP-01 | Consultar la solución de una solicitud | B | Por hacer |
| HU-04-01 | EP-04 | Determinar la prioridad de una solicitud | A | Por hacer |
| HU-04-03 | EP-04 | Conocer las fechas límite de atención | A | Por hacer |

Nota: los tiempos de SLA usan valores fijos de ejemplo en el MVP; su configuración completa (EP-09) queda para después. HU-04-04 ya no depende de Telegram, sino del historial de estados de HU-02-01 y HU-02-09. HU-02-01 y HU-02-02 están en S03 e incluyen el registro de cambios; HU-02-09 y HU-04-04 no tienen sprint asignado en este MVP. Hay que revisar esa cobertura antes de planificar HU-04-04; no se movieron ni agregaron historias a los sprints.

## S05 · Avisos e integración

**Objetivo:** Conectar los eventos relevantes con avisos en aplicación y Telegram.

| ID | Épica | Historia | Responsable | Estado |
|---|---|---|---|---|
| HU-06-08 | EP-06 | Recibir los avisos relevantes en la aplicación y en Telegram | C | Por hacer |

| # | Tarea | Responsable | Estado |
|---|---|---|---|
| S05-01 | Integración transversal y recorrido completo | A + B + C | Por hacer |

## S06 · Validación y entrega

**Objetivo:** Cerrar defectos, documentar y ensayar. No iniciar nuevas historias.


| # | Tarea | Responsable | Estado |
|---|---|---|---|
| S06-01 | Regresión, correcciones y preparación de entrega | A + B + C | Por hacer |

## Fuera del MVP (Product Backlog restante)

78 historias para fases posteriores: base de conocimiento (EP-07), reportes y satisfacción (EP-08), reasignación y transferencia, escalamiento, auditoría y respaldos, y el resto de EP-01 a EP-06 y EP-09. El detalle está en `UserStoryMapping.md`.
