import { IncomingMessage, ServerResponse } from 'http';
import { transcriptService } from '../services/mongoService';
import { parseBody, sendJSON } from '../utils/helpers';

export const handleTranscriptRoutes = async (req: IncomingMessage, res: ServerResponse, pathname: string) => {
  const method = req.method;
  const pathParts = pathname.split('/').filter(Boolean);

  try {
    // POST /api/transcripts - Create transcript
    if (method === 'POST' && pathname === '/api/transcripts') {
      const body = await parseBody(req);
      const transcript = await transcriptService.createTranscript(body);
      sendJSON(res, 201, transcript);
      return true;
    }

    // GET /api/transcripts/user/:userId - Get transcripts by user
    if (method === 'GET' && pathParts[0] === 'api' && pathParts[1] === 'transcripts' && pathParts[2] === 'user' && pathParts[3]) {
      const userId = pathParts[3];
      const transcripts = await transcriptService.getTranscriptsByUser(userId);
      sendJSON(res, 200, transcripts);
      return true;
    }

    return false; // Route not handled
  } catch (error) {
    console.error('Transcript route error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
    return true;
  }
};
