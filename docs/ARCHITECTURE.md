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

## 5. Planeación y Operación Territorial (Fase 14)
La planeación territorial permite convertir la cobertura geopolítica de la campaña en planes y metas de acción. Estructurada mediante:
- **Planes (Plan):** Entidades raíz atadas a `organization_id` con vigencia temporal y alcance geopolítico (Municipio, Zona, Puesto).
- **Objetivos (Objective):** Metas dentro de un plan asignadas a un colaborador (`TeamMember`).
- **Actividades (Activity):** Acciones operativas granulares con tipo, prioridad, fechas límite, check-lists de tareas, bitácora de comentarios y adjuntos de evidencias.
- **Validaciones de Dependencia:** Impide completar una actividad si sus actividades precedentes (`ActivityDependency`) no están en estado COMPLETADA.
- **Aislamiento Multi-Tenant:** Todas las transacciones verifican la pertenencia del recurso a la organización a través del `JwtAuthGuard`.

## 6. Movilización Electoral y Gestión de Jornada (Fase 15)
El Centro de Operaciones controla la movilización operativa interna el día de la jornada. Consta de:
- **Operaciones y Días Operativos (Operation/OperationDay):** La estructura del cronograma operativo de jornada.
- **Actividades de Movilización (MobilizationActivity):** Acciones del día (Coordinación, Reuniones, etc.) distribuidas en Kanban.
- **Puntos Operativos (OperationalPoint):** Ubicaciones clave de apoyo y coordinación.
- **Incidencias (Incident/History):** Reporte, asignación y bitácora de resolución de novedades en terreno con 4 niveles de severidad. Si hay una incidencia crítica abierta, el "Nivel de Alerta" del panel cambia automáticamente a "CRÍTICO".
- **Recursos (OperationalResource/Assignment):** Inventario y asignación de activos logísticos (vehículos, folletos, etc.) a los colaboradores en campo.
- **Protección de Datos:** Las incidencias y recursos están aislados a nivel de campaña, garantizando la privacidad de los responsables.
