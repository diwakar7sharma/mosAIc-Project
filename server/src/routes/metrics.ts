import { IncomingMessage, ServerResponse } from 'http';
import { metricsService } from '../services/mongoService';
import { parseBody, sendJSON } from '../utils/helpers';

export const handleMetricsRoutes = async (req: IncomingMessage, res: ServerResponse, pathname: string) => {
  const method = req.method;
  const pathParts = pathname.split('/').filter(Boolean);

  try {
    // GET /api/metrics/user/:userId - Get user metrics
    if (method === 'GET' && pathParts[0] === 'api' && pathParts[1] === 'metrics' && pathParts[2] === 'user' && pathParts[3]) {
      const userId = pathParts[3];
      const metrics = await metricsService.getUserMetrics(userId);
      sendJSON(res, 200, metrics);
      return true;
    }

    // POST /api/metrics/increment - Increment a metric
    if (method === 'POST' && pathname === '/api/metrics/increment') {
      const body = await parseBody(req);
      const { userId, metric, amount } = body;
      const updatedMetrics = await metricsService.incrementMetric(userId, metric, amount);
      sendJSON(res, 200, updatedMetrics);
      return true;
    }

    // POST /api/metrics/hours - Update hours saved
    if (method === 'POST' && pathname === '/api/metrics/hours') {
      const body = await parseBody(req);
      const { userId, hours } = body;
      const updatedMetrics = await metricsService.updateHoursSaved(userId, hours);
      sendJSON(res, 200, updatedMetrics);
      return true;
    }

    return false; // Route not handled
  } catch (error) {
    console.error('Metrics route error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
    return true;
  }
};
