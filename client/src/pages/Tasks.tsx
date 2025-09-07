import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Calendar, User, AlertCircle, Trash2, Sparkles, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taskService, type Task } from '@/lib/supabaseClient';
import TaskModal from '@/components/TaskModal';

interface Column {
  id: string;
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: 'To Do', title: 'To Do', color: 'bg-blue-500' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'Done', title: 'Done', color: 'bg-green-500' },
];

const TaskCard = ({ task, onDelete, onEdit }: { task: Task; onDelete: (id: string) => void; onEdit: (task: Task) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    high: 'border-l-red-500 bg-red-50/10',
    medium: 'border-l-yellow-500 bg-yellow-50/10',
    low: 'border-l-green-500 bg-green-50/10',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-card border border-border rounded-lg p-4 mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md border-l-4 ${
        priorityColors[task.priority]
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm leading-tight flex-1">{task.title}</h4>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 hover:bg-primary/20 rounded text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1 hover:bg-destructive/20 rounded text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <User className="w-3 h-3" />
          <span>{task.assigned_to}</span>
        </div>
        {task.due_date && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-green-500/20 text-green-300'
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
};

const Tasks = () => {
  const { isAuthenticated, user } = useAuth0();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Load tasks from Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTasks();
    }
  }, [isAuthenticated, user]);

  const loadTasks = async () => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) {
        console.log('No user ID found, skipping task load');
        setLoading(false);
        return;
      }
      
      console.log('Loading tasks for user:', userId);
      const { data, error } = await taskService.getUserTasks(userId);
      if (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } else {
        console.log('Tasks loaded:', data);
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: {
    title: string;
    description: string;
    owner: string;
    due_date: string;
    priority: 'high' | 'medium' | 'low';
  }) => {
    if (!taskData.title.trim()) return;

    try {
      const userId = user?.email || user?.sub;
      if (!userId) return;
      
      const newTaskData = {
        user_id: userId,
        title: taskData.title,
        description: taskData.description,
        assigned_to: taskData.owner || user?.name || user?.email || 'Unassigned',
        due_date: taskData.due_date || undefined,
        priority: taskData.priority,
        status: 'todo' as const,
      };

      const { data, error } = await taskService.createTask(newTaskData);
      if (error) throw error;
      if (data) {
        setTasks((prev) => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const editTask = async (taskData: {
    title: string;
    description: string;
    owner: string;
    due_date: string;
    priority: 'high' | 'medium' | 'low';
  }) => {
    if (!editingTask || !taskData.title.trim()) return;

    try {
      const updates = {
        title: taskData.title,
        description: taskData.description,
        assigned_to: taskData.owner,
        due_date: taskData.due_date || undefined,
        priority: taskData.priority,
      };

      const { data, error } = await taskService.updateTask(editingTask.id, updates);
      if (error) throw error;
      if (data) {
        setTasks((prev) => prev.map(task => task.id === editingTask.id ? data : task));
      }
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };


  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await taskService.deleteTask(taskId);
      if (error) throw error;
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await taskService.updateTaskStatus(taskId, newStatus);
      if (error) throw error;
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find(task => task.id === event.active.id) || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    let newStatus: Task['status'];
    switch (over.id) {
      case 'To Do':
        newStatus = 'todo';
        break;
      case 'In Progress':
        newStatus = 'in_progress';
        break;
      case 'Done':
        newStatus = 'done';
        break;
      default:
        return;
    }

    if (activeTask.status !== newStatus) {
      updateTaskStatus(active.id, newStatus);
    }
  };

  const getTasksByStatus = (status: string) => {
    const statusMap: { [key: string]: Task['status'] } = {
      'To Do': 'todo',
      'In Progress': 'in_progress', 
      'Done': 'done',
    };
    // Also handle legacy 'pending' status
    const legacyStatusMap: { [key: string]: Task['status'][] } = {
      'To Do': ['todo', 'pending'],
      'In Progress': ['in_progress'],
      'Done': ['done'],
    };
    const allowedStatuses = legacyStatusMap[status] || [statusMap[status]];
    return tasks.filter((task) => allowedStatuses.includes(task.status));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Please Log In</h2>
              <p className="text-muted-foreground">You need to be authenticated to view and manage tasks.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <Sparkles className="text-primary" />
                Task Board
              </h1>
              <p className="text-muted-foreground mt-2">Organize your work with AI-powered task management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowTaskModal(true)} 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2" size={16} />
                Add Task
              </Button>
            </div>
          </div>

          <TaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSubmit={addTask}
            initialDescription=""
          />

          <TaskModal
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            onSubmit={editTask}
            initialDescription={editingTask?.description || ""}
            initialData={editingTask ? {
              title: editingTask.title,
              description: editingTask.description || '',
              owner: editingTask.assigned_to || '',
              due_date: editingTask.due_date || '',
              priority: editingTask.priority
            } : undefined}
            isEditing={true}
          />

          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((column) => (
                <div key={column.id}>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-foreground">
                        <span className="flex items-center gap-2">
                          {column.id === 'To Do' && <AlertCircle className="w-5 h-5 text-blue-400" />}
                          {column.id === 'In Progress' && <div className="w-5 h-5 rounded-full bg-yellow-400 animate-pulse" />}
                          {column.id === 'Done' && <div className="w-5 h-5 rounded-full bg-green-400" />}
                          {column.title}
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {getTasksByStatus(column.id).length}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SortableContext items={getTasksByStatus(column.id).map((task) => task.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 min-h-[200px] group">
                          {getTasksByStatus(column.id).map((task) => (
                            <div key={task.id} className="group">
                              <TaskCard task={task} onDelete={deleteTask} onEdit={handleEditTask} />
                            </div>
                          ))}
                          {getTasksByStatus(column.id).length === 0 && (
                            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                              No tasks in {column.id.toLowerCase()}
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard task={activeTask} onDelete={() => {}} onEdit={() => {}} />
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Task Statistics */}
          <Card className="mt-8 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Task Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{getTasksByStatus('To Do').length}</div>
                  <div className="text-sm text-muted-foreground">To Do</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">{getTasksByStatus('In Progress').length}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{getTasksByStatus('Done').length}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">{tasks.length}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Tasks;
