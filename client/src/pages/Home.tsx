import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowRight, Mic, Brain, CheckCircle, Mail, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const features = [
    {
      icon: Mic,
      title: 'Voice Transcription',
      description: 'Upload meeting transcripts or paste text directly'
    },
    {
      icon: Brain,
      title: 'AI Analysis',
      description: 'Extract key decisions, action items, and summaries'
    },
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Organize action items in a Kanban-style board'
    },
    {
      icon: Mail,
      title: 'Follow-up Emails',
      description: 'Generate professional follow-up emails automatically'
    },
    {
      icon: Play,
      title: 'Voice Summaries',
      description: 'Listen to AI-generated voice summaries of your meetings'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              From AI Curious → AI Confident
            </h1>
            <p className="text-xl md:text-2xl text-foreground mb-8 max-w-3xl mx-auto">
              Transform your meeting transcripts into actionable insights with AI-powered analysis, 
              task extraction, and voice summaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2" size={20} />
                  </a>
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => loginWithRedirect()}
                >
                  Get Started <ArrowRight className="ml-2" size={20} />
                </Button>
              )}
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <a href="/about">Learn More</a>
              </Button>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Everything you need to turn meeting chaos into organized action items
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border border-primary/20 bg-black hover:border-primary/40 transition-all duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="text-primary" size={24} />
                      </div>
                      <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to Transform Your Meetings?
            </h2>
            <p className="text-xl text-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using Meeting Actioner to stay organized and productive.
            </p>
            {!isAuthenticated && (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => loginWithRedirect()}
              >
                Start Free Today <ArrowRight className="ml-2" size={20} />
              </Button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
