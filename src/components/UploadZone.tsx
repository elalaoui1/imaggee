import { useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
}

export const UploadZone = ({ 
  onFilesSelected, 
  accept = "image/*",
  multiple = false 
}: UploadZoneProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) {
      toast({
        title: "No images found",
        description: "Please drop image files only",
        variant: "destructive",
      });
      return;
    }
    
    onFilesSelected(files);
  }, [onFilesSelected, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="relative"
    >
      <label
        htmlFor="file-upload"
        className="glass rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-300 hover:glow-primary group"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload className="w-16 h-16 text-primary mb-4 group-hover:text-accent transition-colors" />
        </motion.div>
        
        <h3 className="text-xl font-semibold mb-2">Drop images here</h3>
        <p className="text-muted-foreground text-center mb-4">
          or click to browse
          <br />
          <span className="text-sm">Supports JPEG, PNG, WebP, AVIF, GIF, BMP, SVG</span>
        </p>
        
        <div className="flex gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            {multiple ? "Multiple files" : "Single file"}
          </div>
        </div>
        
        <input
          id="file-upload"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </motion.div>
  );
};
