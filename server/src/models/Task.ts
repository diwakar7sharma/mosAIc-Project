import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'pending';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: Date;
  user_id: string; // Auth0 user ID or email
  created_at: Date;
  updated_at: Date;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'done', 'pending'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assigned_to: {
    type: String,
    trim: true
  },
  due_date: {
    type: Date
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
TaskSchema.index({ user_id: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
