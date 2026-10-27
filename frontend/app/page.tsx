import pool from './lib/db';
import TaskDashboard from './components/TaskDashboard';

export default async function Page() {
  let initialTasks = [];

  try {
    // Consulta nativa directa a la base de datos
    const result = await pool.query('SELECT * FROM tasks ORDER BY "createdAt" DESC');
    initialTasks = result.rows;
  } catch (error) {
    console.error("Error al obtener tareas desde el servidor:", error);
  }

  // Serializamos las fechas para evitar errores de hidratación en Next.js
  const serializedTasks = initialTasks.map((task: any) => ({
    ...task,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : String(task.createdAt),
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Gestión Profesional de Tareas
        </h1>
        <TaskDashboard initialTasks={serializedTasks} />
      </div>
    </main>
  );
}
