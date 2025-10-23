import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { UploadZone } from "./UploadZone";
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
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        quality: quality[0] / 100,
      };

      const compressed = await imageCompression(originalFile, options);
      setCompressedBlob(compressed);
      setCompressedSize(compressed.size);
      
      toast({
        title: "Compression complete!",
        description: `Reduced by ${((1 - compressed.size / originalFile.size) * 100).toFixed(1)}%`,
      });
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
    </motion.div>
  );
};
