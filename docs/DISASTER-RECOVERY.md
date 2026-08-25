# Plan de Recuperación ante Desastres (Disaster Recovery)

## 1. Objetivos de Recuperación
- **RPO (Recovery Point Objective)**: 15 Minutos (Pérdida máxima de datos tolerada).
- **RTO (Recovery Time Objective)**: 4 Horas (Tiempo máximo para restaurar servicios en caso de caída total).

## 2. Backups de Base de Datos
- **Frecuencia**: Full Backup Diario (2:00 AM) + WAL (Write-Ahead Logs) continuos cada 5 minutos.
- **Almacenamiento**: Bucket S3 seguro con retención inmutable (Object Lock) para evitar eliminación por Ransomware.
- **Pruebas de Restauración**: Ejecutadas obligatoriamente el día 15 de cada mes en un entorno aislado (Staging).

## 3. Escenarios de Desastre
### A. Caída de Base de Datos Principal
1. Activar réplica Read-Only y promoverla a Primary.
2. Actualizar la variable `DATABASE_URL` en el entorno.
3. Reiniciar instancias de backend.

### B. Corrupción de Datos (Error humano/Malicioso)
1. Detener el tráfico entrante desde Cloudflare.
2. Identificar el punto de tiempo exacto previo a la corrupción.
3. Restaurar la base de datos vía PITR (Point-In-Time Recovery) de los WAL logs.
4. Auditar `AuditLog` para identificar al responsable.

### C. Falla de Cloudflare
1. Cambiar los nameservers del dominio en el registrador a un proveedor DNS de respaldo (ej. Route53).
2. Asegurar que las IPs de los balanceadores estáticos asuman el tráfico directo con certificados de emergencia.
