# Inteligencia Electoral y Analítica Avanzada (Fase 16) - Electoral360

## 1. Arquitectura
La capa de Inteligencia Electoral se sitúa por encima del CORE (Usuarios, Actas, Resultados, Auditoría) bajo un principio inamovible de **aislamiento de responsabilidad y protección contra escritura**.
- **Data Access Layer**: Conexión de solo lectura (Read-Replica) a las tablas principales.
- **Analytics API**: Endpoints independientes de `/api/v1/analytics/*`.

## 2. Model Registry y Motor de Anomalías (Anomaly Engine)
Todo modelo predictivo o de detección de anomalías se registra y versiona. 
Las anomalías detectadas (picos anormales, caídas de latencia, volúmenes atípicos de votos) generan una entidad `AnomalyAlert` en el sistema.
- **Score (0-100)**: Clasifica la prioridad.
- **Review Humano**: Toda alerta requiere revisión (`reviewed_by`) y una nota de resolución (`resolution_note`).
- **Regla Estricta**: La IA **nunca** actúa autónomamente sobre resultados ni invalida actas; solo alerta al Centro de Decisiones.

## 3. Seguridad y Privacidad
- El asistente de IA (`Asistente Electoral`) hereda el JWT del usuario y aplica los filtros de Multi-tenancy (`organization_id`) y Aislamiento Territorial. No tiene acceso a tablas críticas más allá del alcance asignado al rol.
- Se ha diseñado la protección contra **Prompt Injection** y **Data Exfiltration** limitando estrictamente el catálogo de datos (Data Lineage) accesible mediante RAG/LLM a solo métricas agregadas y no a datos personales sensibles.

## 4. Simulaciones (What-if Analysis)
Los escenarios estadísticos, proyecciones (escenario optimista/pesimista) y simulaciones de inteligencia se agrupan en `SimulationScenario`. Tienen una fuerte marca de agua en frontend para no ser confundidos con los resultados reales del Core.
