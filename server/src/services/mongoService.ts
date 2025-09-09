import { Task, ITask } from '../models/Task';
import { UserMetrics, IUserMetrics } from '../models/UserMetrics';
import { Transcript, ITranscript } from '../models/Transcript';
import { MeetingInsight, IMeetingInsight } from '../models/MeetingInsight';

// Task Service
export class TaskService {
  async createTask(taskData: Partial<ITask>): Promise<any> {
    const task = new Task(taskData);
    const savedTask = await task.save();
    // Convert _id to id for frontend compatibility
    return {
      ...savedTask.toObject(),
      id: (savedTask._id as any).toString()
    };
  }

  async getTasksByUser(userId: string): Promise<any[]> {
    const tasks = await Task.find({ user_id: userId }).sort({ created_at: -1 });
    // Convert _id to id for frontend compatibility
    return tasks.map(task => ({
      ...task.toObject(),
      id: (task._id as any).toString()
    }));
  }

  async updateTask(taskId: string, updates: Partial<ITask>): Promise<any | null> {
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    if (!task) return null;
    // Convert _id to id for frontend compatibility
    return {
      ...task.toObject(),
      id: (task._id as any).toString()
    };
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const result = await Task.findByIdAndDelete(taskId);
    return !!result;
  }

  async updateTaskStatus(taskId: string, status: ITask['status']): Promise<any | null> {
    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    if (!task) return null;
    // Convert _id to id for frontend compatibility
    return {
      ...task.toObject(),
      id: (task._id as any).toString()
    };
  }

  async createTaskWithMetrics(taskData: Partial<ITask>): Promise<any> {
    const task = await this.createTask(taskData);
    if (taskData.user_id) {
      await metricsService.incrementMetric(taskData.user_id, 'tasks_created', 1);
    }
    return task;
  }

  async createMultipleTasks(tasks: Partial<ITask>[], userId: string): Promise<any[]> {
    const createdTasks = await Task.insertMany(tasks);
    await metricsService.incrementMetric(userId, 'tasks_created', tasks.length);
    // Convert _id to id for frontend compatibility
    return createdTasks.map((task: any) => ({
      ...task.toObject(),
      id: (task._id as any).toString()
    }));
  }
}

// User Metrics Service
export class MetricsService {
  async getUserMetrics(userId: string): Promise<IUserMetrics> {
    let metrics = await UserMetrics.findOne({ user_id: userId });
    if (!metrics) {
      metrics = new UserMetrics({ user_id: userId });
      await metrics.save();
    }
    return metrics;
  }

  async incrementMetric(userId: string, metric: keyof Pick<IUserMetrics, 'transcripts_analyzed' | 'ai_insights_generated' | 'hours_saved' | 'tasks_created'>, amount: number): Promise<IUserMetrics | null> {
    return await UserMetrics.findOneAndUpdate(
      { user_id: userId },
      { $inc: { [metric]: amount } },
      { new: true, upsert: true }
    );
  }

  async updateHoursSaved(userId: string, hours: number): Promise<IUserMetrics | null> {
    return await UserMetrics.findOneAndUpdate(
      { user_id: userId },
      { $inc: { hours_saved: hours } },
      { new: true, upsert: true }
    );
  }
}

// Transcript Service
export class TranscriptService {
  async createTranscript(transcriptData: Partial<ITranscript>): Promise<ITranscript> {
    const transcript = new Transcript(transcriptData);
    return await transcript.save();
  }

  async getTranscriptsByUser(userId: string): Promise<ITranscript[]> {
    return await Transcript.find({ user_id: userId }).sort({ created_at: -1 });
  }

  async updateTranscript(transcriptId: string, updates: Partial<ITranscript>): Promise<ITranscript | null> {
    return await Transcript.findByIdAndUpdate(transcriptId, updates, { new: true });
  }

  async deleteTranscript(transcriptId: string): Promise<boolean> {
    const result = await Transcript.findByIdAndDelete(transcriptId);
    return !!result;
  }
}

// Meeting Insight Service
export class InsightService {
  async createInsight(insightData: Partial<IMeetingInsight>): Promise<IMeetingInsight> {
    const insight = new MeetingInsight(insightData);
    return await insight.save();
  }

  async getInsightsByUser(userId: string): Promise<IMeetingInsight[]> {
    return await MeetingInsight.find({ user_id: userId }).sort({ created_at: -1 });
  }

  async updateInsight(insightId: string, updates: Partial<IMeetingInsight>): Promise<IMeetingInsight | null> {
    return await MeetingInsight.findByIdAndUpdate(insightId, updates, { new: true });
  }

  async deleteInsight(insightId: string): Promise<boolean> {
    const result = await MeetingInsight.findByIdAndDelete(insightId);
    return !!result;
  }
}

// User Data Cleanup Service
export class UserDataService {
  async clearAllUserData(userId: string): Promise<{ success: boolean; deletedCounts: any }> {
    try {
      const results = await Promise.all([
        Task.deleteMany({ user_id: userId }),
        UserMetrics.deleteMany({ user_id: userId }),
        Transcript.deleteMany({ user_id: userId }),
        MeetingInsight.deleteMany({ user_id: userId })
      ]);

      return {
        success: true,
        deletedCounts: {
          tasks: results[0].deletedCount,
          metrics: results[1].deletedCount,
          transcripts: results[2].deletedCount,
          insights: results[3].deletedCount
        }
      };
    } catch (error) {
      console.error('Error clearing user data:', error);
      return {
        success: false,
        deletedCounts: null
      };
    }
  }
}

// Export service instances
export const taskService = new TaskService();
export const metricsService = new MetricsService();
export const transcriptService = new TranscriptService();
export const insightService = new InsightService();
export const userDataService = new UserDataService();
