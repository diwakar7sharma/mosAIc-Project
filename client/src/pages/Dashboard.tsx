import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { FileText, Upload, BarChart3, Mail, Clock, Users, CheckCircle, Mic, Brain, Zap, Copy, Plus, RotateCcw, AlertTriangle, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { analyzeTranscript, generateSpeech, type ActionItem } from '@/services/api';
import { taskService, metricsService, transcriptService, insightService, type UserMetrics, subscribeToUserMetrics } from '@/lib/mongoClient';
import { calculateTimeSaved, extractMeetingDuration } from '@/utils/timeCalculations';
import SpeechWaveAnimation from '@/components/SpeechWaveAnimation';
import Sidebar from '@/components/Sidebar';

interface Decision {
  text: string;
  made_by: string;
  timestamp: string;
}

interface ExtractedData {
  meeting_title: string;
  summary: string;
  decisions: Decision[];
  action_items: ActionItem[];
  follow_up_email: {
    subject: string;
    body: string;
  };
}

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth0();
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [analysis, setAnalysis] = useState<ExtractedData | null>(null);
  const [tasksAdded, setTasksAdded] = useState(false);
  const [addedTaskIds, setAddedTaskIds] = useState<Set<string>>(new Set());
  const [emailBody, setEmailBody] = useState('');
  const [userStats, setUserStats] = useState<UserMetrics | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserMetrics();
      loadPersistedState();
      
      // Set up real-time metrics subscription
      const userId = user?.email || user?.sub;
      if (userId) {
        const subscription = subscribeToUserMetrics(userId, (payload) => {
          console.log('Metrics updated:', payload);
          // Reload metrics when they change
          loadUserMetrics();
        });
        
        return () => {
          subscription.unsubscribe();
        };
      }
    }
  }, [isAuthenticated, user]);

  // Save state to localStorage whenever key values change (but not on initial load)
  useEffect(() => {
    if (isAuthenticated && user && (transcript || extractedData || analysis || emailBody)) {
      saveStateToStorage();
    }
  }, [transcript, extractedData, analysis, emailBody]);

  const loadPersistedState = () => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) return;
      
      const savedState = localStorage.getItem(`dashboard_state_${userId}`);
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Only restore if there's actual data to restore
        if (state.transcript || state.extractedData || state.analysis || state.emailBody) {
          setTranscript(state.transcript || '');
          setExtractedData(state.extractedData || null);
          setAnalysis(state.analysis || null);
          setEmailBody(state.emailBody || '');
          console.log('Dashboard state restored from localStorage:', state);
        }
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  };

  const saveStateToStorage = () => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) return;
      
      const state = {
        transcript,
        extractedData,
        analysis,
        emailBody,
        timestamp: Date.now()
      };
      
      // Only save if there's actual content to save
      if (transcript || extractedData || analysis || emailBody) {
        localStorage.setItem(`dashboard_state_${userId}`, JSON.stringify(state));
        console.log('Dashboard state saved to localStorage');
      }
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  };

  const loadUserMetrics = async () => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) return;
      
      const { data, error } = await metricsService.getUserMetrics(userId);
      if (error) {
        console.error('Error loading user metrics:', error);
      } else {
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error loading user metrics:', error);
    }
  };

  const handleExtract = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    try {
      const userId = user?.email || user?.sub;
      if (!userId) {
        console.error('User not authenticated');
        return;
      }

      console.log('Starting transcript analysis...');
      const userInfo = {
        name: user?.name || user?.given_name || user?.nickname || 'User',
        email: user?.email || ''
      };
      const analysis = await analyzeTranscript(transcript, userInfo);
      console.log('Analysis completed:', analysis);
      
      // Check if AI detected this is not a real transcript
      if ((analysis as any).error === 'not_a_transcript') {
        alert('This doesn\'t appear to be a meeting transcript with conversations between people. Please try with an actual meeting transcript.');
        return;
      }
      
      // Calculate time saved
      const meetingDuration = extractMeetingDuration(transcript);
      const timeCalc = calculateTimeSaved(transcript, meetingDuration || undefined);
      
      // Add 2-3 second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setExtractedData(analysis);
      setAnalysis(analysis);
      setEmailBody(analysis.follow_up_email?.body || '');
      
      // Save transcript and insights to MongoDB if user is authenticated
      if (isAuthenticated && userId) {
        try {
          // Save transcript with full session state
          const transcriptData = {
            user_id: userId,
            title: analysis.meeting_title,
            content: transcript,
            summary: analysis.summary,
            session_state: {
              extractedData: analysis,
              analysis: analysis,
              emailBody: analysis.follow_up_email?.body || ''
            }
          };
          await transcriptService.createTranscript(transcriptData);
          
          // Extract key takeaways from summary and decisions
          const keyTakeaways = [
            analysis.summary.split('.').slice(0, 2).join('.') + '.', // First 2 sentences of summary
            ...analysis.decisions.slice(0, 2).map(d => d.text) // First 2 decisions
          ].filter(takeaway => takeaway.trim().length > 0);

          // Save insights
          const insightData = {
            user_id: userId,
            transcript_id: 'temp', // We'll update this later when we have proper IDs
            meeting_title: analysis.meeting_title,
            summary: analysis.summary,
            key_takeaways: keyTakeaways,
            decisions: analysis.decisions,
            action_items: analysis.action_items,
            follow_up_email: analysis.follow_up_email
          };
          await insightService.createInsight(insightData);
          
          console.log('Transcript and insights saved to MongoDB');
        } catch (saveError) {
          console.error('Error saving to MongoDB:', saveError);
        }
      }
      
      // Update metrics
      try {
        await metricsService.incrementMetric(userId, 'transcripts_analyzed', 1);
        await metricsService.incrementMetric(userId, 'ai_insights_generated', 1);
        await metricsService.addHoursSaved(userId, timeCalc.totalTimeSaved);
        
        // Reload metrics to update UI
        await loadUserMetrics();
      } catch (metricsError) {
        console.error('Error updating metrics:', metricsError);
      }
      
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      alert('Failed to analyze transcript. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleReset = () => {
    setTranscript('');
    setExtractedData(null);
    setAnalysis(null);
    setEmailBody('');
    
    // Clear persisted state from localStorage
    try {
      const userId = user?.email || user?.sub;
      if (userId) {
        localStorage.removeItem(`dashboard_state_${userId}`);
        console.log('Dashboard state cleared from localStorage');
      }
    } catch (error) {
      console.error('Error clearing persisted state:', error);
    }
  };

  const handleGenerateSpeech = async () => {
    if (!analysis?.summary) return;
    
    setIsGeneratingSpeech(true);
    try {
      const audioUrl = await generateSpeech(analysis.summary);
      if (audioUrl) {
        // Create audio element and play immediately
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        alert('Failed to generate speech. Please check your ElevenLabs API key.');
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      alert('Failed to generate speech. Please try again.');
    } finally {
      setIsGeneratingSpeech(false);
    }
  };

  const handleResumeSession = (sessionData: any) => {
    if (sessionData.extractedData) {
      setExtractedData(sessionData.extractedData);
      setAnalysis(sessionData.analysis || sessionData.extractedData);
      setEmailBody(sessionData.emailBody || sessionData.extractedData?.follow_up_email?.body || '');
      // Optionally set transcript if available
      if (sessionData.transcript) {
        setTranscript(sessionData.transcript);
      }
    }
  };

  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleAddTasksToBoard = async (actionItems: ActionItem[]) => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) {
        console.error('User not authenticated');
        return;
      }
      
      const tasksToAdd = actionItems.map(item => ({
        user_id: userId,
        title: item.task,
        description: item.context || '',
        assigned_to: item.owner,
        due_date: item.due || new Date().toISOString().split('T')[0],
        priority: item.priority.toLowerCase() as 'high' | 'medium' | 'low',
        status: 'todo' as const
      }));

      console.log('Adding tasks to board:', tasksToAdd);

      // Add tasks to Supabase (this will automatically update metrics)
      try {
        console.log('Creating multiple tasks:', tasksToAdd);
        const { data, error } = await taskService.createMultipleTasks(tasksToAdd, userId);
        if (error) {
          console.error('Error adding tasks to database:', error);
          alert(`Failed to add tasks: ${(error as any)?.message || JSON.stringify(error)}`);
          return;
        }
        console.log('Tasks created successfully:', data);
        
        // Reload metrics to update UI
        await loadUserMetrics();
        
        setTasksAdded(true);
      } catch (dbError) {
        console.error('Error adding tasks to database:', dbError);
      }
      
    } catch (error) {
      console.error('Error adding tasks to board:', error);
    }
  };

  const handleAddSingleTask = async (actionItem: ActionItem) => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) {
        console.error('User not authenticated');
        return;
      }
      
      const taskData = {
        user_id: userId,
        title: actionItem.task,
        description: actionItem.context || '',
        assigned_to: actionItem.owner,
        due_date: actionItem.due || new Date().toISOString().split('T')[0],
        priority: actionItem.priority.toLowerCase() as 'high' | 'medium' | 'low',
        status: 'todo' as const
      };

      console.log('Creating task with data:', taskData);
      const { data, error } = await taskService.createTaskWithMetrics(taskData);
      if (error) {
        console.error('Error adding task:', error);
        alert(`Failed to add task: ${(error as any)?.message || JSON.stringify(error)}`);
        return;
      }
      console.log('Task created successfully:', data);
      
      // Reload metrics to update UI
      await loadUserMetrics();
      
      setAddedTaskIds(prev => new Set(prev).add(actionItem.task));
    } catch (error) {
      console.error('Error adding single task:', error);
    }
  };

  const statsData = [
    { icon: FileText, label: 'Transcripts Analyzed', value: userStats?.transcripts_analyzed?.toString() || '0', color: 'text-blue-400' },
    { icon: BarChart3, label: 'AI Insights Generated', value: userStats?.ai_insights_generated?.toString() || '0', color: 'text-green-400' },
    { icon: Clock, label: 'Hours Saved', value: userStats?.hours_saved?.toString() || '0', color: 'text-purple-400' },
    { icon: CheckCircle, label: 'Tasks Created', value: userStats?.tasks_created?.toString() || '0', color: 'text-orange-400' }
  ];

  // Non-authenticated user warning
  const UnauthenticatedWarning = () => (
    <Card className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-green-500/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-foreground mb-2 text-lg">🚨 Hold up, fellow human! 🤖</h3>
            <p className="text-foreground mb-3">
              Your brilliant progress is floating in the digital void like a lost sock! 🧦✨ 
              Without joining our awesome crew, your transcripts, insights, and all that juicy AI magic 
              will vanish faster than pizza at a developer meetup! 🍕💨
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Join us to save your progress, access your history, and unlock the full power of Meeting Actioner! 
              Plus, you'll get a shiny sidebar to show off your past transcripts. Pretty neat, right? 😎
            </p>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg">
              🚀 Join the Party (It's Free!)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Overlay for darkening effect */}
      {isAuthenticated && !isSidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          className="fixed inset-0 bg-black z-40"
        />
      )}
      
      {/* Sidebar */}
      {isAuthenticated && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onResumeSession={handleResumeSession}
        />
      )}
      
      <div className={`container mx-auto px-4 pt-20 pb-8 max-w-7xl transition-all duration-200 ${!isSidebarCollapsed ? 'blur-sm' : ''}`}>
        <div>
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Meeting Dashboard
            </h1>
            <div className="flex items-center justify-center mb-6">
              <SpeechWaveAnimation />
            </div>
            <p className="text-muted-foreground text-lg">Transform your meeting transcripts into actionable insights</p>
          </div>

          {/* Show warning for non-authenticated users */}
          {!isAuthenticated && <UnauthenticatedWarning />}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 max-w-6xl mx-auto">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label}>
                  <Card className="bg-card border border-green-500/30 backdrop-blur-sm hover:bg-accent/50 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-xl font-bold text-foreground">{stat.value}</p>
                        </div>
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Input Section */}
            <Card className="bg-card border border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={24} className="text-primary" />
                  Upload Transcript
                </CardTitle>
                <CardDescription>
                  Paste your meeting transcript or upload a file to extract AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder="Paste your meeting transcript here...

Example:
Today we discussed the Q4 budget. John will review the proposal by Friday. Sarah agreed to coordinate with the marketing team for the new campaign launch."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="min-h-[300px] resize-none bg-input border border-green-500/30 backdrop-blur-sm focus:ring-2 focus:ring-primary"
                  />
                  {transcript.length > 0 && (
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border border-green-500/30 backdrop-blur-sm">
                      {transcript.length} characters
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleExtract}
                    disabled={!transcript.trim() || isLoading || !!extractedData}
                    className={`flex-1 ${
                      extractedData 
                        ? 'bg-black hover:bg-black text-gray-400 cursor-not-allowed' 
                        : ''
                    }`}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Brain className="mr-2 animate-spin" size={16} />
                        Analyzing with AI...
                      </>
                    ) : extractedData ? (
                      <>
                        <Brain className="mr-2" size={16} />
                        Analysis Complete
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2" size={16} />
                        Extract AI Insights
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleReset}
                    disabled={isLoading}
                    variant="outline"
                    size="lg"
                    className="px-4"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            {extractedData && (
              <Card className="bg-card border border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={24} className="text-primary" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis powered by Gemini
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Meeting Title */}
                  <div className="bg-accent p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Mic size={18} className="text-primary" />
                      Meeting Title
                    </h3>
                    <p className="text-sm bg-background p-3 rounded border border-green-500/30 backdrop-blur-sm font-medium">{extractedData.meeting_title}</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-accent p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
                    <div className="mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Brain size={18} className="text-primary" />
                        AI Summary
                      </h3>
                    </div>
                    <div className="relative bg-background p-4 rounded border border-green-500/30 backdrop-blur-sm">
                      <p className="text-sm leading-relaxed pr-16">{analysis?.summary}</p>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={handleGenerateSpeech}
                          disabled={isGeneratingSpeech}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Play speech"
                        >
                          {isGeneratingSpeech ? (
                            <Brain size={16} className="text-primary animate-spin" />
                          ) : (
                            <Volume2 size={16} className="text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(analysis?.summary || '', 'summary')}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedStates['summary'] ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} className="text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                    </div>
                  </div>

                  {/* Decisions */}
                  {extractedData.decisions.length > 0 && (
                    <div className="bg-accent p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        Key Decisions ({extractedData.decisions.length})
                      </h3>
                      <div className="space-y-3">
                        {extractedData.decisions.map((decision, index) => (
                          <div key={index} className="bg-background p-4 rounded border border-green-500/30 backdrop-blur-sm">
                            <p className="font-medium mb-2">{decision.text}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>👤 {decision.made_by}</span>
                              <span>⏰ {decision.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Items */}
          {extractedData?.action_items && extractedData.action_items.length > 0 && (
            <Card className="mt-8 bg-card border border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={24} className="text-primary" />
                    Action Items ({extractedData.action_items.length})
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddTasksToBoard(analysis?.action_items || [])}
                      disabled={tasksAdded}
                      className={`shadow-lg hover:shadow-xl transition-all duration-200 ${
                        tasksAdded 
                          ? 'bg-green-600 text-white cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                      }`}
                    >
                      {tasksAdded ? (
                        <div className="mr-2">
                          ✓
                        </div>
                      ) : (
                        <Plus className="mr-2" size={16} />
                      )}
                      {tasksAdded ? 'Tasks Added to Board' : 'Add All Tasks to Board'}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  AI-extracted tasks and assignments from your meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {extractedData.action_items.map((item) => (
                    <div key={item.id} className="bg-accent p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold flex-1 pr-4">{item.task}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'High' || item.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-sm' :
                          item.priority === 'Medium' || item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm' :
                          'bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-muted-foreground" />
                          <span>{item.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground" />
                          <span>{item.due}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain size={14} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Confidence: {Math.round(item.confidence * 100)}%</span>
                        </div>
                      </div>
                      {item.context && (
                        <p className="text-xs text-muted-foreground mt-2 bg-background p-2 rounded border border-green-500/30 backdrop-blur-sm">
                          💡 {item.context}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <Button
                          onClick={() => handleAddSingleTask(item)}
                          disabled={addedTaskIds.has(item.task)}
                          size="sm"
                          className={`shadow-md hover:shadow-lg transition-all duration-200 ${
                            addedTaskIds.has(item.task)
                              ? 'bg-green-600 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                          }`}
                        >
                          {addedTaskIds.has(item.task) ? (
                            <div className="mr-1">
                              ✓
                            </div>
                          ) : (
                            <Plus className="mr-1" size={14} />
                          )}
                          {addedTaskIds.has(item.task) ? 'Added' : 'Add Task'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Email */}
          {extractedData?.follow_up_email && (
            <Card className="mt-8 bg-card border border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail size={24} className="text-primary" />
                  Follow-up Email Draft
                </CardTitle>
                <CardDescription>
                  Professional email generated by AI - fully editable
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-accent p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
                  <label className="text-sm font-medium mb-2 block">📧 Subject Line:</label>
                  <Input 
                    value={extractedData.follow_up_email.subject}
                    readOnly
                    className="bg-background border border-green-500/30 backdrop-blur-sm"
                  />
                </div>
                <div className="bg-accent p-4 rounded-lg border border-green-500/30 backdrop-blur-sm">
                  <label className="text-sm font-medium mb-2 block">✍️ Email Body:</label>
                  <Textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="min-h-[250px] bg-background border border-green-500/30 backdrop-blur-sm resize-none"
                    placeholder="Your professional follow-up email will appear here..."
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    {emailBody.length} characters • Click to edit
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(emailBody, 'email')}
                    className="flex-1"
                  >
                    {copiedStates['email'] ? (
                          <CheckCircle className="mr-2 text-green-600" size={16} />
                        ) : (
                          <Copy className="mr-2" size={16} />
                        )}
                    {copiedStates['email'] ? 'Copied!' : 'Copy to Clipboard'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const subject = encodeURIComponent(extractedData.follow_up_email.subject);
                      const body = encodeURIComponent(emailBody);
                      window.open(`mailto:?subject=${subject}&body=${body}`);
                    }}
                    className="flex-1"
                  >
                    <Mail className="mr-2" size={16} />
                    Open Email Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
