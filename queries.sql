-- 1. Estructura de la Tabla de Tareas
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Creación del Índice Optimizado (Requerido para búsquedas concurrentes)
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- 3. Consulta A: Filtrar tareas por estado (Ejemplo: Completadas)
SELECT id, title, description, completed, "createdAt" 
FROM tasks 
WHERE completed = true;

-- 4. Consulta B: Agrupación y conteo global por estado
SELECT completed, COUNT(*) as total_tasks 
FROM tasks 
GROUP BY completed;
