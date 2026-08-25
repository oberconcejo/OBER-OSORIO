# Arquitectura Electoral360

## 1. Topología del Sistema
El flujo de datos de Electoral360 está diseñado para garantizar alta disponibilidad y seguridad transaccional:

`Usuario` -> `Cloudflare (WAF/DNS/DDoS)` -> `React Frontend (Vite/SPA)` -> `NestJS API REST` -> `PostgreSQL (Prisma)` -> `Almacenamiento (S3/R2 para Actas)`

## 2. Multi-tenancy
Todos los datos (Usuarios, Electores, Territorios, Resultados) están aislados mediante la columna `organization_id`. Las políticas de aplicación exigen que cada request inyecte este ID proveniente del JWT del usuario. Nunca se permite el cruce de datos.

## 3. Control Territorial
El control de acceso basado en roles (RBAC) está complementado por el alcance territorial. Un usuario asignado a la "Zona A" no puede consultar, alterar ni auditar operaciones de la "Zona B".

## 4. Auditoría Inmutable
Todo evento crítico (Auth, Resultados, Exportaciones) graba un log transaccional en la tabla `AuditLog`. Esta tabla es *Append-Only* a nivel de backend. No existen endpoints de DELETE o UPDATE para esta entidad.
