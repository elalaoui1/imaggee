import { useState, useRef, useEffect } from "react";
import { Canvas as FabricCanvas, Circle, Image as FabricImage, Text as FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Eraser, Download, RotateCcw, Smile } from "lucide-react";
import { ToolDescription } from "./ToolDescription";

const EMOJI_LIST = ["😀", "😍", "😎", "🥳", "😂", "🤣", "😊", "😇", "🤩", "😋", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "😐", "😑", "😶", "🙄", "😏", "😬", "😮", "😯", "😴", "😪", "😵", "🤯", "🥴", "🥳", "😎", "🤓", "🧐", "❤️", "💕", "💖", "💗", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💝", "💘", "💖", "⭐", "✨", "💫", "🌟", "🔥", "💥", "⚡", "💯", "✅", "❌", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪"];

export const BlurEmojiTool = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<"blur" | "emoji">("blur");
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(30);
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [selectedEmoji, setSelectedEmoji] = useState("😀");
  const [isDrawing, setIsDrawing] = useState(false);
  const [blurMask, setBlurMask] = useState<ImageData | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<any[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Make canvas responsive based on container width
    const containerWidth = canvasRef.current.parentElement?.clientWidth || 800;
    const canvasWidth = Math.min(containerWidth - 32, 800); // Max 800px, minus padding
    const canvasHeight = Math.min(canvasWidth * 0.75, 600); // 4:3 aspect ratio, max 600px

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "#f5f5f5",
      selection: false,
    });

    setFabricCanvas(canvas);

    // Create mask canvas for blur selection
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvasWidth;
    maskCanvas.height = canvasHeight;
    maskCanvasRef.current = maskCanvas;

    // Handle window resize
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

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        if (fabricCanvas) {
          fabricCanvas.clear();
          
          // Calculate scaling to fit canvas while maintaining aspect ratio
          const scale = Math.min(
            fabricCanvas.width! / img.width,
            fabricCanvas.height! / img.height
          ) * 0.95; // 95% to add padding

          FabricImage.fromURL(event.target?.result as string).then((fabricImg) => {
            fabricImg.scale(scale);
            // Center the image on canvas
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
            fabricCanvas.renderAll();
          });

          // Reset mask
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

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (e: any) => {
      if (!uploadedImage) return;
      
      if (mode === "blur") {
        setIsDrawing(true);
        drawOnMask(e.pointer.x, e.pointer.y);
      } else {
        // Emoji mode - only add emoji if clicking on empty space
        const target = e.target;
        if (!target || target.type === 'image') {
          addEmoji(e.pointer.x, e.pointer.y);
        }
      }
    };

    const handleMouseMove = (e: any) => {
      if (!uploadedImage) return;
      
      if (mode === "blur") {
        // Always show preview circle when in blur mode
        drawPreviewCircle(e.pointer.x, e.pointer.y);
        
        // Draw on mask if mouse is pressed
        if (isDrawing) {
          drawOnMask(e.pointer.x, e.pointer.y);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      if (mode === "blur") {
        applyBlur();
      }
    };

    const handleMouseOut = () => {
      // Remove preview circle when mouse leaves canvas
      if (!fabricCanvas) return;
      const objects = fabricCanvas.getObjects();
      objects.forEach(obj => {
        if ((obj as any).name === "preview-circle") {
          fabricCanvas.remove(obj);
        }
      });
      fabricCanvas.renderAll();
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
  }, [fabricCanvas, isDrawing, uploadedImage, mode, tool, brushSize, selectedEmoji]);

  const drawOnMask = (x: number, y: number) => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = tool === "brush" ? "source-over" : "destination-out";
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Show preview circle
    drawPreviewCircle(x, y);
  };

  const drawPreviewCircle = (x: number, y: number) => {
    if (!fabricCanvas) return;
    
    // Remove previous preview circles
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if ((obj as any).name === "preview-circle") {
        fabricCanvas.remove(obj);
      }
    });

    // Draw new preview circle with blue color
    const circle = new Circle({
      left: x - brushSize / 2,
      top: y - brushSize / 2,
      radius: brushSize / 2,
      fill: tool === "brush" ? "rgba(59, 130, 246, 0.4)" : "rgba(239, 68, 68, 0.4)",
      stroke: tool === "brush" ? "#3B82F6" : "#EF4444",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
    (circle as any).name = "preview-circle";
    fabricCanvas.add(circle);
    fabricCanvas.renderAll();
  };

  const applyBlur = () => {
    if (!fabricCanvas || !uploadedImage || !maskCanvasRef.current) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = fabricCanvas.width!;
    tempCanvas.height = fabricCanvas.height!;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Draw current canvas state
    const dataUrl = fabricCanvas.toDataURL();
    const img = new Image();
    img.onload = () => {
      tempCtx.drawImage(img, 0, 0);

      // Apply blur filter
      tempCtx.filter = `blur(${blurIntensity}px)`;
      tempCtx.drawImage(img, 0, 0);
      tempCtx.filter = "none";

      // Get mask data
      const maskCtx = maskCanvasRef.current!.getContext("2d");
      if (!maskCtx) return;
      const maskData = maskCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Composite blurred image with mask
      const blurredData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.drawImage(img, 0, 0);
      const originalData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

      for (let i = 0; i < maskData.data.length; i += 4) {
        const alpha = maskData.data[i + 3] / 255;
        if (alpha > 0) {
          originalData.data[i] = blurredData.data[i];
          originalData.data[i + 1] = blurredData.data[i + 1];
          originalData.data[i + 2] = blurredData.data[i + 2];
        }
      }

      tempCtx.putImageData(originalData, 0, 0);

      // Update canvas
      FabricImage.fromURL(tempCanvas.toDataURL()).then((fabricImg) => {
        fabricCanvas.clear();
        fabricImg.set({
          selectable: false,
          evented: false,
        });
        fabricCanvas.add(fabricImg);
        fabricCanvas.renderAll();
      });
    };
    img.src = dataUrl;
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

    // Clear mask
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
    }

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

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 gradient-text">Blur & Emoji Editor</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          Add blur effects or emojis to your images with live preview
        </p>

        <Card className="glass p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Upload Section */}
            <div>
              <Label htmlFor="image-upload" className="text-lg font-semibold mb-2 block">
                Upload Image
              </Label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
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

                    <div>
                      <Label className="mb-2 block">Blur Intensity: {blurIntensity}px</Label>
                      <Slider
                        value={[blurIntensity]}
                        onValueChange={(value) => setBlurIntensity(value[0])}
                        min={2}
                        max={30}
                        step={1}
                      />
                    </div>
                  </div>
                )}

                {/* Emoji Mode Controls */}
                {mode === "emoji" && (
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Select Emoji</Label>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`text-2xl p-2 sm:p-3 rounded hover:bg-muted/50 transition-colors active:scale-95 ${
                              selectedEmoji === emoji ? "bg-primary/20 ring-2 ring-primary" : ""
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedEmojis.length > 0 && (
                      <Button onClick={handleDeleteEmoji} variant="destructive" className="w-full">
                        <Eraser className="w-4 h-4 mr-2" />
                        Delete Selected Emoji{selectedEmojis.length > 1 ? 's' : ''}
                      </Button>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Click to place emoji. Click emoji to select, then drag to move or resize. Delete selected emojis with the button above.
                    </p>
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

        {/* Canvas */}
        <Card className="glass p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="w-full overflow-auto">
            <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-lg touch-none" style={{ display: 'block', margin: '0 auto' }} />
          </div>
        </Card>

        {/* Tool Description */}
        <ToolDescription
          title="Blur & Emoji Editor"
          description="Add creative blur effects or fun emojis to your images with precision control and live preview."
          benefits={[
            "Selective blur areas to protect privacy or add artistic effects",
            "Add emojis with full control over size and placement",
            "Live preview shows changes as you work",
            "Adjustable brush size and blur intensity",
            "Export high-quality edited images"
          ]}
          howTo={[
            { title: "Upload Image", description: "Upload your image using the file selector" },
            { title: "Select Mode", description: "Choose Blur Mode to add blur effects or Emoji Mode to add emojis" },
            { title: "Apply Effects (Blur)", description: "For blur: Select areas with the brush, use eraser to refine selection" },
            { title: "Add Emojis", description: "For emoji: Choose your emoji and click to place. Click emoji to select and move/resize." },
            { title: "Adjust Settings", description: "Adjust settings like brush size and blur intensity as needed" },
            { title: "Download", description: "Download your edited image when finished" }
          ]}
          faqs={[
            {
              question: "Can I blur multiple areas of the same image?",
              answer: "Yes! Keep using the brush tool to select multiple areas. The blur will be applied to all selected regions."
            },
            {
              question: "How do I remove blur from an area?",
              answer: "Switch to the Eraser tool in Blur Mode and paint over the areas you want to unblur before applying the effect."
            },
            {
              question: "Can I resize or move emojis after placing them?",
              answer: "Absolutely! Click on any placed emoji to select it, then drag to move or use the corner handles to resize."
            },
            {
              question: "What's the difference between Blur Mode and Emoji Mode?",
              answer: "Blur Mode lets you selectively blur parts of your image. Emoji Mode lets you place decorative emojis anywhere on the image."
            },
            {
              question: "Is my image uploaded to any server?",
              answer: "No! All editing happens locally in your browser. Your images never leave your device, ensuring complete privacy."
            },
            {
              question: "Can I undo my changes?",
              answer: "Use the Reset button to restore your original image at any time and start over with fresh edits."
            }
          ]}
        />
      </div>
    </div>
  );
};
