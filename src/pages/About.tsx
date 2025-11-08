import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Zap, Heart, Globe } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">About Imaggee</h1>
            <p className="text-xl text-muted-foreground">
              Empowering creators with professional image tools
            </p>
          </div>

          <Card className="glass">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At Imaggee, we believe that powerful image editing tools should be accessible to everyone, 
                without compromising privacy or requiring expensive software subscriptions. Our mission is to 
                provide professional-grade image processing capabilities that run entirely in your browser, 
                ensuring your data never leaves your device.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We're committed to building tools that are not only powerful and efficient but also respect 
                your privacy and give you complete control over your images. Every feature we develop is 
                designed with security, performance, and user experience in mind.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Privacy First</h3>
                </div>
                <p className="text-muted-foreground">
                  All image processing happens locally in your browser. We never upload, store, or access 
                  your images. Your privacy is guaranteed, not promised.
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Lightning Fast</h3>
                </div>
                <p className="text-muted-foreground">
                  Process images instantly without waiting for uploads or downloads. Our client-side 
                  technology delivers professional results in seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Made with Care</h3>
                </div>
                <p className="text-muted-foreground">
                  Every tool is carefully crafted to provide the best user experience. We continuously 
                  improve our features based on user feedback and emerging technologies.
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Always Available</h3>
                </div>
                <p className="text-muted-foreground">
                  Access our tools anytime, anywhere. No installation required, no registration needed. 
                  Just open your browser and start creating.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Imaggee was born from a simple observation: most people need basic to intermediate 
                image editing capabilities, but they're forced to choose between privacy-invading online 
                tools or expensive desktop software. We saw an opportunity to bridge this gap using modern 
                web technologies.
              </p>
...
              <p className="text-muted-foreground leading-relaxed">
                Today, Imaggee serves thousands of users who value both functionality and privacy. 
                We're constantly expanding our toolset and improving existing features to meet the evolving 
                needs of content creators, designers, and everyday users.
              </p>
            </CardContent>
          </Card>

          <Card className="glass bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Our Commitment to You</h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2">🔒 100% Client-Side</h4>
                  <p className="text-sm text-muted-foreground">
                    Your images never leave your device. All processing happens locally.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🚀 Always Free</h4>
                  <p className="text-sm text-muted-foreground">
                    Core features remain free forever. No hidden costs or subscriptions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">⚡ Constant Innovation</h4>
                  <p className="text-sm text-muted-foreground">
                    Regular updates with new features and improvements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <h3 className="text-xl font-semibold mb-4">Ready to start editing?</h3>
            <Button asChild size="lg">
              <Link to="/">
                Try Our Tools
              </Link>
            </Button>
          </div>
        </motion.div>

        <Footer />
      </div>
    </Layout>
  );
};

export default About;
