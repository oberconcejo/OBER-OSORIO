# Plan de Pruebas Integrales y QA (Fase 20) - Electoral360

Este documento rige la estrategia de aseguramiento de calidad (QA) y certificación para el paso a Producción (Go-Live).

## 1. Estrategia de Pruebas (Test Plan)
Todo cambio debe someterse a:
1. **Unit Testing:** Cobertura de lógica de negocio (validación de actas, checksums).
2. **Integration Testing:** Interacción entre API y Base de datos (Testcontainers).
3. **E2E Testing (Cypress / Playwright):** Flujos completos desde el Frontend hasta la Base de datos.
4. **Security Testing:** SAST (SonarQube) y DAST (Pentest) en Staging.
5. **Performance Testing:** k6 / JMeter para simular picos electorales.

## 2. Flujos Críticos E2E a Automatizar
- **Flujo de Escrutinio:** Subida de Acta -> OCR/IA (Opcional) -> Digitación Manual -> Verificación -> Aprobación -> Inserción en `VoteResult`.
- **Tenant Isolation:** Usuario Territorial A intenta consultar mesas del Usuario Territorial B (Debe retornar 403 Forbidden).
- **Idempotencia:** Doble clic o reenvío por mala red al subir un acta (Debe retornar 409 Conflict o procesar como 200 sin duplicar datos).

## 3. Entornos
- **Development:** Base de datos volátil.
- **Staging / UAT:** Réplica exacta de Producción (escala reducida). Datos ofuscados.
- **Production:** Solo código certificado. Prohibidas pruebas destructivas o de estrés.

## 4. Criterios de Aprobación (GO / NO-GO)
**NO-GO inmediato si:**
- Existen Bugs Críticos (Blockers) abiertos.
- Fallan pruebas de regresión en el módulo de Resultados.
- Existen vulnerabilidades de seguridad sin mitigar (Ej. Posible inyección SQL o Bypass de autorización).
- El Backup / Restore falla en el simulacro de recuperación.
