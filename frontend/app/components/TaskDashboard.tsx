'use client';

import { useState } from 'react';

// Dirección de la API de tu Backend en Express
const BACKEND_URL = 'http://localhost:5000/api/tasks';

interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    createdAt: string;
}

export default function TaskDashboard({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // 1. Crear tarea mediante petición POST a la API de Express
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const res = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });
            if (res.ok) {
                const data = await res.json();
                // Extraemos el primer elemento si el backend devuelve un array
                const newTaskRaw = Array.isArray(data) ? data[0] : data;

                if (newTaskRaw) {
                    // Forzamos que la fecha sea una cadena de texto limpia (string) para evitar que React falle
                    const newTask = {
                        ...newTaskRaw,
                        createdAt: newTaskRaw.createdAt ? String(newTaskRaw.createdAt) : new Date().toISOString()
                    };

                    setTasks([newTask, ...tasks]);
                    setTitle('');
                    setDescription('');
                }
            }

        } catch (err) {
            console.error("Error al crear tarea:", err);
        }
    };


    // 2. Alternar estado completado/pendiente mediante petición PUT a Express
    const handleToggle = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`${BACKEND_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !currentStatus }),
            });

            if (res.ok) {
                const data = await res.json();
                // Extraemos el primer elemento si el backend devuelve un array
                const updatedTaskRaw = Array.isArray(data) ? data[0] : data;

                if (updatedTaskRaw) {
                    const updatedTask = {
                        ...updatedTaskRaw,
                        createdAt: updatedTaskRaw.createdAt ? String(updatedTaskRaw.createdAt) : new Date().toISOString()
                    };

                    // Reemplazamos únicamente la tarea modificada en el estado
                    setTasks(tasks.map(t => t.id === id ? updatedTask : t));
                }
            }
        } catch (err) {
            console.error("Error al actualizar tarea:", err);
        }
    };


    // 3. Eliminar tarea mediante petición DELETE a Express
    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks(tasks.filter(t => t.id !== id));
            }
        } catch (err) {
            console.error("Error al eliminar tarea:", err);
        }
    };

    // Lógica de filtrado en el cliente
    const filteredTasks = tasks.filter(t => {
        if (filter === 'pending') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    return (
        <div className="space-y-6 text-gray-900">
            {/* Formulario de creación */}
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Título de la Tarea</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="mt-1 w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="Ej. Escribir consultas SQL"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="mt-1 w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="Detalles adicionales..."
                        rows={3}
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition duration-200">
                    Guardar Tarea
                </button>
            </form>

            {/* Selectores de Filtro */}
            <div className="flex bg-gray-200 p-1 rounded-lg">
                {(['all', 'pending', 'completed'] as const).map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFilter(type)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition duration-200 ${filter === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {type === 'all' ? 'Todas' : type === 'pending' ? 'Pendientes' : 'Completadas'}
                    </button>
                ))}
            </div>

            {/* Listado interactivo */}
            <ul className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay tareas para mostrar.</p>
                ) : (
                    filteredTasks.map(task => (
                        <li key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center gap-4 hover:shadow-md transition">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggle(task.id, task.completed)}
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <div>
                                    <h3 className={`font-semibold text-base ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h3>
                                    {task.description && <p className={`text-sm ${task.completed ? 'line-through text-gray-300' : 'text-gray-500'}`}>{task.description}</p>}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium p-2 transition"
                            >
                                Eliminar
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
