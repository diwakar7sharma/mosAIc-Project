import express from 'express';
import { requiresAuth } from 'express-openid-connect';
import axios from 'axios';

const router = express.Router();

// Protect the route with Auth0
router.use(requiresAuth());

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text is too long. Maximum 5000 characters allowed.' });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'bIHbv24MWmeRgasZH58o';
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        responseType: 'stream'
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="summary.mp3"'
    });

    response.data.pipe(res);

  } catch (error) {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'bIHbv24MWmeRgasZH58o';
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    console.error('TTS API Error:', error);
    console.error('Voice ID:', voiceId);
    console.error('API Key exists:', !!apiKey);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      console.error('Response status:', status);
      console.error('Response data:', error.response?.data);
      const message = error.response?.data?.detail?.message || error.response?.data?.message || 'Failed to generate speech';
      res.status(status).json({ error: message, voiceId: voiceId, status });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate speech',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

export default router;
