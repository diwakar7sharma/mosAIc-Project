// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    console.log('Generating speech via backend API...');

    const response = await fetch(`${API_URL}/api/ai/tts`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
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

export async function analyzeTranscript(transcript: string, userInfo?: { name?: string; email?: string }): Promise<TranscriptAnalysis> {
  try {
    console.log('Analyzing transcript via backend API...');

    const response = await fetch(`${API_URL}/api/ai/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        userInfo
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw error;
  }
}


