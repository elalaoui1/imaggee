import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Crop, Lock, Unlock, Frame, Scissors, RotateCw, X, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { UploadZone } from "@/components/UploadZone";
import { ToolDescription } from "@/components/ToolDescription";
import { toast } from "sonner";

/**
 * ResizeToolRefactor
 * - Frame mode: Image fits inside selected frame (full image centered)
 * - Crop mode: Move crop area freely over image + resize from edges/corners
 * - Fixed: Crop now only works on the actual displayed image area
 */

/* ---------------------------
   Constants
   --------------------------- */
const PRESETS = [
  { name: "Instagram Post", ratio: "4:5", width: 1080, height: 1350 },
  { name: "Instagram Story", ratio: "9:16", width: 1080, height: 1920 },
  { name: "YouTube Thumbnail", ratio: "16:9", width: 1280, height: 720 },
  { name: "LinkedIn Banner", ratio: "4:1", width: 1584, height: 396 },
  { name: "Facebook Cover", ratio: "2.7:1", width: 851, height: 315 },
  { name: "Pinterest Pin", ratio: "2:3", width: 1000, height: 1500 },
];

const ASPECT_RATIOS = [
  { name: "Free", value: "free" },
  { name: "1:1 Square", value: "1:1" },
  { name: "4:3", value: "4:3" },
  { name: "16:9", value: "16:9" },
  { name: "9:16", value: "9:16" },
  { name: "3:2", value: "3:2" },
  { name: "2:3", value: "2:3" },
  { name: "4:1", value: "4:1" },
  { name: "4:5", value: "4:5" },
  { name: "2.7:1", value: "2.7:1" },
];

/* ---------------------------
   Types
   --------------------------- */
type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropMode = "frame" | "crop";

type DraggingState = {
  offsetX: number;
  offsetY: number;
};

type ResizingState = {
  pos: string;
  startX: number;
  startY: number;
};

/* ---------------------------
   Component
   --------------------------- */
export const ResizeTool: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageNatural, setImageNatural] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1350);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  const [quality, setQuality] = useState<number>(95);
  const [cropMode, setCropMode] = useState<CropMode>("frame");
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [cropRatio, setCropRatio] = useState<string>("free");
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [resizing, setResizing] = useState<ResizingState | null>(null);

  /* ---------------------------
     Effects
     --------------------------- */
  useEffect(() => {
    if (!originalImage) {
      setOriginalImageUrl(null);
      setPreviewUrl(null);
      setImageNatural({ width: 0, height: 0 });
      return;
    }

    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    const url = URL.createObjectURL(originalImage);
    setOriginalImageUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageNatural({ width: img.width, height: img.height });
      setOriginalAspectRatio(img.width / img.height);
      setWidth(img.width);
      setHeight(img.height);
      
      // Set initial crop area to 50% of image (in percentage for display)
      const percentCrop = {
        x: 25,
        y: 25,
        width: 50,
        height: 50
      };
      setCropArea(percentCrop);
      
      updatePreview(img, img.width, img.height);
      toast.success("Image loaded");
    };
    img.onerror = () => toast.error("Failed to load image");
    img.src = url;

    return () => {
      img.src = "";
    };
  }, [originalImage]);

  /* ---------------------------
     Preview Functions
     --------------------------- */
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

    // Background for transparent images
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    setPreviewUrl(canvas.toDataURL());
  };

  const updatePreviewFromCurrent = () => {
    if (!originalImageUrl) return;
    
    const img = new Image();
    img.onload = () => updatePreview(img, width, height);
    img.src = originalImageUrl;
  };

  const updatePreviewForCrop = () => {
    if (!originalImageUrl) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw cropped area - this is what the user sees
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
      
      // Convert percentage crop to pixel coordinates
      const pixelX = (cropArea.x / 100) * img.width;
      const pixelY = (cropArea.y / 100) * img.height;
      const pixelWidth = (cropArea.width / 100) * img.width;
      const pixelHeight = (cropArea.height / 100) * img.height;
      
      // Draw the cropped portion, scaled to output dimensions
      ctx.drawImage(
        img,
        pixelX, pixelY, pixelWidth, pixelHeight,
        0, 0, width, height
      );

      setPreviewUrl(canvas.toDataURL());
    };
    img.src = originalImageUrl;
  };

  /* ---------------------------
     Handlers
     --------------------------- */
  const handleFilesSelected = useCallback((files: File[]) => {
    if (!files || files.length === 0) return;
    setOriginalImage(files[0]);
  }, []);

  /* ---------------------------
     Crop Functions (Updated)
     --------------------------- */

  // Calculate the displayed image bounds within the container
  const getImageDisplayBounds = (): { x: number; y: number; width: number; height: number } => {
    if (!containerRef.current || !imageRef.current) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = imageRef.current.getBoundingClientRect();
    
    return {
      x: imgRect.left - containerRect.left,
      y: imgRect.top - containerRect.top,
      width: imgRect.width,
      height: imgRect.height,
    };
  };

  // Convert screen coordinates to percentage of the actual image
  const screenToImagePercent = (screenX: number, screenY: number): { xPercent: number; yPercent: number } => {
    const bounds = getImageDisplayBounds();
    if (bounds.width === 0 || bounds.height === 0) {
      return { xPercent: 0, yPercent: 0 };
    }
    
    // Convert screen coordinates to local container coordinates
    if (!containerRef.current) {
      return { xPercent: 0, yPercent: 0 };
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const localX = screenX - containerRect.left;
    const localY = screenY - containerRect.top;
    
    // Convert to image-relative coordinates
    const imageRelativeX = localX - bounds.x;
    const imageRelativeY = localY - bounds.y;
    
    // Convert to percentages of the actual displayed image
    const xPercent = Math.max(0, Math.min(100, (imageRelativeX / bounds.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (imageRelativeY / bounds.height) * 100));
    
    return { xPercent, yPercent };
  };

  const startDragging = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cropMode !== "crop" || !isCropping) return;
    
    const { xPercent, yPercent } = screenToImagePercent(e.clientX, e.clientY);
    
    // Check if click is inside crop area
    const isInsideCrop = 
      xPercent >= cropArea.x && 
      xPercent <= cropArea.x + cropArea.width &&
      yPercent >= cropArea.y && 
      yPercent <= cropArea.y + cropArea.height;
    
    if (isInsideCrop) {
      setDragging({
        offsetX: xPercent - cropArea.x,
        offsetY: yPercent - cropArea.y,
      });
    }
  };

  const startResize = (pos: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cropMode !== "crop" || !isCropping) return;
    
    setResizing({ 
      pos, 
      startX: e.clientX, 
      startY: e.clientY 
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (cropMode !== "crop" || !isCropping) return;
    
    if (dragging) {
      const { xPercent, yPercent } = screenToImagePercent(e.clientX, e.clientY);
      
      // Calculate new position based on the offset
      let newX = xPercent - dragging.offsetX;
      let newY = yPercent - dragging.offsetY;
      
      // Constrain inside image bounds (in percentage)
      const maxX = 100 - cropArea.width;
      const maxY = 100 - cropArea.height;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setCropArea(c => ({ ...c, x: newX, y: newY }));
      updatePreviewForCrop();
    }

    if (resizing) {
      resizeCrop(e);
    }
  };

  const resizeCrop = (e: React.MouseEvent) => {
    if (!resizing) return;
    
    const { xPercent, yPercent } = screenToImagePercent(e.clientX, e.clientY);
    const { xPercent: startXPercent, yPercent: startYPercent } = screenToImagePercent(resizing.startX, resizing.startY);
    
    const dxPercent = xPercent - startXPercent;
    const dyPercent = yPercent - startYPercent;

    // Use percentages for all calculations
    let { x, y, width: w, height: h } = cropArea;

    const resizeOps: Record<string, () => void> = {
      right: () => {
        w = w + dxPercent;
      },
      left: () => {
        w = w - dxPercent;
        x = x + dxPercent;
      },
      bottom: () => {
        h = h + dyPercent;
      },
      top: () => {
        h = h - dyPercent;
        y = y + dyPercent;
      },
      topLeft: () => {
        w = w - dxPercent;
        x = x + dxPercent;
        h = h - dyPercent;
        y = y + dyPercent;
      },
      topRight: () => {
        w = w + dxPercent;
        h = h - dyPercent;
        y = y + dyPercent;
      },
      bottomLeft: () => {
        w = w - dxPercent;
        x = x + dxPercent;
        h = h + dyPercent;
      },
      bottomRight: () => {
        w = w + dxPercent;
        h = h + dyPercent;
      },
    };

    if (resizeOps[resizing.pos]) {
      resizeOps[resizing.pos]();
    }

    // Aspect ratio lock
    if (cropRatio !== "free") {
      const [rw, rh] = cropRatio.includes(".") 
        ? cropRatio.split(".").map(Number) 
        : cropRatio.split(":").map(Number);
      
      if (rw && rh) {
        const targetRatio = rw / rh;
        
        // Maintain aspect ratio
        if (Math.abs(dxPercent) > Math.abs(dyPercent) || resizing.pos === "left" || resizing.pos === "right") {
          // Width changed more or horizontal resizing, adjust height
          h = w / targetRatio;
          // Adjust y position for top handles
          if (resizing.pos.includes("top")) {
            const heightDiff = cropArea.height - h;
            y = y + heightDiff;
          }
        } else {
          // Height changed more or vertical resizing, adjust width
          w = h * targetRatio;
          // Adjust x position for left handles
          if (resizing.pos.includes("left")) {
            const widthDiff = cropArea.width - w;
            x = x + widthDiff;
          }
        }
      }
    }

    // Boundaries (in percentage)
    const minSizePercent = Math.min(
      (50 / imageNatural.width) * 100, // At least 50 pixels in original image
      (50 / imageNatural.height) * 100
    );
    
    const maxWidth = 100 - x;
    const maxHeight = 100 - y;
    
    w = Math.max(minSizePercent, Math.min(w, maxWidth));
    h = Math.max(minSizePercent, Math.min(h, maxHeight));
    x = Math.max(0, Math.min(x, 100 - w));
    y = Math.max(0, Math.min(y, 100 - h));

    setCropArea({ x, y, width: w, height: h });
    updatePreviewForCrop();
    
    // Update resizing state with new screen coordinates
    setResizing({
      ...resizing,
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current || !isCropping) return;
    
    const { xPercent, yPercent } = screenToImagePercent(e.clientX, e.clientY);
    
    // Create new crop area centered on click
    const newCrop = {
      x: xPercent - 20,
      y: yPercent - 20,
      width: 40,
      height: 40
    };
    
    // Apply aspect ratio if needed
    if (cropRatio !== "free") {
      const [rw, rh] = cropRatio.includes(".") 
        ? cropRatio.split(".").map(Number) 
        : cropRatio.split(":").map(Number);
      
      if (rw && rh) {
        const targetRatio = rw / rh;
        if (targetRatio > 1) {
          newCrop.height = newCrop.width / targetRatio;
        } else {
          newCrop.width = newCrop.height * targetRatio;
        }
      }
    }
    
    // Constrain bounds
    newCrop.x = Math.max(0, Math.min(newCrop.x, 100 - newCrop.width));
    newCrop.y = Math.max(0, Math.min(newCrop.y, 100 - newCrop.height));
    
    setCropArea(newCrop);
    updatePreviewForCrop();
  };

  const stopAction = () => {
    setDragging(null);
    setResizing(null);
  };

  /* ---------------------------
     Actions
     --------------------------- */
  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setActivePreset(preset.name);
    setCropMode("frame");
    setIsCropping(false);
    
    if (originalImageUrl) {
      const img = new Image();
      img.onload = () => updatePreview(img, preset.width, preset.height);
      img.src = originalImageUrl;
    }
    
    toast.success(`Applied ${preset.name} preset: ${preset.width}×${preset.height}`);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    setActivePreset(null);
    
    if (maintainAspectRatio) {
      const newHeight = Math.round(newWidth / originalAspectRatio);
      setHeight(newHeight);
    }

    if (originalImageUrl) {
      const img = new Image();
      img.onload = () => {
        const h = maintainAspectRatio ? Math.round(newWidth / originalAspectRatio) : height;
        updatePreview(img, newWidth, h);
      };
      img.src = originalImageUrl;
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    setActivePreset(null);
    
    if (maintainAspectRatio) {
      const newWidth = Math.round(newHeight * originalAspectRatio);
      setWidth(newWidth);
    }

    if (originalImageUrl) {
      const img = new Image();
      img.onload = () => {
        const w = maintainAspectRatio ? Math.round(newHeight * originalAspectRatio) : width;
        updatePreview(img, w, newHeight);
      };
      img.src = originalImageUrl;
    }
  };

  const startCrop = () => {
    if (!originalImage) return;
    setIsCropping(true);
    setCropMode("crop");
    setActivePreset(null);
    
    // Set initial crop area to 50% centered
    const initialCrop = {
      x: 25,
      y: 25,
      width: 50,
      height: 50
    };
    setCropArea(initialCrop);
    updatePreviewForCrop();
    toast.info("Drag crop area to move. Drag handles to resize.");
  };

  const applyCrop = () => {
    setIsCropping(false);
    updatePreviewForCrop();
    toast.success("Crop applied.");
  };

  const cancelCrop = () => {
    setIsCropping(false);
    // Reset to full image
    const fullCrop = {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    };
    setCropArea(fullCrop);
    updatePreviewFromCurrent();
    toast.info("Crop canceled.");
  };

  const resetCrop = () => {
    // Reset to 50% centered
    const centerCrop = {
      x: 25,
      y: 25,
      width: 50,
      height: 50
    };
    setCropArea(centerCrop);
    updatePreviewForCrop();
    toast.info("Crop reset to center.");
  };

  const resetAll = () => {
    setOriginalImage(null);
    setActivePreset(null);
    setIsCropping(false);
    setCropMode("frame");
    setWidth(1080);
    setHeight(1350);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
      setOriginalImageUrl(null);
    }
    setPreviewUrl(null);
    setDragging(null);
    setResizing(null);
    toast.success("Reset complete. Ready for new image.");
  };

  const fitToImage = () => {
    if (!imageNatural.width || !imageNatural.height) return;
    setWidth(imageNatural.width);
    setHeight(imageNatural.height);
    setActivePreset(null);
    updatePreviewFromCurrent();
    toast.success("Fit to original image size");
  };

  const exportImage = async () => {
    if (!originalImage || !originalImageUrl) return;

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) {
      toast.error("Failed to get canvas context");
      return;
    }

    try {
      const img = new Image();
      img.onload = () => {
        if (cropMode === "frame") {
          // Frame mode: centered image with letterbox
          const scale = Math.min(width / img.width, height / img.height);
          const x = (width - img.width * scale) / 2;
          const y = (height - img.height * scale) / 2;

          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } else {
          // Crop mode: EXACTLY match what's shown in preview
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, width, height);
          
          // Get the EXACT crop coordinates in pixels
          const pixelX = (cropArea.x / 100) * img.width;
          const pixelY = (cropArea.y / 100) * img.height;
          const pixelWidth = (cropArea.width / 100) * img.width;
          const pixelHeight = (cropArea.height / 100) * img.height;
          
          // Draw EXACTLY what's in the preview
          ctx.drawImage(
            img,
            pixelX, pixelY, pixelWidth, pixelHeight,  // Source: cropped area from original
            0, 0, width, height                       // Destination: output canvas
          );
        }

        // Export
        outputCanvas.toBlob(
          (blob) => {
            if (!blob) {
              toast.error("Failed to create exported image");
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${cropMode === "crop" ? "cropped" : "framed"}-${width}x${height}-${Date.now()}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Image exported successfully!");
          },
          "image/jpeg",
          Math.max(0.01, Math.min(1, quality / 100))
        );
      };
      img.src = originalImageUrl;
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export image");
    }
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
  className="text-center space-y-4 pt-4 md:pt-6"
>
  <div className="flex flex-col md:flex-row items-center justify-center gap-3">
    <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
      Smart Resize & Crop
    </h1>
  </div>
   <div>
            <p className="text-muted-foreground">
              {cropMode === "frame" 
                ? "Resize your images to perfect dimensions for any platform" 
                : "Crop mode: Select and adjust the crop area"}
            </p>
          </div>
</motion.div>

        <div className="flex items-center justify-end mb-4">

          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Reset All
          </Button>
        </div>

        {!originalImage ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-6">
            {/* Preview Area */}
            {previewUrl && (
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Preview ({width} × {height})</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant={cropMode === "frame" ? "default" : "ghost"}
                      onClick={() => {
                        setCropMode("frame");
                        setIsCropping(false);
                        setDragging(null);
                        setResizing(null);
                        updatePreviewFromCurrent();
                      }}
                    >
                      <Frame className="w-4 h-4 mr-2" /> Frame
                    </Button>
                    <Button 
                      size="sm" 
                      variant={cropMode === "crop" ? "default" : "ghost"}
                      onClick={startCrop}
                    >
                      <Crop className="w-4 h-4 mr-2" /> Crop
                    </Button>
                  </div>
                </div>
                
                <div className="relative bg-muted/20 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                  {/* Original Image for cropping reference */}
                  {cropMode === "crop" && isCropping && originalImageUrl && (
                    <img 
                      ref={imageRef}
                      src={originalImageUrl} 
                      alt="Original" 
                      className="max-w-full max-h-[500px] mx-auto object-contain"
                      style={{ display: 'block' }}
                    />
                  )}
                  
                  {/* Preview Image (for frame mode or after crop) */}
                  {(!isCropping || cropMode === "frame") && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full max-h-[500px] mx-auto object-contain"
                    />
                  )}
                  
                  {/* Crop Overlay */}
                  {cropMode === "crop" && isCropping && (
                    <div
                      ref={containerRef}
                      className="absolute inset-0"
                      onMouseDown={handleOverlayClick}
                      onMouseMove={onMouseMove}
                      onMouseUp={stopAction}
                      onMouseLeave={stopAction}
                      style={{ cursor: "default" }}
                    >
                      {/* Dimmed overlay outside crop area - only on actual image area */}
                      {(() => {
                        const bounds = getImageDisplayBounds();
                        if (bounds.width === 0 || bounds.height === 0) return null;
                        
                        const screenCrop = {
                          x: bounds.x + (cropArea.x / 100) * bounds.width,
                          y: bounds.y + (cropArea.y / 100) * bounds.height,
                          width: (cropArea.width / 100) * bounds.width,
                          height: (cropArea.height / 100) * bounds.height,
                        };
                        
                        return (
                          <>
                            {/* Top dimmed area */}
                            <div 
                              className="absolute bg-black/60"
                              style={{
                                left: bounds.x,
                                top: bounds.y,
                                width: bounds.width,
                                height: Math.max(0, screenCrop.y - bounds.y),
                              }}
                            />
                            
                            {/* Bottom dimmed area */}
                            <div 
                              className="absolute bg-black/60"
                              style={{
                                left: bounds.x,
                                top: screenCrop.y + screenCrop.height,
                                width: bounds.width,
                                height: Math.max(0, bounds.y + bounds.height - (screenCrop.y + screenCrop.height)),
                              }}
                            />
                            
                            {/* Left dimmed area */}
                            <div 
                              className="absolute bg-black/60"
                              style={{
                                left: bounds.x,
                                top: screenCrop.y,
                                width: Math.max(0, screenCrop.x - bounds.x),
                                height: screenCrop.height,
                              }}
                            />
                            
                            {/* Right dimmed area */}
                            <div 
                              className="absolute bg-black/60"
                              style={{
                                left: screenCrop.x + screenCrop.width,
                                top: screenCrop.y,
                                width: Math.max(0, bounds.x + bounds.width - (screenCrop.x + screenCrop.width)),
                                height: screenCrop.height,
                              }}
                            />
                          </>
                        );
                      })()}
                      
                      {/* Crop area */}
                      {(() => {
                        const bounds = getImageDisplayBounds();
                        if (bounds.width === 0 || bounds.height === 0) return null;
                        
                        const screenCrop = {
                          left: bounds.x + (cropArea.x / 100) * bounds.width,
                          top: bounds.y + (cropArea.y / 100) * bounds.height,
                          width: (cropArea.width / 100) * bounds.width,
                          height: (cropArea.height / 100) * bounds.height,
                        };
                        
                        return (
                          <div
                            className="absolute border-2 border-emerald-400 bg-emerald-400/10"
                            style={{
                              left: `${screenCrop.left}px`,
                              top: `${screenCrop.top}px`,
                              width: `${screenCrop.width}px`,
                              height: `${screenCrop.height}px`,
                            }}
                            onMouseDown={startDragging}
                          >
                            {/* Corner handles */}
                            {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((pos) => {
                              const style: React.CSSProperties = {
                                position: "absolute",
                                width: 16,
                                height: 16,
                                background: "#10b981",
                                border: "2px solid white",
                                borderRadius: "50%",
                                cursor: `${pos.includes("Left") ? "nwse" : "nesw"}-resize`,
                              };
                              
                              if (pos === "topLeft") {
                                style.left = -8;
                                style.top = -8;
                              } else if (pos === "topRight") {
                                style.right = -8;
                                style.top = -8;
                              } else if (pos === "bottomLeft") {
                                style.left = -8;
                                style.bottom = -8;
                              } else {
                                style.right = -8;
                                style.bottom = -8;
                              }
                              
                              return (
                                <div
                                  key={pos}
                                  style={style}
                                  onMouseDown={startResize(pos)}
                                />
                              );
                            })}
                            
                            {/* Edge handles */}
                            {[
                              { pos: "top", style: { left: "50%", top: -6, transform: "translateX(-50%)", width: 40, height: 12 } },
                              { pos: "bottom", style: { left: "50%", bottom: -6, transform: "translateX(-50%)", width: 40, height: 12 } },
                              { pos: "left", style: { top: "50%", left: -6, transform: "translateY(-50%)", width: 12, height: 40 } },
                              { pos: "right", style: { top: "50%", right: -6, transform: "translateY(-50%)", width: 12, height: 40 } },
                            ].map(({ pos, style }) => (
                              <div
                                key={pos}
                                style={{
                                  position: "absolute",
                                  background: "rgba(16, 185, 129, 0.8)",
                                  border: "1px solid white",
                                  borderRadius: 3,
                                  cursor: pos === "top" || pos === "bottom" ? "ns-resize" : "ew-resize",
                                  ...style,
                                }}
                                onMouseDown={startResize(pos)}
                              />
                            ))}
                            
                            {/* Move area indicator */}
                            <div className="absolute inset-0 cursor-move" />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                
                {cropMode === "frame" && activePreset && (
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    Using {activePreset} preset. Image will be centered with no cropping.
                  </div>
                )}
                
                {cropMode === "crop" && isCropping && (
                  <div className="mt-3 flex justify-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={resetCrop}
                      className="text-xs"
                    >
                      <RotateCw className="w-3 h-3 mr-1" /> Reset Crop
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        const centerCrop = {
                          x: 25,
                          y: 25,
                          width: 50,
                          height: 50
                        };
                        setCropArea(centerCrop);
                        updatePreviewForCrop();
                      }}
                      className="text-xs"
                    >
                      Center Crop
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Controls Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-xl p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Crop className="w-4 h-4" />
                  Preset Sizes
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant={activePreset === preset.name ? "default" : "outline"}
                      onClick={() => handlePresetClick(preset)}
                      className="h-auto py-3 text-xs justify-start"
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
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fitToImage}
                      title="Fit to original image"
                    >
                      Fit to Image
                    </Button>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (px)</label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      min={1}
                      max={8192}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height (px)</label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      min={1}
                      max={8192}
                    />
                  </div>
                </div>

                <div>
                  <Label>Quality: {quality}%</Label>
                  <Slider value={[quality]} onValueChange={([v]) => setQuality(v)} min={10} max={100} />
                </div>

                {cropMode === "crop" && (
                  <div>
                    <Label>Crop Aspect Ratio</Label>
                    <select 
                      value={cropRatio} 
                      onChange={(e) => {
                        setCropRatio(e.target.value);
                        if (e.target.value !== "free") {
                          const [rw, rh] = e.target.value.includes(".") 
                            ? e.target.value.split(".").map(Number) 
                            : e.target.value.split(":").map(Number);
                          
                          if (rw && rh) {
                            const targetRatio = rw / rh;
                            let newCrop = { ...cropArea };
                            const currentRatio = newCrop.width / newCrop.height;
                            
                            if (Math.abs(currentRatio - targetRatio) > 0.01) {
                              if (targetRatio > currentRatio) {
                                // Need wider crop
                                newCrop.width = newCrop.height * targetRatio;
                                if (newCrop.x + newCrop.width > 100) {
                                  newCrop.x = 100 - newCrop.width;
                                }
                              } else {
                                // Need taller crop
                                newCrop.height = newCrop.width / targetRatio;
                                if (newCrop.y + newCrop.height > 100) {
                                  newCrop.y = 100 - newCrop.height;
                                }
                              }
                              setCropArea(newCrop);
                              updatePreviewForCrop();
                            }
                          }
                        }
                      }} 
                      className="w-full p-2 rounded-md border bg-background"
                    >
                      {ASPECT_RATIOS.map((r) => 
                        <option key={r.value} value={r.value}>{r.name}</option>
                      )}
                    </select>
                  </div>
                )}

                {cropMode === "crop" && (
                  <div className="flex gap-2">
                    {!isCropping ? (
                      <Button onClick={startCrop} variant="default" className="flex-1">
                        <Scissors className="w-4 h-4 mr-2" /> Start Cropping
                      </Button>
                    ) : (
                      <>
                        <Button onClick={applyCrop} variant="default" className="flex-1">Apply Crop</Button>
                        <Button onClick={cancelCrop} variant="outline">
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      </>
                    )}
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-2">
                  <Button onClick={exportImage} variant="gradient" size="lg" className="w-full">
                    <Download className="w-4 h-4 mr-2" /> 
                    Download {cropMode === "crop" ? "Cropped" : "Resized"} Image
                  </Button>
                  
                  <Button 
                    onClick={resetAll}
                    variant="outline" 
                    className="w-full"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Reset & Process New Image
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <ToolDescription
        title="Smart Image Resizer & Cropper"
        description={
          cropMode === "frame" 
            ? "FRAME MODE: Select a social media preset to see how your image fits. The entire image will be visible within the frame, centered with no cropping."
            : "CROP MODE: Drag crop area to move. Drag handles to resize. Click outside to create new crop area."
        }
        benefits={[
          "Frame Mode: See how your image fits social media formats",
          "Crop Mode: Drag anywhere inside to move, drag handles to resize",
          "Simple circle handles for easy grabbing",
          "Aspect ratio locking for perfect crops",
          "High-quality exports",
          "One-click social media presets",
        ]}
        howTo={[
          { title: "Upload", description: "Upload your image." },
          { title: "Frame Mode", description: "Select a preset to see how your image fits." },
          { title: "Crop Mode", description: "Start cropping - drag to move, drag handles to resize." },
          { title: "Export", description: "Set dimensions and download your image." },
        ]}
        faqs={[
          { 
            question: "How do I move the crop area?", 
            answer: "Click and drag anywhere inside the crop area to move it around the image." 
          },
          { 
            question: "How do I resize the crop area?", 
            answer: "Drag the circle corner handles or edge rectangles to resize." 
          },
          { 
            question: "Will my image be cropped in Frame mode?", 
            answer: "No. Frame mode only shows how your full image fits within the frame. The entire image will be visible in the output." 
          },
        ]}
      />
    </div>
  );
};

export default ResizeTool;