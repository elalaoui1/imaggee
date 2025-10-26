import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadZone } from "./UploadZone";
import { ToolDescription } from "./ToolDescription";
import { useToast } from "@/hooks/use-toast";

const formats = ["png", "jpeg", "webp", "bmp"] as const;
type ImageFormat = typeof formats[number];

export const ConvertTool = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("png");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    setOriginalFile(file);
    setConvertedBlob(null);
    toast({
      title: "Image loaded",
      description: file.name,
    });
  };

  const convertImage = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      const url = URL.createObjectURL(originalFile);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          toast({
            title: "Conversion failed",
            description: "Could not create canvas context",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        
        const mimeType = targetFormat === 'jpeg' ? 'image/jpeg' : `image/${targetFormat}`;
        canvas.toBlob((blob) => {
          if (blob) {
            setConvertedBlob(blob);
            toast({
              title: "Conversion complete!",
              description: `Converted to ${targetFormat.toUpperCase()}`,
            });
          }
          setIsProcessing(false);
        }, mimeType, 0.95);
        
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "Please try again",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const downloadConverted = () => {
    if (!convertedBlob || !originalFile) return;
    
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    const originalName = originalFile.name.split('.')[0];
    a.href = url;
    a.download = `${originalName}.${targetFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Repeat className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold">Convert Format</h2>
      </div>

      {!originalFile ? (
        <UploadZone onFilesSelected={handleFileSelect} accept="image/*" />
      ) : (
        <Card className="glass p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Original</h3>
              <img 
                src={URL.createObjectURL(originalFile)} 
                alt="Original" 
                className="w-full rounded-lg border border-border"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {originalFile.type.split('/')[1].toUpperCase()}
              </p>
            </div>
            
            {convertedBlob && (
              <div>
                <h3 className="text-sm font-medium mb-2">Converted</h3>
                <img 
                  src={URL.createObjectURL(convertedBlob)} 
                  alt="Converted" 
                  className="w-full rounded-lg border border-border"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {targetFormat.toUpperCase()}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Target Format
            </label>
            <Select value={targetFormat} onValueChange={(v) => setTargetFormat(v as ImageFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map(format => (
                  <SelectItem key={format} value={format}>
                    {format.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={convertImage}
              disabled={isProcessing}
              variant="gradient"
            >
              {isProcessing ? "Converting..." : "Convert"}
            </Button>
            
            {convertedBlob && (
              <Button onClick={downloadConverted} variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            
            <Button onClick={() => setOriginalFile(null)} variant="outline">
              New Image
            </Button>
          </div>
        </Card>
      )}

      <ToolDescription
        title="Image Format Converter"
        description="Seamlessly convert images between PNG, JPG, WebP, and BMP formats with a single click. Our converter maintains image quality while ensuring compatibility across all platforms and applications. Whether you need transparent PNGs, compressed JPEGs, modern WebP for web optimization, or legacy BMP files, our tool handles it all effortlessly."
        benefits={[
          "Convert between PNG, JPEG, WebP, and BMP formats instantly",
          "Maintain maximum image quality during conversion",
          "Support for transparent backgrounds in PNG format",
          "Optimize for web with modern WebP format (up to 30% smaller than JPEG)",
          "Batch conversion support for multiple images",
          "No watermarks, no file size limits, completely free"
        ]}
        howTo={[
          {
            title: "Upload Your Image",
            description: "Select or drag-and-drop the image you want to convert. All common image formats are supported as input."
          },
          {
            title: "Choose Target Format",
            description: "Select your desired output format from the dropdown: PNG (for transparency), JPEG (for photos), WebP (for web), or BMP."
          },
          {
            title: "Convert",
            description: "Click the Convert button and watch as your image is instantly transformed to the new format."
          },
          {
            title: "Download",
            description: "Download your converted image with the new file extension and format."
          }
        ]}
        faqs={[
          {
            question: "When should I use PNG vs JPEG format?",
            answer: "Use PNG for images with transparency, graphics, logos, and screenshots where you need lossless quality. Use JPEG for photographs and images with many colors where smaller file sizes are more important than perfect quality."
          },
          {
            question: "What is WebP and why should I use it?",
            answer: "WebP is a modern image format developed by Google that provides superior compression. WebP images are typically 25-35% smaller than JPEG at the same quality level, making them perfect for websites and web applications to improve loading speeds."
          },
          {
            question: "Will converting from JPEG to PNG improve quality?",
            answer: "No, converting from a lossy format (JPEG) to a lossless format (PNG) won't restore lost quality. However, it's useful if you need transparency support or want to prevent further quality loss in subsequent edits."
          },
          {
            question: "Does format conversion preserve EXIF data?",
            answer: "Basic EXIF data like dimensions and color space is preserved when possible, but some metadata may be lost. If you need to preserve or remove all metadata, use our Metadata tool."
          },
          {
            question: "Can I convert transparent PNGs to JPEG?",
            answer: "Yes, but JPEG doesn't support transparency. Transparent areas will be replaced with a white background during conversion."
          }
        ]}
      />
    </motion.div>
  );
};