import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Layers, Trash2, Palette, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadZone } from "./UploadZone";
import { useToast } from "@/hooks/use-toast";

type ImageObject = {
  id: string;
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

const PRESET_SIZES = [
  { name: "16:9 (HD)", width: 1920, height: 1080 },
  { name: "1:1 (Square)", width: 1080, height: 1080 },
  { name: "9:16 (Story)", width: 1080, height: 1920 },
  { name: "4:3", width: 1600, height: 1200 },
];

export const CombineTool = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [uploadedImages, setUploadedImages] = useState<{ id: string; src: string }[]>([]);
  const [canvasObjects, setCanvasObjects] = useState<ImageObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("image/png");
  const [exportQuality, setExportQuality] = useState([0.9]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<"move" | "resize-br" | "rotate" | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvasObjects.forEach((obj) => {
      ctx.save();
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
      ctx.rotate(obj.rotation);
      ctx.drawImage(obj.img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
      ctx.restore();
    });

    const selectedObject = canvasObjects.find((o) => o.id === selectedObjectId);
    if (selectedObject) {
      drawSelectionHandles(ctx, selectedObject);
    }
  }, [canvasObjects, selectedObjectId, backgroundColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      draw();
    }
  }, [canvasSize, draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, obj: ImageObject) => {
    ctx.save();
    ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
    ctx.rotate(obj.rotation);

    const halfW = obj.width / 2;
    const halfH = obj.height / 2;

    ctx.strokeStyle = "hsl(var(--accent))";
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfW, -halfH, obj.width, obj.height);

    ctx.fillStyle = "hsl(var(--accent))";
    ctx.fillRect(halfW - 8, halfH - 8, 16, 16);
    ctx.strokeStyle = "hsl(var(--background))";
    ctx.lineWidth = 2;
    ctx.strokeRect(halfW - 8, halfH - 8, 16, 16);

    ctx.beginPath();
    ctx.moveTo(0, -halfH);
    ctx.lineTo(0, -halfH - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -halfH - 20, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  const handleFileSelect = (files: File[]) => {
    const newImages = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      src: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);

    toast({
      title: "Images uploaded",
      description: `${files.length} image(s) ready to add to canvas`,
    });
  };

  const addImageToCanvas = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const maxWidth = canvasSize.width * 0.4;
      const maxHeight = canvasSize.height * 0.4;
      let width = maxWidth;
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      const newObject: ImageObject = {
        id: `canvas-${Date.now()}-${Math.random()}`,
        img,
        x: (canvasSize.width - width) / 2,
        y: (canvasSize.height - height) / 2,
        width,
        height,
        rotation: 0,
      };
      setCanvasObjects((prev) => [...prev, newObject]);
      setSelectedObjectId(newObject.id);
      
      toast({
        title: "Image added to canvas",
        description: "Drag, resize, and rotate to arrange",
      });
    };
    img.src = src;
  };

  const getTransformedMousePos = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const isPointInObject = (x: number, y: number, obj: ImageObject) => {
    const centerX = obj.x + obj.width / 2;
    const centerY = obj.y + obj.height / 2;
    const translatedX = x - centerX;
    const translatedY = y - centerY;
    const rotatedX = translatedX * Math.cos(-obj.rotation) - translatedY * Math.sin(-obj.rotation);
    const rotatedY = translatedX * Math.sin(-obj.rotation) + translatedY * Math.cos(-obj.rotation);
    return (
      rotatedX >= -obj.width / 2 &&
      rotatedX <= obj.width / 2 &&
      rotatedY >= -obj.height / 2 &&
      rotatedY <= obj.height / 2
    );
  };

  const getActionForPoint = (x: number, y: number, obj: ImageObject): "move" | "resize-br" | "rotate" | null => {
    const handleSize = 16;
    const rotateHandleRadius = 8;
    const rotateHandleDist = 20;
    const centerX = obj.x + obj.width / 2;
    const centerY = obj.y + obj.height / 2;
    const translatedX = x - centerX;
    const translatedY = y - centerY;
    const cos = Math.cos(-obj.rotation);
    const sin = Math.sin(-obj.rotation);
    const localX = translatedX * cos - translatedY * sin;
    const localY = translatedX * sin + translatedY * cos;
    const halfW = obj.width / 2;
    const halfH = obj.height / 2;

    const rotateHandleX = 0;
    const rotateHandleY = -halfH - rotateHandleDist;
    if (Math.hypot(localX - rotateHandleX, localY - rotateHandleY) <= rotateHandleRadius) {
      return "rotate";
    }

    const resizeHandleX = halfW - handleSize / 2;
    const resizeHandleY = halfH - handleSize / 2;
    if (
      localX >= resizeHandleX &&
      localX <= resizeHandleX + handleSize &&
      localY >= resizeHandleY &&
      localY <= resizeHandleY + handleSize
    ) {
      return "resize-br";
    }

    if (isPointInObject(x, y, obj)) {
      return "move";
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getTransformedMousePos(e);
    lastMousePos.current = pos;

    const selectedObject = canvasObjects.find((o) => o.id === selectedObjectId);
    if (selectedObject) {
      const action = getActionForPoint(pos.x, pos.y, selectedObject);
      if (action) {
        setIsDragging(true);
        setDragAction(action);
        return;
      }
    }

    for (let i = canvasObjects.length - 1; i >= 0; i--) {
      const obj = canvasObjects[i];
      if (isPointInObject(pos.x, pos.y, obj)) {
        setSelectedObjectId(obj.id);
        setIsDragging(true);
        setDragAction("move");
        return;
      }
    }

    setSelectedObjectId(null);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragAction || !selectedObjectId) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pos = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };

      const dx = pos.x - lastMousePos.current.x;
      const dy = pos.y - lastMousePos.current.y;

      setCanvasObjects((prev) =>
        prev.map((obj) => {
          if (obj.id !== selectedObjectId) return obj;

          const newObj = { ...obj };
          const centerX = newObj.x + newObj.width / 2;
          const centerY = newObj.y + newObj.height / 2;

          switch (dragAction) {
            case "move":
              newObj.x += dx;
              newObj.y += dy;
              break;
            case "rotate": {
              const angle = Math.atan2(pos.y - centerY, pos.x - centerX) + Math.PI / 2;
              newObj.rotation = angle;
              break;
            }
            case "resize-br": {
              const cos = Math.cos(newObj.rotation);
              const sin = Math.sin(newObj.rotation);
              const rotatedDx = dx * cos + dy * sin;
              const aspectRatio = newObj.width / newObj.height;
              const newWidth = newObj.width + rotatedDx;
              const newHeight = newWidth / aspectRatio;

              if (newWidth > 20) {
                newObj.width = newWidth;
                newObj.height = newHeight;
                newObj.x = centerX - newWidth / 2;
                newObj.y = centerY - newHeight / 2;
              }
              break;
            }
          }
          return newObj;
        })
      );

      lastMousePos.current = pos;
    },
    [isDragging, dragAction, selectedObjectId]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragAction(null);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const deleteSelectedObject = () => {
    if (!selectedObjectId) return;
    setCanvasObjects((prev) => prev.filter((obj) => obj.id !== selectedObjectId));
    setSelectedObjectId(null);
    toast({
      title: "Image removed",
      description: "Image deleted from canvas",
    });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentSelectedId = selectedObjectId;
    setSelectedObjectId(null);

    requestAnimationFrame(() => {
      const dataUrl = canvas.toDataURL(exportFormat, exportFormat !== "image/png" ? exportQuality[0] : undefined);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `imageforge-combine.${exportFormat.split("/")[1]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSelectedObjectId(currentSelectedId);

      toast({
        title: "Downloaded!",
        description: "Combined image exported successfully",
      });
    });
  };

  const clearCanvas = () => {
    setCanvasObjects([]);
    setSelectedObjectId(null);
    toast({
      title: "Canvas cleared",
      description: "All images removed",
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Layers className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold">Combine Images</h2>
      </div>

      <UploadZone onFilesSelected={handleFileSelect} accept="image/*" multiple />

      {uploadedImages.length > 0 && (
        <Card className="glass p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uploaded Images</Label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {uploadedImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => addImageToCanvas(img.src)}
                  className="aspect-square rounded-lg overflow-hidden border border-border hover:border-accent cursor-pointer transition-all hover:scale-105"
                >
                  <img src={img.src} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Click any image to add it to the canvas</p>
          </div>
        </Card>
      )}

      {canvasObjects.length > 0 && (
        <Card className="glass p-6 space-y-6">
          <div className="relative border border-border rounded-lg overflow-hidden bg-background">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              className="w-full cursor-move"
              style={{ maxHeight: "600px", objectFit: "contain" }}
            />
            {selectedObjectId && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 shadow-lg"
                onClick={deleteSelectedObject}
                title="Delete selected image"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Canvas Size
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize((s) => ({ ...s, width: parseInt(e.target.value) || 0 }))}
                    placeholder="Width"
                  />
                  <Input
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize((s) => ({ ...s, height: parseInt(e.target.value) || 0 }))}
                    placeholder="Height"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SIZES.map((s) => (
                    <Button
                      key={s.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setCanvasSize({ width: s.width, height: s.height })}
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bgColor" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Background Color
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="bgColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Format
                </Label>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/png">PNG (Lossless)</SelectItem>
                    <SelectItem value="image/jpeg">JPEG</SelectItem>
                    <SelectItem value="image/webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(exportFormat === "image/jpeg" || exportFormat === "image/webp") && (
                <div className="space-y-2">
                  <Label>Quality: {Math.round(exportQuality[0] * 100)}%</Label>
                  <Slider value={exportQuality} onValueChange={setExportQuality} max={1} step={0.01} />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleExport} variant="gradient" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Image
            </Button>
            <Button onClick={clearCanvas} variant="outline">
              Clear Canvas
            </Button>
          </div>
        </Card>
      )}

      {canvasObjects.length === 0 && uploadedImages.length > 0 && (
        <Card className="glass p-8 text-center">
          <p className="text-muted-foreground">Click on any uploaded image above to add it to the canvas</p>
        </Card>
      )}
    </motion.div>
  );
};
