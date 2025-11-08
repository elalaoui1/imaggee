import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Users, HelpCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Contact = () => {
  return (
    <Layout>
      <div className="relative z-10 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">
              We'd love to hear from you! Whether you have questions, feedback, or suggestions.
            </p>
          </div>

          <Card className="glass">
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                At Imaggee, we value our users and are committed to providing excellent support. 
                If you have any questions about our tools, encounter any issues, or have suggestions 
                for improvements, please don't hesitate to reach out. We read every message and strive 
                to respond as quickly as possible.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your feedback helps us make Imaggee better for everyone. We're always looking to 
                improve our tools and add new features that matter to you.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>General Inquiries</CardTitle>
                </div>
                <CardDescription>
                  Questions about our tools or services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:support@imaggee.com" 
                  className="text-primary hover:underline font-medium"
                >
                  support@imaggee.com
                </a>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Technical Support</CardTitle>
                </div>
                <CardDescription>
                  Need help with a specific tool or feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:help@imaggee.com" 
                  className="text-primary hover:underline font-medium"
                >
                  help@imaggee.com
                </a>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Feedback & Suggestions</CardTitle>
                </div>
                <CardDescription>
                  Share your ideas to improve Imaggee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:feedback@imaggee.com" 
                  className="text-primary hover:underline font-medium"
                >
                  feedback@imaggee.com
                </a>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Partnerships</CardTitle>
                </div>
                <CardDescription>
                  Interested in collaborating with us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:partners@imaggee.com" 
                  className="text-primary hover:underline font-medium"
                >
                  partners@imaggee.com
                </a>
              </CardContent>
            </Card>
          </div>

          <Card className="glass bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I report a bug?</h3>
                  <p className="text-sm text-muted-foreground">
                    Send us an email at help@imaggee.com with details about the issue, including 
                    your browser type, operating system, and steps to reproduce the problem.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I suggest a new feature?</h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! We love hearing from our users. Email your suggestions to 
                    feedback@imaggee.com and we'll review them carefully.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">How quickly can I expect a response?</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24-48 hours during business days. For urgent technical 
                    issues, we aim to respond even faster.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass text-center">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-3">Prefer to explore on your own?</h3>
              <p className="text-muted-foreground mb-6">
                Our tools are designed to be intuitive and easy to use. Try them out and see what you can create!
              </p>
              <Button asChild size="lg">
                <Link to="/">
                  Explore Tools
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Footer />
      </div>
    </Layout>
  );
};

export default Contact;
