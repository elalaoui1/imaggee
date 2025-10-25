import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UploadZone } from "@/components/UploadZone";
import { Download, Palette, Sparkles, Image as ImageIcon, Scissors } from "lucide-react";
import { toast } from "sonner";
import { pipeline, env } from '@huggingface/transformers';
import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";

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
type RemovalMode = 'background' | 'object';

export const BackgroundRemoverTool = () => {
  const [mode, setMode] = useState<RemovalMode | null>(null);
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('transparent');
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [gradientColor1, setGradientColor1] = useState('#667eea');
  const [gradientColor2, setGradientColor2] = useState('#764ba2');
  
  // MediaPipe object removal states
  const [modelLoading, setModelLoading] = useState(false);
  const [confidence, setConfidence] = useState(50);
  const [edgeSmoothing, setEdgeSmoothing] = useState(true);
  const [feather, setFeather] = useState(2);
  
  const imageSegmenterRef = useRef<ImageSegmenter | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize MediaPipe for object removal
  useEffect(() => {
    if (mode !== 'object') return;
    
    const initializeSegmenter = async () => {
      try {
        console.log("Initializing MediaPipe ImageSegmenter...");
        setModelLoading(true);

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });

        imageSegmenterRef.current = segmenter;
        console.log("MediaPipe ImageSegmenter initialized successfully");
        setModelLoading(false);
        toast.success("AI model loaded successfully!");
      } catch (error) {
        console.error("Error initializing ImageSegmenter:", error);
        toast.error("Failed to load AI model. Please try again.");
        setModelLoading(false);
      }
    };

    initializeSegmenter();

    return () => {
      if (imageSegmenterRef.current) {
        imageSegmenterRef.current.close();
      }
    };
  }, [mode]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    setOriginalImage(file);
    setProcessedBlob(null);
    setPreviewUrl(null);
    
    // Auto-process only if in background removal mode
    if (mode === 'background') {
      setIsProcessing(true);
      setProgress(0);

      try {
        const img = await loadImage(file);
        const blob = await removeBackground(img, setProgress);
        setProcessedBlob(blob);
        
        const previewCanvas = document.createElement('canvas');
        const ctx = previewCanvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        const processedImg = await loadImage(blob);
        previewCanvas.width = processedImg.width;
        previewCanvas.height = processedImg.height;
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
    }
  };

  // Process with MediaPipe for object removal
  const processImageMediaPipe = useCallback(async () => {
    if (!originalImage || !imageSegmenterRef.current || !processedCanvasRef.current) {
      toast.error("Missing required resources");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(originalImage);
      });

      setProgress(30);
      const segmentationResult = imageSegmenterRef.current.segment(img);

      if (!segmentationResult.categoryMask) {
        throw new Error("No segmentation mask returned");
      }

      setProgress(60);
      const mask = segmentationResult.categoryMask;
      const maskData = mask.getAsUint8Array();

      const canvas = processedCanvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) throw new Error("Failed to get canvas context");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixels = imageData.data;

      const confidenceThreshold = confidence / 100;

      for (let i = 0; i < maskData.length; i++) {
        const pixelIndex = i * 4;
        if (maskData[i] === 0) {
          pixels[pixelIndex + 3] = 0;
        } else {
          const alpha = pixels[pixelIndex + 3];
          pixels[pixelIndex + 3] = Math.round(alpha * (confidenceThreshold + (1 - confidenceThreshold)));
        }
      }

      ctx.putImageData(imageData, 0, 0);

      if (edgeSmoothing && feather > 0) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          tempCtx.filter = `blur(${feather}px)`;
          tempCtx.drawImage(canvas, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0);
        }
      }

      setProgress(90);
      canvas.toBlob((blob) => {
        if (blob) {
          setProcessedBlob(blob);
          setPreviewUrl(canvas.toDataURL("image/png"));
          setProgress(100);
          toast.success("Object removed successfully!");
        }
      }, "image/png");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, confidence, edgeSmoothing, feather]);

  const processImage = async () => {
    if (mode === 'object') {
      await processImageMediaPipe();
    } else {
      // Background removal mode
      if (!originalImage) return;

      setIsProcessing(true);
      setProgress(0);

      try {
        const img = await loadImage(originalImage);
        const blob = await removeBackground(img, setProgress);
        setProcessedBlob(blob);
        
        const previewCanvas = document.createElement('canvas');
        const ctx = previewCanvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        const processedImg = await loadImage(blob);
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

        toast.success("Background removed successfully!");
      } catch (error) {
        console.error('Processing error:', error);
        toast.error("Failed to remove background. Please try again.");
      } finally {
        setIsProcessing(false);
      }
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
    <div className="space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 md:p-6"
      >
        <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 gradient-text">Remove Background</h2>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
          AI-powered background and object removal
        </p>

        {!mode ? (
          <div className="space-y-4">
            <p className="text-sm md:text-base text-center mb-4">Choose what you want to remove:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Button
                onClick={() => setMode('background')}
                variant="outline"
                size="lg"
                className="h-auto py-6 md:py-8 flex flex-col gap-2 hover:border-primary transition-all"
              >
                <ImageIcon className="w-8 h-8 md:w-12 md:h-12" />
                <div>
                  <div className="font-bold text-base md:text-lg">Remove Background</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Keep subject, remove background</div>
                </div>
              </Button>
              <Button
                onClick={() => setMode('object')}
                variant="outline"
                size="lg"
                className="h-auto py-6 md:py-8 flex flex-col gap-2 hover:border-primary transition-all"
              >
                <Scissors className="w-8 h-8 md:w-12 md:h-12" />
                <div>
                  <div className="font-bold text-base md:text-lg">Remove Object</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Remove person/object from photo</div>
                </div>
              </Button>
            </div>
          </div>
        ) : !originalImage ? (
          <div className="space-y-4">
            {modelLoading && (
              <div className="glass rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <Sparkles size={16} className="animate-pulse" />
                <span className="text-sm md:text-base">Loading AI model...</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMode(null);
                  setOriginalImage(null);
                  setProcessedBlob(null);
                  setPreviewUrl(null);
                }}
              >
                ← Change Mode
              </Button>
              <div className="text-xs md:text-sm text-muted-foreground">
                Mode: {mode === 'background' ? 'Remove Background' : 'Remove Object'}
              </div>
            </div>
            <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMode(null);
                setOriginalImage(null);
                setProcessedBlob(null);
                setPreviewUrl(null);
              }}
              className="mb-2"
            >
              ← Change Mode
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
              <div className="glass rounded-xl p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-semibold mb-2">Original</h3>
                <div className="w-full aspect-video md:aspect-auto md:max-h-[300px] lg:max-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(originalImage)}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="glass rounded-xl p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-semibold mb-2">Preview</h3>
                <div className="w-full aspect-video md:aspect-auto md:max-h-[300px] lg:max-h-[400px] flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
                  {!previewUrl ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="w-8 h-8 md:w-12 md:h-12" />
                      <p className="text-xs md:text-sm text-center px-4">
                        {mode === 'background' ? 'Processing...' : 'Click process to remove object'}
                      </p>
                    </div>
                  ) : (
                    <img src={previewUrl} alt="Processed" className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
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

            {mode === 'object' && !isProcessing && !processedBlob && (
              <div className="glass rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Settings
                </h3>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="confidence" className="text-xs md:text-sm">
                      Confidence ({confidence}%)
                    </Label>
                    <Slider
                      id="confidence"
                      value={[confidence]}
                      onValueChange={(v) => setConfidence(v[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Higher values preserve more details</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="edge-smoothing" className="text-xs md:text-sm">Edge Smoothing</Label>
                    <Switch
                      id="edge-smoothing"
                      checked={edgeSmoothing}
                      onCheckedChange={setEdgeSmoothing}
                    />
                  </div>

                  {edgeSmoothing && (
                    <div className="space-y-2">
                      <Label htmlFor="feather" className="text-xs md:text-sm">
                        Feather ({feather}px)
                      </Label>
                      <Slider
                        id="feather"
                        value={[feather]}
                        onValueChange={(v) => setFeather(v[0])}
                        max={10}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Softens edges for natural blend</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={processImage}
                  disabled={isProcessing || modelLoading}
                  className="w-full"
                  variant="gradient"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Remove Object
                </Button>
              </div>
            )}

            {mode === 'background' && processedBlob && (
              <div className="space-y-3 md:space-y-4">
                <div className="glass rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
                  <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Background Options
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={backgroundType === 'transparent' ? 'gradient' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setBackgroundType('transparent');
                        updatePreview();
                      }}
                      className="flex-1 min-w-[100px]"
                    >
                      Transparent
                    </Button>
                    <Button
                      variant={backgroundType === 'solid' ? 'gradient' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setBackgroundType('solid');
                        updatePreview();
                      }}
                      className="flex-1 min-w-[100px]"
                    >
                      Solid
                    </Button>
                    <Button
                      variant={backgroundType === 'gradient' ? 'gradient' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setBackgroundType('gradient');
                        updatePreview();
                      }}
                      className="flex-1 min-w-[100px]"
                    >
                      Gradient
                    </Button>
                  </div>

                  {backgroundType === 'solid' && (
                    <div className="flex items-center gap-3 md:gap-4">
                      <label className="text-xs md:text-sm font-medium">Color:</label>
                      <input
                        type="color"
                        value={solidColor}
                        onChange={(e) => {
                          setSolidColor(e.target.value);
                          updatePreview();
                        }}
                        className="h-8 md:h-10 w-16 md:w-20 rounded cursor-pointer"
                      />
                    </div>
                  )}

                  {backgroundType === 'gradient' && (
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center gap-3 md:gap-4">
                        <label className="text-xs md:text-sm font-medium">Color 1:</label>
                        <input
                          type="color"
                          value={gradientColor1}
                          onChange={(e) => {
                            setGradientColor1(e.target.value);
                            updatePreview();
                          }}
                          className="h-8 md:h-10 w-16 md:w-20 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <label className="text-xs md:text-sm font-medium">Color 2:</label>
                        <input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => {
                            setGradientColor2(e.target.value);
                            updatePreview();
                          }}
                          className="h-8 md:h-10 w-16 md:w-20 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {processedBlob && (
              <div className="space-y-2 md:space-y-3">
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
      <canvas ref={processedCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};
