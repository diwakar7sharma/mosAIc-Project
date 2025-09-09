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

    // Extract transcript endpoint (legacy - keeping for compatibility)
    if (pathname === '/api/extract' && req.method === 'POST') {
      const body = await parseBody(req);
      const { transcript } = body;

      if (!transcript) {
        sendJSON(res, 400, { error: 'Transcript is required' });
        return;
      }

      // Mock response for now (since we're using Gemini API in frontend)
      const mockAnalysis = {
        meeting_title: "Team Development Meeting",
        summary: "Discussion about Auth0 login integration and booking API testing. Team will reconvene Friday for progress check.",
        decisions: [
          {
            text: "Complete Auth0 login and payment integration this week",
            made_by: "Diwakar",
            timestamp: "End of meeting"
          }
        ],
        action_items: [
          {
            id: 1,
            task: "Begin testing booking APIs",
            owner: "Arjun",
            due: "2025-01-10",
            priority: "high",
            context: "Start testing once Rohit pushes final code",
            confidence: 0.95
          },
          {
            id: 2,
            task: "Complete Auth0 login and payment integration",
            owner: "Diwakar",
            due: "2025-01-10",
            priority: "high",
            context: "Focus for this week",
            confidence: 0.9
          }
        ],
        follow_up_email: {
          subject: "Team Meeting Follow-up - Auth0 & Booking API Progress",
          body: "Hi team,\n\nGreat meeting today! Here's what we discussed:\n\n• Arjun will begin testing the booking APIs once Rohit pushes the final code\n• Diwakar will focus on completing Auth0 login and payment integration this week\n• We'll reconvene on Friday for a progress check\n\nLet me know if you have any questions!\n\nBest regards"
        }
      };

      sendJSON(res, 200, mockAnalysis);
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
