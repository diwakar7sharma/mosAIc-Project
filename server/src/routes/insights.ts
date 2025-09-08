import { IncomingMessage, ServerResponse } from 'http';
import { insightService } from '../services/mongoService';
import { parseBody, sendJSON } from '../utils/helpers';

export const handleInsightRoutes = async (req: IncomingMessage, res: ServerResponse, pathname: string) => {
  const method = req.method;
  const pathParts = pathname.split('/').filter(Boolean);

  try {
    // POST /api/insights - Create insight
    if (method === 'POST' && pathname === '/api/insights') {
      const body = await parseBody(req);
      const insight = await insightService.createInsight(body);
      sendJSON(res, 201, insight);
      return true;
    }

    // GET /api/insights/user/:userId - Get insights by user
    if (method === 'GET' && pathParts[0] === 'api' && pathParts[1] === 'insights' && pathParts[2] === 'user' && pathParts[3]) {
      const userId = pathParts[3];
      const insights = await insightService.getInsightsByUser(userId);
      sendJSON(res, 200, insights);
      return true;
    }

    return false; // Route not handled
  } catch (error) {
    console.error('Insight route error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
    return true;
  }
};
