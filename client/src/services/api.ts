// import OpenAI from 'openai';

// OpenAI Configuration - commented out since using mock data
// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true,
//   baseURL: 'https://api.openai.com/v1'
// });

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'jsCqWAovK2LkecY7zXl4';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

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

// OpenAI API Helper Functions
export async function analyzeTranscript(_transcript: string): Promise<TranscriptAnalysis> {
  try {
    console.log('Analyzing transcript...');
    
    // Mock response for immediate testing - works with any transcript
    return {
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

    // Real OpenAI API call - uncomment when needed
    /*
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes meeting transcripts. Extract key information and return ONLY valid JSON.`
        },
        {
          role: "user",
          content: `Please analyze this meeting transcript: ${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');
    
    return JSON.parse(content.trim());
    */
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to analyze transcript');
  }
}


// ElevenLabs API Helper Functions
export async function generateVoiceSummary(text: string): Promise<Blob> {
  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key is missing. Please check your environment variables.');
    }

    console.log('Generating voice summary with ElevenLabs...');

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
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    console.log('Voice summary generated successfully');
    return await response.blob();
  } catch (error) {
    console.error('Error generating voice summary:', error);
    throw new Error('Failed to generate voice summary');
  }
}
