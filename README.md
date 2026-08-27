# Electoral360

Electoral360 es una plataforma integral de gestión de campañas y cobertura geopolítica para elecciones a gran escala.

## Estructura del Monorepo

* **`backend/`**: Servidor API REST desarrollado en NestJS + Prisma ORM (SQLite / PostgreSQL).
* **`frontend/`**: Aplicación de cliente desarrollada en React + Vite + Tailwind CSS.
* **`docs/`**: Documentación técnica detallada de arquitectura, API y operaciones.

## Módulos del Sistema

1. **Gestión Territorial (Fase 13)**: Vista geopolítica recursiva desde Departamento hasta Mesa de votación y análisis de cobertura de coordinadores.
2. **Planeación Territorial (Fase 14)**: Gestión de Planes, Objetivos y Actividades operativas con Kanban, bitácora de comentarios, checklist de tareas y dependencias de precedencia lógica.

## Ejecución en Desarrollo

### Backend
```bash
cd backend
npm install
npx prisma db push
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
