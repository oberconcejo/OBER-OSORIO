# Arquitectura de Infraestructura, DevOps y Observabilidad (Fase 26) - Electoral360

Este documento rige la infraestructura de nube, la canalización de integración y entrega continua (CI/CD), la observabilidad y los planes de recuperación ante desastres.

## 1. Cloud Architecture (Teórica)
- **Edge / WAF / DNS:** Cloudflare (Protección DDoS capa 7, caché perimetral, SSL/TLS estricto).
- **Frontend:** React + TypeScript (Servido vía Cloudflare Pages o AWS CloudFront / Vercel).
- **Backend:** NestJS (Desplegado en contenedores escalables, ej. ECS Fargate o Google Cloud Run).
- **Database:** PostgreSQL (Cloud SQL o AWS RDS con Alta Disponibilidad, Multi-AZ).
- **Storage:** S3 / Cloudflare R2 para actas y documentos.

## 2. CI/CD Architecture (Pipeline)
1. **COMMIT:** Push a rama protegida (`main` o `develop`).
2. **SCAN:** SAST (SonarQube/GitHub Advanced Security), Secret Scanning.
3. **BUILD & TEST:** Instalación de dependencias (npm/yarn), Linter, Typecheck, Unit/Integration Tests.
4. **IMAGE BUILD:** Construcción de contenedor Docker inmutable.
5. **DEPLOY (Staging):** Despliegue automático a entorno de Staging. Aprobación manual requerida para Producción (Release Candidate).

## 3. Observability Architecture
- **Centralized Logging:** Logs estructurados (JSON) sin PII/secretos. Almacenamiento en Elasticsearch/Datadog.
- **Metrics:** Consumo de CPU/RAM, Pool de Conexiones DB, Latencia de API (Prometheus/Grafana).
- **Tracing:** Correlation IDs para rastrear peticiones desde el Frontend hasta la Base de Datos.
- **Alerting:** Alertas P1/P2 integradas con PagerDuty/Slack para picos de latencia o alta tasa de errores HTTP 500.

## 4. Disaster Recovery Plan (RTO / RPO)
- **RPO (Recovery Point Objective):** < 5 minutos (Log de transacciones/PITR en PostgreSQL).
- **RTO (Recovery Time Objective):** < 1 hora (Despliegue automático de Infraestructura como Código - Terraform/Pulumi).
- **Backup Plan:** Snapshots diarios cifrados, retenidos por 30 días, inmutables. Pruebas de restauración (Restore Tests) programadas mensualmente.
- **Degraded Mode:** Si falla la Inteligencia Artificial o el Módulo de Reportes pesados, el Core de Escrutinio continuará operando.
