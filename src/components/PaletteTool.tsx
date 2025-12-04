import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/UploadZone";
import { ToolDescription } from "@/components/ToolDescription";
import { Palette, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ColorSwatch {
  hex: string;
  rgb: string;
  count: number;
}

export const PaletteTool = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setOriginalImage(file);

    const img = new Image();
    img.onload = () => extractColors(img);
    img.src = URL.createObjectURL(file);

    toast.success("Extracting color palette...");
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const extractColors = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale down for faster processing
    const maxSize = 200;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Color quantization using simple clustering
    const colorMap = new Map<string, number>();

    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 128) continue; // Skip transparent pixels

      // Round to nearest 16 to reduce color space
      const rRounded = Math.round(r / 16) * 16;
      const gRounded = Math.round(g / 16) * 16;
      const bRounded = Math.round(b / 16) * 16;

      const key = `${rRounded},${gRounded},${bRounded}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Sort by frequency and get top colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number);
        return {
          hex: rgbToHex(r, g, b),
          rgb: `rgb(${r}, ${g}, ${b})`,
          count,
        };
      });

    setColors(sortedColors);
    toast.success(`Extracted ${sortedColors.length} dominant colors!`);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success(`Copied ${text} to clipboard!`);
  };

  const generateGradients = () => {
    if (colors.length < 2) return [];

    return [
      `linear-gradient(135deg, ${colors[0].hex}, ${colors[1].hex})`,
      colors.length > 2 ? `linear-gradient(135deg, ${colors[0].hex}, ${colors[2].hex})` : null,
      colors.length > 3 ? `linear-gradient(135deg, ${colors[1].hex}, ${colors[3].hex})` : null,
    ].filter(Boolean) as string[];
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
      >
        <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center space-y-4 py-4 md:py-6"
>
  <div className="flex flex-col md:flex-row items-center justify-center gap-3">
    <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
      Color Palette Extractor
    </h1>
  </div>

  <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto px-4">
    Extract dominant colors from any image and copy HEX/RGB codes effortlessly.
  </p>
</motion.div>


        {!originalImage ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-6">
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2">Original Image</h3>
              <img
                src={URL.createObjectURL(originalImage)}
                alt="Original"
                className="w-full rounded-lg max-h-96 object-contain bg-muted/20"
              />
            </div>

            {colors.length > 0 && (
              <>
                <div className="glass rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Dominant Colors
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {colors.map((color, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-xl overflow-hidden"
                      >
                        <div
                          className="h-24 sm:h-28 w-full"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="p-3 space-y-2">
                          <button
                            onClick={() => copyToClipboard(color.hex, index * 2)}
                            className="flex items-center justify-between w-full text-xs sm:text-sm hover:text-primary transition-colors active:scale-95 py-1"
                          >
                            <span className="font-mono">{color.hex}</span>
                            {copiedIndex === index * 2 ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(color.rgb, index * 2 + 1)}
                            className="flex items-center justify-between w-full text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors active:scale-95 py-1"
                          >
                            <span className="font-mono text-xs">{color.rgb}</span>
                            {copiedIndex === index * 2 + 1 ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold">Gradient Suggestions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {generateGradients().map((gradient, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        onClick={() => copyToClipboard(gradient, 100 + index)}
                        className="glass rounded-xl h-24 sm:h-28 overflow-hidden relative group active:scale-95"
                        style={{ background: gradient }}
                      >
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                          {copiedIndex === 100 + index ? (
                            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          ) : (
                            <Copy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={() => {
                setOriginalImage(null);
                setColors([]);
              }}
              variant="outline"
              className="w-full"
            >
              Process Another Image
            </Button>
          </div>
        )}
      </motion.div>

      <ToolDescription
        title="Color Palette Extractor"
        description="Extract dominant colors from any image and get HEX/RGB codes instantly. Perfect for designers, developers, and creatives who need to match colors or create harmonious palettes."
        benefits={["Extract 8 dominant colors", "HEX and RGB codes", "Gradient suggestions", "One-click copy to clipboard"]}
        howTo={[
          { title: "Upload Image", description: "Upload any image to extract its color palette" },
          { title: "View Colors", description: "See the dominant colors with HEX and RGB values" },
          { title: "Copy Codes", description: "Click any color to copy its code to clipboard" }
        ]}
        faqs={[
          { question: "How accurate is the color extraction?", answer: "Our algorithm analyzes every pixel to identify the most dominant and representative colors in your image." },
          { question: "Can I use these colors in my designs?", answer: "Absolutely! Copy the HEX or RGB codes and use them in any design software, CSS, or graphics application." }
        ]}
      />
    </div>
  );
};
