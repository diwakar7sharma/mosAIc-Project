import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquare, Sparkles, Clock, FileText, Brain } from 'lucide-react';
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
  key_takeaways: string[];
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
        // Sort by creation date, most recent first
        const sortedTranscripts = transcriptsResult.data
          .sort((a: Transcript, b: Transcript) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 10); // Show last 10
        setTranscripts(sortedTranscripts);
      }
      if (insightsResult.data) {
        // Sort by creation date, most recent first
        const sortedInsights = insightsResult.data
          .sort((a: MeetingInsight, b: MeetingInsight) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 10); // Show last 10
        setInsights(sortedInsights);
      }
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const handleTranscriptClick = async (transcript: Transcript) => {
    if (onResumeSession && transcript.session_state) {
      onResumeSession({
        ...transcript.session_state,
        transcript: transcript.content // Include original transcript
      });
      onToggle(); // Close sidebar after selection
    }
  };

  // AI Insights are display-only, no session restoration needed

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
            <div className="space-y-4">
              {/* Recent Transcripts */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
                  Recent Transcripts
                </h3>
                {loading ? (
                  <div className="space-y-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 bg-accent/30 rounded-lg animate-pulse mx-2" />
                    ))}
                  </div>
                ) : transcripts.length > 0 ? (
                  <div className="space-y-1">
                    {transcripts.map((transcript) => (
                      <div
                        key={transcript.id || transcript._id}
                        onClick={() => handleTranscriptClick(transcript)}
                        className="mx-2 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare size={16} className="text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {truncateTitle(transcript.title || 'Meeting Transcript')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transcript.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-6 mx-2">
                    No transcripts yet
                  </div>
                )}
              </div>

              {/* AI Insights */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">
                  AI Insights
                </h3>
                {loading ? (
                  <div className="space-y-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-accent/30 rounded-lg animate-pulse mx-2" />
                    ))}
                  </div>
                ) : insights.length > 0 ? (
                  <div className="space-y-1">
                    {insights.map((insight) => (
                      <div
                        key={insight.id || insight._id}
                        className="mx-2 p-3 rounded-lg bg-accent/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground mb-1 truncate">
                              {truncateTitle(insight.meeting_title)}
                            </p>
                            <div className="space-y-1">
                              {insight.key_takeaways?.slice(0, 3).map((takeaway, index) => (
                                <p key={index} className="text-xs text-muted-foreground leading-relaxed">
                                  • {takeaway.length > 60 ? takeaway.substring(0, 60) + '...' : takeaway}
                                </p>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              <Clock size={10} className="text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                {formatDate(insight.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-6 mx-2">
                    No insights yet
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border/50 pt-4 mt-6">
                <p className="text-[10px] text-muted-foreground/60 text-center px-2">
                  Click any item to restore session
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar;
