// Quick test for Gemini API integration
import { analyzeTranscript } from './services/api';

export async function testGeminiAPI() {
  console.log('Testing Gemini API integration...');
  
  const testTranscript = `
    Meeting: Sprint Planning
    Attendees: John, Sarah, Mike
    
    John: Let's discuss the new authentication feature for next sprint.
    Sarah: I think we should prioritize the OAuth integration with Google and GitHub.
    Mike: Agreed. We also need to fix the payment processing bug that's been reported.
    John: Sarah, can you handle the OAuth implementation?
    Sarah: Yes, I'll have it done by Friday.
    Mike: I'll take care of the payment bug fix by Wednesday.
    John: Perfect. Let's also update our API documentation.
    Sarah: I can do that after the OAuth work is complete.
  `;

  try {
    const result = await analyzeTranscript(testTranscript);
    console.log('✅ Gemini API test successful!');
    console.log('Analysis result:', result);
    return result;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    throw error;
  }
}

// Auto-run test when this module is imported
if (typeof window !== 'undefined') {
  window.testGeminiAPI = testGeminiAPI;
}
