# Guía de Despliegue a Producción (Fase 21) - Electoral360

Este documento rige el protocolo de despliegue a producción de Electoral360.

## 1. Regla de Parada Inmediata (Kill Switch)
Si la Fase 20 (Testing QA Integral) **NO** fue aprobada formalmente y no cuenta con un certificado `PRODUCTION READY`, el proceso de *Go-Live* queda estrictamente bloqueado.

## 2. Playbook de Despliegue (Go-Live)
Si se cuenta con autorización, la secuencia inmutable es:
1. **Change Freeze:** Prohibir cualquier commit que no sea de emergencia.
2. **Pre-Flight Check:** Validar métricas de salud en Staging.
3. **Database Snapshot:** Creación de Backup manual inmutable (`pg_dump`).
4. **Zero-Downtime DB Migrations:** Ejecutar scripts de Prisma (`npx prisma migrate deploy`). Si fallan -> Rollback Inmediato.
5. **Backend Deployment:** Desplegar contenedores API en el clúster. 
6. **Frontend Deployment:** Limpiar caché (CDN Cloudflare) y desplegar SPA estática.
7. **Smoke Tests:** Validar que un usuario SUPER_ADMIN puede hacer login.
8. **Live:** Apertura del WAF al tráfico público.

## 3. Protocolo de Rollback
Todo despliegue fallido que involucre corrupción de base de datos accionará un retorno al *Point-in-Time Recovery (PITR)* exacto del inicio del despliegue. No se intentarán parches manuales sobre la base de datos en caliente.
