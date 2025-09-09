// MongoDB client for frontend - API calls to server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Database Types
export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'pending';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

export interface UserMetrics {
  _id?: string;
  user_id: string;
  transcripts_analyzed: number;
  ai_insights_generated: number;
  hours_saved: number;
  tasks_created: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transcript {
  _id?: string;
  id?: string;
  title?: string;
  content: string;
  summary?: string;
  key_points?: string[];
  action_items?: string[];
  audio_url?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  session_state?: {
    extractedData?: any;
    analysis?: any;
    audioUrl?: string;
    emailBody?: string;
  };
}

export interface MeetingInsight {
  _id?: string;
  id?: string;
  transcript_id: string;
  meeting_title: string;
  summary: string;
  key_takeaways: string[]; // Only store key takeaways for sidebar
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
  created_at?: string;
  updated_at?: string;
}

// API Helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

// Task Service
export class TaskService {
  async createTask(taskData: Omit<Task, '_id' | 'created_at' | 'updated_at'>) {
    try {
      const data = await apiCall('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getTasksByUser(userId: string) {
    try {
      const data = await apiCall(`/api/tasks/user/${userId}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getUserTasks(userId: string) {
    return this.getTasksByUser(userId);
  }

  async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      const data = await apiCall(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteTask(taskId: string) {
    try {
      const data = await apiCall(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateTaskStatus(taskId: string, status: Task['status']) {
    try {
      const data = await apiCall(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createTaskWithMetrics(taskData: Omit<Task, '_id' | 'created_at' | 'updated_at'>) {
    try {
      const data = await apiCall('/api/tasks/with-metrics', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createMultipleTasks(tasks: Omit<Task, '_id' | 'created_at' | 'updated_at'>[], userId: string) {
    try {
      const data = await apiCall('/api/tasks/bulk', {
        method: 'POST',
        body: JSON.stringify({ tasks, userId }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Metrics Service
export class MetricsService {
  async getUserMetrics(userId: string) {
    try {
      const data = await apiCall(`/api/metrics/user/${userId}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async incrementMetric(userId: string, metric: keyof Pick<UserMetrics, 'transcripts_analyzed' | 'ai_insights_generated' | 'hours_saved' | 'tasks_created'>, amount: number) {
    try {
      const data = await apiCall('/api/metrics/increment', {
        method: 'POST',
        body: JSON.stringify({ userId, metric, amount }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateHoursSaved(userId: string, hours: number) {
    try {
      const data = await apiCall('/api/metrics/hours', {
        method: 'POST',
        body: JSON.stringify({ userId, hours }),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async addHoursSaved(userId: string, hours: number) {
    return this.updateHoursSaved(userId, hours);
  }
}

// Transcript Service
export class TranscriptService {
  async createTranscript(transcriptData: {
    user_id: string;
    title: string;
    content: string;
    summary?: string;
    session_state?: {
      extractedData?: any;
      analysis?: any;
      audioUrl?: string;
      emailBody?: string;
    };
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transcripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcriptData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating transcript:', error);
      return { data: null, error };
    }
  }

  async getTranscriptsByUser(userId: string) {
    try {
      const data = await apiCall(`/api/transcripts/user/${userId}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getTranscriptById(transcriptId: string) {
    try {
      const data = await apiCall(`/api/transcripts/${transcriptId}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Insight Service
export class InsightService {
  async createInsight(insightData: Omit<MeetingInsight, '_id' | 'created_at' | 'updated_at'>) {
    try {
      const data = await apiCall('/api/insights', {
        method: 'POST',
        body: JSON.stringify(insightData),
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getInsightsByUser(userId: string) {
    try {
      const data = await apiCall(`/api/insights/user/${userId}`);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Export service instances
export const taskService = new TaskService();
export const metricsService = new MetricsService();
export const transcriptService = new TranscriptService();
export const insightService = new InsightService();

// Mock subscription function for compatibility
export const subscribeToUserMetrics = (_userId: string, _callback: (payload: any) => void) => {
  // For MongoDB, we'll implement polling or WebSocket later
  // For now, return a mock subscription
  return {
    unsubscribe: () => {
      console.log('Unsubscribed from metrics updates');
    }
  };
};
