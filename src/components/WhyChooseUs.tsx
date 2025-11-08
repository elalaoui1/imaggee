import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Shield, Zap, Globe, Heart } from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "100% Privacy & Security",
    description: "All image processing happens directly in your browser. Your files never touch our servers, ensuring complete privacy and security for your sensitive images.",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Processing",
    description: "No waiting for uploads or downloads. Our client-side processing delivers instant results, saving you time and bandwidth.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "No software installation required. Access our tools from any device, anywhere, anytime. Works on Windows, Mac, Linux, iOS, and Android.",
  },
  {
    icon: Heart,
    title: "Completely Free",
    description: "All tools are 100% free with no hidden costs, watermarks, or limitations. Professional-grade image editing accessible to everyone.",
  },
];

export const WhyChooseUs = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
        Why Choose Imaggee?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reasons.map((reason, index) => (
          <motion.div
            key={reason.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="glass p-6 h-full">
              <reason.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">{reason.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass p-8">
        <h3 className="text-2xl font-bold mb-4 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-3">
              1
            </div>
            <h4 className="font-semibold mb-2">Choose Your Tool</h4>
            <p className="text-sm text-muted-foreground">
              Select from our suite of powerful image editing tools
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-3">
              2
            </div>
            <h4 className="font-semibold mb-2">Upload Your Image</h4>
            <p className="text-sm text-muted-foreground">
              Drag & drop or browse to upload your images
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold mx-auto mb-3">
              3
            </div>
            <h4 className="font-semibold mb-2">Download Result</h4>
            <p className="text-sm text-muted-foreground">
              Get your processed image instantly - no waiting
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};