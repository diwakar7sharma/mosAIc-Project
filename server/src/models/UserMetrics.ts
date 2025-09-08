import mongoose, { Schema, Document } from 'mongoose';

export interface IUserMetrics extends Document {
  user_id: string;
  transcripts_analyzed: number;
  ai_insights_generated: number;
  hours_saved: number;
  tasks_created: number;
  created_at: Date;
  updated_at: Date;
}

const UserMetricsSchema: Schema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  transcripts_analyzed: {
    type: Number,
    default: 0,
    min: 0
  },
  ai_insights_generated: {
    type: Number,
    default: 0,
    min: 0
  },
  hours_saved: {
    type: Number,
    default: 0,
    min: 0
  },
  tasks_created: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const UserMetrics = mongoose.model<IUserMetrics>('UserMetrics', UserMetricsSchema);
