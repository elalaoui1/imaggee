import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas as FabricCanvas, Circle, Image as FabricImage, Text as FabricText, Rect } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Eraser, Download, RotateCcw, Smile, Eye, EyeOff, Zap, Upload, Image as ImageIcon } from "lucide-react";
import { ToolDescription } from "./ToolDescription";

// Organized emoji categories for better UX
const EMOJI_CATEGORIES = {
  "Faces & Emotions": ["😀", "😍", "😎", "🥳", "😂", "🤣", "😊", "😇", "🤩", "😋", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "😐", "😑", "😶", "🙄", "😏", "😬", "😮", "😯", "😴", "😪", "😵", "🤯", "🥴"],
  "Hearts & Symbols": ["❤️", "💕", "💖", "💗", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💝", "💘", "⭐", "✨", "💫", "🌟", "🔥", "💥", "⚡", "💯", "✅", "❌", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉"],
  "Hands & Gestures": ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪"],
  "Special & Fun": ["🧐", "🤓", "😎", "🥳", "🤑", "🤠", "🥸", "🤡", "👻", "💀", "👽", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"]
};

// Flatten emoji list for the main display
const ALL_EMOJIS = [
  ...EMOJI_CATEGORIES["Faces & Emotions"],
  ...EMOJI_CATEGORIES["Hearts & Symbols"],
  ...EMOJI_CATEGORIES["Hands & Gestures"],
  ...EMOJI_CATEGORIES["Special & Fun"]
];

export const BlurEmojiTool = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<"blur" | "emoji">("blur");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(30);
  const [blurIntensity, setBlurIntensity] = useState(15);
  const [blurOpacity, setBlurOpacity] = useState(100);
  const [hideCompletely, setHideCompletely] = useState(true);
  const [selectedEmoji, setSelectedEmoji] = useState("😀");
  const [isDrawing, setIsDrawing] = useState(false);
  const [blurMask, setBlurMask] = useState<ImageData | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<any[]>([]);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const originalImageRef = useRef<string | null>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);
  const [livePreview, setLivePreview] = useState(true);
  const [showSelectionOverlay, setShowSelectionOverlay] = useState(true);
  const selectionOverlayRef = useRef<Rect | null>(null);
  const [blurMethod, setBlurMethod] = useState<"gaussian" | "pixelate" | "double">("double");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emojiCategory, setEmojiCategory] = useState<string>("All");
  const [isHoveringEmoji, setIsHoveringEmoji] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const containerWidth = canvasRef.current.parentElement?.clientWidth || 800;
    const canvasWidth = Math.min(containerWidth - 32, 800);
    const canvasHeight = Math.min(canvasWidth * 0.75, 600);

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#f5f5f5",
      selection: false,
    });

    setFabricCanvas(canvas);

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvasWidth;
    maskCanvas.height = canvasHeight;
    maskCanvasRef.current = maskCanvas;

    const handleResize = () => {
      const newContainerWidth = canvasRef.current?.parentElement?.clientWidth || 800;
      const newWidth = Math.min(newContainerWidth - 32, 800);
      const newHeight = Math.min(newWidth * 0.75, 600);
      
      canvas.setDimensions({ width: newWidth, height: newHeight });
      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = newWidth;
        maskCanvasRef.current.height = newHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFile(file);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        originalImageRef.current = event.target?.result as string;
        
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0);
          originalImageDataRef.current = tempCtx.getImageData(0, 0, img.width, img.height);
        }

        if (fabricCanvas) {
          fabricCanvas.clear();
          
          const scale = Math.min(
            fabricCanvas.width! / img.width,
            fabricCanvas.height! / img.height
          ) * 0.9;

          FabricImage.fromURL(event.target?.result as string).then((fabricImg) => {
            fabricImg.scale(scale);
            fabricImg.set({
              left: (fabricCanvas.width! - img.width * scale) / 2,
              top: (fabricCanvas.height! - img.height * scale) / 2,
              selectable: false,
              evented: false,
              originX: 'left',
              originY: 'top',
            });
            fabricCanvas.add(fabricImg);
            fabricCanvas.sendObjectToBack(fabricImg);
            applyImageAdjustments();
            fabricCanvas.renderAll();
          });

          if (maskCanvasRef.current) {
            const ctx = maskCanvasRef.current.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
            }
          }
        }
        toast.success("Image uploaded! Start selecting areas.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (e: any) => {
      if (!uploadedImage) return;
      
      if (mode === "blur") {
        setIsDrawing(true);
        drawOnMask(e.pointer.x, e.pointer.y);
        if (livePreview) {
          applyBlurPreview(e.pointer.x, e.pointer.y);
        }
      } else {
        const target = e.target;
        if (!target || target.type === 'image') {
          addEmoji(e.pointer.x, e.pointer.y);
        }
      }
    };

    const handleMouseMove = (e: any) => {
      if (!uploadedImage) return;
      
      if (mode === "blur") {
        drawPreviewCircle(e.pointer.x, e.pointer.y);
        
        if (isDrawing) {
          drawOnMask(e.pointer.x, e.pointer.y);
          if (livePreview) {
            applyBlurPreview(e.pointer.x, e.pointer.y);
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (isDrawing && mode === "blur") {
        setIsDrawing(false);
        removePreviewCircle();
        applyBlur();
      }
    };

    const handleMouseOut = () => {
      removePreviewCircle();
    };

    const handleSelection = (e: any) => {
      if (mode === "emoji" && e.selected && e.selected.length > 0) {
        setSelectedEmojis(e.selected);
      } else {
        setSelectedEmojis([]);
      }
    };

    fabricCanvas.on("mouse:down", handleMouseDown);
    fabricCanvas.on("mouse:move", handleMouseMove);
    fabricCanvas.on("mouse:up", handleMouseUp);
    fabricCanvas.on("mouse:out", handleMouseOut);
    fabricCanvas.on("selection:created", handleSelection);
    fabricCanvas.on("selection:updated", handleSelection);
    fabricCanvas.on("selection:cleared", () => setSelectedEmojis([]));

    return () => {
      fabricCanvas.off("mouse:down", handleMouseDown);
      fabricCanvas.off("mouse:move", handleMouseMove);
      fabricCanvas.off("mouse:up", handleMouseUp);
      fabricCanvas.off("mouse:out", handleMouseOut);
      fabricCanvas.off("selection:created", handleSelection);
      fabricCanvas.off("selection:updated", handleSelection);
      fabricCanvas.off("selection:cleared");
    };
  }, [fabricCanvas, isDrawing, uploadedImage, mode, tool, brushSize, selectedEmoji, livePreview, blurIntensity, blurOpacity, hideCompletely, blurMethod]);

  const drawOnMask = (x: number, y: number) => {
    if (!maskCanvasRef.current || !fabricCanvas) return;
    
    const imageObj = fabricCanvas.getObjects().find(obj => obj.type === 'image') as any;
    if (!imageObj) return;
    
    const imgLeft = imageObj.left || 0;
    const imgTop = imageObj.top || 0;
    const imgWidth = (imageObj.width || 0) * (imageObj.scaleX || 1);
    const imgHeight = (imageObj.height || 0) * (imageObj.scaleY || 1);
    
    if (x < imgLeft || x > imgLeft + imgWidth || y < imgTop || y > imgTop + imgHeight) {
      return;
    }
    
    const ctx = maskCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = tool === "brush" ? "source-over" : "destination-out";
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    if (showSelectionOverlay) {
      updateSelectionOverlay(x, y);
    }
  };

  const updateSelectionOverlay = (x: number, y: number) => {
    if (!fabricCanvas) return;
    
    if (!selectionOverlayRef.current) {
      selectionOverlayRef.current = new Rect({
        left: x - brushSize / 2,
        top: y - brushSize / 2,
        width: brushSize,
        height: brushSize,
        fill: 'rgba(59, 130, 246, 0.2)',
        stroke: '#3B82F6',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(selectionOverlayRef.current);
    } else {
      selectionOverlayRef.current.set({
        left: x - brushSize / 2,
        top: y - brushSize / 2,
        width: brushSize,
        height: brushSize,
      });
    }
    fabricCanvas.renderAll();
  };

  const removeSelectionOverlay = () => {
    if (!fabricCanvas || !selectionOverlayRef.current) return;
    fabricCanvas.remove(selectionOverlayRef.current);
    selectionOverlayRef.current = null;
    fabricCanvas.renderAll();
  };

  const removePreviewCircle = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if ((obj as any).name === "preview-circle") {
        fabricCanvas.remove(obj);
      }
    });
    fabricCanvas.renderAll();
  };

  const drawPreviewCircle = (x: number, y: number) => {
    if (!fabricCanvas) return;
    
    removePreviewCircle();

    const circle = new Circle({
      left: x - brushSize / 2,
      top: y - brushSize / 2,
      radius: brushSize / 2,
      fill: tool === "brush" ? "rgba(59, 130, 246, 0.3)" : "rgba(239, 68, 68, 0.3)",
      stroke: tool === "brush" ? "#3B82F6" : "#EF4444",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
    (circle as any).name = "preview-circle";
    fabricCanvas.add(circle);
    fabricCanvas.renderAll();
  };

  // Enhanced blur functions for better text hiding
  const applyPixelateBlur = (data: ImageData, x: number, y: number, intensity: number): void => {
    const blockSize = Math.max(4, Math.min(intensity, 16));
    const halfBlock = Math.floor(blockSize / 2);
    
    let totalR = 0, totalG = 0, totalB = 0, count = 0;
    
    for (let dy = -halfBlock; dy <= halfBlock; dy++) {
      for (let dx = -halfBlock; dx <= halfBlock; dx++) {
        const sx = Math.min(Math.max(0, x + dx), data.width - 1);
        const sy = Math.min(Math.max(0, y + dy), data.height - 1);
        
        const idx = (sy * data.width + sx) * 4;
        totalR += data.data[idx];
        totalG += data.data[idx + 1];
        totalB += data.data[idx + 2];
        count++;
      }
    }
    
    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);
    
    // Apply to a larger block for stronger pixelation
    const applyBlock = Math.min(blockSize * 2, 24);
    for (let dy = -applyBlock; dy <= applyBlock; dy++) {
      for (let dx = -applyBlock; dx <= applyBlock; dx++) {
        const sx = Math.min(Math.max(0, x + dx), data.width - 1);
        const sy = Math.min(Math.max(0, y + dy), data.height - 1);
        
        const idx = (sy * data.width + sx) * 4;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= applyBlock) {
          data.data[idx] = avgR;
          data.data[idx + 1] = avgG;
          data.data[idx + 2] = avgB;
        }
      }
    }
  };

  const applyDoubleGaussianBlur = (data: ImageData, x: number, y: number, intensity: number): void => {
    const radius = Math.max(3, Math.min(intensity, 25));
    
    // Apply first pass of Gaussian blur
    let totalR1 = 0, totalG1 = 0, totalB1 = 0, weightSum1 = 0;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const sx = Math.min(Math.max(0, x + dx), data.width - 1);
        const sy = Math.min(Math.max(0, y + dy), data.height - 1);
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const weight = Math.exp(-(distance * distance) / (radius * radius));
        
        const idx = (sy * data.width + sx) * 4;
        totalR1 += data.data[idx] * weight;
        totalG1 += data.data[idx + 1] * weight;
        totalB1 += data.data[idx + 2] * weight;
        weightSum1 += weight;
      }
    }
    
    const blurredR = Math.round(totalR1 / weightSum1);
    const blurredG = Math.round(totalG1 / weightSum1);
    const blurredB = Math.round(totalB1 / weightSum1);
    
    // Apply second pass with larger radius for stronger blur
    const secondRadius = Math.min(radius * 1.5, 35);
    let totalR2 = 0, totalG2 = 0, totalB2 = 0, weightSum2 = 0;
    
    for (let dy = -secondRadius; dy <= secondRadius; dy++) {
      for (let dx = -secondRadius; dx <= secondRadius; dx++) {
        const sx = Math.min(Math.max(0, x + dx), data.width - 1);
        const sy = Math.min(Math.max(0, y + dy), data.height - 1);
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const weight = Math.exp(-(distance * distance) / (secondRadius * secondRadius));
        
        const idx = (sy * data.width + sx) * 4;
        totalR2 += data.data[idx] * weight;
        totalG2 += data.data[idx + 1] * weight;
        totalB2 += data.data[idx + 2] * weight;
        weightSum2 += weight;
      }
    }
    
    // Mix the two blur results
    const finalR = Math.round((blurredR * 0.4 + (totalR2 / weightSum2) * 0.6));
    const finalG = Math.round((blurredG * 0.4 + (totalG2 / weightSum2) * 0.6));
    const finalB = Math.round((blurredB * 0.4 + (totalB2 / weightSum2) * 0.6));
    
    // Apply to target pixel
    const idx = (y * data.width + x) * 4;
    data.data[idx] = finalR;
    data.data[idx + 1] = finalG;
    data.data[idx + 2] = finalB;
  };

  const applyEnhancedGaussianBlur = (data: ImageData, x: number, y: number, intensity: number): void => {
    const radius = Math.max(5, Math.min(intensity, 40));
    
    let totalR = 0, totalG = 0, totalB = 0;
    let weightSum = 0;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const sx = Math.min(Math.max(0, x + dx), data.width - 1);
        const sy = Math.min(Math.max(0, y + dy), data.height - 1);
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Stronger weight falloff for better text hiding
        const weight = Math.exp(-(distance * distance) / (radius * radius * 0.3));
        
        const idx = (sy * data.width + sx) * 4;
        totalR += data.data[idx] * weight;
        totalG += data.data[idx + 1] * weight;
        totalB += data.data[idx + 2] * weight;
        weightSum += weight;
      }
    }
    
    const idx = (y * data.width + x) * 4;
    data.data[idx] = Math.round(totalR / weightSum);
    data.data[idx + 1] = Math.round(totalG / weightSum);
    data.data[idx + 2] = Math.round(totalB / weightSum);
  };

  const applyCompleteHide = (data: ImageData, x: number, y: number): void => {
    // Get average color from a large surrounding area
    const radius = 20;
    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;
    
    for (let dy = -radius; dy <= radius; dy += 2) {
      for (let dx = -radius; dx <= radius; dx += 2) {
        const sx = Math.min(Math.max(0, x + dx), data.width - 1);
        const sy = Math.min(Math.max(0, y + dy), data.height - 1);
        
        const idx = (sy * data.width + sx) * 4;
        totalR += data.data[idx];
        totalG += data.data[idx + 1];
        totalB += data.data[idx + 2];
        count++;
      }
    }
    
    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);
    
    // Apply to target pixel and surrounding area
    const applyRadius = 8;
    for (let dy = -applyRadius; dy <= applyRadius; dy++) {
      for (let dx = -applyRadius; dx <= applyRadius; dx++) {
        const sx = Math.min(Math.max(0, x + dx), data.width - 1);
        const sy = Math.min(Math.max(0, y + dy), data.height - 1);
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= applyRadius) {
          const idx = (sy * data.width + sx) * 4;
          data.data[idx] = avgR;
          data.data[idx + 1] = avgG;
          data.data[idx + 2] = avgB;
        }
      }
    }
  };

  const applyBlurPreview = (x: number, y: number) => {
    if (!fabricCanvas || !uploadedImage || !maskCanvasRef.current || !originalImageDataRef.current) return;

    const imageObj = fabricCanvas.getObjects().find(obj => obj.type === 'image') as any;
    if (!imageObj) return;

    const imgLeft = imageObj.left || 0;
    const imgTop = imageObj.top || 0;
    const imgWidth = (imageObj.width || 0) * (imageObj.scaleX || 1);
    const imgHeight = (imageObj.height || 0) * (imageObj.scaleY || 1);

    const originalWidth = uploadedImage.width;
    const originalHeight = uploadedImage.height;
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tempCtx) return;

    const resultData = new ImageData(
      new Uint8ClampedArray(originalImageDataRef.current.data),
      originalWidth,
      originalHeight
    );

    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (!maskCtx) return;
    const maskData = maskCtx.getImageData(0, 0, fabricCanvas.width!, fabricCanvas.height!);

    const scaleX = originalWidth / imgWidth;
    const scaleY = originalHeight / imgHeight;

    const maskPixels = [];
    for (let canvasY = 0; canvasY < fabricCanvas.height!; canvasY++) {
      for (let canvasX = 0; canvasX < fabricCanvas.width!; canvasX++) {
        const maskIndex = (canvasY * fabricCanvas.width! + canvasX) * 4;
        const maskAlpha = maskData.data[maskIndex + 3] / 255;
        
        if (maskAlpha > 0) {
          const origX = Math.floor((canvasX - imgLeft) * scaleX);
          const origY = Math.floor((canvasY - imgTop) * scaleY);
          
          if (origX >= 0 && origX < originalWidth && origY >= 0 && origY < originalHeight) {
            maskPixels.push({ x: origX, y: origY });
          }
        }
      }
    }

    if (maskPixels.length === 0) return;

    const currentBlurIntensity = hideCompletely ? 30 : blurIntensity;
    
    // Apply the selected blur method
    for (const pixel of maskPixels) {
      const x = pixel.x;
      const y = pixel.y;
      
      if (hideCompletely) {
        applyCompleteHide(resultData, x, y);
      } else {
        switch (blurMethod) {
          case "pixelate":
            applyPixelateBlur(resultData, x, y, currentBlurIntensity);
            break;
          case "double":
            applyDoubleGaussianBlur(resultData, x, y, currentBlurIntensity);
            break;
          case "gaussian":
          default:
            applyEnhancedGaussianBlur(resultData, x, y, currentBlurIntensity);
            break;
        }
        
        // Apply opacity effect if less than 100%
        if (blurOpacity < 100) {
          const idx = (y * originalWidth + x) * 4;
          const originalR = resultData.data[idx];
          const originalG = resultData.data[idx + 1];
          const originalB = resultData.data[idx + 2];
          
          // Get average color from surrounding area for mixing
          let avgR = 0, avgG = 0, avgB = 0;
          const sampleRadius = 10;
          let sampleCount = 0;
          
          for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
            for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
              const sx = Math.min(Math.max(0, x + dx), originalWidth - 1);
              const sy = Math.min(Math.max(0, y + dy), originalHeight - 1);
              
              const sampleIdx = (sy * originalWidth + sx) * 4;
              avgR += resultData.data[sampleIdx];
              avgG += resultData.data[sampleIdx + 1];
              avgB += resultData.data[sampleIdx + 2];
              sampleCount++;
            }
          }
          
          const mixR = Math.round(avgR / sampleCount);
          const mixG = Math.round(avgG / sampleCount);
          const mixB = Math.round(avgB / sampleCount);
          
          const opacity = blurOpacity / 100;
          resultData.data[idx] = Math.round(originalR * opacity + mixR * (1 - opacity));
          resultData.data[idx + 1] = Math.round(originalG * opacity + mixG * (1 - opacity));
          resultData.data[idx + 2] = Math.round(originalB * opacity + mixB * (1 - opacity));
        }
      }
    }

    const adjustedData = applyBrightnessContrast(resultData, brightness, contrast);
    
    tempCtx.putImageData(adjustedData, 0, 0);

    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = fabricCanvas.width!;
    displayCanvas.height = fabricCanvas.height!;
    const displayCtx = displayCanvas.getContext("2d");
    if (!displayCtx) return;
    
    displayCtx.fillStyle = "#f5f5f5";
    displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    
    displayCtx.drawImage(tempCanvas, 0, 0, originalWidth, originalHeight, imgLeft, imgTop, imgWidth, imgHeight);

    const currentEmojis = fabricCanvas.getObjects().filter(obj => obj.type === 'text');
    FabricImage.fromURL(displayCanvas.toDataURL()).then((fabricImg) => {
      const currentObjects = fabricCanvas.getObjects();
      currentObjects.forEach(obj => {
        if (obj.type === 'image') {
          fabricCanvas.remove(obj);
        }
      });
      
      fabricImg.set({
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      });
      fabricCanvas.add(fabricImg);
      fabricCanvas.sendObjectToBack(fabricImg);
      
      currentEmojis.forEach(emoji => fabricCanvas.add(emoji));
      fabricCanvas.renderAll();
    });
  };

  const applyBlur = () => {
    if (!fabricCanvas || !uploadedImage || !maskCanvasRef.current || !originalImageDataRef.current) return;

    const imageObj = fabricCanvas.getObjects().find(obj => obj.type === 'image') as any;
    if (!imageObj) return;

    const imgLeft = imageObj.left || 0;
    const imgTop = imageObj.top || 0;
    const imgWidth = (imageObj.width || 0) * (imageObj.scaleX || 1);
    const imgHeight = (imageObj.height || 0) * (imageObj.scaleY || 1);

    const originalWidth = uploadedImage.width;
    const originalHeight = uploadedImage.height;
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tempCtx) return;

    const resultData = new ImageData(
      new Uint8ClampedArray(originalImageDataRef.current.data),
      originalWidth,
      originalHeight
    );

    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (!maskCtx) return;
    const maskData = maskCtx.getImageData(0, 0, fabricCanvas.width!, fabricCanvas.height!);

    const scaleX = originalWidth / imgWidth;
    const scaleY = originalHeight / imgHeight;

    const maskPixels = [];
    for (let canvasY = 0; canvasY < fabricCanvas.height!; canvasY++) {
      for (let canvasX = 0; canvasX < fabricCanvas.width!; canvasX++) {
        const maskIndex = (canvasY * fabricCanvas.width! + canvasX) * 4;
        const maskAlpha = maskData.data[maskIndex + 3] / 255;
        
        if (maskAlpha > 0) {
          const origX = Math.floor((canvasX - imgLeft) * scaleX);
          const origY = Math.floor((canvasY - imgTop) * scaleY);
          
          if (origX >= 0 && origX < originalWidth && origY >= 0 && origY < originalHeight) {
            maskPixels.push({ x: origX, y: origY });
          }
        }
      }
    }

    if (maskPixels.length === 0) return;

    const currentBlurIntensity = hideCompletely ? 30 : blurIntensity;
    
    // Apply the selected blur method
    for (const pixel of maskPixels) {
      const x = pixel.x;
      const y = pixel.y;
      
      if (hideCompletely) {
        applyCompleteHide(resultData, x, y);
      } else {
        switch (blurMethod) {
          case "pixelate":
            applyPixelateBlur(resultData, x, y, currentBlurIntensity);
            break;
          case "double":
            applyDoubleGaussianBlur(resultData, x, y, currentBlurIntensity);
            break;
          case "gaussian":
          default:
            applyEnhancedGaussianBlur(resultData, x, y, currentBlurIntensity);
            break;
        }
        
        // Apply opacity effect if less than 100%
        if (blurOpacity < 100) {
          const idx = (y * originalWidth + x) * 4;
          const originalR = resultData.data[idx];
          const originalG = resultData.data[idx + 1];
          const originalB = resultData.data[idx + 2];
          
          // Get average color from surrounding area for mixing
          let avgR = 0, avgG = 0, avgB = 0;
          const sampleRadius = 10;
          let sampleCount = 0;
          
          for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
            for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
              const sx = Math.min(Math.max(0, x + dx), originalWidth - 1);
              const sy = Math.min(Math.max(0, y + dy), originalHeight - 1);
              
              const sampleIdx = (sy * originalWidth + sx) * 4;
              avgR += resultData.data[sampleIdx];
              avgG += resultData.data[sampleIdx + 1];
              avgB += resultData.data[sampleIdx + 2];
              sampleCount++;
            }
          }
          
          const mixR = Math.round(avgR / sampleCount);
          const mixG = Math.round(avgG / sampleCount);
          const mixB = Math.round(avgB / sampleCount);
          
          const opacity = blurOpacity / 100;
          resultData.data[idx] = Math.round(originalR * opacity + mixR * (1 - opacity));
          resultData.data[idx + 1] = Math.round(originalG * opacity + mixG * (1 - opacity));
          resultData.data[idx + 2] = Math.round(originalB * opacity + mixB * (1 - opacity));
        }
      }
    }

    const adjustedData = applyBrightnessContrast(resultData, brightness, contrast);
    
    tempCtx.putImageData(adjustedData, 0, 0);

    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = fabricCanvas.width!;
    displayCanvas.height = fabricCanvas.height!;
    const displayCtx = displayCanvas.getContext("2d");
    if (!displayCtx) return;
    
    displayCtx.fillStyle = "#f5f5f5";
    displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    
    displayCtx.drawImage(tempCanvas, 0, 0, originalWidth, originalHeight, imgLeft, imgTop, imgWidth, imgHeight);

    const currentEmojis = fabricCanvas.getObjects().filter(obj => obj.type === 'text');
    FabricImage.fromURL(displayCanvas.toDataURL()).then((fabricImg) => {
      fabricCanvas.clear();
      fabricImg.set({
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      });
      fabricCanvas.add(fabricImg);
      
      currentEmojis.forEach(emoji => fabricCanvas.add(emoji));
      fabricCanvas.renderAll();
      
      removeSelectionOverlay();
    });
    
    toast.success(`Blur applied to selected area! ${hideCompletely ? '(Completely hidden)' : ''}`);
  };

  const applyBrightnessContrast = (imageData: ImageData, brightness: number, contrast: number): ImageData => {
    const data = imageData.data;
    const factor = contrast / 100;
    const brightnessAdjust = brightness - 100;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + brightnessAdjust));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightnessAdjust));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightnessAdjust));
      
      data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * factor) + 128));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * factor) + 128));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * factor) + 128));
    }
    
    return imageData;
  };

  const applyImageAdjustments = () => {
    if (!fabricCanvas || !originalImageDataRef.current) return;

    const imageObj = fabricCanvas.getObjects().find(obj => obj.type === 'image') as any;
    if (!imageObj) return;

    const imgLeft = imageObj.left || 0;
    const imgTop = imageObj.top || 0;
    const imgWidth = (imageObj.width || 0) * (imageObj.scaleX || 1);
    const imgHeight = (imageObj.height || 0) * (imageObj.scaleY || 1);

    const originalWidth = originalImageDataRef.current.width;
    const originalHeight = originalImageDataRef.current.height;
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const adjustedData = new ImageData(
      new Uint8ClampedArray(originalImageDataRef.current.data),
      originalWidth,
      originalHeight
    );
    
    const finalData = applyBrightnessContrast(adjustedData, brightness, contrast);
    
    if (maskCanvasRef.current) {
      const maskCtx = maskCanvasRef.current.getContext("2d");
      if (maskCtx) {
        const maskData = maskCtx.getImageData(0, 0, fabricCanvas.width!, fabricCanvas.height!);
        
        const scaleX = originalWidth / imgWidth;
        const scaleY = originalHeight / imgHeight;
        
        const currentBlurIntensity = hideCompletely ? 30 : blurIntensity;
        
        for (let canvasY = 0; canvasY < fabricCanvas.height!; canvasY++) {
          for (let canvasX = 0; canvasX < fabricCanvas.width!; canvasX++) {
            const maskIndex = (canvasY * fabricCanvas.width! + canvasX) * 4;
            const maskAlpha = maskData.data[maskIndex + 3] / 255;
            
            if (maskAlpha > 0) {
              const origX = Math.floor((canvasX - imgLeft) * scaleX);
              const origY = Math.floor((canvasY - imgTop) * scaleY);
              
              if (origX >= 0 && origX < originalWidth && origY >= 0 && origY < originalHeight) {
                if (hideCompletely) {
                  applyCompleteHide(finalData, origX, origY);
                } else {
                  switch (blurMethod) {
                    case "pixelate":
                      applyPixelateBlur(finalData, origX, origY, currentBlurIntensity);
                      break;
                    case "double":
                      applyDoubleGaussianBlur(finalData, origX, origY, currentBlurIntensity);
                      break;
                    case "gaussian":
                    default:
                      applyEnhancedGaussianBlur(finalData, origX, origY, currentBlurIntensity);
                      break;
                  }
                  
                  // Apply opacity effect if less than 100%
                  if (blurOpacity < 100) {
                    const idx = (origY * originalWidth + origX) * 4;
                    const originalR = finalData.data[idx];
                    const originalG = finalData.data[idx + 1];
                    const originalB = finalData.data[idx + 2];
                    
                    // Get average color from surrounding area for mixing
                    let avgR = 0, avgG = 0, avgB = 0;
                    const sampleRadius = 10;
                    let sampleCount = 0;
                    
                    for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
                      for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
                        const sx = Math.min(Math.max(0, origX + dx), originalWidth - 1);
                        const sy = Math.min(Math.max(0, origY + dy), originalHeight - 1);
                        
                        const sampleIdx = (sy * originalWidth + sx) * 4;
                        avgR += finalData.data[sampleIdx];
                        avgG += finalData.data[sampleIdx + 1];
                        avgB += finalData.data[sampleIdx + 2];
                        sampleCount++;
                      }
                    }
                    
                    const mixR = Math.round(avgR / sampleCount);
                    const mixG = Math.round(avgG / sampleCount);
                    const mixB = Math.round(avgB / sampleCount);
                    
                    const opacity = blurOpacity / 100;
                    finalData.data[idx] = Math.round(originalR * opacity + mixR * (1 - opacity));
                    finalData.data[idx + 1] = Math.round(originalG * opacity + mixG * (1 - opacity));
                    finalData.data[idx + 2] = Math.round(originalB * opacity + mixB * (1 - opacity));
                  }
                }
              }
            }
          }
        }
      }
    }
    
    tempCtx.putImageData(finalData, 0, 0);

    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = fabricCanvas.width!;
    displayCanvas.height = fabricCanvas.height!;
    const displayCtx = displayCanvas.getContext("2d");
    if (!displayCtx) return;
    
    displayCtx.fillStyle = "#f5f5f5";
    displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    
    displayCtx.drawImage(tempCanvas, 0, 0, originalWidth, originalHeight, imgLeft, imgTop, imgWidth, imgHeight);

    const currentEmojis = fabricCanvas.getObjects().filter(obj => obj.type === 'text');
    FabricImage.fromURL(displayCanvas.toDataURL()).then((fabricImg) => {
      fabricCanvas.clear();
      fabricImg.set({
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      });
      fabricCanvas.add(fabricImg);
      
      currentEmojis.forEach(emoji => fabricCanvas.add(emoji));
      fabricCanvas.renderAll();
    });
  };

  const addEmoji = (x: number, y: number) => {
    if (!fabricCanvas) return;

    const text = new FabricText(selectedEmoji, {
      left: x - 20,
      top: y - 20,
      fontSize: 40,
      selectable: true,
      evented: true,
    });

    fabricCanvas.add(text);
    fabricCanvas.renderAll();
    toast.success("Emoji added! Drag to move, use corner handles to resize.");
  };

  const handleDeleteEmoji = () => {
    if (!fabricCanvas || selectedEmojis.length === 0) return;
    
    selectedEmojis.forEach(obj => {
      fabricCanvas.remove(obj);
    });
    
    setSelectedEmojis([]);
    fabricCanvas.renderAll();
    toast.success("Emoji(s) deleted!");
  };

  const handleReset = () => {
    if (!fabricCanvas || !uploadedImage) return;
    
    fabricCanvas.clear();
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(
        fabricCanvas.width! / img.width,
        fabricCanvas.height! / img.height
      );

      FabricImage.fromURL(img.src).then((fabricImg) => {
        fabricImg.scale(scale);
        fabricImg.set({
          left: (fabricCanvas.width! - img.width * scale) / 2,
          top: (fabricCanvas.height! - img.height * scale) / 2,
          selectable: false,
          evented: false,
        });
        fabricCanvas.add(fabricImg);
        fabricCanvas.renderAll();
      });
    };
    img.src = uploadedImage.src;

    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
    }

    setBrightness(100);
    setContrast(100);
    setBlurOpacity(100);
    setHideCompletely(true);
    setBlurIntensity(15);
    setBlurMethod("double");

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = uploadedImage.width;
    tempCanvas.height = uploadedImage.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(uploadedImage, 0, 0);
      originalImageDataRef.current = tempCtx.getImageData(0, 0, uploadedImage.width, uploadedImage.height);
    }

    removeSelectionOverlay();
    toast.success("Reset to original image");
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    
    const dataUrl = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `edited-image-${Date.now()}.png`;
    link.click();
    toast.success("Image downloaded!");
  };

  // Get emojis for current category
  const getCurrentEmojis = () => {
    if (emojiCategory === "All") {
      return ALL_EMOJIS;
    }
    return EMOJI_CATEGORIES[emojiCategory as keyof typeof EMOJI_CATEGORIES] || ALL_EMOJIS;
  };

  // Handle emoji hover
  const handleEmojiHover = (emoji: string) => {
    setIsHoveringEmoji(emoji);
  };

  const handleEmojiLeave = () => {
    setIsHoveringEmoji(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-0 space-y-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 py-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Blur & Emoji Editor
            </h1>
          </div>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto px-4">
            Add blur effects or apply emojis to hide sensitive areas — fast, simple, and fully client-side.
          </p>
        </motion.div>

        {/* Main Content - Canvas and Controls Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
          {/* Left Column - Canvas */}
          <div className="lg:col-span-2">
            <Card className="glass p-3 sm:p-4 h-full">
              <div className="w-full overflow-auto h-full flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full rounded-lg shadow-lg touch-none" 
                  style={{ display: 'block', margin: '0 auto' }} 
                />
              </div>
              {mode === "blur" && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>✓ Live preview enabled - see blur effect as you paint</span>
                  </div>
                  {hideCompletely && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>✓ Hide Completely mode active - text will be completely unreadable</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Using <strong>{blurMethod === "double" ? "Double Gaussian Blur" : blurMethod === "pixelate" ? "Pixelate Blur" : "Enhanced Gaussian Blur"}</strong> method
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Controls */}
          <div className="lg:col-span-1">
            <Card className="glass p-4 sm:p-6 h-full">
              <div className="space-y-4 sm:space-y-6">
                {/* Upload Section - Drag & Drop Style */}
                <div>
                  <Label htmlFor="image-upload" className="text-lg font-semibold mb-2 block">
                    Upload Image
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      isDragging 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={handleUploadClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {isDragging ? (
                          <Upload className="w-6 h-6 text-primary" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {isDragging ? "Drop image here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadClick();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                {uploadedImage && (
                  <>
                    {/* Mode Selection */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Button
                        variant={mode === "blur" ? "default" : "outline"}
                        onClick={() => {
                          setMode("blur");
                          setTool("brush");
                        }}
                        size="lg"
                        className="h-12 text-xs sm:text-sm"
                      >
                        Blur Mode
                      </Button>
                      <Button
                        variant={mode === "emoji" ? "default" : "outline"}
                        onClick={() => setMode("emoji")}
                        size="lg"
                        className="h-12 text-xs sm:text-sm"
                      >
                        <Smile className="w-4 h-4 mr-1 sm:mr-2" />
                        Emoji Mode
                      </Button>
                    </div>

                    {/* Blur Mode Controls */}
                    {mode === "blur" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <Button
                            variant={tool === "brush" ? "default" : "outline"}
                            onClick={() => setTool("brush")}
                            size="lg"
                            className="h-12 text-xs sm:text-sm"
                          >
                            Brush
                          </Button>
                          <Button
                            variant={tool === "eraser" ? "default" : "outline"}
                            onClick={() => setTool("eraser")}
                            size="lg"
                            className="h-12 text-xs sm:text-sm"
                          >
                            <Eraser className="w-4 h-4 mr-1 sm:mr-2" />
                            Eraser
                          </Button>
                        </div>

                        <div>
                          <Label className="mb-2 block">Brush Size: {brushSize}px</Label>
                          <Slider
                            value={[brushSize]}
                            onValueChange={(value) => setBrushSize(value[0])}
                            min={10}
                            max={100}
                            step={5}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant={blurMethod === "double" ? "default" : "outline"}
                            onClick={() => setBlurMethod("double")}
                            className="h-10 text-xs"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Double
                          </Button>
                          <Button
                            variant={blurMethod === "pixelate" ? "default" : "outline"}
                            onClick={() => setBlurMethod("pixelate")}
                            className="h-10 text-xs"
                          >
                            Pixelate
                          </Button>
                          <Button
                            variant={blurMethod === "gaussian" ? "default" : "outline"}
                            onClick={() => setBlurMethod("gaussian")}
                            className="h-10 text-xs"
                          >
                            Gaussian
                          </Button>
                        </div>

                        <div>
                          <Label className="mb-2 block">
                            Blur Intensity: {hideCompletely ? 30 : blurIntensity}px
                            {blurMethod === "pixelate" && " (block size)"}
                          </Label>
                          <Slider
                            value={[hideCompletely ? 30 : blurIntensity]}
                            onValueChange={(value) => setBlurIntensity(value[0])}
                            min={blurMethod === "pixelate" ? 4 : 5}
                            max={blurMethod === "pixelate" ? 16 : 30}
                            step={1}
                            disabled={hideCompletely}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {blurMethod === "double" && "Double Gaussian blur for maximum text hiding"}
                            {blurMethod === "pixelate" && "Pixelation effect - great for hiding text"}
                            {blurMethod === "gaussian" && "Enhanced Gaussian blur with stronger falloff"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="block">Blur Strength: {hideCompletely ? 100 : blurOpacity}%</Label>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={hideCompletely}
                                onCheckedChange={(checked) => {
                                  setHideCompletely(checked);
                                  if (checked) {
                                    setBlurIntensity(30);
                                    setBlurOpacity(100);
                                    setBlurMethod("double");
                                  }
                                  applyImageAdjustments();
                                }}
                              />
                              <Label className="text-sm">Hide Completely</Label>
                            </div>
                          </div>
                          <Slider
                            value={[hideCompletely ? 100 : blurOpacity]}
                            onValueChange={(value) => {
                              setBlurOpacity(value[0]);
                              applyImageAdjustments();
                            }}
                            min={50}
                            max={100}
                            step={5}
                            disabled={hideCompletely}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {hideCompletely 
                              ? "Maximum hiding mode - text will be completely unreadable"
                              : "Higher strength makes blur effect more powerful"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Live Preview
                          </Label>
                          <Switch
                            checked={livePreview}
                            onCheckedChange={setLivePreview}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Show Selection Overlay
                          </Label>
                          <Switch
                            checked={showSelectionOverlay}
                            onCheckedChange={setShowSelectionOverlay}
                          />
                        </div>

                        <div>
                          <Label className="mb-2 block">Brightness: {brightness}%</Label>
                          <Slider
                            value={[brightness]}
                            onValueChange={(value) => {
                              setBrightness(value[0]);
                              applyImageAdjustments();
                            }}
                            min={50}
                            max={150}
                            step={5}
                          />
                        </div>

                        <div>
                          <Label className="mb-2 block">Contrast: {contrast}%</Label>
                          <Slider
                            value={[contrast]}
                            onValueChange={(value) => {
                              setContrast(value[0]);
                              applyImageAdjustments();
                            }}
                            min={50}
                            max={150}
                            step={5}
                          />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Tip:</strong> For hiding text, use "Double" blur method with high intensity and enable "Hide Completely" mode.
                            Pixelate method is also excellent for making text unreadable.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Emoji Mode Controls - Updated Design */}
                    {mode === "emoji" && (
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2 block">Select Emoji</Label>
                          
                          {/* Emoji Category Tabs */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            <button
                              onClick={() => setEmojiCategory("All")}
                              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                                emojiCategory === "All"
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                              }`}
                            >
                              All
                            </button>
                            {Object.keys(EMOJI_CATEGORIES).map((category) => (
                              <button
                                key={category}
                                onClick={() => setEmojiCategory(category)}
                                className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                                  emojiCategory === category
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>

                          {/* Emoji Grid */}
                          <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-2 border rounded-lg">
                            {getCurrentEmojis().map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => setSelectedEmoji(emoji)}
                                onMouseEnter={() => handleEmojiHover(emoji)}
                                onMouseLeave={handleEmojiLeave}
                                className={`
                                  relative text-2xl p-2 rounded-lg transition-all duration-150
                                  flex items-center justify-center
                                  hover:scale-110 hover:z-10 hover:shadow-lg
                                  active:scale-95
                                  ${selectedEmoji === emoji 
                                    ? "bg-primary/20 ring-2 ring-primary scale-110 shadow-md" 
                                    : "hover:bg-primary/10"
                                  }
                                  ${isHoveringEmoji === emoji && selectedEmoji !== emoji
                                    ? "bg-primary/10 ring-1 ring-primary/30"
                                    : ""
                                  }
                                `}
                                style={{
                                  transform: selectedEmoji === emoji ? 'scale(1.1)' : 
                                            isHoveringEmoji === emoji ? 'scale(1.1)' : 'scale(1)',
                                  zIndex: selectedEmoji === emoji || isHoveringEmoji === emoji ? 10 : 1
                                }}
                              >
                                {/* Selection indicator */}
                                {selectedEmoji === emoji && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                  </div>
                                )}
                                
                                {/* Hover tooltip */}
                                {isHoveringEmoji === emoji && selectedEmoji !== emoji && (
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                                    Click to select
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                  </div>
                                )}
                                
                                <span className="transition-transform duration-150">
                                  {emoji}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Selected Emoji Display */}
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl">{selectedEmoji}</div>
                                <div>
                                  <p className="text-sm font-medium">Selected Emoji</p>
                                  <p className="text-xs text-muted-foreground">
                                    Click on canvas to place this emoji
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Copy emoji to clipboard
                                  navigator.clipboard.writeText(selectedEmoji);
                                  toast.success("Emoji copied to clipboard!");
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {selectedEmojis.length > 0 && (
                          <Button onClick={handleDeleteEmoji} variant="destructive" className="w-full">
                            <Eraser className="w-4 h-4 mr-2" />
                            Delete Selected Emoji{selectedEmojis.length > 1 ? 's' : ''}
                          </Button>
                        )}
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>• Click to place emoji on canvas</p>
                          <p>• Click emoji to select, then drag to move or resize</p>
                          <p>• Delete selected emojis with button above</p>
                          <p>• Categories help find emojis faster</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <Button onClick={handleReset} variant="outline" size="lg" className="h-12 text-xs sm:text-sm">
                        <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
                        Reset
                      </Button>
                      <Button onClick={handleDownload} size="lg" className="h-12 text-xs sm:text-sm">
                        <Download className="w-4 h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Tool Description */}
        <ToolDescription
          title="Blur & Emoji Editor"
          description="Add powerful blur effects or fun emojis to your images with precision control and live preview. Enhanced blur algorithms ensure text is completely unreadable."
          benefits={[
            "Multiple blur methods: Double Gaussian, Pixelate, and Enhanced Gaussian",
            "Complete text hiding with 'Hide Completely' mode",
            "Double Gaussian blur applies two passes for maximum obscurity",
            "Pixelate blur creates mosaic effect that destroys text readability",
            "Enhanced Gaussian blur with stronger weight falloff",
            "Live preview shows blur effect as you select areas",
            "Visual overlay shows selected regions",
            "Add emojis with full control over size and placement",
            "Export high-quality edited images"
          ]}
          howTo={[
            { 
              title: "Upload Image", 
              description: "Upload your image using the file selector" 
            },
            { 
              title: "Select Blur Mode", 
              description: "Choose Blur Mode to hide sensitive information or text" 
            },
            { 
              title: "Choose Blur Method", 
              description: "Select Double Gaussian (recommended), Pixelate, or Enhanced Gaussian blur" 
            },
            { 
              title: "Adjust Settings", 
              description: "Set brush size, blur intensity, and strength. Enable 'Hide Completely' for maximum obscurity" 
            },
            { 
              title: "Select Areas", 
              description: "Paint over areas you want to blur. Text in selected areas will be completely unreadable" 
            },
            { 
              title: "Preview & Refine", 
              description: "Use eraser to remove selections. Blue overlay shows selected regions" 
            },
            { 
              title: "Add Emojis (Optional)", 
              description: "Switch to Emoji Mode to add decorative elements" 
            },
            { 
              title: "Download", 
              description: "Download your edited image when finished" 
            }
          ]}
          faqs={[
            {
              question: "How do I completely hide text in my image?",
              answer: "Enable 'Hide Completely' mode and use the 'Double' blur method. This applies two passes of Gaussian blur with different radii to ensure text is completely unreadable."
            },
            {
              question: "Which blur method is best for hiding text?",
              answer: "'Double Gaussian' is best for most text hiding. 'Pixelate' creates a mosaic effect that's also excellent for destroying text readability. Both methods make text completely unreadable."
            },
            {
              question: "What's the difference between the blur methods?",
              answer: "Double: Two Gaussian passes for maximum blur. Pixelate: Creates blocky mosaic effect. Gaussian: Enhanced single-pass blur with stronger falloff."
            },
            {
              question: "Can I see the blur effect while I'm selecting?",
              answer: "Yes! Enable Live Preview to see the blur effect in real-time as you paint over areas. The effect updates instantly."
            },
            {
              question: "What settings should I use for hiding text?",
              answer: "Use 'Double' method, blur intensity 20-30px, strength 100%, and enable 'Hide Completely' mode for maximum effectiveness."
            },
            {
              question: "Why is text still visible after blurring?",
              answer: "If text is visible, increase blur intensity to max (30px), ensure 'Hide Completely' is enabled, and use 'Double' blur method for the strongest effect."
            },
            {
              question: "Is my image data secure?",
              answer: "Absolutely! All processing happens locally in your browser. Your images never leave your device."
            }
          ]}
        />
      </div>
    </div>
  );
};