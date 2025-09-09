import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { connectDB } from './config/database';
import { handleTaskRoutes } from './routes/tasks';
import { handleMetricsRoutes } from './routes/metrics';
import { handleTranscriptRoutes } from './routes/transcripts';
import { handleInsightRoutes } from './routes/insights';
import { handleUserDataRoutes } from './routes/userdata';
import { sendJSON, parseBody } from './utils/helpers';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3003;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// CORS headers helper
const setCORSHeaders = (res: http.ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  try {
    // Health check endpoint
    if (pathname === '/health' && req.method === 'GET') {
      sendJSON(res, 200, { 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'MongoDB server running'
      });
      return;
    }

    // Route handlers
    if (await handleTaskRoutes(req, res, pathname)) return;
    if (await handleMetricsRoutes(req, res, pathname)) return;
    if (await handleTranscriptRoutes(req, res, pathname)) return;
    if (await handleInsightRoutes(req, res, pathname)) return;
    if (await handleUserDataRoutes(req, res, pathname)) return;

    // Extract transcript endpoint (deprecated - analysis now handled in frontend)
    if (pathname === '/api/extract' && req.method === 'POST') {
      sendJSON(res, 410, { 
        error: 'This endpoint is deprecated. Please use the frontend Gemini API integration for transcript analysis.' 
      });
      return;
    }

    // Text-to-speech endpoint
    if (pathname === '/api/tts' && req.method === 'POST') {
      const body = await parseBody(req);
      const { text } = body;

      if (!text) {
        sendJSON(res, 400, { error: 'Text is required' });
        return;
      }

      // Mock TTS response
      sendJSON(res, 200, { 
        message: 'TTS generation would happen here',
        text: text.substring(0, 100) + '...'
      });
      return;
    }

    // 404 for unknown routes
    sendJSON(res, 404, { error: 'Route not found' });

  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Pure Node.js server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 CORS enabled for: ${CLIENT_URL}`);
});
