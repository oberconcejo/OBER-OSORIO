# GO-LIVE PLAN & PRODUCTION CHECKLIST (Fase 28)

## 1. Go-Live Plan
El plan de pase a producción consta de las siguientes etapas obligatorias:

### Fase Pre-Go-Live
- Ejecución de escaneos de seguridad DAST y SAST finales.
- Simulación de Restore de Base de Datos en un entorno aislado.
- Validación de despliegue en Staging idéntico a Producción.

### Fase Go-Live
- Apuntar registros DNS de Cloudflare hacia la IP/CNAME del balanceador de Producción.
- Activar reglas estrictas del WAF (Under Attack Mode si se detectan anomalías).
- Escalar instancias de Backend y réplicas de Base de Datos.

### Fase Post-Go-Live
- Monitoreo en tiempo real de `p95 latency`, tasas de error (HTTP 5xx) y eventos de seguridad.
- Habilitación del *Incident Command Center*.

---

## 2. Production Checklist
**Estado actual de validación para Producción:**

- [x] **Frontend:** Desplegado en Vercel (SPA, Rutas, Tailwind).
- [ ] **Domain & DNS:** Dominio `electoral360.com` no apuntado a infraestructura definitiva.
- [ ] **Cloudflare & WAF:** Reglas contra DDoS y Rate Limiting no implementadas físicamente.
- [ ] **Backend API:** No desplegado en infraestructura de alta disponibilidad.
- [ ] **Database:** PostgreSQL no aprovisionada. No hay esquema de backups automáticos (Punto en el tiempo - PITR).
- [ ] **Backup & Restore:** Prueba de Restore de emergencia NUNCA ejecutada.
- [ ] **Security:** Falta rotación de secretos y variables de entorno reales. Pruebas de penetración no realizadas.
