import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Reset success message after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get in touch via email',
      value: 'diwakar4311@gmail.com',
      action: 'mailto:diwakar4311@gmail.com'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      value: 'Coming soon',
      action: '#'
    },
    {
      icon: Phone,
      title: 'Contact Us',
      description: 'Connect with us on LinkedIn',
      value: 'LinkedIn Profile',
      action: 'https://www.linkedin.com/in/diwakar7sharma/'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Get in Touch
            </h1>
            <p className="text-xl text-foreground max-w-2xl mx-auto">
              Have questions about Meeting Actioner? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card className="border border-primary/20 bg-black">
                <CardHeader>
                  <CardTitle className="text-foreground">Contact Information</CardTitle>
                  <CardDescription className="text-foreground">
                    Multiple ways to reach our team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <motion.div
                        key={info.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="text-primary" size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{info.title}</h3>
                          <p className="text-sm text-foreground mb-1">{info.description}</p>
                          {info.action.startsWith('#') ? (
                            <span className="text-sm font-medium text-foreground">{info.value}</span>
                          ) : (
                            <a 
                              href={info.action}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {info.value}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Office Location */}
              <Card className="mt-6 border border-primary/20 bg-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MapPin className="text-primary" size={20} />
                    Office Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-foreground">Meeting Actioner HQ</p>
                    <p className="text-foreground">
                      Diwakar's Brain and his couch
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border border-primary/20 bg-black">
                <CardHeader>
                  <CardTitle className="text-foreground">Send us a Message</CardTitle>
                  <CardDescription className="text-foreground">
                    Fill out the form below and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="text-primary" size={24} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Message Sent!</h3>
                      <p className="text-foreground">
                        Thank you for contacting us. We'll get back to you soon.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                            Full Name *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                            Email Address *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2 text-foreground">
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What's this about?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us more about your inquiry..."
                          className="min-h-[120px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Send className="mr-2 animate-pulse" size={16} />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2" size={16} />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="mt-12 border border-primary/20 bg-black">
            <CardHeader>
              <CardTitle className="text-foreground">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-foreground">
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">How secure is my meeting data?</h4>
                  <p className="text-sm text-foreground">
                    We use enterprise-grade encryption and never store your meeting transcripts longer than necessary for processing.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">What file formats do you support?</h4>
                  <p className="text-sm text-foreground">
                    Currently, we support plain text transcripts. Audio file support is coming soon.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Is there a free trial?</h4>
                  <p className="text-sm text-foreground">
                    Yes! You can process up to 5 meeting transcripts for free to test our service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Can I integrate with my existing tools?</h4>
                  <p className="text-sm text-foreground">
                    API integrations are available for enterprise customers. Contact us for details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
