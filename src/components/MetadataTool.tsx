import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/UploadZone";
import { ToolDescription } from "@/components/ToolDescription";
import { Download, FileX, Info, Check } from "lucide-react";
import { toast } from "sonner";

interface ImageMetadata {
  fileName: string;
  fileSize: string;
  dimensions: string;
  fileType: string;
  lastModified: string;
}

export const MetadataTool = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setOriginalImage(file);
    setCleanedBlob(null);

    const img = new Image();
    img.onload = () => {
      const meta: ImageMetadata = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        dimensions: `${img.width} × ${img.height}`,
        fileType: file.type,
        lastModified: new Date(file.lastModified).toLocaleDateString(),
      };
      setMetadata(meta);
    };
    img.src = URL.createObjectURL(file);

    toast.success("Image loaded! Metadata detected.");
  };

  const cleanMetadata = async () => {
    if (!originalImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        toast.error("Failed to process image");
        return;
      }

      // Draw image to canvas (this removes all EXIF data)
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCleanedBlob(blob);
            toast.success("Metadata removed successfully!");
          } else {
            toast.error("Failed to create cleaned image");
          }
        },
        originalImage.type || 'image/png',
        0.95
      );
    };
    img.src = URL.createObjectURL(originalImage);
  };

  const handleDownload = () => {
    if (!cleanedBlob) return;

    const url = URL.createObjectURL(cleanedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned-${Date.now()}.${originalImage?.type.split('/')[1] || 'png'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cleaned image downloaded!");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold mb-4 gradient-text">Metadata Cleaner</h2>
        <p className="text-muted-foreground mb-6">
          Remove EXIF data and metadata from your images for privacy
        </p>

        {!originalImage ? (
          <UploadZone onFilesSelected={handleFilesSelected} multiple={false} />
        ) : (
          <div className="space-y-6">
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-2">Original Image</h3>
              <img
                src={URL.createObjectURL(originalImage)}
                alt="Original"
                className="w-full rounded-lg max-h-96 object-contain bg-muted/20"
              />
            </div>

            {metadata && (
              <div className="glass rounded-xl p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Image Information
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">File Name</span>
                    <span className="font-mono">{metadata.fileName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">File Size</span>
                    <span className="font-mono">{metadata.fileSize}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-mono">{metadata.dimensions}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-mono">{metadata.fileType}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Last Modified</span>
                    <span className="font-mono">{metadata.lastModified}</span>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> EXIF data may include camera model, GPS location, 
                    timestamps, and other sensitive information. Cleaning removes all metadata 
                    while preserving image quality.
                  </p>
                </div>
              </div>
            )}

            {!cleanedBlob && (
              <Button
                onClick={cleanMetadata}
                className="w-full"
                variant="gradient"
                size="lg"
              >
                <FileX className="w-4 h-4 mr-2" />
                Remove Metadata
              </Button>
            )}

            {cleanedBlob && (
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 flex items-center gap-3 text-primary">
                  <Check className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Metadata Removed</p>
                    <p className="text-sm text-muted-foreground">
                      New size: {formatFileSize(cleanedBlob.size)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  className="w-full"
                  variant="gradient"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Cleaned Image
                </Button>

                <Button
                  onClick={() => {
                    setOriginalImage(null);
                    setMetadata(null);
                    setCleanedBlob(null);
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

      <ToolDescription
        title="Metadata Cleaner"
        description="Remove EXIF data and metadata from images to protect your privacy. GPS location, camera info, timestamps, and other sensitive data are completely removed while preserving image quality."
        benefits={["Remove GPS location data", "Delete camera information", "Privacy protection", "Maintains image quality"]}
        howTo={[
          { title: "Upload Image", description: "Upload the image you want to clean" },
          { title: "View Metadata", description: "Review what metadata is present in your image" },
          { title: "Remove & Download", description: "Remove all metadata and download the cleaned image" }
        ]}
        faqs={[
          { question: "What is EXIF data?", answer: "EXIF data includes camera settings, GPS location, date/time, and other information embedded in photos." },
          { question: "Why should I remove metadata?", answer: "Metadata can reveal sensitive information like your location, device details, and when/where photos were taken. Removing it protects your privacy when sharing images online." }
        ]}
      />
    </div>
  );
};
