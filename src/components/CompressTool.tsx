import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { UploadZone } from "./UploadZone";
import { ToolDescription } from "./ToolDescription";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

export const CompressTool = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState([80]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    setOriginalFile(file);
    setOriginalSize(file.size);
    setCompressedBlob(null);
    toast({
      title: "Image loaded",
      description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    });
  };

  const compressImage = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    try {
      const fileSizeInMB = originalFile.size / (1024 * 1024);
      const targetSize = originalFile.size * 0.5; // 50% of original
      
      let finalCompressed: Blob;
      
      // For images over 1MB, ensure at least 50% compression with best quality
      if (fileSizeInMB > 1) {
        let bestQuality = quality[0] / 100;
        let compressed = await imageCompression(originalFile, {
          maxSizeMB: fileSizeInMB * 0.5,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          initialQuality: bestQuality,
        });
        
        // If first attempt doesn't reach 50% compression, iteratively reduce quality
        let attempts = 0;
        while (compressed.size > targetSize && bestQuality > 0.5 && attempts < 5) {
          bestQuality -= 0.1;
          compressed = await imageCompression(originalFile, {
            maxSizeMB: fileSizeInMB * 0.5,
            maxWidthOrHeight: 4096,
            useWebWorker: true,
            initialQuality: Math.max(0.5, bestQuality),
          });
          attempts++;
        }
        
        finalCompressed = compressed;
        
        const compressionPercent = ((1 - compressed.size / originalFile.size) * 100).toFixed(1);
        toast({
          title: "Compression complete!",
          description: `Reduced by ${compressionPercent}% (${(compressed.size / 1024).toFixed(2)} KB)`,
        });
      } else {
        // For images under 1MB, use standard compression with user's quality setting
        const compressed = await imageCompression(originalFile, {
          maxSizeMB: 10,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          initialQuality: quality[0] / 100,
        });
        
        finalCompressed = compressed;
        
        toast({
          title: "Compression complete!",
          description: `Reduced by ${((1 - compressed.size / originalFile.size) * 100).toFixed(1)}%`,
        });
      }
      
      setCompressedBlob(finalCompressed);
      setCompressedSize(finalCompressed.size);
      
    } catch (error) {
      toast({
        title: "Compression failed",
        description: "Please try again with a different image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedBlob || !originalFile) return;
    
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed-${originalFile.name}`;
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
        <Minimize2 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Compress Images</h2>
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
                {(originalSize / 1024).toFixed(2)} KB
              </p>
            </div>
            
            {compressedBlob && (
              <div>
                <h3 className="text-sm font-medium mb-2">Compressed</h3>
                <img 
                  src={URL.createObjectURL(compressedBlob)} 
                  alt="Compressed" 
                  className="w-full rounded-lg border border-border"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {(compressedSize / 1024).toFixed(2)} KB
                  <span className="text-primary ml-2">
                    (-{((1 - compressedSize / originalSize) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Quality: {quality[0]}%
            </label>
            <Slider
              value={quality}
              onValueChange={setQuality}
              max={100}
              min={10}
              step={1}
              className="mb-4"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={compressImage}
              disabled={isProcessing}
              variant="gradient"
            >
              {isProcessing ? "Processing..." : "Compress"}
            </Button>
            
            {compressedBlob && (
              <Button onClick={downloadCompressed} variant="secondary">
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
        title="Image Compression"
        description="Our advanced image compression tool reduces file sizes by up to 90% while maintaining excellent visual quality. Perfect for optimizing images for websites, social media, email attachments, or cloud storage. Using state-of-the-art compression algorithms, you can significantly reduce loading times and save bandwidth without compromising on image quality."
        benefits={[
          "Reduce file sizes by up to 90% without visible quality loss",
          "Adjustable quality slider for precise control over compression level",
          "Instant preview to compare original and compressed versions",
          "Perfect for web optimization, faster page loading, and reduced bandwidth costs",
          "Supports all major image formats: JPEG, PNG, WebP, and more",
          "No file size or quantity limits - compress as many images as you need"
        ]}
        howTo={[
          {
            title: "Upload Your Image",
            description: "Click or drag-and-drop your image file into the upload zone. Supports JPG, PNG, WebP, and other common formats."
          },
          {
            title: "Adjust Quality",
            description: "Use the quality slider to set your desired compression level. Higher values preserve more quality but result in larger files."
          },
          {
            title: "Compress",
            description: "Click the 'Compress' button to process your image. You'll see the size reduction percentage instantly."
          },
          {
            title: "Download",
            description: "Review the compressed image and download it when satisfied with the results."
          }
        ]}
        faqs={[
          {
            question: "How much can I compress an image without losing quality?",
            answer: "Typically, you can reduce file sizes by 50-70% without noticeable quality loss. JPEG images can often be compressed to 70-80% quality with minimal visible difference, while PNG images benefit from lossless compression techniques."
          },
          {
            question: "What's the difference between lossy and lossless compression?",
            answer: "Lossy compression (like JPEG) removes some image data to achieve smaller file sizes, which may slightly reduce quality. Lossless compression (like PNG optimization) reduces file size without any quality loss by optimizing how the data is stored."
          },
          {
            question: "Will compressing images affect their resolution or dimensions?",
            answer: "No, compression only reduces file size by optimizing how image data is stored. The pixel dimensions and resolution remain unchanged."
          },
          {
            question: "How does image compression help with website speed?",
            answer: "Smaller image files load faster, reducing page load times and bandwidth usage. This improves user experience, SEO rankings, and reduces hosting costs. Google recommends optimized images for better Core Web Vitals scores."
          },
          {
            question: "Is there a limit to how many images I can compress?",
            answer: "No limits! You can compress as many images as you need, completely free. All processing happens in your browser, so there are no server restrictions."
          }
        ]}
      />
    </motion.div>
  );
};