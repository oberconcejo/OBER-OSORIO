# Escalabilidad y Alta Disponibilidad (Fase 17) - Electoral360

Este documento rige la arquitectura de escalabilidad de Electoral360.

## 1. Arquitectura Objetivo (Electoral Peak Mode)
Durante una Jornada Electoral, la arquitectura muta a:
- **Cloudflare Edge**: WAF estricto, mitigación DDoS, Rate Limiting (Picos de ataque).
- **Load Balancers**: Distribución Layer 7.
- **Stateless API (NestJS)**: Clústeres escalables horizontalmente. Sesiones gestionadas vía JWT (sin estado local).
- **Background Queues (Redis/Bull)**: Reportes masivos y exportaciones pesadas van a una Dead Letter Queue (DLQ) si fallan, liberando el hilo principal del servidor web (Event Loop).
- **Base de Datos (PostgreSQL)**: Conexiones protegidas mediante un Connection Pooler (Ej. PgBouncer).

## 2. Protección de la Ruta Crítica (Critical Path)
El ingreso de Actas y Resultados tiene **prioridad absoluta**. 
Si el servidor experimenta degradación (Falla la IA, fallan los reportes asíncronos), la ingesta de votos DEBE continuar (Graceful Degradation).

## 3. RPO y RTO (Objetivos de Recuperación)
- **RPO (Recovery Point Objective)**: 0 minutos para transacciones de resultados (Sincronización Multi-AZ).
- **RTO (Recovery Time Objective)**: < 15 minutos en failover de base de datos secundaria.

## 4. Idempotencia y Doble Envío
Las subidas de actas implementan llaves de idempotencia (`checksum` en `ElectionAct`) para evitar que un reintento de red durante un pico de tráfico duplique los votos.

## 5. Pruebas Pendientes de Ejecución (Chaos & Load)
- Pruebas de Carga (Normal / Peak)
- Pruebas de Estrés (Degradación controlada)
- Spike Tests (Picos repentinos de tráfico)
- Soak Tests (Fugas de memoria)
- Simulacros de Failover (Failover Drill)
