# Centro de Comando Electoral (Fase 19) - Electoral360

Este documento rige la arquitectura del Centro de Comando (Command Center) de Electoral360.

## 1. Modos de Operación
El Command Center tiene 4 estados:
- **NORMAL MODE:** Vista estándar analítica.
- **ELECTION MODE:** Prioriza exclusivamente incidentes críticos, mesas caídas, y procesamiento de actas.
- **MAINTENANCE MODE:** Ventanas de actualización.
- **EMERGENCY MODE:** Degradación controlada, muestra rutas críticas de contingencia.

## 2. Arquitectura Real-Time (Event-Driven)
- Uso recomendado de **WebSockets / Server-Sent Events (SSE)**.
- **Offline Indicator:** Muestra claramente el estado (ONLINE, RECONNECTING, OFFLINE).
- **Stale Data Warning:** Si falla WebSockets, la UI debe mostrar `STALE DATA / LAST UPDATED` para no confundir a los operadores sobre la frescura de los datos.

## 3. Prevención de Modificaciones Silenciosas
**REGLA DE ORO:** Un operador, administrador o sistema automático desde el Command Center **NO PUEDE modificar un voto, anular un acta, ni intervenir en el resultado**. Solo pueden crear un **Incidente** y enrutarlo al flujo de auditoría y revisión oficial, manteniendo intacto el CORE.

## 4. Gestión de Incidentes
- **Tipos:** CONECTIVIDAD, ACTA, SEGURIDAD, INFRAESTRUCTURA.
- **Jerarquía:** LOW, MEDIUM, HIGH, CRITICAL.
- **Handoff & SLA:** Los operadores pueden asignar/derivar un incidente. Los SLAs de resolución alimentarán la telemetría del SOC.

## 5. Security & Isolation
- **Tenant Isolation:** Un supervisor solo ve el Command Center de su propio `organization_id` y su `territory_id` (Ej. Delegado de Antioquia no ve Bogotá).
- **Alert Fatigue:** Sistema de de-duplicación para no colapsar la UI si una misma mesa genera 100 alertas de conectividad en un minuto.
