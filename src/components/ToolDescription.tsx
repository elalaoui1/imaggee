import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Step {
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ToolDescriptionProps {
  title: string;
  description: string;
  benefits: string[];
  howTo: Step[];
  faqs: FAQ[];
}

export const ToolDescription = ({ title, description, benefits, howTo, faqs }: ToolDescriptionProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6 mt-8"
    >
      {/* What it does */}
      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-3 gradient-text">What is {title}?</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
        
        <h4 className="font-semibold mb-3">Key Benefits:</h4>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* How to use */}
      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-4 gradient-text">How to Use {title}</h3>
        <div className="space-y-4">
          {howTo.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div>
                <h4 className="font-semibold mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* FAQ Section */}
      <Card className="glass p-6">
        <h3 className="text-xl font-bold mb-4 gradient-text">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border/50 last:border-0 pb-3">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between text-left py-2 hover:text-primary transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {openFaq === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-muted-foreground mt-2 leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};