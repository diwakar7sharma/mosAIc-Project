import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingInsight extends Document {
  transcript_id: string;
  meeting_title: string;
  summary: string;
  decisions: Array<{
    text: string;
    made_by: string;
    timestamp: string;
  }>;
  action_items: Array<{
    id: number;
    task: string;
    owner: string;
    due: string;
    priority: string;
    context: string;
    confidence: number;
  }>;
  follow_up_email: {
    subject: string;
    body: string;
  };
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

const MeetingInsightSchema: Schema = new Schema({
  transcript_id: {
    type: String,
    required: true
  },
  meeting_title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  decisions: [{
    text: String,
    made_by: String,
    timestamp: String
  }],
  action_items: [{
    id: Number,
    task: String,
    owner: String,
    due: String,
    priority: String,
    context: String,
    confidence: Number
  }],
  follow_up_email: {
    subject: String,
    body: String
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
MeetingInsightSchema.index({ user_id: 1, created_at: -1 });

export const MeetingInsight = mongoose.model<IMeetingInsight>('MeetingInsight', MeetingInsightSchema);
