# Auditoría de Calidad y Pruebas E2E (Fase 27) - Electoral360

Este documento establece la estrategia de aseguramiento de calidad (QA), el registro de defectos y la certificación final para producción.

## 1. Test Plan (Estrategia de Pruebas)
- **Unit Tests:** Validación de algoritmos de cálculo de escrutinio (aislados del framework).
- **Integration Tests:** Validación de rutas de API con base de datos en memoria (SQLite/Testcontainers).
- **E2E Tests:** Pruebas automatizadas de flujos críticos usando Playwright/Cypress.
- **Load Tests:** Simulaciones de Election Day Peak con k6/JMeter.
- **Security Tests:** Análisis DAST y escaneo de dependencias (OWASP).

## 2. Bug Register (Registro de Defectos)
Actualmente, el registro de defectos físicos está vacío porque el código no ha sido desplegado en un entorno testeable. Sin embargo, los siguientes riesgos actúan como bloqueadores (NO-GO) teóricos:
- **BUG-001 (CRITICAL):** Falta de pruebas unitarias físicas para la función de totalización de actas.
- **BUG-002 (HIGH):** Ausencia de pruebas de estrés (Spike Test) para garantizar la disponibilidad durante el cierre de urnas.
- **BUG-003 (HIGH):** Ausencia de validación de recuperación de base de datos (Restore Test).

## 3. Final Quality Gate (Criterios de Aprobación)
Para que una versión (Release Candidate) sea certificada (GO) para Producción, debe cumplir:
1. Cobertura de pruebas (Test Coverage) > 80% en lógica de negocio.
2. Cero (0) bugs críticos o altos (Severidad P0/P1) abiertos.
3. Cero (0) vulnerabilidades de seguridad críticas sin mitigar.
4. Pruebas E2E del flujo `LOGIN -> CARGAR ACTA -> APROBAR ACTA -> VER DASHBOARD` exitosas al 100%.
5. Tiempos de respuesta del percentil 95 (P95) por debajo de 500ms bajo carga normal.
6. Restauración de backup probada exitosamente en el último mes.
