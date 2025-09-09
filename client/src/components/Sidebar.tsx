import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, Brain, Eye, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { transcriptService, insightService } from '@/lib/mongoClient';

interface Transcript {
  _id?: string;
  id?: string;
  title?: string;
  content: string;
  summary?: string;
  user_id: string;
  created_at?: string;
  session_state?: {
    extractedData?: any;
    analysis?: any;
    audioUrl?: string;
    emailBody?: string;
  };
}

interface MeetingInsight {
  _id?: string;
  id?: string;
  meeting_title: string;
  summary: string;
  user_id: string;
  created_at?: string;
  decisions?: Array<{
    text: string;
    made_by: string;
    timestamp: string;
  }>;
  action_items?: Array<{
    id: number;
    task: string;
    owner: string;
    due: string;
    priority: string;
    context: string;
    confidence: number;
  }>;
  follow_up_email?: {
    subject: string;
    body: string;
  };
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onResumeSession?: (sessionData: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, onResumeSession }) => {
  const { user } = useAuth0();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [insights, setInsights] = useState<MeetingInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const userId = user?.email || user?.sub;
      if (!userId) return;

      const [transcriptsResult, insightsResult] = await Promise.all([
        transcriptService.getTranscriptsByUser(userId),
        insightService.getInsightsByUser(userId)
      ]);

      if (transcriptsResult.data) {
        setTranscripts(transcriptsResult.data.slice(0, 5)); // Show last 5
      }
      if (insightsResult.data) {
        setInsights(insightsResult.data.slice(0, 5)); // Show last 5
      }
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleTranscriptClick = async (transcript: Transcript) => {
    if (onResumeSession && transcript.session_state) {
      onResumeSession(transcript.session_state);
    }
  };

  const handleInsightClick = async (insight: MeetingInsight) => {
    if (onResumeSession) {
      // Convert insight back to session format
      const sessionData = {
        extractedData: {
          meeting_title: insight.meeting_title,
          summary: insight.summary,
          decisions: insight.decisions,
          action_items: insight.action_items,
          follow_up_email: insight.follow_up_email
        },
        analysis: {
          meeting_title: insight.meeting_title,
          summary: insight.summary,
          decisions: insight.decisions,
          action_items: insight.action_items,
          follow_up_email: insight.follow_up_email
        },
        emailBody: insight.follow_up_email?.body || ''
      };
      onResumeSession(sessionData);
    }
  };

  return (
    <motion.div
      initial={{ x: isCollapsed ? -260 : 0 }}
      animate={{ x: isCollapsed ? -260 : 0 }}
      transition={{ duration: 0.08, ease: "easeInOut" }}
      className="fixed left-0 top-20 h-[calc(100vh-6rem)] w-80 bg-card/20 backdrop-blur-3xl border border-green-500/20 rounded-r-3xl z-50 overflow-hidden shadow-2xl"
    >
      {/* Toggle Button */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="absolute -right-4 top-4 z-50"
      >
        <Button
          onClick={onToggle}
          variant="ghost"
          className="w-8 h-12 rounded-r-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg border-l-4 border-green-500 transition-all duration-200 hover:scale-105"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-2 pt-12"
          >
            <div className="space-y-4">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                <Brain size={16} className="text-primary" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 pt-12 h-full overflow-y-auto scrollbar-hide"
          >
            <div className="space-y-6">
              {/* Recent Transcripts */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Recent Transcripts
                </h3>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-accent/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : transcripts.length > 0 ? (
                  <div className="space-y-2">
                    {transcripts.map((transcript) => (
                      <Card key={transcript.id || transcript._id} className="bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-xs font-medium text-foreground truncate flex-1">
                              {transcript.title || 'Meeting Transcript'}
                            </h4>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                              <Eye size={10} />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {truncateText(transcript.content, 60)}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(transcript.created_at)}
                            </span>
                          </div>
                          <div 
                            className="bg-background/60 backdrop-blur-sm p-2 rounded text-xs leading-relaxed cursor-pointer hover:bg-background/80 transition-colors"
                            onClick={() => handleTranscriptClick(transcript)}
                          >
                            <p className="font-medium text-foreground mb-1">{transcript.title || 'Untitled Meeting'}</p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                              <Eye size={10} />
                              <span>{formatDate(transcript.created_at)}</span>
                              <Clock size={10} />
                              <span>{formatDate(transcript.created_at)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-4 bg-accent/30 rounded-lg">
                    No transcripts yet
                  </div>
                )}
              </div>

              {/* Recent Insights */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Brain size={16} className="text-primary" />
                  AI Insights
                </h3>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-accent/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : insights.length > 0 ? (
                  <div className="space-y-2">
                    {insights.map((insight) => (
                      <Card key={insight.id || insight._id} className="bg-accent/50 hover:bg-accent transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-xs font-medium text-foreground truncate flex-1">
                              {insight.meeting_title}
                            </h4>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                              <Eye size={10} />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {truncateText(insight.summary, 60)}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {formatDate(insight.created_at)}
                            </span>
                          </div>
                          <div 
                            className="bg-background/60 backdrop-blur-sm p-2 rounded text-xs leading-relaxed cursor-pointer hover:bg-background/80 transition-colors"
                            onClick={() => handleInsightClick(insight)}
                          >
                            <p className="font-medium text-foreground mb-1">{insight.meeting_title}</p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                              <Eye size={10} />
                              <span>{formatDate(insight.created_at)}</span>
                              <Clock size={10} />
                              <span>{formatDate(insight.created_at)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-4 bg-accent/30 rounded-lg">
                    No insights yet
                  </div>
                )}
              </div>

              {/* Storage Notice */}
              <p className="text-[10px] text-muted-foreground/60 text-center mt-2">· recent progress ·</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar;
