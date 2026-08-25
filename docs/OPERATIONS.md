# Modelo de Operación y Gobierno - Electoral360

Este documento rige la etapa de post-despliegue (Fase 15), estableciendo las directrices de SRE, Incident Management, Change Management y Data Governance de Electoral360.

## 1. Niveles de Soporte (Ticketing)
- **L1 (Mesa de Ayuda)**: Resolución de accesos (MFA, contraseñas) y soporte funcional.
- **L2 (Soporte Técnico)**: Errores de configuración de territorios, roles y acceso cruzado.
- **L3 (Ingeniería/SRE)**: Caídas de base de datos, optimización de queries, despliegues.
- **L4 (Proveedores)**: Cloudflare (DNS/WAF), Infraestructura Cloud, Postgres Hosting.

## 2. Gestión de Incidentes (Incident Command)
Clasificación estricta:
- **P0 (Crítico)**: Base de datos inaccesible, caída total de API, violación de Tenant (Aislamiento territorial roto). SLA de respuesta: Inmediato.
- **P1 (Alto)**: Degradación en ingesta de Actas o Resultados. 
- **P2 (Medio)**: Fallo en reportes analíticos asíncronos.
- **P3 / P4**: Mejoras funcionales y bugs cosméticos.

## 3. Change Management y Gobernanza de Base de Datos
- Las migraciones estructurales requerirán un ADR (Architecture Decision Record) y un **Code Freeze** de 48 horas previo a los comicios.
- Todo cambio en resultados confirmados invoca un rastro forense forzoso en la tabla `AuditLog`, el cual es de Solo-Lectura (Append-Only) para administradores.

## 4. Retención y Privacidad (Data Governance)
- **Archivado (Cold Storage)**: Las actas electorales (imágenes físicas) pasarán a almacenamiento frío 6 meses post-elección.
- Los logs técnicos y de métricas operativas (Cloudflare, CPU, RAM) se separan conceptualmente de la auditoría electoral interna de la aplicación.
