import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadZone } from "./UploadZone";
import { useToast } from "@/hooks/use-toast";
import { Canvas as FabricCanvas, FabricImage } from "fabric";

export const CombineTool = () => {
  const [images, setImages] = useState<File[]>([]);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#1a1a1a",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const handleFileSelect = async (files: File[]) => {
    setImages(prev => [...prev, ...files]);
    
    if (!fabricCanvas) return;

    for (const file of files) {
      const url = URL.createObjectURL(file);
      const img = await FabricImage.fromURL(url);
      
      img.scale(0.3);
      img.set({
        left: Math.random() * 400,
        top: Math.random() * 300,
      });
      
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
    }

    toast({
      title: "Images added",
      description: `${files.length} image(s) added to canvas`,
    });
  };

  const downloadCombined = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'combined-image.png';
    a.click();

    toast({
      title: "Downloaded!",
      description: "Combined image saved",
    });
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#1a1a1a";
    fabricCanvas.renderAll();
    setImages([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Layers className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold">Combine Images</h2>
      </div>

      <UploadZone onFilesSelected={handleFileSelect} accept="image/*" multiple />

      {images.length > 0 && (
        <Card className="glass p-6 space-y-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <canvas ref={canvasRef} />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Drag, resize, and rotate images on the canvas. {images.length} image(s) loaded.
          </p>

          <div className="flex gap-3">
            <Button onClick={downloadCombined} variant="gradient">
              <Download className="w-4 h-4 mr-2" />
              Download Combined
            </Button>
            <Button onClick={clearCanvas} variant="outline">
              Clear Canvas
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
};
