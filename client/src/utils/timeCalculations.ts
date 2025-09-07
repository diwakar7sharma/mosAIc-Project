// Utility functions for calculating time saved from transcripts

export interface TimeCalculation {
  estimatedMeetingDuration: number; // in minutes
  estimatedReadingTime: number; // in minutes
  totalTimeSaved: number; // in hours
}

/**
 * Calculate time saved based on transcript content
 * @param transcript - The meeting transcript text
 * @param meetingDuration - Optional: actual meeting duration in minutes
 * @returns TimeCalculation object with estimated times
 */
export function calculateTimeSaved(transcript: string, meetingDuration?: number): TimeCalculation {
  const wordCount = countWords(transcript);
  
  // Estimate meeting duration if not provided
  // Average speaking rate: 150-160 words per minute
  // Account for pauses, discussions, etc. - multiply by 1.5
  const estimatedMeetingDuration = meetingDuration || Math.ceil((wordCount / 155) * 1.5);
  
  // Estimate reading time for transcript
  // Average reading speed: 200-250 words per minute
  const estimatedReadingTime = Math.ceil(wordCount / 225);
  
  // Time saved = meeting duration - reading time (converted to hours)
  const timeSavedMinutes = Math.max(0, estimatedMeetingDuration - estimatedReadingTime);
  const totalTimeSaved = Number((timeSavedMinutes / 60).toFixed(2));
  
  return {
    estimatedMeetingDuration,
    estimatedReadingTime,
    totalTimeSaved
  };
}

/**
 * Count words in a text string
 * @param text - The text to count words in
 * @returns Number of words
 */
function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  // Remove extra whitespace and split by whitespace
  return text.trim().split(/\s+/).length;
}

/**
 * Parse meeting duration from transcript if mentioned
 * @param transcript - The meeting transcript text
 * @returns Duration in minutes if found, null otherwise
 */
export function extractMeetingDuration(transcript: string): number | null {
  const text = transcript.toLowerCase();
  
  // Look for common patterns like "30 minute meeting", "1 hour meeting", etc.
  const patterns = [
    /(\d+)\s*minute\s*meeting/,
    /(\d+)\s*min\s*meeting/,
    /(\d+)\s*hour\s*meeting/,
    /meeting\s*lasted\s*(\d+)\s*minutes?/,
    /meeting\s*lasted\s*(\d+)\s*hours?/,
    /(\d+)\s*minute\s*call/,
    /(\d+)\s*hour\s*call/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const duration = parseInt(match[1]);
      
      // Convert hours to minutes if needed
      if (pattern.source.includes('hour')) {
        return duration * 60;
      }
      return duration;
    }
  }
  
  return null;
}

/**
 * Format time for display
 * @param hours - Time in hours
 * @returns Formatted string like "2.5 hours" or "30 minutes"
 */
export function formatTimeDisplay(hours: number): string {
  if (hours >= 1) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    const minutes = Math.round(hours * 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
}
