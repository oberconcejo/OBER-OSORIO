# Auditoría de Ciberseguridad y Zero Trust (Fase 25) - Electoral360

Este documento rige la arquitectura de seguridad perimetral, modelado de amenazas y respuesta a incidentes del sistema Electoral360.

## 1. Security Audit (Estado Teórico vs Físico)
- **AUTH:** Diseño RBAC estricto en el esquema de Prisma (Pasa auditoría teórica). Faltan pruebas físicas (DAST).
- **API:** Rate Limiting y Validación (Zod/Class-Validator) en diseño. Falta SAST continuo.
- **DATABASE:** RBAC implementado. Inmutabilidad de relaciones garantizada. Encriptación en reposo dependerá de la infraestructura Cloud.
- **CLOUDFLARE:** DNS/WAF diseñados. **NO APROVISIONADOS.**
- **AI SECURITY:** *Prompt Injection Protection* y Tenant Isolation diseñados en Fase 24.

## 2. Threat Model (Modelado de Amenazas STRIDE)
1. **Spoofing (Suplantación):** Mitigado por MFA (obligatorio para ADMIN).
2. **Tampering (Manipulación de Actas):** Mitigado por Auditoría Inmutable (Tabla `AuditLog`) y cifrado de Storage (Cloudflare R2/S3).
3. **Repudiation (Repudio):** Mitigado mediante validación criptográfica en backend.
4. **Information Disclosure (Fuga de Datos):** Mitigado mediante *Object-Level Authorization* y *Tenant Isolation* (`organization_id`).
5. **Denial of Service (DDoS):** A mitigarse delegando la capa 7 a Cloudflare WAF.
6. **Elevation of Privilege (Escalada):** Mitigado al no usar *Mass Assignment* y tener el RBAC fuertemente acoplado en Base de Datos, no solo en frontend.

## 3. Risk Register (Registro de Riesgos Críticos)
| Riesgo | Probabilidad | Impacto | Mitigación | Propietario |
|---|---|---|---|---|
| Ataque DDoS durante elección | ALTA | CRÍTICO | Cloudflare Under Attack Mode + Rate Limit | CISO |
| Fuga de secretos en repositorio | MEDIA | CRÍTICO | Git-Leaks + Secret Scanning Pipeline | DevSecOps |
| Ransomware en base de datos | BAJA | CRÍTICO | Backups inmutables y Point-In-Time-Recovery (PITR) | DBA |

## 4. Remediation Roadmap
1. **P0:** Configurar SAST (Static Application Security Testing) en la canalización CI/CD (GitHub/GitLab).
2. **P0:** Aprobar e implementar Cloudflare WAF con reglas OWASP Top 10.
3. **P1:** Ejecutar Pentest (DAST) sobre entorno de Staging.
4. **P2:** Activar MFA obligatorio (TOTP) en el frontend.
