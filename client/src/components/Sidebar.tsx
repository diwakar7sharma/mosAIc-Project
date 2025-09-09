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
}

interface MeetingInsight {
  _id?: string;
  id?: string;
  meeting_title: string;
  summary: string;
  user_id: string;
  created_at?: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
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

  return (
    <motion.div
      initial={{ x: isCollapsed ? -260 : 0 }}
      animate={{ x: isCollapsed ? -260 : 0 }}
      transition={{ duration: 0.08, ease: "easeInOut" }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card/80 backdrop-blur-xl border-r border-border/50 z-50 overflow-hidden shadow-2xl"
    >
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-4 z-50 w-6 h-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </Button>

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
            className="p-4 pt-12 h-full overflow-y-auto"
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
