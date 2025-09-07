// Gemini API Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'jsCqWAovK2LkecY7zXl4';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

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
      console.warn('Gemini API key not found, using mock data');
      return getMockAnalysis(transcript);
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
    console.log('Falling back to mock data');
    return getMockAnalysis(transcript);
  }
}

// Mock analysis function for fallback
function getMockAnalysis(transcript: string): TranscriptAnalysis {
  const lowerTranscript = transcript.toLowerCase();
    
    // Scenario 1: Product Launch Meeting
    if (lowerTranscript.includes('product launch') || lowerTranscript.includes('marketing') || lowerTranscript.includes('campaign')) {
      return {
        meeting_title: "Q1 Product Launch Strategy Meeting",
        summary: "Discussed the upcoming product launch timeline, marketing campaigns, and resource allocation. Key focus on social media strategy and influencer partnerships for maximum reach.",
        decisions: [
          {
            text: "Launch date confirmed for March 15th",
            made_by: "Sarah (Product Manager)",
            timestamp: "10:30 AM"
          },
          {
            text: "Budget approved for influencer marketing campaign",
            made_by: "Mike (Marketing Director)",
            timestamp: "10:45 AM"
          }
        ],
        action_items: [
          {
            id: 1,
            task: "Finalize product packaging design",
            owner: "Design Team",
            due: "2025-01-15",
            priority: "high",
            context: "Must align with brand guidelines and be production-ready",
            confidence: 0.92
          },
          {
            id: 2,
            task: "Create social media content calendar",
            owner: "Marketing Team",
            due: "2025-01-12",
            priority: "high",
            context: "Include pre-launch teasers and launch day content",
            confidence: 0.88
          },
          {
            id: 3,
            task: "Contact top 10 influencers for partnerships",
            owner: "Sarah",
            due: "2025-01-08",
            priority: "medium",
            context: "Focus on tech and lifestyle influencers with 100K+ followers",
            confidence: 0.85
          }
        ],
        follow_up_email: {
          subject: "Q1 Product Launch - Action Items & Next Steps",
          body: "Hi Team,\n\nGreat energy in today's product launch meeting! Here's what we committed to:\n\n🎯 Key Decisions:\n• Launch date: March 15th (confirmed)\n• Influencer marketing budget approved\n\n📋 Action Items:\n• Design Team: Finalize packaging by Jan 15th\n• Marketing Team: Social media calendar by Jan 12th\n• Sarah: Reach out to top influencers by Jan 8th\n\nLet's make this launch amazing! Reach out if you need any support.\n\nBest,\nSarah"
        }
      };
    }
    
    // Scenario 2: Sprint Planning Meeting
    if (lowerTranscript.includes('sprint') || lowerTranscript.includes('development') || lowerTranscript.includes('features') || lowerTranscript.includes('bugs')) {
      return {
        meeting_title: "Sprint 23 Planning & Retrospective",
        summary: "Reviewed Sprint 22 deliverables and planned Sprint 23 features. Discussed technical debt, bug fixes, and new user authentication system implementation.",
        decisions: [
          {
            text: "Prioritize user authentication over new dashboard features",
            made_by: "Alex (Tech Lead)",
            timestamp: "2:15 PM"
          },
          {
            text: "Allocate 30% of sprint capacity to bug fixes",
            made_by: "Team Consensus",
            timestamp: "2:30 PM"
          }
        ],
        action_items: [
          {
            id: 1,
            task: "Implement OAuth 2.0 authentication system",
            owner: "Alex",
            due: "2025-01-20",
            priority: "high",
            context: "Use Auth0 for third-party integration, include Google and GitHub login",
            confidence: 0.90
          },
          {
            id: 2,
            task: "Fix critical payment processing bug",
            owner: "Emma",
            due: "2025-01-10",
            priority: "high",
            context: "Issue with Stripe webhook handling causing failed transactions",
            confidence: 0.95
          },
          {
            id: 3,
            task: "Update API documentation",
            owner: "Jordan",
            due: "2025-01-18",
            priority: "medium",
            context: "Include new endpoints and authentication requirements",
            confidence: 0.80
          },
          {
            id: 4,
            task: "Set up automated testing for authentication flow",
            owner: "Sam",
            due: "2025-01-25",
            priority: "medium",
            context: "Ensure all login methods are covered in test suite",
            confidence: 0.85
          }
        ],
        follow_up_email: {
          subject: "Sprint 23 Planning Summary - Authentication Focus",
          body: "Hi Development Team,\n\nThanks for the productive sprint planning session! Here's our Sprint 23 roadmap:\n\n🎯 Sprint Goal: Implement secure user authentication\n\n📋 Key Tasks:\n• Alex: OAuth 2.0 system (Auth0 integration)\n• Emma: Fix Stripe payment bug (CRITICAL)\n• Jordan: Update API docs\n• Sam: Authentication testing automation\n\n⚡ Sprint Capacity: 70% features, 30% bug fixes\n\nDaily standups at 9 AM. Let's ship something great!\n\nCheers,\nAlex"
        }
      };
    }
    
    // Scenario 3: Client Project Meeting
    if (lowerTranscript.includes('client') || lowerTranscript.includes('project') || lowerTranscript.includes('deadline') || lowerTranscript.includes('requirements')) {
      return {
        meeting_title: "TechCorp Website Redesign - Client Check-in",
        summary: "Client feedback session on website mockups and timeline adjustments. Discussed scope changes, additional features, and delivery milestones for the TechCorp project.",
        decisions: [
          {
            text: "Add e-commerce functionality to project scope",
            made_by: "Client (TechCorp)",
            timestamp: "3:20 PM"
          },
          {
            text: "Extend deadline by 2 weeks for additional features",
            made_by: "Project Manager",
            timestamp: "3:35 PM"
          }
        ],
        action_items: [
          {
            id: 1,
            task: "Create e-commerce wireframes and user flow",
            owner: "UX Team",
            due: "2025-01-14",
            priority: "high",
            context: "Include shopping cart, checkout, and payment integration",
            confidence: 0.88
          },
          {
            id: 2,
            task: "Update project timeline and budget estimate",
            owner: "Project Manager",
            due: "2025-01-09",
            priority: "high",
            context: "Account for e-commerce development and testing time",
            confidence: 0.92
          },
          {
            id: 3,
            task: "Research payment gateway options",
            owner: "Development Team",
            due: "2025-01-12",
            priority: "medium",
            context: "Compare Stripe, PayPal, and Square for client needs",
            confidence: 0.85
          }
        ],
        follow_up_email: {
          subject: "TechCorp Project Update - Scope & Timeline Changes",
          body: "Hi TechCorp Team,\n\nGreat meeting today! Excited about the e-commerce addition to your website.\n\n📋 What's Next:\n• UX Team: E-commerce wireframes by Jan 14th\n• PM: Updated timeline & budget by Jan 9th\n• Dev Team: Payment gateway research by Jan 12th\n\n📅 New Timeline: Project delivery extended to Feb 15th\n\nWe'll keep you updated on progress. Thanks for your flexibility!\n\nBest regards,\nProject Team"
        }
      };
    }
    
    // Default scenario for any other transcript
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

}


// ElevenLabs TTS (Text-to-Speech) - Real implementation
export async function generateVoiceSummary(text: string): Promise<string> {
  try {
    console.log('Generating voice summary with ElevenLabs API...');
    
    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not found, using mock audio');
      return 'https://example.com/mock-audio.mp3';
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
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
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Convert response to blob and create URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('Voice summary generated successfully');
    return audioUrl;
  } catch (error) {
    console.error('Error generating voice summary:', error);
    // Fallback to mock audio
    return 'https://example.com/mock-audio.mp3';
  }
}

// Helper function to convert AudioBuffer to WAV blob (unused but kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  const channelData = buffer.getChannelData(0);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
