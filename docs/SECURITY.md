# Políticas de Seguridad Electoral360

## 1. Autenticación y Autorización
- Se utiliza JWT para las sesiones, con tiempos de expiración cortos (15-30 mins).
- Las contraseñas usan hashing robusto (Bcrypt/Argon2).
- Toda ruta de la API está protegida por Guards de NestJS (AuthGuard, RolesGuard, TerritoryGuard).

## 2. Protección de Datos (PII)
- Datos como números de documento y teléfonos están ofuscados en listados generales.
- Las URLs de evidencias fotográficas (Actas) usan *Pre-signed URLs* con expiración de 5 minutos, impidiendo hotlinking público.

## 3. OWASP Top 10 Mitigaciones
- **SQL Injection**: Prevenido por el uso estricto del ORM Prisma (Prepared Statements).
- **XSS**: Prevenido nativamente por React y sanitización estricta en endpoints de entrada (Class-validator en NestJS).
- **IDOR**: Todo ID requerido en URL (`/api/v1/results/:id`) es cruzado contra el `organization_id` y `territory_id` del usuario en la base de datos.
- **CSRF**: Mitigado por el uso de headers `Authorization: Bearer <token>` y políticas CORS estrictas.
- **Rate Limiting**: Aplicado a nivel de Cloudflare y Throttler en NestJS, especialmente estricto en el endpoint de Login y carga de archivos (Actas).

## 4. Gestión de Secretos
- PROHIBIDO versionar archivos `.env`.
- Los secretos de Producción se inyectan a través del gestor de secretos del proveedor Cloud (ej. AWS Secrets Manager o Doppler).
