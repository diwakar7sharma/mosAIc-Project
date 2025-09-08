import { IncomingMessage, ServerResponse } from 'http';
import { taskService } from '../services/mongoService';
import { parseBody, sendJSON } from '../utils/helpers';

export const handleTaskRoutes = async (req: IncomingMessage, res: ServerResponse, pathname: string) => {
  const method = req.method;
  const pathParts = pathname.split('/').filter(Boolean);

  try {
    // POST /api/tasks - Create task
    if (method === 'POST' && pathname === '/api/tasks') {
      const body = await parseBody(req);
      const task = await taskService.createTask(body);
      sendJSON(res, 201, task);
      return true;
    }

    // POST /api/tasks/with-metrics - Create task with metrics
    if (method === 'POST' && pathname === '/api/tasks/with-metrics') {
      const body = await parseBody(req);
      const task = await taskService.createTaskWithMetrics(body);
      sendJSON(res, 201, task);
      return true;
    }

    // POST /api/tasks/bulk - Create multiple tasks
    if (method === 'POST' && pathname === '/api/tasks/bulk') {
      const body = await parseBody(req);
      const { tasks, userId } = body;
      const createdTasks = await taskService.createMultipleTasks(tasks, userId);
      sendJSON(res, 201, createdTasks);
      return true;
    }

    // GET /api/tasks/user/:userId - Get tasks by user
    if (method === 'GET' && pathParts[0] === 'api' && pathParts[1] === 'tasks' && pathParts[2] === 'user' && pathParts[3]) {
      const userId = pathParts[3];
      const tasks = await taskService.getTasksByUser(userId);
      sendJSON(res, 200, tasks);
      return true;
    }

    // PUT /api/tasks/:taskId - Update task
    if (method === 'PUT' && pathParts[0] === 'api' && pathParts[1] === 'tasks' && pathParts[2]) {
      const taskId = pathParts[2];
      const body = await parseBody(req);
      const task = await taskService.updateTask(taskId, body);
      if (!task) {
        sendJSON(res, 404, { error: 'Task not found' });
        return true;
      }
      sendJSON(res, 200, task);
      return true;
    }

    // PATCH /api/tasks/:taskId/status - Update task status
    if (method === 'PATCH' && pathParts[0] === 'api' && pathParts[1] === 'tasks' && pathParts[2] && pathParts[3] === 'status') {
      const taskId = pathParts[2];
      const body = await parseBody(req);
      const { status } = body;
      const task = await taskService.updateTaskStatus(taskId, status);
      if (!task) {
        sendJSON(res, 404, { error: 'Task not found' });
        return true;
      }
      sendJSON(res, 200, task);
      return true;
    }

    // DELETE /api/tasks/:taskId - Delete task
    if (method === 'DELETE' && pathParts[0] === 'api' && pathParts[1] === 'tasks' && pathParts[2]) {
      const taskId = pathParts[2];
      const success = await taskService.deleteTask(taskId);
      if (!success) {
        sendJSON(res, 404, { error: 'Task not found' });
        return true;
      }
      sendJSON(res, 200, { message: 'Task deleted successfully' });
      return true;
    }

    return false; // Route not handled
  } catch (error) {
    console.error('Task route error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
    return true;
  }
};
