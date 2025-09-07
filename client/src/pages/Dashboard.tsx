import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import { Upload, FileText, Brain, Mail, Play, Copy, Mic, BarChart3, Clock, Users, Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import SpeechWaveAnimation from '@/components/SpeechWaveAnimation';
import { transcriptService, taskService, insightService, type Transcript } from '@/lib/supabaseClient';
import { analyzeTranscript, generateVoiceSummary } from '@/services/api';

interface ActionItem {
  id: number;
  task: string;
  owner: string;
  due: string;
  priority: string;
  context: string;
  confidence: number;
}

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
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [, setTranscripts] = useState<Transcript[]>([]);
  const [userStats, setUserStats] = useState({
    transcriptsAnalyzed: 0,
    insightsGenerated: 0,
    hoursSaved: 0,
    teamMembers: 1
  });

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) return;
      
      const { data: transcriptsData } = await transcriptService.getUserTranscripts(userId);
      if (transcriptsData) {
        setTranscripts(transcriptsData);
        setUserStats({
          transcriptsAnalyzed: transcriptsData.length,
          insightsGenerated: transcriptsData.filter((t: Transcript) => t.processed).length,
          hoursSaved: Math.round(transcriptsData.length * 2.5), // Estimate 2.5 hours saved per transcript
          teamMembers: 1
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => loginWithRedirect()}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExtract = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    try {
      // Store transcript in Supabase
      const userId = user?.email || user?.sub;
      if (!userId) throw new Error('User not authenticated');
      
      const { data: transcriptData, error: transcriptError } = await transcriptService.createTranscript({
        user_id: userId,
        content: transcript,
        processed: false
      });

      if (transcriptError || !transcriptData) throw transcriptError;

      // Analyze transcript with OpenAI
      console.log('Starting transcript analysis...');
      const analysis = await analyzeTranscript(transcript);
      console.log('Analysis completed:', analysis);
      
      // Store insights in Supabase
      const { error: insightError } = await insightService.createInsight({
        transcript_id: transcriptData.id,
        user_id: userId,
        summary: analysis.summary,
        decisions: analysis.decisions,
        action_items: analysis.action_items,
        follow_up_email: analysis.follow_up_email
      });

      if (insightError) throw insightError;

      // Update transcript as processed
      await transcriptService.markTranscriptProcessed(transcriptData.id);

      setExtractedData(analysis);
      setEmailBody(analysis.follow_up_email.body);
      
      // Refresh user data
      await loadUserData();
    } catch (error) {
      console.error('Error extracting data:', error);
      alert('Failed to extract meeting insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!extractedData?.summary) return;

    setIsGeneratingVoice(true);
    try {
      const audioBlob = await generateVoiceSummary(extractedData.summary);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error generating voice:', error);
      alert('Failed to generate voice summary. Please try again.');
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleAddTasksToBoard = async (actionItems: ActionItem[]) => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) return;
      
      const tasksToAdd = actionItems.map(item => ({
        user_id: userId,
        title: item.task,
        description: item.context || '',
        assigned_to: item.owner,
        due_date: item.due || new Date().toISOString().split('T')[0],
        priority: item.priority.toLowerCase() as 'high' | 'medium' | 'low',
        status: 'pending' as const
      }));

      const { error } = await taskService.createMultipleTasks(tasksToAdd);
      if (error) throw error;

      alert(`Successfully added ${actionItems.length} tasks to your task board!`);
    } catch (error) {
      console.error('Error adding tasks to board:', error);
      alert('Failed to add tasks to board. Please try again.');
    }
  };

  const statsData = [
    { icon: FileText, label: 'Transcripts Analyzed', value: userStats.transcriptsAnalyzed.toString(), color: 'text-blue-400' },
    { icon: Brain, label: 'AI Insights Generated', value: userStats.insightsGenerated.toString(), color: 'text-purple-400' },
    { icon: Clock, label: 'Hours Saved', value: userStats.hoursSaved.toString(), color: 'text-green-400' },
    { icon: Users, label: 'Team Members', value: userStats.teamMembers.toString(), color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Meeting Dashboard
            </h1>
            <div className="flex items-center justify-center mb-6">
              <SpeechWaveAnimation />
            </div>
            <p className="text-muted-foreground text-lg">Transform your meeting transcripts into actionable insights</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border hover:bg-accent/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-card border-border">
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
                    className="min-h-[300px] resize-none bg-input border-border focus:ring-2 focus:ring-primary"
                  />
                  {transcript.length > 0 && (
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                      {transcript.length} characters
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleExtract}
                  disabled={!transcript.trim() || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Brain className="mr-2 animate-spin" size={16} />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2" size={16} />
                      Extract AI Insights
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {extractedData && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={24} className="text-primary" />
                    AI-Generated Insights
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis powered by GPT-4
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Meeting Title */}
                  <div className="bg-accent p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Mic size={18} className="text-primary" />
                      Meeting Title
                    </h3>
                    <p className="text-sm bg-background p-3 rounded border font-medium">{extractedData.meeting_title}</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-accent p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Brain size={18} className="text-primary" />
                        AI Summary
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerateVoice}
                        disabled={isGeneratingVoice}
                      >
                        {isGeneratingVoice ? (
                          <>
                            <Play className="mr-2 animate-pulse" size={14} />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2" size={14} />
                            Voice Summary
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm bg-background p-4 rounded border leading-relaxed">{extractedData.summary}</p>
                  </div>

                  {/* Decisions */}
                  {extractedData.decisions.length > 0 && (
                    <div className="bg-accent p-4 rounded-lg border border-border">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        Key Decisions ({extractedData.decisions.length})
                      </h3>
                      <div className="space-y-3">
                        {extractedData.decisions.map((decision, index) => (
                          <div key={index} className="bg-background p-4 rounded border">
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
            <Card className="mt-8 bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={24} className="text-primary" />
                    Action Items ({extractedData.action_items.length})
                  </div>
                  <Button
                    onClick={() => handleAddTasksToBoard(extractedData.action_items)}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Task Board
                  </Button>
                </CardTitle>
                <CardDescription>
                  AI-extracted tasks and assignments from your meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {extractedData.action_items.map((item) => (
                    <div key={item.id} className="bg-accent p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold flex-1 pr-4">{item.task}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'High' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                          item.priority === 'Medium' ? 'bg-primary/20 text-primary border border-primary/30' :
                          'bg-secondary/20 text-secondary-foreground border border-secondary/30'
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
                        <p className="text-xs text-muted-foreground mt-2 bg-background p-2 rounded border">
                          💡 {item.context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Email */}
          {extractedData?.follow_up_email && (
            <Card className="mt-8 bg-card border-border">
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
                <div className="bg-accent p-4 rounded-lg border border-border">
                  <label className="text-sm font-medium mb-2 block">📧 Subject Line:</label>
                  <Input 
                    value={extractedData.follow_up_email.subject}
                    readOnly
                    className="bg-background border-border"
                  />
                </div>
                <div className="bg-accent p-4 rounded-lg border border-border">
                  <label className="text-sm font-medium mb-2 block">✍️ Email Body:</label>
                  <Textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="min-h-[250px] bg-background border-border resize-none"
                    placeholder="Your professional follow-up email will appear here..."
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    {emailBody.length} characters • Click to edit
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(emailBody)}
                    className="flex-1"
                  >
                    <Copy className="mr-2" size={16} />
                    Copy to Clipboard
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
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
