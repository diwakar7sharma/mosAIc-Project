// Gemini API Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'XrExE9yKIg1WjnnlVkGX';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// ElevenLabs Text-to-Speech Function
export async function generateSpeech(text: string): Promise<string | null> {
  try {
    console.log('Generating speech with ElevenLabs API...');
    
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not found');
      return null;
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech with ElevenLabs:', error);
    return null;
  }
}

// Types
export interface ActionItem {
  id: number;
  task: string;
  owner: string;
  due: string;
  priority: string;
  context: string;
  confidence: number;
}

export interface Decision {
  text: string;
  made_by: string;
  timestamp: string;
}

export interface TranscriptAnalysis {
  meeting_title: string;
  summary: string;
  decisions: Decision[];
  action_items: ActionItem[];
  follow_up_email: {
    subject: string;
    body: string;
  };
}

// Gemini API Helper Functions
export async function analyzeTranscript(transcript: string, userInfo?: { name?: string; email?: string }): Promise<TranscriptAnalysis> {
  try {
    console.log('Analyzing transcript with Gemini API...');
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please configure VITE_GOOGLE_GEMINI_API_KEY in your environment variables.');
    }

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
      "id": number,
      "task": "string",
      "owner": "string",
      "due": "YYYY-MM-DD",
      "priority": "High|Medium|Low",
      "context": "string",
      "confidence": number (0-1)
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No response from Gemini API');
    }

    // Clean the response to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini API');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing transcript with Gemini:', error);
    throw error;
  }
}


