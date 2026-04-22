import { IncomingMessage, ServerResponse } from 'http';
import { parseBody, sendJSON } from '../utils/helpers';

export const handleAiRoutes = async (req: IncomingMessage, res: ServerResponse, pathname: string) => {
  const method = req.method;

  try {
    // POST /api/ai/extract - Extract insights from transcript
    if (method === 'POST' && pathname === '/api/ai/extract') {
      const body = await parseBody(req);
      const { transcript, userInfo } = body;

      if (!transcript) {
        sendJSON(res, 400, { error: 'Transcript is required' });
        return true;
      }

      const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        sendJSON(res, 500, { error: 'Server missing Gemini API configuration' });
        return true;
      }

      const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
      
      const response = await fetch(GEMINI_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant that analyzes meeting transcripts for a user${userInfo?.name ? ` named ${userInfo.name}` : ''}${userInfo?.email ? ` (${userInfo.email})` : ''}. 

IMPORTANT: First, determine if the provided text is actually a meeting transcript with real conversations between people. If it's not a genuine meeting transcript (e.g., random text, instructions, single-person notes, or clearly not a conversation), return exactly: {"error": "not_a_transcript"}

If it IS a valid meeting transcript with conversations between people, extract key information and return ONLY valid JSON in this exact format (when generating follow-up emails, use this user as the sender${userInfo?.name ? ` and sign emails with "${userInfo.name}"` : ''}):

{
  "meeting_title": "string",
  "summary": "string",
  "decisions": [
    {
      "text": "string",
      "made_by": "string",
      "timestamp": "string"
    }
  ],
  "action_items": [
    {
      "id": 1,
      "task": "string",
      "owner": "string",
      "due": "YYYY-MM-DD",
      "priority": "High|Medium|Low",
      "context": "string",
      "confidence": 0.9
    }
  ],
  "follow_up_email": {
    "subject": "string",
    "body": "string"
  }
}

Analyze this meeting transcript: ${transcript}`
            }]
          }]
        })
      });

      if (!response.ok) {
        sendJSON(res, response.status, { error: `Gemini API error: ${response.statusText}` });
        return true;
      }

      const data = await response.json();
      const content = (data as any).candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        sendJSON(res, 500, { error: 'No response from Gemini API' });
        return true;
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        sendJSON(res, 500, { error: 'Invalid JSON response from Gemini API' });
        return true;
      }

      sendJSON(res, 200, JSON.parse(jsonMatch[0]));
      return true;
    }

    // POST /api/ai/tts - Text to Speech
    if (method === 'POST' && pathname === '/api/ai/tts') {
      const body = await parseBody(req);
      const { text } = body;

      if (!text) {
        sendJSON(res, 400, { error: 'Text is required' });
        return true;
      }

      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'wWWn96OtTHu1sn8SRGEr';
      
      if (!ELEVENLABS_API_KEY) {
        sendJSON(res, 500, { error: 'Server missing ElevenLabs configuration' });
        return true;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        sendJSON(res, response.status, { error: `ElevenLabs API error: ${response.statusText}` });
        return true;
      }

      const audioBuffer = await response.arrayBuffer();
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength
      });
      res.end(Buffer.from(audioBuffer));
      return true;
    }

    return false; // Route not handled
  } catch (error) {
    console.error('AI route error:', error);
    sendJSON(res, 500, { error: 'Internal server error' });
    return true;
  }
};
