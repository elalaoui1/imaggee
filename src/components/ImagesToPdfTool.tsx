import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, Download, FileText, Image as ImageIcon,
  LayoutGrid, LayoutList, Columns, Rows, Square,
  Maximize2, Minimize2, ZoomIn, ZoomOut,
  RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Trash2, Plus, X, Move, Grid, GripVertical,
  Settings, Palette, Type, Printer, Eye,
  EyeOff, Lock, Unlock, Layers, Scissors,
  FileType, FilePlus, FileMinus, FileCheck,
  AlertCircle, CheckCircle, RefreshCw,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Camera, FolderOpen, FolderPlus, FolderMinus,
  Layers2, Expand, Shuffle, Filter,
  Heart, Star, Bookmark, Share2,
  Image as LucideImage, FileImage,
  Images, FileDown, UploadCloud, CloudDownload,
  Save, Copy, Scissors as ScissorsIcon,
  Crop, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, Hash,
  Calendar, Clock, User, Tag,
  PenTool, Ruler, Edit, Eraser,
  Shield, Zap, Sparkles, Rocket,
  Smartphone, Tablet, Monitor,
  Award, Trophy, Target, TrendingUp
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Types
interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
  dimensions: { width: number; height: number };
  selected: boolean;
  order: number;
}

interface PDFConfig {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5';
  orientation: 'portrait' | 'landscape';
  margin: number;
  quality: 'low' | 'medium' | 'high' | 'very-high';
  compression: boolean;
  imageLayout: 'full-page' | 'single' | 'grid' | 'custom';
  gridColumns: number;
  gridRows: number;
  spacing: number;
  border: boolean;
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
  watermark: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  pageNumbers: boolean;
  header: boolean;
  headerText: string;
  footer: boolean;
  footerText: string;
}

interface LayoutTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  gridColumns: number;
  gridRows: number;
  spacing: number;
}

interface PagePreview {
  id: string;
  images: UploadedImage[];
  layout: LayoutTemplate;
}

// Sortable Image Component
const SortableImage = ({ image, onSelect, onRemove, isSelected }: {
  image: UploadedImage;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group"
    >
      <div
        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-500/20 ring-offset-1'
            : 'border-slate-700 hover:border-blue-400/50'
        } ${isDragging ? 'z-50 shadow-2xl' : ''}`}
        onClick={() => onSelect(image.id)}
      >
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 z-10"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        )}

        {/* Drag handle */}
        <motion.div
          className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          {...attributes}
          {...listeners}
        >
          <div className="w-6 h-6 rounded-full bg-slate-800/90 backdrop-blur-sm flex items-center justify-center cursor-grab active:cursor-grabbing">
            <GripVertical className="w-3 h-3 text-slate-300" />
          </div>
        </motion.div>

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
          <img
            src={image.preview}
            alt={image.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Overlay info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs text-white font-medium truncate">{image.name}</p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-slate-300">{image.size}</span>
            <span className="text-xs text-slate-300">
              {image.dimensions.width}×{image.dimensions.height}
            </span>
          </div>
        </div>

        {/* Remove button */}
        <motion.button
          className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
        >
          <div className="w-6 h-6 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-red-600">
            <X className="w-3 h-3 text-white" />
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function ImagesToPdfTool() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [pdfConfig, setPdfConfig] = useState<PDFConfig>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 20,
    quality: 'high',
    compression: true,
    imageLayout: 'grid',
    gridColumns: 2,
    gridRows: 2,
    spacing: 10,
    border: true,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadow: true,
    watermark: false,
    watermarkText: 'Confidential',
    watermarkOpacity: 0.3,
    pageNumbers: true,
    header: false,
    headerText: 'Images PDF',
    footer: true,
    footerText: 'Page {page} of {total}',
  });
  const [isConverting, setIsConverting] = useState(false);
  const [previewMode, setPreviewMode] = useState<'grid' | 'list' | 'preview'>('grid');
  const [activeTab, setActiveTab] = useState<'images' | 'layout' | 'settings'>('images');
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Layout templates
  const layoutTemplates: LayoutTemplate[] = [
    {
      id: 'single',
      name: 'Single Image',
      icon: <Maximize2 className="w-4 h-4" />,
      description: 'One image per page, full size',
      gridColumns: 1,
      gridRows: 1,
      spacing: 0
    },
    {
      id: 'grid-2x2',
      name: '2×2 Grid',
      icon: <Grid className="w-4 h-4" />,
      description: 'Four images per page',
      gridColumns: 2,
      gridRows: 2,
      spacing: 10
    },
    {
      id: 'grid-3x3',
      name: '3×3 Grid',
      icon: <Grid className="w-4 h-4" />,
      description: 'Nine images per page',
      gridColumns: 3,
      gridRows: 3,
      spacing: 8
    },
    {
      id: 'vertical',
      name: 'Vertical Stack',
      icon: <LayoutList className="w-4 h-4" />,
      description: 'Images stacked vertically',
      gridColumns: 1,
      gridRows: 3,
      spacing: 15
    },
    {
      id: 'horizontal',
      name: 'Horizontal Row',
      icon: <Columns className="w-4 h-4" />,
      description: 'Images in a single row',
      gridColumns: 3,
      gridRows: 1,
      spacing: 15
    },
    {
      id: 'mixed',
      name: 'Mixed Layout',
      icon: <Layers className="w-4 h-4" />,
      description: 'Varied image sizes',
      gridColumns: 2,
      gridRows: 3,
      spacing: 12
    },
    {
      id: 'custom',
      name: 'Custom Grid',
      icon: <Settings className="w-4 h-4" />,
      description: 'Configure your own layout',
      gridColumns: pdfConfig.gridColumns,
      gridRows: pdfConfig.gridRows,
      spacing: pdfConfig.spacing
    }
  ];

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  // Process uploaded files
  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    const newImages: UploadedImage[] = [];
    
    for (const file of imageFiles) {
      try {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        // Get image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
          };
          img.src = preview;
        });

        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview,
          name: file.name,
          size: formatFileSize(file.size),
          dimensions,
          selected: true,
          order: uploadedImages.length + newImages.length,
        });
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    if (newImages.length > 0) {
      setUploadedImages(prev => [...prev, ...newImages]);
      setSelectedImages(prev => new Set([...Array.from(prev), ...newImages.map(img => img.id)]));
      toast.success(`Added ${newImages.length} image${newImages.length > 1 ? 's' : ''}`);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle image selection
  const handleSelectImage = (id: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle image removal
  const handleRemoveImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.info('Image removed');
  };

  // Select all images
  const handleSelectAll = () => {
    if (selectedImages.size === uploadedImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(uploadedImages.map(img => img.id)));
    }
  };

  // Remove selected images
  const handleRemoveSelected = () => {
    setUploadedImages(prev => prev.filter(img => !selectedImages.has(img.id)));
    setSelectedImages(new Set());
    toast.info(`Removed ${selectedImages.size} image${selectedImages.size > 1 ? 's' : ''}`);
  };

  // Handle drag end for sorting
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setUploadedImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Update page previews when images or layout changes
  useEffect(() => {
    if (uploadedImages.length === 0) {
      setPagePreviews([]);
      return;
    }

    const selectedLayout = layoutTemplates.find(t => t.id === pdfConfig.imageLayout) || layoutTemplates[0];
    const imagesPerPage = selectedLayout.gridColumns * selectedLayout.gridRows;
    const pages: PagePreview[] = [];
    
    // Group images by page
    for (let i = 0; i < uploadedImages.length; i += imagesPerPage) {
      const pageImages = uploadedImages.slice(i, i + imagesPerPage);
      pages.push({
        id: `page-${i}`,
        images: pageImages,
        layout: selectedLayout,
      });
    }
    
    setPagePreviews(pages);
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1));
    }
  }, [uploadedImages, pdfConfig.imageLayout, pdfConfig.gridColumns, pdfConfig.gridRows]);

  // Handle layout template selection
  const handleLayoutSelect = (templateId: string) => {
    const template = layoutTemplates.find(t => t.id === templateId);
    if (template) {
      setPdfConfig(prev => ({
        ...prev,
        imageLayout: templateId as PDFConfig['imageLayout'],
        gridColumns: template.gridColumns,
        gridRows: template.gridRows,
        spacing: template.spacing,
      }));
    }
  };

  // Generate PDF with jspdf (Working version)
  const generatePDF = async () => {
    if (uploadedImages.length === 0) {
      toast.error('Please upload some images first');
      return;
    }

    setIsConverting(true);
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: pdfConfig.orientation,
        unit: 'mm',
        format: pdfConfig.pageSize.toLowerCase(),
      });

      const selectedLayout = layoutTemplates.find(t => t.id === pdfConfig.imageLayout) || layoutTemplates[0];
      const imagesPerPage = selectedLayout.gridColumns * selectedLayout.gridRows;
      
      // Calculate page dimensions in mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate margins in mm
      const margin = pdfConfig.margin;
      const usableWidth = pageWidth - (margin * 2);
      const usableHeight = pageHeight - (margin * 2);
      
      // Calculate grid cell dimensions
      const cellWidth = usableWidth / selectedLayout.gridColumns;
      const cellHeight = usableHeight / selectedLayout.gridRows;
      
      // Calculate spacing in mm (convert from px to mm)
      const spacing = pdfConfig.spacing * 0.264583;
      
      // Process images in batches per page
      for (let pageIndex = 0; pageIndex < uploadedImages.length; pageIndex += imagesPerPage) {
        const pageImages = uploadedImages.slice(pageIndex, pageIndex + imagesPerPage);
        
        // Add new page for all except first page
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        // Add header if enabled
        if (pdfConfig.header) {
          pdf.setFontSize(12);
          pdf.setTextColor(40, 40, 40);
          pdf.text(
            pdfConfig.headerText,
            pageWidth / 2,
            margin - 5,
            { align: 'center' }
          );
        }
        
        // Add images to the page
        for (let i = 0; i < pageImages.length; i++) {
          const image = pageImages[i];
          const row = Math.floor(i / selectedLayout.gridColumns);
          const col = i % selectedLayout.gridColumns;
          
          // Calculate position
          const x = margin + (col * (cellWidth + spacing));
          const y = margin + (row * (cellHeight + spacing)) + (pdfConfig.header ? 5 : 0);
          
          try {
            // Create an image element to load the image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                // Calculate aspect ratio
                const imgAspectRatio = img.width / img.height;
                const cellAspectRatio = cellWidth / cellHeight;
                
                let drawWidth, drawHeight, drawX, drawY;
                
                if (imgAspectRatio > cellAspectRatio) {
                  // Image is wider than cell
                  drawWidth = cellWidth;
                  drawHeight = cellWidth / imgAspectRatio;
                  drawX = x;
                  drawY = y + (cellHeight - drawHeight) / 2;
                } else {
                  // Image is taller than cell
                  drawHeight = cellHeight;
                  drawWidth = cellHeight * imgAspectRatio;
                  drawX = x + (cellWidth - drawWidth) / 2;
                  drawY = y;
                }
                
                // Add border if enabled
                if (pdfConfig.border) {
                  pdf.setDrawColor(pdfConfig.borderColor);
                  pdf.setLineWidth(pdfConfig.borderWidth * 0.264583);
                  pdf.rect(x, y, cellWidth, cellHeight);
                }
                
                // Add image to PDF
                const imageType = image.name.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
                pdf.addImage(
                  img,
                  imageType,
                  drawX,
                  drawY,
                  drawWidth,
                  drawHeight
                );
                
                resolve();
              };
              
              img.onerror = () => {
                console.error('Failed to load image:', image.name);
                reject(new Error(`Failed to load image: ${image.name}`));
              };
              
              img.src = image.preview;
            });
          } catch (error) {
            console.error('Error adding image to PDF:', error);
            toast.error(`Failed to add image: ${image.name}`);
          }
        }
        
        // Add watermark if enabled
        if (pdfConfig.watermark) {
          pdf.setFontSize(40);
          pdf.setTextColor(200, 200, 200);
          pdf.setGState(new pdf.GState({ opacity: pdfConfig.watermarkOpacity }));
          
          // Save current state
          pdf.saveGraphicsState();
          
          // Rotate and position watermark
          const textWidth = pdf.getTextWidth(pdfConfig.watermarkText);
          pdf.text(
            pdfConfig.watermarkText,
            pageWidth / 2 - textWidth / 2,
            pageHeight / 2,
            { angle: 45 }
          );
          
          // Restore state
          pdf.restoreGraphicsState();
        }
        
        // Add footer if enabled
        if (pdfConfig.footer) {
          const footerText = pdfConfig.footerText
            .replace('{page}', (Math.floor(pageIndex / imagesPerPage) + 1).toString())
            .replace('{total}', Math.ceil(uploadedImages.length / imagesPerPage).toString());
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            footerText,
            pageWidth / 2,
            pageHeight - margin + 5,
            { align: 'center' }
          );
        }
        
        // Add page numbers if enabled
        if (pdfConfig.pageNumbers) {
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `Page ${Math.floor(pageIndex / imagesPerPage) + 1} of ${Math.ceil(uploadedImages.length / imagesPerPage)}`,
            pageWidth - margin,
            pageHeight - margin + 5,
            { align: 'right' }
          );
        }
      }
      
      // Save the PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `images-to-pdf-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // Alternative method using html2canvas for exact preview replication
  const generatePDFWithCanvas = async () => {
    if (uploadedImages.length === 0) {
      toast.error('Please upload some images first');
      return;
    }

    setIsConverting(true);
    
    try {
      const pdf = new jsPDF({
        orientation: pdfConfig.orientation,
        unit: 'mm',
        format: pdfConfig.pageSize.toLowerCase(),
      });

      const selectedLayout = layoutTemplates.find(t => t.id === pdfConfig.imageLayout) || layoutTemplates[0];
      const imagesPerPage = selectedLayout.gridColumns * selectedLayout.gridRows;
      
      // Process each page
      for (let pageIndex = 0; pageIndex < uploadedImages.length; pageIndex += imagesPerPage) {
        const pageImages = uploadedImages.slice(pageIndex, pageIndex + imagesPerPage);
        
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        // Create a temporary container for rendering
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
        tempContainer.style.height = '1123px'; // A4 height in pixels at 96 DPI
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = `${pdfConfig.margin}px`;
        document.body.appendChild(tempContainer);
        
        // Add header if enabled
        if (pdfConfig.header) {
          const header = document.createElement('div');
          header.style.textAlign = 'center';
          header.style.marginBottom = '20px';
          header.style.paddingBottom = '10px';
          header.style.borderBottom = '1px solid #e2e8f0';
          
          const headerText = document.createElement('h3');
          headerText.textContent = pdfConfig.headerText;
          headerText.style.fontSize = '18px';
          headerText.style.fontWeight = 'bold';
          headerText.style.color = '#1e293b';
          
          header.appendChild(headerText);
          tempContainer.appendChild(header);
        }
        
        // Create grid layout
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gap = `${pdfConfig.spacing}px`;
        gridContainer.style.gridTemplateColumns = `repeat(${selectedLayout.gridColumns}, 1fr)`;
        gridContainer.style.gridTemplateRows = `repeat(${selectedLayout.gridRows}, 1fr)`;
        gridContainer.style.width = '100%';
        gridContainer.style.height = 'calc(100% - 60px)'; // Account for header/footer
        
        // Add images to grid
        pageImages.forEach((image, index) => {
          const cell = document.createElement('div');
          cell.style.position = 'relative';
          cell.style.overflow = 'hidden';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.backgroundColor = '#f8fafc';
          
          if (pdfConfig.border) {
            cell.style.border = `${pdfConfig.borderWidth}px solid ${pdfConfig.borderColor}`;
            cell.style.borderRadius = '4px';
          }
          
          if (pdfConfig.shadow) {
            cell.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }
          
          const img = document.createElement('img');
          img.src = image.preview;
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.objectFit = 'contain';
          
          cell.appendChild(img);
          gridContainer.appendChild(cell);
        });
        
        tempContainer.appendChild(gridContainer);
        
        // Add watermark if enabled
        if (pdfConfig.watermark) {
          const watermark = document.createElement('div');
          watermark.style.position = 'absolute';
          watermark.style.top = '0';
          watermark.style.left = '0';
          watermark.style.width = '100%';
          watermark.style.height = '100%';
          watermark.style.display = 'flex';
          watermark.style.alignItems = 'center';
          watermark.style.justifyContent = 'center';
          watermark.style.pointerEvents = 'none';
          watermark.style.opacity = pdfConfig.watermarkOpacity.toString();
          
          const watermarkText = document.createElement('div');
          watermarkText.textContent = pdfConfig.watermarkText;
          watermarkText.style.fontSize = '60px';
          watermarkText.style.fontWeight = 'bold';
          watermarkText.style.color = '#cccccc';
          watermarkText.style.transform = 'rotate(45deg)';
          watermarkText.style.whiteSpace = 'nowrap';
          
          watermark.appendChild(watermarkText);
          tempContainer.appendChild(watermark);
        }
        
        // Add footer if enabled
        if (pdfConfig.footer) {
          const footer = document.createElement('div');
          footer.style.textAlign = 'center';
          footer.style.marginTop = '20px';
          footer.style.paddingTop = '10px';
          footer.style.borderTop = '1px solid #e2e8f0';
          
          const footerText = document.createElement('p');
          footerText.textContent = pdfConfig.footerText
            .replace('{page}', (Math.floor(pageIndex / imagesPerPage) + 1).toString())
            .replace('{total}', Math.ceil(uploadedImages.length / imagesPerPage).toString());
          footerText.style.fontSize = '12px';
          footerText.style.color = '#64748b';
          
          footer.appendChild(footerText);
          tempContainer.appendChild(footer);
        }
        
        // Use html2canvas to capture the container
        const canvas = await html2canvas(tempContainer, {
          scale: 2, // Higher quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        
        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calculate dimensions for PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Add image to PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        
        // Clean up temporary container
        document.body.removeChild(tempContainer);
      }
      
      // Save the PDF
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `images-to-pdf-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // Quick actions
  const quickActions = [
    {
      label: 'Upload Images',
      icon: <Upload className="w-4 h-4" />,
      action: () => fileInputRef.current?.click(),
      variant: 'default' as const,
    },
    {
      label: 'Generate PDF',
      icon: isConverting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />,
      action: generatePDF, // Using the jspdf version
      variant: 'default' as const,
      disabled: isConverting || uploadedImages.length === 0,
    },
    {
      label: 'Select All',
      icon: <CheckCircle className="w-4 h-4" />,
      action: handleSelectAll,
      variant: 'outline' as const,
    },
    {
      label: 'Clear All',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => {
        setUploadedImages([]);
        setSelectedImages(new Set());
        toast.info('All images cleared');
      },
      variant: 'destructive' as const,
      disabled: uploadedImages.length === 0,
    },
  ];

  // Page size options
  const pageSizeOptions = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'Letter', label: 'Letter (216 × 279 mm)' },
    { value: 'Legal', label: 'Legal (216 × 356 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'A5', label: 'A5 (148 × 210 mm)' },
  ];

  // Quality options
  const qualityOptions = [
    { value: 'low', label: 'Low (72 DPI)' },
    { value: 'medium', label: 'Medium (150 DPI)' },
    { value: 'high', label: 'High (300 DPI)' },
    { value: 'very-high', label: 'Very High (600 DPI)' },
  ];

  return (
    <div className="min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-0 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 pt-4 md:pt-8"
        >
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Images to PDF Converter
            </h1>
          </div>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Convert multiple images to a single PDF with custom layouts, watermarks, and professional formatting.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Panel - Images & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <ImageIcon className="w-5 h-5 text-emerald-400" />
                  Upload Images
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode('grid')}
                    className={previewMode === 'grid' ? 'bg-emerald-500/20 border-emerald-500' : ''}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode('list')}
                    className={previewMode === 'list' ? 'bg-emerald-500/20 border-emerald-500' : ''}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode('preview')}
                    disabled={uploadedImages.length === 0}
                    className={previewMode === 'preview' ? 'bg-emerald-500/20 border-emerald-500' : ''}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                ref={dropzoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 mb-6 ${
                  isDraggingOver
                    ? 'border-emerald-500 bg-emerald-500/10 scale-105'
                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/30'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <motion.div
                  className="relative mx-auto mb-4 w-20 h-20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity" />
                  <UploadCloud className="w-12 h-12 mx-auto text-slate-400 group-hover:text-emerald-400 relative z-10 transition-colors" />
                </motion.div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Drop images here or click to upload
                </h4>
                <p className="text-slate-400 mb-4">
                  Supports JPG, PNG, WebP, GIF, BMP, TIFF
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                  <span className="text-sm text-slate-500">or drag & drop</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Image Grid */}
              {uploadedImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-300">
                        {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
                      </h4>
                      <span className="text-sm text-slate-400">
                        ({selectedImages.size} selected)
                      </span>
                    </div>
                    {selectedImages.size > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveSelected}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Selected
                      </Button>
                    )}
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={uploadedImages.map(img => img.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className={`grid gap-4 ${
                        previewMode === 'grid' 
                          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                          : 'grid-cols-1'
                      }`}>
                        {uploadedImages.map((image) => (
                          <SortableImage
                            key={image.id}
                            image={image}
                            onSelect={handleSelectImage}
                            onRemove={handleRemoveImage}
                            isSelected={selectedImages.has(image.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <p className="text-sm text-slate-400 text-center">
                    Drag to reorder • Click to select • Uploaded order will be preserved in PDF
                  </p>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 min-w-[140px]"
                  >
                    <Button
                      onClick={action.action}
                      disabled={action.disabled}
                      variant={action.variant}
                      className={`w-full transition-all duration-300 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg hover:shadow-emerald-500/30'
                          : index === 1
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/30'
                          : ''
                      }`}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* PDF Preview */}
            {previewMode === 'preview' && pagePreviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                    <Eye className="w-5 h-5 text-blue-400" />
                    PDF Preview
                  </h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-300">
                      Page {currentPage + 1} of {pagePreviews.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagePreviews.length - 1, prev + 1))}
                      disabled={currentPage === pagePreviews.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Page Preview */}
                <div className="bg-white rounded-xl p-8 shadow-2xl min-h-[500px]">
                  {/* Mock PDF Page */}
                  <div className="border-2 border-slate-200 rounded-lg p-6 h-full">
                    {/* Header */}
                    {pdfConfig.header && (
                      <div className="text-center mb-6 pb-4 border-b">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {pdfConfig.headerText}
                        </h3>
                      </div>
                    )}

                    {/* Grid Layout */}
                    <div 
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: `repeat(${pagePreviews[currentPage]?.layout.gridColumns || 2}, 1fr)`,
                        gap: `${pdfConfig.spacing}px`,
                      }}
                    >
                      {pagePreviews[currentPage]?.images.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative overflow-hidden rounded-lg ${
                            pdfConfig.border ? 'border' : ''
                          } ${pdfConfig.shadow ? 'shadow-md' : ''}`}
                          style={{
                            borderWidth: `${pdfConfig.borderWidth}px`,
                            borderColor: pdfConfig.borderColor,
                            aspectRatio: '1/1',
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Watermark */}
                          {pdfConfig.watermark && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{ opacity: pdfConfig.watermarkOpacity }}
                            >
                              <span className="text-4xl font-bold text-slate-400 rotate-45 transform">
                                {pdfConfig.watermarkText}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Footer */}
                    {pdfConfig.footer && (
                      <div className="text-center mt-6 pt-4 border-t">
                        <p className="text-sm text-slate-600">
                          {pdfConfig.footerText
                            .replace('{page}', (currentPage + 1).toString())
                            .replace('{total}', pagePreviews.length.toString())}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="text-sm text-slate-400">
                    Layout: {pagePreviews[currentPage]?.layout.name}
                  </div>
                  <div className="text-sm text-slate-400">
                    • {pagePreviews[currentPage]?.images.length} images on this page
                  </div>
                  <div className="text-sm text-slate-400">
                    • Page size: {pdfConfig.pageSize}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Settings & Layout */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="glass rounded-2xl p-2 border border-slate-700/50">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'images', label: 'Images', icon: <ImageIcon className="w-4 h-4" /> },
                  { id: 'layout', label: 'Layout', icon: <LayoutGrid className="w-4 h-4" /> },
                  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`justify-center transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-700/50 text-white shadow-inner'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Images Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'images' && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Image Stats */}
                  <div className="glass rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-emerald-400" />
                      Image Statistics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Total Images</span>
                        <span className="font-semibold">{uploadedImages.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Selected</span>
                        <span className="font-semibold">{selectedImages.size}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Total Pages</span>
                        <span className="font-semibold">{pagePreviews.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Estimated PDF Size</span>
                        <span className="font-semibold">
                          {Math.round(uploadedImages.length * 0.5 * 100) / 100} MB
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Image Tools */}
                 
                </motion.div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Layout Templates */}
                  <div className="glass rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-purple-400" />
                      Layout Templates
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {layoutTemplates.map((template) => (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleLayoutSelect(template.id)}
                          className={`p-3 rounded-xl flex flex-col items-center gap-2 border-2 transition-all ${
                            pdfConfig.imageLayout === template.id
                              ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                              : 'border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            pdfConfig.imageLayout === template.id
                              ? 'bg-purple-500/20'
                              : 'bg-slate-700/50'
                          }`}>
                            {template.icon}
                          </div>
                          <span className="text-sm font-medium">{template.name}</span>
                          <span className="text-xs text-slate-400 text-center">
                            {template.description}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Configuration */}
                  {pdfConfig.imageLayout === 'custom' && (
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Grid className="w-4 h-4 text-blue-400" />
                        Custom Grid Settings
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Columns: {pdfConfig.gridColumns}</Label>
                          <Slider
                            value={[pdfConfig.gridColumns]}
                            onValueChange={([value]) => setPdfConfig(prev => ({ ...prev, gridColumns: value }))}
                            min={1}
                            max={6}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Rows: {pdfConfig.gridRows}</Label>
                          <Slider
                            value={[pdfConfig.gridRows]}
                            onValueChange={([value]) => setPdfConfig(prev => ({ ...prev, gridRows: value }))}
                            min={1}
                            max={6}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Spacing: {pdfConfig.spacing}px</Label>
                          <Slider
                            value={[pdfConfig.spacing]}
                            onValueChange={([value]) => setPdfConfig(prev => ({ ...prev, spacing: value }))}
                            min={0}
                            max={30}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Borders & Effects */}
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Square className="w-4 h-4 text-emerald-400" />
                      Borders & Effects
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="border" className="flex items-center gap-2">
                          <Square className="w-4 h-4" />
                          Add Borders
                        </Label>
                        <Switch
                          id="border"
                          checked={pdfConfig.border}
                          onCheckedChange={(checked) => setPdfConfig(prev => ({ ...prev, border: checked }))}
                        />
                      </div>
                      {pdfConfig.border && (
                        <div className="space-y-2 pl-4">
                          <Label className="text-sm">Border Width: {pdfConfig.borderWidth}px</Label>
                          <Slider
                            value={[pdfConfig.borderWidth]}
                            onValueChange={([value]) => setPdfConfig(prev => ({ ...prev, borderWidth: value }))}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex items-center gap-3">
                            <Label className="text-sm">Color:</Label>
                            <input
                              type="color"
                              value={pdfConfig.borderColor}
                              onChange={(e) => setPdfConfig(prev => ({ ...prev, borderColor: e.target.value }))}
                              className="w-8 h-8 cursor-pointer rounded-lg overflow-hidden border border-slate-700"
                            />
                            <span className="text-sm text-slate-400">{pdfConfig.borderColor}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shadow" className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          Add Shadows
                        </Label>
                        <Switch
                          id="shadow"
                          checked={pdfConfig.shadow}
                          onCheckedChange={(checked) => setPdfConfig(prev => ({ ...prev, shadow: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* PDF Settings */}
                  <div className="glass rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      PDF Settings
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Page Size</Label>
                        <Select
                          value={pdfConfig.pageSize}
                          onValueChange={(value) => setPdfConfig(prev => ({ ...prev, pageSize: value as any }))}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {pageSizeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Orientation</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant={pdfConfig.orientation === 'portrait' ? 'default' : 'outline'}
                            onClick={() => setPdfConfig(prev => ({ ...prev, orientation: 'portrait' }))}
                            className={pdfConfig.orientation === 'portrait' ? 'bg-blue-600' : ''}
                          >
                            <Rows className="w-4 h-4 mr-2" />
                            Portrait
                          </Button>
                          <Button
                            variant={pdfConfig.orientation === 'landscape' ? 'default' : 'outline'}
                            onClick={() => setPdfConfig(prev => ({ ...prev, orientation: 'landscape' }))}
                            className={pdfConfig.orientation === 'landscape' ? 'bg-blue-600' : ''}
                          >
                            <Columns className="w-4 h-4 mr-2" />
                            Landscape
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Quality: {pdfConfig.quality.toUpperCase()}</Label>
                        <Select
                          value={pdfConfig.quality}
                          onValueChange={(value) => setPdfConfig(prev => ({ ...prev, quality: value as any }))}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {qualityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compression" className="flex items-center gap-2">
                          <Layers2 className="w-4 h-4" />
                          Enable Compression
                        </Label>
                        <Switch
                          id="compression"
                          checked={pdfConfig.compression}
                          onCheckedChange={(checked) => setPdfConfig(prev => ({ ...prev, compression: checked }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Margins: {pdfConfig.margin}px</Label>
                        <Slider
                          value={[pdfConfig.margin]}
                          onValueChange={([value]) => setPdfConfig(prev => ({ ...prev, margin: value }))}
                          min={0}
                          max={50}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Watermark Settings */}
                  <div className="glass rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-400" />
                      Watermark
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="watermark" className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Add Watermark
                        </Label>
                        <Switch
                          id="watermark"
                          checked={pdfConfig.watermark}
                          onCheckedChange={(checked) => setPdfConfig(prev => ({ ...prev, watermark: checked }))}
                        />
                      </div>
                      {pdfConfig.watermark && (
                        <>
                          <div className="space-y-2">
                            <Label>Watermark Text</Label>
                            <Input
                              value={pdfConfig.watermarkText}
                              onChange={(e) => setPdfConfig(prev => ({ ...prev, watermarkText: e.target.value }))}
                              className="bg-slate-800/50 border-slate-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Opacity: {Math.round(pdfConfig.watermarkOpacity * 100)}%</Label>
                            <Slider
                              value={[pdfConfig.watermarkOpacity]}
                              onValueChange={([value]) => setPdfConfig(prev => ({ ...prev, watermarkOpacity: value }))}
                              min={0.1}
                              max={0.8}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Header & Footer */}
                  <div className="glass rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <AlignCenter className="w-4 h-4 text-emerald-400" />
                      Header & Footer
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="header" className="flex items-center gap-2">
                          <ChevronUp className="w-4 h-4" />
                          Add Header
                        </Label>
                        <Switch
                          id="header"
                          checked={pdfConfig.header}
                          onCheckedChange={(checked) => setPdfConfig(prev => ({ ...prev, header: checked }))}
                        />
                      </div>
                      {pdfConfig.header && (
                        <div className="space-y-2">
                          <Label>Header Text</Label>
                          <Input
                            value={pdfConfig.headerText}
                            onChange={(e) => setPdfConfig(prev => ({ ...prev, headerText: e.target.value }))}
                            className="bg-slate-800/50 border-slate-700"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="footer" className="flex items-center gap-2">
                          <ChevronDown className="w-4 h-4" />
                          Add Footer
                        </Label>
                        <Switch
                          id="footer"
                          checked={pdfConfig.footer}
                          onCheckedChange={(checked) => setPdfConfig(prev => ({ ...prev, footer: checked }))}
                        />
                      </div>
                      {pdfConfig.footer && (
                        <div className="space-y-2">
                          <Label>Footer Text</Label>
                          <Input
                            value={pdfConfig.footerText}
                            onChange={(e) => setPdfConfig(prev => ({ ...prev, footerText: e.target.value }))}
                            className="bg-slate-800/50 border-slate-700"
                            placeholder="Page {page} of {total}"
                          />
                          <p className="text-xs text-slate-400">
                            Use {'{page}'} for current page and {'{total}'} for total pages
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="pageNumbers" className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Page Numbers
                        </Label>
                        <Switch
                          id="pageNumbers"
                          checked={pdfConfig.pageNumbers}
                          onCheckedChange={(checked) => setPdfConfig(prev => ({ ...prev, pageNumbers: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-700/30">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Quick Tips
              </h4>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Drag & drop to reorder images in PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Use custom grid for flexible layouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Add watermarks for document protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Preview before generating final PDF</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-slate-700/50"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Advanced Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="p-4 rounded-xl glass border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                <LayoutGrid className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Flexible Layouts</h4>
              <p className="text-sm text-slate-400">
                Choose from multiple layout templates or create custom grids
              </p>
            </motion.div>
            <motion.div 
              className="p-4 rounded-xl glass border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                <Edit className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Drag & Drop</h4>
              <p className="text-sm text-slate-400">
                Easily reorder images with intuitive drag and drop interface
              </p>
            </motion.div>
            <motion.div 
              className="p-4 rounded-xl glass border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/70 transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Watermark Protection</h4>
              <p className="text-sm text-slate-400">
                Add customizable watermarks to protect your documents
              </p>
            </motion.div>
            <motion.div 
              className="p-4 rounded-xl glass border border-slate-700/50 hover:border-pink-500/50 hover:bg-slate-800/70 transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-3">
                <Eye className="w-6 h-6 text-pink-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Live Preview</h4>
              <p className="text-sm text-slate-400">
                Preview your PDF before generation with real-time updates
              </p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}