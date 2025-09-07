import express from 'express';
import { requiresAuth } from 'express-openid-connect';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Validate API key
if (!process.env.OPENAI_API_KEY) {
  console.error('Warning: OPENAI_API_KEY is not set');
}

// Protect the route with Auth0
router.use(requiresAuth());

interface ActionItem {
  id: number;
  task: string;
  owner: string;
  due: string;
  priority: string;
  context: string;
  confidence: number;
}

interface Decision {
  text: string;
  made_by: string;
  timestamp: string;
}

interface ExtractResponse {
  meeting_title: string;
  summary: string;
  decisions: Decision[];
  action_items: ActionItem[];
  follow_up_email: {
    subject: string;
    body: string;
  };
}

router.post('/', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required and must be a string' });
    }

    const prompt = `
Analyze the following meeting transcript and extract structured information. Return a JSON response with the following format:

{
  "meeting_title": "Brief descriptive title for the meeting",
  "summary": "Concise 2-3 sentence summary of the meeting",
  "decisions": [
    {
      "text": "Description of the decision made",
      "made_by": "Person who made the decision",
      "timestamp": "Approximate time or 'Unknown' if not clear"
    }
  ],
  "action_items": [
    {
      "id": 1,
      "task": "Clear, actionable task description",
      "owner": "Person responsible or 'Unassigned'",
      "due": "YYYY-MM-DD format or 'TBD'",
      "priority": "High/Medium/Low",
      "context": "Brief context about why this task is needed",
      "confidence": 0.8
    }
  ],
  "follow_up_email": {
    "subject": "Professional email subject line",
    "body": "Professional email body with meeting summary, decisions, and action items"
  }
}

Meeting Transcript:
${transcript}

Please ensure all JSON is valid and properly formatted.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert meeting analyst. Extract structured information from meeting transcripts and return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let extractedData: ExtractResponse;
    try {
      extractedData = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      throw new Error('Invalid JSON response from AI');
    }

    res.json(extractedData);

  } catch (error) {
    console.error('Extract API Error:', error);
    res.status(500).json({ 
      error: 'Failed to extract meeting insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
