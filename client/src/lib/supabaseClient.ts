import { createClient } from '@supabase/supabase-js';

// Environment variables with fallback support for different deployment platforms
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://ruwhsrpogvaofegbeevy.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d2hzcnBvZ3Zhb2ZlZ2JlZXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjgzOTcsImV4cCI6MjA3MjgwNDM5N30.M_C6_MqSnjssGG92hFGaCALRh1M_e-i8mJKUv0UhwZk';

// Create Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'pending';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  user_id: string; // Auth0 user ID or email
}

export interface Transcript {
  id: string;
  title?: string;
  content: string;
  summary?: string;
  key_points?: string[];
  action_items?: string[];
  audio_url?: string;
  processed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingInsight {
  id: string;
  transcript_id: string;
  user_id: string;
  summary: string;
  decisions: any[];
  action_items: any[];
  follow_up_email: any;
  created_at: string;
}

export interface UserMetrics {
  id: string;
  user_id: string;
  transcripts_analyzed: number;
  ai_insights_generated: number;
  hours_saved: number;
  tasks_created: number;
  created_at: string;
  updated_at: string;
}

// Task Management Functions
export const taskService = {
  // Create a new task
  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabaseClient
        .from('tasks')
        .insert([{
          ...taskData,
          status: taskData.status || 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  },

  // Get all tasks for a specific user
  async getUserTasks(userId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return { data: null, error };
    }
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: Task['status']) {
    try {
      const { data, error } = await supabaseClient
        .from('tasks')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating task status:', error);
      return { data: null, error };
    }
  },

  // Update entire task
  async updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'user_id'>>) {
    try {
      const { data, error } = await supabaseClient
        .from('tasks')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, error };
    }
  },

  // Get single task by ID
  async getTask(taskId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching task:', error);
      return { data: null, error };
    }
  },

  // Delete a task
  async deleteTask(taskId: string) {
    try {
      const { error } = await supabaseClient
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { error };
    }
  },

  // Bulk create tasks (for dashboard integration)
  async createMultipleTasks(tasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]) {
    try {
      const { data, error } = await supabaseClient
        .from('tasks')
        .insert(tasks.map(task => ({
          ...task,
          status: task.status || 'pending'
        })))
        .select();

      if (error) throw error;
      
      // Update task count metrics
      if (data && data.length > 0) {
        const userId = tasks[0]?.user_id;
        if (userId) {
          await metricsService.incrementMetric(userId, 'tasks_created', data.length);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating multiple tasks:', error);
      return { data: null, error };
    }
  },

  // Create single task with metrics update
  async createTaskWithMetrics(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await this.createTask(taskData);
      if (error) throw error;
      
      // Update task count metrics
      if (data) {
        await metricsService.incrementMetric(taskData.user_id, 'tasks_created', 1);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating task with metrics:', error);
      return { data: null, error };
    }
  }
};

// Transcript Management Functions
export const transcriptService = {
  // Create a new transcript
  async createTranscript(transcriptData: Omit<Transcript, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabaseClient
        .from('transcripts')
        .insert([transcriptData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating transcript:', error);
      return { data: null, error };
    }
  },

  // Get user transcripts
  async getUserTranscripts(userId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('transcripts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user transcripts:', error);
      return { data: null, error };
    }
  },

  // Update transcript as processed
  async markTranscriptProcessed(transcriptId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('transcripts')
        .update({ 
          processed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', transcriptId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating transcript:', error);
      return { data: null, error };
    }
  }
};

// Meeting Insights Functions
export const insightService = {
  // Create meeting insights
  async createInsight(insightData: Omit<MeetingInsight, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabaseClient
        .from('meeting_insights')
        .insert([insightData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating insight:', error);
      return { data: null, error };
    }
  },

  // Get user insights
  async getUserInsights(userId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('meeting_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user insights:', error);
      return { data: null, error };
    }
  }
};

// User Metrics Functions
export const metricsService = {
  // Get or create user metrics
  async getUserMetrics(userId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No metrics found, create new record
        const newMetrics = {
          user_id: userId,
          transcripts_analyzed: 0,
          ai_insights_generated: 0,
          hours_saved: 0,
          tasks_created: 0
        };
        
        const { data: createdData, error: createError } = await supabaseClient
          .from('user_metrics')
          .insert([newMetrics])
          .select()
          .single();
        
        if (createError) throw createError;
        return { data: createdData, error: null };
      }
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return { data: null, error };
    }
  },

  // Update user metrics
  async updateMetrics(userId: string, updates: Partial<Omit<UserMetrics, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabaseClient
        .from('user_metrics')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating metrics:', error);
      return { data: null, error };
    }
  },

  // Increment specific metrics
  async incrementMetric(userId: string, metric: 'transcripts_analyzed' | 'ai_insights_generated' | 'tasks_created', amount: number = 1) {
    try {
      // Get current metrics
      const { data: currentMetrics } = await this.getUserMetrics(userId);
      if (!currentMetrics) throw new Error('Failed to get current metrics');

      const updates = {
        [metric]: currentMetrics[metric] + amount
      };

      return await this.updateMetrics(userId, updates);
    } catch (error) {
      console.error(`Error incrementing ${metric}:`, error);
      return { data: null, error };
    }
  },

  // Add hours saved
  async addHoursSaved(userId: string, hours: number) {
    try {
      const { data: currentMetrics } = await this.getUserMetrics(userId);
      if (!currentMetrics) throw new Error('Failed to get current metrics');

      const updates = {
        hours_saved: currentMetrics.hours_saved + hours
      };

      return await this.updateMetrics(userId, updates);
    } catch (error) {
      console.error('Error adding hours saved:', error);
      return { data: null, error };
    }
  }
};

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabaseClient
      .from('tasks')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

// Real-time subscription for tasks
export const subscribeToUserTasks = (userId: string, callback: (payload: any) => void) => {
  return supabaseClient
    .channel('user-tasks')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// Real-time subscription for user metrics
export const subscribeToUserMetrics = (userId: string, callback: (payload: any) => void) => {
  return supabaseClient
    .channel('user-metrics')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_metrics',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

export default supabaseClient;
