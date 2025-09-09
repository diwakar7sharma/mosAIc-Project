import mongoose, { Schema, Document } from 'mongoose';

export interface ITranscript extends Document {
  title?: string;
  content: string;
  summary?: string;
  key_points?: string[];
  action_items?: string[];
  audio_url?: string;
  session_state?: {
    extractedData?: any;
    analysis?: any;
    audioUrl?: string;
    emailBody?: string;
  };
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

const TranscriptSchema: Schema = new Schema({
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  key_points: [{
    type: String
  }],
  action_items: [{
    type: String
  }],
  audio_url: {
    type: String
  },
  session_state: {
    extractedData: Schema.Types.Mixed,
    analysis: Schema.Types.Mixed,
    audioUrl: String,
    emailBody: String
  },
  user_id: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for efficient user queries
TranscriptSchema.index({ user_id: 1, created_at: -1 });

// Add text index for search functionality
TranscriptSchema.index({ title: 'text', content: 'text' });

export const Transcript = mongoose.model<ITranscript>('Transcript', TranscriptSchema);
