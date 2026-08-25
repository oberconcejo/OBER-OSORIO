# Runbook Operativo - Electoral360

Este documento contiene los procedimientos operativos para mantener y depurar el sistema en producción.

## 1. Verificación de Salud (Health Checks)
La API expone los siguientes endpoints públicos para sondeo:
- `GET /health/live`: Verifica que el proceso NestJS responde.
- `GET /health/ready`: Verifica que NestJS tiene conexión activa a PostgreSQL.

## 2. Despliegues y Rollbacks (CI/CD)
El flujo de despliegue requiere aprobación manual para Producción.
Si un despliegue falla en producción (ej. migraciones rotas):
1. Detener el pipeline actual.
2. En GitHub Actions / GitLab CI, ejecutar el job manual "Rollback to Previous Tag".
3. Si la base de datos sufrió alteraciones incompatibles, coordinar con el DBA para restaurar el snapshot pre-migración.

## 3. Manejo de Exportaciones Bloqueadas
Si los reportes asíncronos (Fase 10) se atascan en estado `PROCESSING`:
1. Verificar si el worker de Redis/Colas está corriendo.
2. Reiniciar el servicio de workers.
3. Ejecutar script de limpieza que pasa jobs viejos a `FAILED`.
