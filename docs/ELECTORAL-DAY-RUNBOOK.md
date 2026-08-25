# Runbook de la Jornada Electoral - Electoral360

Este documento contiene los protocolos operativos exclusivos para el Día D (Jornada Electoral), garantizando alta disponibilidad, integridad de datos y respuesta a incidentes bajo condiciones de máxima concurrencia.

## 1. Inicio de Jornada (04:00 AM - 07:00 AM)
- **Verificación de Salud**: Confirmar estados `HTTP 200` en `/health/live` y `/health/ready`.
- **Cloudflare**: Activar regla de caché estático pre-calentado (Pre-warming).
- **Monitoreo**: Habilitar dashboards de SLO (Disponibilidad y P95).
- **Sincronización**: Verificar que las colas de Redis/Workers (para ingesta asíncrona de reportes offline) estén en cero (0) mensajes encolados.

## 2. Monitoreo Durante el Día D (08:00 AM - 04:00 PM)
- **RPS y P95**: Monitorear los *Requests Per Second*. Si el P95 (Latencia del 95% de las peticiones) supera los 1500ms, escalar horizontalmente los pods de la API.
- **Conexiones DB**: Si PostgreSQL alcanza el 80% del límite del `max_connections`, forzar terminación de conexiones ociosas (Idle) e inspeccionar *Slow Queries*.
- **Backpressure**: Si la ingesta de FieldReports (Fase 8) se acumula en el cliente offline, el servidor aceptará los paquetes vía *Background Queues* en lugar de procesamiento síncrono.

## 3. Picos de Tráfico y Escrutinio (04:00 PM - 09:00 PM)
- **Actas y Resultados (Fase 9)**: Este es el pico crítico de concurrencia.
- **Protección de DB**: Toda modificación de Resultados entra con *Optimistic Locking* (Versionamiento). Si dos digitadores envían correcciones simultáneas, el sistema prioriza la primera y rechaza la segunda con conflicto (HTTP 409).
- **Storage**: Las pre-signed URLs de S3/R2 evitan sobrecargar el ancho de banda del backend. Solo se transfiere metadatos a la API.

## 4. Fallos y Contingencia (Degraded Mode)
- **Fallo Analítico**: Si el módulo de reportes asíncronos (Fase 10) colapsa, desactivar la pestaña "Analítica" vía *Feature Flag*. El ingreso transaccional de Resultados (Fase 9) debe continuar al 100%.
- **Fallo de Conectividad (Offline)**: Los testigos y coordinadores (Fase 8) almacenarán la data en el almacenamiento local del navegador (IndexedDB) con llaves UUID únicas (Idempotencia). Se sincronizarán al recuperar la red.

## 5. Resultados y Cierre
- Congelamiento de ingesta transaccional (Write Freeze) a las 23:59.
- Ejecución de un snapshot completo de base de datos (Post-Electoral Backup).
- Exportación en frío (Cold Storage) de todas las actas escaneadas para auditorías.
