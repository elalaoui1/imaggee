import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadZone } from "@/components/UploadZone";
import { ToolDescription } from "@/components/ToolDescription";
import { Download, Crop, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { name: "Instagram Post", ratio: "1:1", width: 1080, height: 1080 },
  { name: "Instagram Story", ratio: "9:16", width: 1080, height: 1920 },
  { name: "YouTube Thumbnail", ratio: "16:9", width: 1280, height: 720 },
  { name: "Website Banner", ratio: "4:3", width: 1200, height: 900 },
  { name: "Facebook Cover", ratio: "205:78", width: 820, height: 312 },
  { name: "Twitter Header", ratio: "3:1", width: 1500, height: 500 },
];

export const ResizeTool = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setOriginalImage(file);

    const img = new Image();
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setOriginalAspectRatio(img.width / img.height);
      updatePreview(img, img.width, img.height);
    };
    img.src = URL.createObjectURL(file);

    toast.success("Image loaded! Select a preset or enter custom dimensions.");
  };

  const updatePreview = (img: HTMLImageElement, w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw image centered and scaled to fit
    const scale = Math.min(w / img.width, h / img.height);
    const x = (w - img.width * scale) / 2;
    const y = (h - img.height * scale) / 2;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    setPreviewUrl(canvas.toDataURL());
  };

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    if (!originalImage) return;

    setWidth(preset.width);
    setHeight(preset.height);

    const img = new Image();
    img.onload = () => updatePreview(img, preset.width, preset.height);
    img.src = URL.createObjectURL(originalImage);

    toast.success(`Applied ${preset.name} preset`);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / originalAspectRatio));
    }

    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        const h = maintainAspectRatio ? Math.round(newWidth / originalAspectRatio) : height;
        updatePreview(img, newWidth, h);
      };
      img.src = URL.createObjectURL(originalImage);
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * originalAspectRatio));
    }

    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        const w = maintainAspectRatio ? Math.round(newHeight * originalAspectRatio) : width;
        updatePreview(img, w, newHeight);
      };
      img.src = URL.createObjectURL(originalImage);
    }
  };

  const handleDownload = () => {
    if (!originalImage || !previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `resized-${width}x${height}-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Image downloaded!");
        }
      }, 'image/png');
    };
    img.src = URL.createObjectURL(originalImage);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold mb-4 gradient-text">Smart Resize & Crop</h2>
        <p className="text-muted-foreground mb-6">
          Resize your images to perfect dimensions for any platform
        </p>

        {!originalImage ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-6">
            {previewUrl && (
              <div className="glass rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-2">Preview ({width} × {height})</h3>
                <div className="relative bg-muted/20 rounded-lg overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-[400px] mx-auto object-contain" />
                </div>
              </div>
            )}

            <div className="glass rounded-xl p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Crop className="w-4 h-4" />
                Preset Sizes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    onClick={() => handlePresetClick(preset)}
                    className="h-auto py-3 text-xs"
                  >
                    <div className="text-left w-full">
                      <div className="font-semibold text-sm">{preset.name}</div>
                      <div className="text-muted-foreground text-xs">{preset.ratio} • {preset.width}×{preset.height}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Custom Dimensions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                >
                  {maintainAspectRatio ? (
                    <Lock className="w-4 h-4 mr-2" />
                  ) : (
                    <Unlock className="w-4 h-4 mr-2" />
                  )}
                  {maintainAspectRatio ? "Locked" : "Unlocked"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (px)</label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    min={1}
                    max={4096}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (px)</label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    min={1}
                    max={4096}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full"
              variant="gradient"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Resized Image
            </Button>

            <Button
              onClick={() => {
                setOriginalImage(null);
                setPreviewUrl(null);
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
        title="Smart Image Resizer"
        description="Resize images to exact dimensions for any platform with our smart resizing tool. Features social media presets for Instagram, YouTube, Facebook, and custom dimensions with aspect ratio locking."
        benefits={["Social media presets", "Custom dimensions", "Aspect ratio control", "Multiple export formats"]}
        howTo={[
          { title: "Upload Image", description: "Upload your image to start resizing" },
          { title: "Choose Preset or Custom", description: "Select a preset or enter custom dimensions" },
          { title: "Download", description: "Download your perfectly sized image" }
        ]}
        faqs={[
          { question: "What are the best image sizes for social media?", answer: "Instagram posts: 1080x1080, Instagram stories: 1080x1920, YouTube thumbnails: 1280x720, Facebook covers: 820x312" },
          { question: "Will resizing reduce image quality?", answer: "Our tool maintains quality during resizing. For best results, avoid upscaling beyond the original dimensions." }
        ]}
      />
    </div>
  );
};
