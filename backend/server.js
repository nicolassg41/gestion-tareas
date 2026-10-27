require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/tasks - Listar todas las tareas
app.get('/api/tasks', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY "createdAt" DESC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

// POST /api/tasks - Crear una nueva tarea con validación básica
app.post('/api/tasks', async (req, res, next) => {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'El título es obligatorio.' });
    }

    try {
        const query = `
      INSERT INTO tasks (title, description, completed, "createdAt")
      VALUES ($1, $2, false, NOW())
      RETURNING *
    `;
        const result = await pool.query(query, [title, description]);
        // Devolvemos únicamente el objeto de la tarea creada (la primera posición)
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }

});

// PUT /api/tasks/:id - Actualizar estado o datos de una tarea
app.put('/api/tasks/:id', async (req, res, next) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    try {
        const query = `
      UPDATE tasks 
      SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          completed = COALESCE($3, completed)
      WHERE id = $4
      RETURNING *
    `;
        const result = await pool.query(query, [title, description, completed, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// Eliminar una tarea
app.delete('/api/tasks/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }
        res.json({ message: 'Tarea eliminada correctamente.' });
    } catch (error) {
        next(error);
    }
});

// Middleware Centralizado de Manejo de Errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Ocurrió un error interno en el servidor.'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
