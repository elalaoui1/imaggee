import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { UploadZone } from "@/components/UploadZone";
import { Download, Loader2, Palette, Droplet } from "lucide-react";
import { toast } from "sonner";
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);
  return { width, height };
}

const removeBackground = async (imageElement: HTMLImageElement, onProgress?: (progress: number) => void): Promise<Blob> => {
  try {
    onProgress?.(10);
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    onProgress?.(30);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    resizeImageIfNeeded(canvas, ctx, imageElement);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    onProgress?.(50);
    const result = await segmenter(imageData);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    onProgress?.(70);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    outputCtx.drawImage(canvas, 0, 0);
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    onProgress?.(90);
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            onProgress?.(100);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

type BackgroundType = 'transparent' | 'solid' | 'gradient';

export const BackgroundRemoverTool = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('transparent');
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [gradientColor1, setGradientColor1] = useState('#667eea');
  const [gradientColor2, setGradientColor2] = useState('#764ba2');

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setOriginalImage(file);
    setProcessedBlob(null);
    setPreviewUrl(null);
    
    // Auto-process the image
    setIsProcessing(true);
    setProgress(0);

    try {
      const img = await loadImage(file);
      const blob = await removeBackground(img, setProgress);
      setProcessedBlob(blob);
      
      // Create preview with transparent background
      const previewCanvas = document.createElement('canvas');
      const ctx = previewCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const processedImg = await loadImage(blob);
      previewCanvas.width = processedImg.width;
      previewCanvas.height = processedImg.height;

      // Draw image with transparency
      ctx.drawImage(processedImg, 0, 0);

      const previewDataUrl = previewCanvas.toDataURL('image/png');
      setPreviewUrl(previewDataUrl);

      toast.success("Background removed successfully!");
    } catch (error) {
      console.error('Processing error:', error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const img = await loadImage(originalImage);
      const blob = await removeBackground(img, setProgress);
      setProcessedBlob(blob);
      
      // Create preview with selected background
      const previewCanvas = document.createElement('canvas');
      const ctx = previewCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const processedImg = await loadImage(blob);
      previewCanvas.width = processedImg.width;
      previewCanvas.height = processedImg.height;

      // Draw background
      if (backgroundType === 'solid') {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      } else if (backgroundType === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, previewCanvas.width, previewCanvas.height);
        gradient.addColorStop(0, gradientColor1);
        gradient.addColorStop(1, gradientColor2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
      }

      // Draw image with transparency
      ctx.drawImage(processedImg, 0, 0);

      const previewDataUrl = previewCanvas.toDataURL('image/png');
      setPreviewUrl(previewDataUrl);

      toast.success("Background removed successfully!");
    } catch (error) {
      console.error('Processing error:', error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePreview = async () => {
    if (!processedBlob) return;

    const previewCanvas = document.createElement('canvas');
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;

    const processedImg = await loadImage(processedBlob);
    previewCanvas.width = processedImg.width;
    previewCanvas.height = processedImg.height;

    if (backgroundType === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    } else if (backgroundType === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, previewCanvas.width, previewCanvas.height);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    ctx.drawImage(processedImg, 0, 0);
    const previewDataUrl = previewCanvas.toDataURL('image/png');
    setPreviewUrl(previewDataUrl);
  };

  const handleDownload = async () => {
    if (!processedBlob || !previewUrl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = await loadImage(processedBlob);
    canvas.width = img.width;
    canvas.height = img.height;

    if (backgroundType === 'solid') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (backgroundType === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `background-removed-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Image downloaded!");
      }
    }, 'image/png');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold mb-4 gradient-text">Remove Background</h2>
        <p className="text-muted-foreground mb-6">
          AI-powered background removal with custom background options
        </p>

        {!originalImage ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-2">Original</h3>
                <img
                  src={URL.createObjectURL(originalImage)}
                  alt="Original"
                  className="max-w-full max-h-[400px] mx-auto rounded-lg object-contain"
                />
              </div>

              {previewUrl && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-2">Preview</h3>
                  <img src={previewUrl} alt="Processed" className="max-w-full max-h-[400px] mx-auto rounded-lg object-contain" />
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}


            {processedBlob && (
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Background Options
                  </h3>

                  <div className="flex gap-2">
                    <Button
                      variant={backgroundType === 'transparent' ? 'gradient' : 'outline'}
                      onClick={() => {
                        setBackgroundType('transparent');
                        updatePreview();
                      }}
                    >
                      Transparent
                    </Button>
                    <Button
                      variant={backgroundType === 'solid' ? 'gradient' : 'outline'}
                      onClick={() => {
                        setBackgroundType('solid');
                        updatePreview();
                      }}
                    >
                      Solid Color
                    </Button>
                    <Button
                      variant={backgroundType === 'gradient' ? 'gradient' : 'outline'}
                      onClick={() => {
                        setBackgroundType('gradient');
                        updatePreview();
                      }}
                    >
                      Gradient
                    </Button>
                  </div>

                  {backgroundType === 'solid' && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">Color:</label>
                      <input
                        type="color"
                        value={solidColor}
                        onChange={(e) => {
                          setSolidColor(e.target.value);
                          updatePreview();
                        }}
                        className="h-10 w-20 rounded cursor-pointer"
                      />
                    </div>
                  )}

                  {backgroundType === 'gradient' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Color 1:</label>
                        <input
                          type="color"
                          value={gradientColor1}
                          onChange={(e) => {
                            setGradientColor1(e.target.value);
                            updatePreview();
                          }}
                          className="h-10 w-20 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Color 2:</label>
                        <input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => {
                            setGradientColor2(e.target.value);
                            updatePreview();
                          }}
                          className="h-10 w-20 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleDownload}
                  className="w-full"
                  variant="gradient"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>

                <Button
                  onClick={() => {
                    setOriginalImage(null);
                    setProcessedBlob(null);
                    setPreviewUrl(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Process Another Image
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
