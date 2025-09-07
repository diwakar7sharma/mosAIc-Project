import { motion } from 'framer-motion';
import { Brain, Users, Zap, Shield, Heart, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced natural language processing to extract meaningful insights from your meeting transcripts.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Built for modern teams who need to stay organized and accountable after every meeting.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get your meeting insights in seconds, not hours. Our AI processes transcripts instantly.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your meeting data is encrypted and secure. We never store sensitive information longer than necessary.'
    }
  ];

  const technologies = [
    { name: 'OpenAI GPT-4', description: 'For intelligent text analysis and extraction' },
    { name: 'ElevenLabs', description: 'For high-quality voice synthesis' },
    { name: 'Auth0', description: 'For secure authentication and user management' },
    { name: 'React & TypeScript', description: 'For a modern, type-safe frontend experience' },
    { name: 'Node.js & Express', description: 'For a robust and scalable backend API' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              About Meeting Actioner
            </h1>
            <p className="text-xl text-foreground max-w-3xl mx-auto">
              We're on a mission to transform how teams handle meeting follow-ups. 
              No more lost action items, forgotten decisions, or unclear next steps.
            </p>
          </div>

          {/* Problem & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="border border-primary/30 bg-black">
              <CardHeader>
                <CardTitle className="text-foreground">The Problem</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>67% of meetings end without clear action items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Teams spend 4+ hours weekly on meeting follow-ups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Important decisions get lost in long transcripts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Manual note-taking is error-prone and time-consuming</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-primary/30 bg-black">
              <CardHeader>
                <CardTitle className="text-foreground">Our Solution</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>AI extracts action items automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Key decisions are highlighted and organized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Professional follow-up emails generated instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Voice summaries for busy team members</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose Meeting Actioner?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full border border-primary/20 bg-black hover:border-primary/40 transition-all duration-300">
                      <CardHeader>
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                          <Icon className="text-primary" size={24} />
                        </div>
                        <CardTitle className="text-foreground">{feature.title}</CardTitle>
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

          {/* Technology Stack */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Built with Best-in-Class Technology</h2>
            <Card className="border border-primary/20 bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Award className="text-primary" size={24} />
                  Technology Stack
                </CardTitle>
                <CardDescription className="text-foreground">
                  We use cutting-edge technologies to deliver the best experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {technologies.map((tech) => (
                    <div key={tech.name} className="flex items-start space-x-3 p-4 rounded-lg border border-primary/10 bg-black">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-foreground">{tech.name}</h4>
                        <p className="text-sm text-foreground">{tech.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission Statement */}
          <Card className="border border-primary/30 bg-black">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-foreground">
                <Heart className="text-primary" size={28} />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                To empower every team with AI-driven insights that turn meeting chaos into organized action. 
                We believe that great ideas deserve great follow-through, and technology should make that effortless.
              </p>
            </CardContent>
          </Card>

          {/* Credits */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Powered By</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-foreground">
              <span>OpenAI GPT-4</span>
              <span className="text-primary">•</span>
              <span>ElevenLabs Voice AI</span>
              <span className="text-primary">•</span>
              <span>Auth0 Authentication</span>
              <span className="text-primary">•</span>
              <span>Vercel Deployment</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
