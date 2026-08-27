# API de Planeación y Operación Territorial (Fase 14)

Todos los endpoints listados a continuación requieren autenticación mediante JWT Bearer token y están protegidos contra IDOR (validan pertenencia del recurso a la organización activa del usuario).

## Planes (`/plans`)

### 1. Obtener todos los planes
* **Método:** `GET`
* **Ruta:** `/api/v1/plans`
* **Respuesta (200 OK):**
  ```json
  [
    {
      "id": "uuid-plan-1",
      "name": "Plan Operativo Norte",
      "description": "Fase de control y presencia territorial",
      "start_date": "2026-09-01T00:00:00.000Z",
      "end_date": "2026-10-31T00:00:00.000Z",
      "status": "ACTIVE",
      "priority": "MEDIA"
    }
  ]
  ```

### 2. Crear un plan
* **Método:** `POST`
* **Ruta:** `/api/v1/plans`
* **Cuerpo:**
  ```json
  {
    "name": "Plan de Acreditación",
    "description": "Capacitación y control",
    "start_date": "2026-09-10",
    "priority": "ALTA"
  }
  ```

### 3. Obtener un plan por ID
* **Método:** `GET`
* **Ruta:** `/api/v1/plans/:id`

### 4. Actualizar un plan
* **Método:** `PATCH`
* **Ruta:** `/api/v1/plans/:id`

### 5. Eliminar un plan
* **Método:** `DELETE`
* **Ruta:** `/api/v1/plans/:id`

---

## Objetivos (`/plans/:planId/objectives` / `/objectives`)

### 1. Añadir objetivo a un plan
* **Método:** `POST`
* **Ruta:** `/api/v1/plans/:planId/objectives`
* **Cuerpo:**
  ```json
  {
    "name": "Completar la zona norte",
    "description": "100% de testigos nombrados",
    "priority": "HIGH"
  }
  ```

### 2. Actualizar objetivo
* **Método:** `PATCH`
* **Ruta:** `/api/v1/objectives/:id`

### 3. Eliminar objetivo
* **Método:** `DELETE`
* **Ruta:** `/api/v1/objectives/:id`

---

## Actividades (`/activities`)

### 1. Crear actividad
* **Método:** `POST`
* **Ruta:** `/api/v1/activities`
* **Cuerpo:**
  ```json
  {
    "plan_id": "uuid-plan-1",
    "objective_id": "uuid-obj-1",
    "name": "Entregar credenciales",
    "type": "LOGISTICA",
    "priority": "MEDIA",
    "start_date": "2026-09-11",
    "due_date": "2026-09-15",
    "assignee_ids": ["uuid-member-1"]
  }
  ```

### 2. Cambiar estado de actividad (con validación de precedencias)
* **Método:** `PATCH`
* **Ruta:** `/api/v1/activities/:id/status`
* **Cuerpo:**
  ```json
  {
    "status": "COMPLETADA"
  }
  ```
* **Respuesta de error si tiene dependencias pendientes (400 Bad Request):**
  ```json
  {
    "message": "No se puede completar esta actividad. Depende de las siguientes actividades pendientes: [Actividad Precedente]"
  }
  ```

---

## Checklist, Comentarios y Evidencias

* **Añadir elemento a checklist:** `POST /api/v1/activities/:id/checklist` (Cuerpo: `{ "title": "Contactar líder" }`)
* **Marcar/Desmarcar checklist:** `PATCH /api/v1/activities/checklist/:itemId` (Cuerpo: `{ "is_completed": true }`)
* **Agregar comentario:** `POST /api/v1/activities/:id/comments` (Cuerpo: `{ "content": "Texto del comentario" }`)
* **Registrar evidencia:** `POST /api/v1/activities/:id/evidence` (Cuerpo: `{ "file_name": "Acta.pdf", "file_url": "https://..." }`)

---

## Movilización Electoral y Jornada (`/mobilization`)

### 1. Panel de Control (Dashboard Stats)
* **Método:** `GET`
* **Ruta:** `/api/v1/mobilization/dashboard`

### 2. Operaciones y Jornadas
* **Listar operaciones:** `GET /api/v1/mobilization/operations`
* **Crear operación:** `POST /api/v1/mobilization/operations` (Cuerpo: `{ "name": "...", "start_date": "YYYY-MM-DD" }`)
* **Obtener detalle de operación:** `GET /api/v1/mobilization/operations/:id`
* **Actualizar operación:** `PATCH /api/v1/mobilization/operations/:id`
* **Agregar día de jornada:** `POST /api/v1/mobilization/days` (Cuerpo: `{ "operation_id": "...", "name": "...", "date": "YYYY-MM-DD", "start_time": "08:00", "end_time": "18:00" }`)

### 3. Actividades del Día D
* **Crear actividad:** `POST /api/v1/mobilization/activities` (Cuerpo: `{ "operation_id": "...", "name": "...", "type": "Logistica", "start_date_time": "...", "end_date_time": "..." }`)
* **Actualizar actividad (Kanban):** `PATCH /api/v1/mobilization/activities/:id` (Cuerpo: `{ "status": "EN_PROGRESO" }`)

### 4. Incidencias
* **Listar incidencias:** `GET /api/v1/mobilization/incidents`
* **Reportar incidencia:** `POST /api/v1/mobilization/incidents` (Cuerpo: `{ "title": "...", "description": "...", "severity": "CRITICA", "type": "Logistica" }`)
* **Asignar responsable de resolución:** `POST /api/v1/mobilization/incidents/:id/assign` (Cuerpo: `{ "member_id": "uuid-miembro" }`)

### 5. Recursos Logísticos
* **Listar recursos en almacén:** `GET /api/v1/mobilization/resources`
* **Crear recurso:** `POST /api/v1/mobilization/resources` (Cuerpo: `{ "name": "Vehículo PMU", "type": "VEHICULO", "quantity": 3 }`)
* **Asignar recurso a colaborador:** `POST /api/v1/mobilization/resources/:id/assign` (Cuerpo: `{ "member_id": "uuid-miembro", "quantity": 1 }`)
* **Liberar recurso:** `DELETE /api/v1/mobilization/resources/assignments/:assignmentId`

