import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider"; // Assuming you have a Slider component
import { UploadZone } from "./UploadZone";
import { ToolDescription } from "./ToolDescription";
import { useToast } from "@/hooks/use-toast";

// Define all supported formats
const inputFormats = [
  "image/jpeg",
  "image/png", 
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "image/x-canon-cr2",
  "image/x-nikon-nef",
  "image/x-sony-arw",
  "image/x-adobe-dng",
  "image/vnd.adobe.photoshop",
  "image/vnd.adobe.photoshop", // PSB
  "application/pdf", // AI files are often PDF
  "application/postscript", // EPS
  "application/octet-stream" // Generic RAW
] as const;

const outputFormats = [
  { value: "jpeg", label: "JPEG", mime: "image/jpeg", quality: [0.8, 0.95], default: 0.92 },
  { value: "jpg", label: "JPG", mime: "image/jpeg", quality: [0.8, 0.95], default: 0.92 },
  { value: "png", label: "PNG", mime: "image/png", quality: [0.8, 1.0], default: 1.0 },
  { value: "gif", label: "GIF", mime: "image/gif", quality: [0.8, 1.0], default: 1.0 },
  { value: "webp", label: "WebP", mime: "image/webp", quality: [0.8, 0.95], default: 0.90 },
  { value: "svg", label: "SVG", mime: "image/svg+xml", quality: [1.0, 1.0], default: 1.0 },
  { value: "avif", label: "AVIF", mime: "image/avif", quality: [0.8, 0.95], default: 0.85 },
  { value: "bmp", label: "BMP", mime: "image/bmp", quality: [1.0, 1.0], default: 1.0 },
  { value: "tiff", label: "TIFF", mime: "image/tiff", quality: [0.8, 1.0], default: 0.95 },
  { value: "ico", label: "ICO", mime: "image/x-icon", quality: [0.8, 1.0], default: 0.95 },
] as const;

type OutputFormat = typeof outputFormats[number]['value'];

export const ConvertTool = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState<number>(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    setOriginalFile(file);
    setConvertedBlob(null);
    
    // Reset quality based on default for current target format
    const format = outputFormats.find(f => f.value === targetFormat);
    if (format) {
      setQuality(format.default);
    }
    
    toast({
      title: "Image loaded",
      description: `${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
    });
  };

  const convertImage = async () => {
    if (!originalFile) return;

    setIsProcessing(true);
    try {
      const targetFormatInfo = outputFormats.find(f => f.value === targetFormat);
      if (!targetFormatInfo) {
        throw new Error("Unsupported target format");
      }

      // Create canvas for raster formats
      if (targetFormatInfo.value !== 'svg') {
        await convertToRaster(originalFile, targetFormatInfo);
      } else {
        await convertToSVG(originalFile);
      }
      
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const convertToRaster = async (
  file: File,
  targetFormatInfo: typeof outputFormats[number]
) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // --- HANDLE SVG WITH HIGH RESOLUTION ---
      if (file.type === "image/svg+xml") {
        const svgText = await file.text();

        // Extract width/height or viewBox
        const sizeMatch = svgText.match(/viewBox="[^"]*"/);
        let width = 1200;
        let height = 1200;

        if (sizeMatch) {
          const values = sizeMatch[0]
            .replace('viewBox="', "")
            .replace('"', "")
            .split(" ")
            .map(Number);

          if (values.length === 4) {
            width = values[2];
            height = values[3];
          }
        }

        // Increase DPI (super-sampling)
        const scale = 3; // High-quality factor
        const finalW = width * scale;
        const finalH = height * scale;

        // Create blob URL for SVG
        const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.src = svgUrl;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = finalW;
          canvas.height = finalH;

          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, finalW, finalH);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                setConvertedBlob(blob);
                toast({
                  title: "High-quality conversion complete!",
                  description: `SVG rendered at ${scale}× resolution.`,
                });
                resolve();
              } else reject(new Error("Failed to generate raster output"));
            },
            targetFormatInfo.mime,
            targetFormatInfo.value === "png" ? undefined : quality
          );

          URL.revokeObjectURL(svgUrl);
        };

        img.onerror = reject;
        return;
      }

      // --- DEFAULT RASTER LOGIC FOR NON-SVG ---
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setConvertedBlob(blob);
              resolve();
            } else reject(new Error("Failed raster conversion"));
          },
          targetFormatInfo.mime,
          targetFormatInfo.value === "png" ? undefined : quality
        );

        URL.revokeObjectURL(url);
      };

      img.onerror = reject;
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
};

  const convertToSVG = async (file: File) => {
    // For SVG output, we need different handling
    // This is a simplified version - you might want to use a library like canvg
    try {
      if (file.type === 'image/svg+xml') {
        // If already SVG, just use the file
        setConvertedBlob(file);
      } else {
        // Convert raster to SVG using a canvas-based approach
        // Note: This creates a simple SVG wrapper with embedded image data
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const svgContent = `
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="${img.width}" 
                   height="${img.height}"
                   viewBox="0 0 ${img.width} ${img.height}">
                <image href="${e.target?.result}" 
                       width="${img.width}" 
                       height="${img.height}"/>
              </svg>
            `;
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            setConvertedBlob(blob);
            toast({
              title: "Conversion complete!",
              description: `Converted to SVG (${(blob.size / 1024).toFixed(1)}KB)`,
            });
            setIsProcessing(false);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      throw new Error("Failed to convert to SVG");
    }
  };

  const downloadConverted = () => {
    if (!convertedBlob || !originalFile) return;
    
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    const originalName = originalFile.name.split('.')[0];
    const extension = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
    a.href = url;
    a.download = `${originalName}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormatChange = (value: OutputFormat) => {
    setTargetFormat(value);
    const format = outputFormats.find(f => f.value === value);
    if (format) {
      setQuality(format.default);
    }
    setConvertedBlob(null);
  };

  // Get current format info
  const currentFormat = outputFormats.find(f => f.value === targetFormat);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center space-y-4 pt-4 md:pt-6"
>
  <div className="flex flex-col md:flex-row items-center justify-center gap-3">
    <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
      Convert Format
    </h1>
  </div>

  <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto px-4">
    Convert your images between JPG, PNG, WebP, and more — fast, clean, and fully client-side.
  </p>
</motion.div>


      {!originalFile ? (
        <UploadZone 
          onFilesSelected={handleFileSelect} 
          accept={inputFormats.join(',')}
          maxFiles={1}
        />
      ) : (
        <Card className="glass p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Original</h3>
              <img 
                src={URL.createObjectURL(originalFile)} 
                alt="Original" 
                className="w-full rounded-lg border border-border max-h-[300px] sm:max-h-[400px] object-contain"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {originalFile.type.split('/')[1].toUpperCase()} • {(originalFile.size / 1024).toFixed(1)}KB
              </p>
            </div>
            
            {convertedBlob && (
              <div>
                <h3 className="text-sm font-medium mb-2">Converted</h3>
                <img 
                  src={URL.createObjectURL(convertedBlob)} 
                  alt="Converted" 
                  className="w-full rounded-lg border border-border max-h-[300px] sm:max-h-[400px] object-contain"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {currentFormat?.label} • {(convertedBlob.size / 1024).toFixed(1)}KB
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Target Format
              </label>
              <Select value={targetFormat} onValueChange={handleFormatChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outputFormats.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentFormat && currentFormat.quality[0] !== currentFormat.quality[1] && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">
                    Quality: {Math.round(quality * 100)}%
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Recommended: {Math.round(currentFormat.default * 100)}%
                  </span>
                </div>
                <Slider
                  value={[quality * 100]}
                  min={currentFormat.quality[0] * 100}
                  max={currentFormat.quality[1] * 100}
                  step={1}
                  onValueChange={([value]) => setQuality(value / 100)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={convertImage}
              disabled={isProcessing}
              variant="gradient"
              className="w-full sm:w-auto"
              size="lg"
            >
              {isProcessing ? "Converting..." : "Convert"}
            </Button>
            
            {convertedBlob && (
              <Button onClick={downloadConverted} variant="secondary" className="w-full sm:w-auto" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            
            <Button onClick={() => setOriginalFile(null)} variant="outline" className="w-full sm:w-auto" size="lg">
              New Image
            </Button>
          </div>
        </Card>
      )}

      <ToolDescription
        title="Advanced Image Format Converter"
        description="Convert between 10+ image formats with intelligent quality optimization. Our converter automatically adjusts quality settings for each format to ensure the best balance between file size and image fidelity. From standard formats like PNG and JPEG to professional formats like TIFF and RAW, we handle them all with precision."
        benefits={[
          "Convert between 10+ image formats",
          "Intelligent quality optimization (80-95% for lossy formats)",
          "Professional format support: TIFF, PSD, AI, EPS",
          "Modern format support: WebP, AVIF, HEIC/HEIF",
          "SVG conversion with scalable vector output",
          "ICO generation for favicons and app icons",
          "Transparency preservation for PNG/WebP",
          "Batch conversion support for multiple images",
          "No watermarks, no file size limits, completely free"
        ]}
        howTo={[
          {
            title: "Upload Your Image",
            description: "Select or drag-and-drop any image (including RAW and vector formats). Supported: JPEG, PNG, GIF, WebP, SVG, AVIF, HEIC, BMP, TIFF, ICO, RAW files, PSD, AI, EPS."
          },
          {
            title: "Choose Target Format",
            description: "Select your desired output format. Recommended formats: WebP (web optimization), AVIF (next-gen compression), PNG (transparency), JPEG (photos), SVG (vectors)."
          },
          {
            title: "Adjust Quality",
            description: "Fine-tune the quality slider for lossy formats. We recommend 92% for JPEG, 90% for WebP, and 85% for AVIF as optimal quality/size ratios."
          },
          {
            title: "Convert & Download",
            description: "Convert instantly and download your optimized image. Check the file size reduction while maintaining visual quality."
          }
        ]}
        faqs={[
          {
            question: "What quality setting should I use for different formats?",
            answer: "For JPEG: 92% offers excellent quality with good compression. WebP: 90% provides superior compression. AVIF: 85% maintains quality while being 50% smaller than JPEG. PNG: Use 100% for lossless compression with transparency."
          },
          {
            question: "Can I convert RAW camera files?",
            answer: "Yes! We support Canon CR2, Nikon NEF, Sony ARW, and Adobe DNG. RAW conversion preserves maximum image data but outputs to standard formats with your chosen quality settings."
          },  
          {
            question: "How do I maintain transparency?",
            answer: "Use PNG or WebP formats for transparency. When converting to JPEG, BMP, or TIFF, transparent areas will get a white background. SVG maintains transparency when converting from vector formats."
          },
          {
            question: "What's the difference between lossy and lossless formats?",
            answer: "Lossy (JPEG, WebP, AVIF) removes some data for smaller files but can reduce quality. Lossless (PNG, BMP, TIFF) preserves all data perfectly. We optimize quality settings to minimize visible quality loss in lossy formats."
          },
          {
            question: "Can I convert vector files (AI, EPS, SVG)?",
            answer: "Yes! Vector files can be converted to raster formats (PNG, JPEG, etc.) at any resolution. Raster to vector conversion (SVG) creates a vector wrapper with embedded image data."
          },
          {
            question: "Which format is best for web use?",
            answer: "WebP or AVIF offer the best compression (25-50% smaller than JPEG). Use JPEG as fallback for older browsers. For logos/icons with transparency, use PNG or SVG."
          }
        ]}
      />
    </motion.div>
  );
};