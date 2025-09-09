import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Flag, Clock, Plus, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    owner: string;
    due_date: string;
    priority: 'high' | 'medium' | 'low';
  }) => void;
  initialDescription?: string;
  initialData?: {
    title: string;
    description: string;
    owner: string;
    due_date: string;
    priority: 'high' | 'medium' | 'low';
  };
  isEditing?: boolean;
}

const TaskModal = ({ isOpen, onClose, onSubmit, initialDescription = '', initialData, isEditing = false }: TaskModalProps) => {
  const [task, setTask] = useState({
    title: '',
    description: initialDescription,
    owner: '',
    due_date: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData && isEditing) {
      setTask(initialData);
      if (initialData.due_date) {
        setSelectedDate(new Date(initialData.due_date));
      }
    } else if (!isEditing) {
      setTask({
        title: '',
        description: initialDescription,
        owner: '',
        due_date: '',
        priority: 'medium'
      });
      setSelectedDate(null);
    }
  }, [initialData, isEditing, initialDescription]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.title.trim()) return;
    
    onSubmit({
      ...task,
      due_date: selectedDate ? selectedDate.toISOString().split('T')[0] : ''
    });
    
    // Reset form
    setTask({
      title: '',
      description: '',
      owner: '',
      due_date: '',
      priority: 'medium'
    });
    setSelectedDate(null);
    onClose();
  };

  const CustomCalendar = () => {
    const today = new Date();
    const currentRealMonth = today.getMonth();
    const currentRealYear = today.getFullYear();
    
    // Check if we can go to previous month (not before current month)
    const canGoPrevious = !(currentYear === currentRealYear && currentMonth === currentRealMonth);
    
    // Check if we can go to next month (not more than 12 months ahead)
    const monthsAhead = (currentYear - currentRealYear) * 12 + (currentMonth - currentRealMonth);
    const canGoNext = monthsAhead < 12;
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = today.toDateString() === date.toDateString();
      const isPastDate = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      days.push(
        <button
          key={day}
          onClick={() => {
            if (!isPastDate) {
              setSelectedDate(date);
              setTask({ ...task, due_date: date.toISOString().split('T')[0] });
              setShowCalendar(false);
            }
          }}
          disabled={isPastDate}
          className={`h-6 w-6 rounded-lg text-xs font-medium transition-all duration-200 ${
            isPastDate
              ? 'text-muted-foreground/50 cursor-not-allowed'
              : isSelected 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : isToday 
                  ? 'bg-accent text-accent-foreground border-2 border-primary' 
                  : 'text-foreground hover:text-primary hover:bg-primary/20'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
        className="absolute bottom-full left-0 mb-2 z-50 w-80 max-w-[calc(100vw-2rem)]"
      >
        <Card className="p-3 shadow-xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm w-80 h-80 flex flex-col" onClick={(e) => e.stopPropagation()}>
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canGoPrevious) {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }
                }}
                className={`p-1 rounded ${canGoPrevious ? 'hover:bg-primary/20 text-primary cursor-pointer' : 'text-muted-foreground cursor-not-allowed'}`}
                disabled={!canGoPrevious}
              >
                ←
              </button>
              <h3 className="font-semibold text-foreground text-sm">
                {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (canGoNext) {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }
                }}
                className={`p-1 rounded ${canGoNext ? 'hover:bg-primary/20 text-primary cursor-pointer' : 'text-muted-foreground cursor-not-allowed'}`}
                disabled={!canGoNext}
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="h-6 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1 content-start">
              {days}
            </div>
            <div className="mt-auto pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(false)}
                className="w-full text-xs py-2"
              >
                Close Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-card border-2 border-primary/20 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    {isEditing ? <Edit3 className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
                    <p className="text-muted-foreground">{isEditing ? 'Update task details' : 'Add a new task to your workflow'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Darkening overlay for non-date sections */}
                {showCalendar && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl z-10 pointer-events-none" />
                )}
                {/* Task Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Flag className="w-4 h-4 text-primary" />
                    Task Title
                  </label>
                  <Input
                    placeholder="Enter task title..."
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                    className="text-lg font-medium bg-input/50 border-2 border-border focus:border-primary transition-all duration-200"
                    required
                  />
                </div>

                {/* Task Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <Textarea
                    placeholder="Describe the task in detail..."
                    value={task.description}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                    className="min-h-[120px] bg-input/50 border-2 border-border focus:border-primary transition-all duration-200 resize-none"
                  />
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Owner */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Assigned To
                    </label>
                    <Input
                      placeholder="Enter assignee name..."
                      value={task.owner}
                      onChange={(e) => setTask({ ...task, owner: e.target.value })}
                      className="bg-input/50 border-2 border-border focus:border-primary transition-all duration-200"
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Priority Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setTask({ ...task, priority })}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                            task.priority === priority
                              ? priority === 'high'
                                ? 'bg-red-500/20 border-red-500 text-red-300'
                                : priority === 'medium'
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                                : 'bg-green-500/20 border-green-500 text-green-300'
                              : 'bg-input/30 border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div className={`space-y-2 relative ${showCalendar ? 'z-20' : ''}`}>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Due Date
                  </label>
                  <div className="relative overflow-visible z-20">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full justify-start text-left bg-input/50 border-2 border-border hover:border-primary transition-all duration-200"
                    >
                      <Clock className="w-4 h-4 mr-2 text-primary" />
                      {selectedDate 
                        ? selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'Select due date...'
                      }
                    </Button>
                    <AnimatePresence>
                      {showCalendar && (
                        <div className="relative z-[60]" onClick={(e) => e.stopPropagation()}>
                          <CustomCalendar />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isEditing ? <Edit3 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    {isEditing ? 'Update Task' : 'Create Task'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="px-8 py-3 rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
