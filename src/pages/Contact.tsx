import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare, Users, HelpCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Contact = () => {

  const navigate = useNavigate();
  
    const handleClick = () => {
      // Navigate to home first
      navigate("/");
  
      // Scroll after short delay to let DOM render
       setTimeout(() => {
  const el = document.getElementById("alltools");
  if (el) {
    // Step 1 — scroll to the element
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // Step 2 — adjust -40px after the scroll
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY - 40,
        behavior: "instant" // no animation (optional)
      });
    }, 400); // match your smooth scroll duration
  }
}, 100);
    };

  return (
    <Layout>
      <div className="relative z-10 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, })}>
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

         <Card className="glass ">
  <CardHeader>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-primary/10">
        <Mail className="w-5 h-5 text-primary" />
      </div>
      <CardTitle>Contact Us</CardTitle>
    </div>
    <CardDescription>
      If you have any questions, feedback, or partnership inquiries, reach out to us via email.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <a 
      href="mailto:contact.imaggee@gmail.com" 
      className="text-primary hover:underline font-medium text-lg"
    >
      contact.imaggee@gmail.com
    </a>
  </CardContent>
</Card>


          <Card className="glass bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I report a bug?</h3>
                  <p className="text-sm text-muted-foreground">
                    Send us an email at contact.imaggee@gmail.com with details about the issue, including 
                    your browser type, operating system, and steps to reproduce the problem.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I suggest a new feature?</h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! We love hearing from our users. Email your suggestions to 
                    contact.imaggee@gmail.com and we'll review them carefully.
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
              <Button size="lg" onClick={handleClick}>
                  Explore Tools
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
