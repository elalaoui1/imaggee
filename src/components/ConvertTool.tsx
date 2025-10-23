import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadZone } from "./UploadZone";
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
    </motion.div>
  );
};
