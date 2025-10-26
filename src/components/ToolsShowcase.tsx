import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Minimize2, Repeat, Layers, Eraser, Crop, Palette, FileX } from "lucide-react";

const tools = [
  {
    icon: Minimize2,
    title: "Image Compression",
    description: "Reduce file size without losing quality. Perfect for websites, emails, and storage optimization.",
    features: ["Up to 90% size reduction", "Quality control", "Batch processing"],
  },
  {
    icon: Repeat,
    title: "Format Conversion",
    description: "Convert between PNG, JPG, WebP, and BMP formats seamlessly with one click.",
    features: ["Multiple format support", "Lossless conversion", "Maintains quality"],
  },
  {
    icon: Eraser,
    title: "Background Removal",
    description: "AI-powered background removal with transparent, solid, or gradient backgrounds.",
    features: ["AI precision", "Multiple background options", "Edge refinement"],
  },
  {
    icon: Crop,
    title: "Smart Resize",
    description: "Resize images with presets for Instagram, YouTube, Facebook, and custom dimensions.",
    features: ["Social media presets", "Custom dimensions", "Aspect ratio lock"],
  },
  {
    icon: Layers,
    title: "Image Combiner",
    description: "Merge multiple images into one. Create collages, overlays, and composite images.",
    features: ["Drag & drop placement", "Layer control", "Export options"],
  },
  {
    icon: Palette,
    title: "Color Palette",
    description: "Extract dominant colors from any image with HEX and RGB codes for your designs.",
    features: ["8 color extraction", "HEX/RGB values", "Gradient suggestions"],
  },
  {
    icon: FileX,
    title: "Metadata Editor",
    description: "View and remove EXIF data from images to protect your privacy.",
    features: ["Privacy protection", "EXIF removal", "Location data cleanup"],
  },
];

export const ToolsShowcase = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
        Comprehensive Image Editing Suite
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Everything you need to edit, optimize, and enhance your images in one place. 
        No downloads, no sign-ups, no complicated software.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="glass p-6 h-full hover:border-primary/50 transition-all duration-300">
              <tool.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {tool.description}
              </p>
              <ul className="space-y-2">
                {tool.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};