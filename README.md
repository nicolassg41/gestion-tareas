# Sistema de Gestión de Tareas - Prueba Técnica

Este proyecto es una aplicación web full-stack desacoplada para la gestión de tareas, diseñada bajo criterios de alta disponibilidad, rendimiento en base de datos y mantenibilidad de código.

## 🚀 Arquitectura del Sistema
* **Backend:** API REST construida en Node.js con Express, utilizando un Pool de conexiones nativo (`pg.Pool`) para optimizar el manejo de hilos y transacciones concurrentes hacia la base de datos.
* **Frontend:** Aplicación desarrollada en Next.js 15 (App Router) con TypeScript, empleando Server Components para la hidratación inicial directa desde la base de datos (optimizando la carga del lado del servidor) y Client Components interactivos controlados con Tailwind CSS v4 para la gestión del estado en tiempo real.
* **Base de Datos:** PostgreSQL con indexación explícita sobre estados de selección concurrentes.

## 💡 Decisiones Técnicas Destacadas
* **Consultas SQL Nativas Parametrizadas:** Se prescindió del uso de ORMs pesados para la ejecución en caliente con el fin de evitar sobrecargas en las funciones del servidor y prevenir vulnerabilidades de Inyección SQL (SQLi) mediante el uso de queries estructuradas con marcadores de posición (`$1, $2`).
* **Optimización por Índices (`idx_tasks_completed`):** Dado que los filtros por estado ("pendientes" o "completadas") representan las lecturas más frecuentes en sistemas transaccionales de tareas, se implementó un índice de tipo B-Tree sobre la columna `completed`, transformando los costosos escaneos secuenciales (*Sequential Scans*) en búsquedas directas indexadas (*Index Scans*).

## 🛠️ Instrucciones de Despliegue Local

### Requisitos Previos
* Node.js v18 o superior
* PostgreSQL activo con una base de datos llamada `todo_db`

### 1. Configuración de Base de Datos
Ejecutar el script contenido en `queries.sql` en su gestor de PostgreSQL para levantar el esquema e índices requeridos.

### 2. Levantar el Servidor Backend
```bash
cd backend
npm install
# Configurar archivo .env interno con los accesos locales
node server.js
```

### 3. Levantar la Interfaz Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.
