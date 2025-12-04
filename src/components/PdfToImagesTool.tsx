import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Upload, Download, FileText, X, CheckCircle, AlertCircle,
  RefreshCw, FileDown, UploadCloud, Settings, Eye, Filter,
  Image as ImageIcon, Grid3x3, Palette, Zap, BarChart3,
  Shield, Clock, Scissors, FileImage
} from "lucide-react";
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker with CDN URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Types
interface PdfPage {
  id: string;
  pageNumber: number;
  pdfData: Uint8Array | null;
  imageUrl: string;
  dimensions: { width: number; height: number };
  status: 'pending' | 'splitting' | 'converting' | 'loaded' | 'error';
}

interface ConversionSettings {
  imageQuality: 'high' | 'png' | 'webp';
  imageDpi: number;
  maxDimension: number;
  splitPdf: boolean;
  splitStartPage: number;
  splitEndPage: number;
}

export default function PdfToImagesTool() {
  // State for PDF to Images
  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [selectedPdfPages, setSelectedPdfPages] = useState<Set<number>>(new Set());
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('settings');
  const [originalPdfDoc, setOriginalPdfDoc] = useState<PDFDocument | null>(null);

  // Settings state
  const [settings, setSettings] = useState<ConversionSettings>({
    imageQuality: 'high',
    imageDpi: 150,
    maxDimension: 2000, // Increased to allow full pages
    splitPdf: true,
    splitStartPage: 1,
    splitEndPage: 1,
  });

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Update split end page when page count changes
  useEffect(() => {
    if (pdfPageCount > 0) {
      setSettings(prev => ({
        ...prev,
        splitEndPage: pdfPageCount,
      }));
    }
  }, [pdfPageCount]);

  // Function to count PDF pages before uploading
  const getPdfPageCount = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const pdfData = e.target?.result as ArrayBuffer;
            const pdfDoc = await PDFDocument.load(pdfData);
            const pageCount = pdfDoc.getPageCount();
            resolve(pageCount);
          } catch (error) {
            console.error('Error loading PDF:', error);
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(error);
      }
    });
  };

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
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      const pdfFile = pdfFiles[0];
      await handlePdfUpload(pdfFile);
    } else {
      toast.error('Please drop a PDF file');
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle PDF upload
  const handlePdfUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    try {
      // First, check the page count
      setIsProcessingPdf(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      setOriginalPdfDoc(pdfDoc);
      setPdfPageCount(pageCount);
      
      // Check if PDF has more than 30 pages
      if (pageCount > 30) {
        toast.error(`PDF has ${pageCount} pages. Maximum allowed is 30 pages.`);
        setIsProcessingPdf(false);
        return;
      }
      
      // Check if PDF has no pages
      if (pageCount === 0) {
        toast.error('PDF file appears to be empty or corrupted');
        setIsProcessingPdf(false);
        return;
      }

      // Set uploaded PDF
      setUploadedPdf(file);
      setPdfPages([]);
      setSelectedPdfPages(new Set());
      
      // Update split settings with new page count
      setSettings(prev => ({
        ...prev,
        splitStartPage: 1,
        splitEndPage: pageCount,
      }));
      
      // Show pending placeholders for all pages
      const pendingPages: PdfPage[] = [];
      for (let i = 1; i <= pageCount; i++) {
        pendingPages.push({
          id: `page-${i}`,
          pageNumber: i,
          pdfData: null,
          imageUrl: '',
          dimensions: { width: 0, height: 0 },
          status: 'pending'
        });
      }
      setPdfPages(pendingPages);
      
      toast.success(`PDF uploaded: ${pageCount} page${pageCount !== 1 ? 's' : ''} detected`);
      
    } catch (error) {
      console.error('Failed to process PDF:', error);
      toast.error('Failed to process PDF file. Please make sure it\'s a valid PDF.');
      setUploadedPdf(null);
      setPdfPages([]);
      setPdfPageCount(0);
      setOriginalPdfDoc(null);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Get pages to process based on split settings
  const getPagesToProcess = (): number[] => {
    if (!settings.splitPdf) {
      return Array.from({ length: pdfPageCount }, (_, i) => i + 1);
    }
    
    const start = Math.max(1, settings.splitStartPage);
    const end = Math.min(pdfPageCount, settings.splitEndPage);
    const pages: number[] = [];
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Step 1: Split PDF into individual pages
  const splitPdfPages = async (): Promise<Map<number, Uint8Array>> => {
    if (!originalPdfDoc) throw new Error('No PDF loaded');
    
    const pagesToProcess = getPagesToProcess();
    const pagePdfData = new Map<number, Uint8Array>();
    
    try {
      for (const pageNumber of pagesToProcess) {
        const pageIndex = pageNumber - 1;
        
        // Update page status to splitting
        setPdfPages(prev => {
          const newPages = [...prev];
          if (newPages[pageIndex]) {
            newPages[pageIndex] = {
              ...newPages[pageIndex],
              status: 'splitting'
            };
          }
          return newPages;
        });
        
        // Create a new PDF with just this page
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(originalPdfDoc, [pageIndex]);
        singlePagePdf.addPage(copiedPage);
        
        // Save PDF as bytes
        const pdfBytes = await singlePagePdf.save();
        
        pagePdfData.set(pageNumber, pdfBytes);
        
        // Update page status with PDF data
        setPdfPages(prev => {
          const newPages = [...prev];
          if (newPages[pageIndex]) {
            newPages[pageIndex] = {
              ...newPages[pageIndex],
              pdfData: pdfBytes,
              status: 'converting'
            };
          }
          return newPages;
        });
        
        // Small delay to prevent UI freeze
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return pagePdfData;
      
    } catch (error) {
      console.error('Failed to split PDF:', error);
      throw error;
    }
  };

  // Convert PDF bytes to image using PDF.js - FIXED VERSION
  const convertPdfToImage = async (pdfBytes: Uint8Array, pageNumber: number): Promise<string> => {
    try {
      // Ensure pdfBytes is valid
      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error(`Invalid PDF data for page ${pageNumber}`);
      }
      
      // Convert Uint8Array to ArrayBuffer
      const arrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset, 
        pdfBytes.byteOffset + pdfBytes.byteLength
      );
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Get the first page (since we split to single-page PDFs)
      const page = await pdf.getPage(1);
      
      // Get the original viewport (PDF uses 72 DPI)
      const originalViewport = page.getViewport({ scale: 1 });
      
      // Calculate scale based on DPI
      let scale = settings.imageDpi / 72;
      
      // Calculate dimensions with DPI scaling
      let width = originalViewport.width * scale;
      let height = originalViewport.height * scale;
      
      // Apply max dimension constraint while maintaining aspect ratio
      let constrainedScale = scale;
      if (width > settings.maxDimension || height > settings.maxDimension) {
        const ratio = Math.min(
          settings.maxDimension / width, 
          settings.maxDimension / height
        );
        constrainedScale = scale * ratio;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create viewport with constrained scale
      const viewport = page.getViewport({ scale: constrainedScale });
      
      // Create canvas with EXACT viewport dimensions
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }
      
      // Set canvas dimensions (use ceil to avoid cutting off pixels)
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      
      // Fill background with white
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        enableWebGL: true,
        renderInteractiveForms: false,
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to data URL based on quality setting
      let mimeType: string;
      let quality: number | undefined;
      
      switch (settings.imageQuality) {
        case 'png':
          mimeType = 'image/png';
          quality = undefined;
          break;
        case 'webp':
          mimeType = 'image/webp';
          quality = 0.9;
          break;
        case 'high':
        default:
          mimeType = 'image/jpeg';
          quality = 0.95; // Increased quality for better results
          break;
      }
      
      const imageUrl = canvas.toDataURL(mimeType, quality);
      
      return imageUrl;
      
    } catch (error) {
      console.error(`Error converting page ${pageNumber}:`, error);
      throw new Error(`Failed to convert page ${pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Step 2: Convert all split PDF pages to images
  const convertPdfPagesToImages = async (pagePdfData: Map<number, Uint8Array>) => {
    const pagesToProcess = getPagesToProcess();
    
    for (const pageNumber of pagesToProcess) {
      const pageIndex = pageNumber - 1;
      const pdfBytes = pagePdfData.get(pageNumber);
      
      if (!pdfBytes) continue;
      
      try {
        const imageUrl = await convertPdfToImage(pdfBytes, pageNumber);
        
        // Update the page with the image
        setPdfPages(prev => {
          const newPages = [...prev];
          if (newPages[pageIndex]) {
            newPages[pageIndex] = {
              ...newPages[pageIndex],
              imageUrl,
              dimensions: { width: 0, height: 0 },
              status: 'loaded'
            };
          }
          return newPages;
        });
        
        // Add to selected pages automatically
        setSelectedPdfPages(prev => new Set([...Array.from(prev), pageNumber]));
        
        // Small delay to prevent UI freeze
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error converting page ${pageNumber}:`, error);
        
        // Mark page as error
        setPdfPages(prev => {
          const newPages = [...prev];
          if (newPages[pageIndex]) {
            newPages[pageIndex] = {
              ...newPages[pageIndex],
              status: 'error'
            };
          }
          return newPages;
        });
      }
    }
  };

  // Main function: Split PDF then convert to images
  const splitAndConvertPdf = async () => {
    if (!originalPdfDoc || pdfPageCount === 0) {
      toast.error('Please upload a PDF file first');
      return;
    }

    const pagesToProcess = getPagesToProcess();
    
    if (pagesToProcess.length === 0) {
      toast.error('No pages selected for conversion');
      return;
    }

    setIsProcessingPdf(true);
    
    try {
      toast.info('Step 1: Splitting PDF into individual pages...');
      
      // Step 1: Split PDF into individual pages
      const pagePdfData = await splitPdfPages();
      
      toast.info('Step 2: Converting split pages to images...');
      
      // Step 2: Convert split PDF pages to images
      await convertPdfPagesToImages(pagePdfData);
      
      const convertedCount = pdfPages.filter(p => pagesToProcess.includes(p.pageNumber) && p.status === 'loaded').length;
      toast.success(`Successfully converted ${convertedCount} page${convertedCount !== 1 ? 's' : ''}`);
      
    } catch (error) {
      console.error('Failed to process PDF:', error);
      toast.error('Failed to process PDF file. Please try again.');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Convert and download images immediately
  const convertAndDownloadImages = async () => {
    if (!originalPdfDoc || pdfPageCount === 0) {
      toast.error('Please upload a PDF file first');
      return;
    }

    const pagesToProcess = getPagesToProcess();
    
    if (pagesToProcess.length === 0) {
      toast.error('No pages selected for conversion');
      return;
    }

    setIsProcessingPdf(true);
    
    try {
      const zip = new JSZip();
      let successCount = 0;
      
      // Process each page directly
      for (const pageNumber of pagesToProcess) {
        const pageIndex = pageNumber - 1;
        
        try {
          // Update page status
          setPdfPages(prev => {
            const newPages = [...prev];
            if (newPages[pageIndex]) {
              newPages[pageIndex] = {
                ...newPages[pageIndex],
                status: 'converting'
              };
            }
            return newPages;
          });
          
          // Create single page PDF
          const singlePagePdf = await PDFDocument.create();
          const [copiedPage] = await singlePagePdf.copyPages(originalPdfDoc, [pageIndex]);
          singlePagePdf.addPage(copiedPage);
          const pdfBytes = await singlePagePdf.save();
          
          // Convert to image
          const imageUrl = await convertPdfToImage(pdfBytes, pageNumber);
          
          // Convert data URL to blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Set file extension based on quality setting
          let extension = 'jpg';
          switch (settings.imageQuality) {
            case 'png':
              extension = 'png';
              break;
            case 'webp':
              extension = 'webp';
              break;
          }
          
          // Add to ZIP
          zip.file(`page-${pageNumber}.${extension}`, blob);
          successCount++;
          
          // Update UI
          setPdfPages(prev => {
            const newPages = [...prev];
            if (newPages[pageIndex]) {
              newPages[pageIndex] = {
                ...newPages[pageIndex],
                imageUrl,
                status: 'loaded'
              };
            }
            return newPages;
          });
          
          // Add to selected
          setSelectedPdfPages(prev => new Set([...Array.from(prev), pageNumber]));
          
        } catch (error) {
          console.error(`Error processing page ${pageNumber}:`, error);
          setPdfPages(prev => {
            const newPages = [...prev];
            if (newPages[pageIndex]) {
              newPages[pageIndex] = {
                ...newPages[pageIndex],
                status: 'error'
              };
            }
            return newPages;
          });
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Generate and download ZIP
      if (successCount > 0) {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `pdf-images-${new Date().toISOString().split('T')[0]}.zip`);
        toast.success(`Downloaded ${successCount} image${successCount !== 1 ? 's' : ''} as ZIP`);
      } else {
        toast.error('No images were converted successfully');
      }
      
    } catch (error) {
      console.error('Failed to process PDF:', error);
      toast.error('Failed to convert and download images');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  // Function to download selected images
  const downloadSelectedImages = async () => {
    const pagesToDownload = Array.from(selectedPdfPages)
      .map(pageNumber => pdfPages.find(p => p.pageNumber === pageNumber))
      .filter(page => page && page.status === 'loaded' && page.imageUrl);

    if (pagesToDownload.length === 0) {
      toast.error('No valid images to download');
      return;
    }

    try {
      for (const page of pagesToDownload) {
        if (!page) continue;
        
        const link = document.createElement('a');
        link.href = page.imageUrl;
        
        // Set file extension based on quality setting
        let extension = 'jpg';
        switch (settings.imageQuality) {
          case 'png':
            extension = 'png';
            break;
          case 'webp':
            extension = 'webp';
            break;
        }
        
        link.download = `page-${page.pageNumber}.${extension}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast.success(`Downloaded ${pagesToDownload.length} image${pagesToDownload.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to download images:', error);
      toast.error('Failed to download images');
    }
  };

  // Function to download selected images as ZIP
  const downloadSelectedImagesAsZip = async () => {
    const pagesToDownload = Array.from(selectedPdfPages)
      .map(pageNumber => pdfPages.find(p => p.pageNumber === pageNumber))
      .filter(page => page && page.status === 'loaded' && page.imageUrl);

    if (pagesToDownload.length === 0) {
      toast.error('No valid images to download');
      return;
    }

    try {
      const zip = new JSZip();
      
      for (const page of pagesToDownload) {
        if (!page) continue;
        
        // Convert data URL to blob
        const response = await fetch(page.imageUrl);
        const blob = await response.blob();
        
        // Set file extension based on quality setting
        let extension = 'jpg';
        switch (settings.imageQuality) {
          case 'png':
            extension = 'png';
            break;
          case 'webp':
            extension = 'webp';
            break;
        }
        
        zip.file(`page-${page.pageNumber}.${extension}`, blob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `pdf-images-${new Date().toISOString().split('T')[0]}.zip`);
      toast.success(`Downloaded ${pagesToDownload.length} image${pagesToDownload.length !== 1 ? 's' : ''} as ZIP`);
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      toast.error('Failed to create ZIP file');
    }
  };

  // Function to select/deselect PDF page
  const handleSelectPdfPage = (pageNumber: number) => {
    const page = pdfPages.find(p => p.pageNumber === pageNumber);
    if (!page || page.status !== 'loaded') {
      toast.error('This page is not available for selection');
      return;
    }
    
    setSelectedPdfPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  // Select all loaded pages
  const selectAllLoadedPages = () => {
    const loadedPages = pdfPages.filter(p => p.status === 'loaded').map(p => p.pageNumber);
    setSelectedPdfPages(new Set(loadedPages));
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setSelectedPdfPages(new Set());
  };

  // Calculate statistics
  const stats = {
    totalPages: pdfPageCount,
    loadedPages: pdfPages.filter(p => p.status === 'loaded').length,
    selectedPages: selectedPdfPages.size,
    pendingPages: pdfPages.filter(p => p.status === 'pending').length,
    splittingPages: pdfPages.filter(p => p.status === 'splitting').length,
    convertingPages: pdfPages.filter(p => p.status === 'converting').length,
    errorPages: pdfPages.filter(p => p.status === 'error').length,
  };

  return (
    <div className="min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-0 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 pt-4"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                PDF to Images Converter
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-20 -z-10"></div>
            </div>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
              Convert PDF pages directly to high-quality images
            </p>
          </div>
        </motion.div>

        {/* Hidden Inputs */}
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await handlePdfUpload(file);
          }}
          className="hidden"
        />

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - PDF Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-purple-400" />
                  {uploadedPdf ? 'PDF Pages' : 'Upload PDF'}
                </h3>
                {uploadedPdf && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSelectedImages}
                      disabled={selectedPdfPages.size === 0 || isProcessingPdf}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSelectedImagesAsZip}
                      disabled={selectedPdfPages.size === 0 || isProcessingPdf}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Download as ZIP
                    </Button>
                  </div>
                )}
              </div>

              {/* PDF Drop Zone or Preview */}
              {!uploadedPdf ? (
                <div
                  ref={dropzoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDraggingOver
                      ? 'border-purple-500 bg-purple-500/10 scale-105'
                      : 'border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/30'
                  }`}
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <motion.div
                    className="relative mx-auto mb-4 w-20 h-20"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity" />
                    <UploadCloud className="w-12 h-12 mx-auto text-slate-400 group-hover:text-purple-400 transition-colors relative z-10" />
                  </motion.div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Drop PDF here or click to upload
                  </h4>
                  <p className="text-slate-400 mb-4">
                    Convert PDF pages to images (Max 30 pages)
                  </p>
                  <Button
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Select PDF File
                  </Button>
                  <p className="text-xs text-slate-500 mt-4">
                    Maximum file size: 50MB • Maximum pages: 30
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* PDF File Info */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-purple-400" />
                        <div>
                          <h4 className="font-semibold">{uploadedPdf.name}</h4>
                          <p className="text-sm text-slate-400">
                            {formatFileSize(uploadedPdf.size)} • {pdfPageCount} page{pdfPageCount !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-emerald-400 mt-1">
                            {stats.loadedPages} pages converted
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedPdf(null);
                          setPdfPages([]);
                          setSelectedPdfPages(new Set());
                          setPdfPageCount(0);
                          setOriginalPdfDoc(null);
                        }}
                        disabled={isProcessingPdf}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Conversion Controls */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={splitAndConvertPdf}
                      disabled={isProcessingPdf || pdfPageCount === 0}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1"
                    >
                      {isProcessingPdf ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Convert to Images
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={convertAndDownloadImages}
                      disabled={isProcessingPdf || pdfPageCount === 0}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Convert & Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={selectAllLoadedPages}
                      disabled={stats.loadedPages === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={deselectAllPages}
                      disabled={selectedPdfPages.size === 0}
                    >
                      Deselect All
                    </Button>
                  </div>

                  {/* Processing Indicator */}
                  {isProcessingPdf && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-6 h-6 text-purple-400" />
                        </motion.div>
                        <div>
                          <p className="text-slate-300">Converting PDF pages...</p>
                          <p className="text-xs text-slate-400">
                            Please wait while images are generated
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                          initial={{ width: "0%" }}
                          animate={{ 
                            width: `${((stats.loadedPages + stats.convertingPages * 0.5) / getPagesToProcess().length) * 100}%` 
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* PDF Pages Grid */}
                  {pdfPages.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-300">
                          Pages ({pdfPageCount} total)
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400">
                            {stats.loadedPages} converted
                          </span>
                          {(stats.splittingPages > 0 || stats.convertingPages > 0) && (
                            <span className="text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                              {stats.splittingPages + stats.convertingPages} processing
                            </span>
                          )}
                          {stats.errorPages > 0 && (
                            <span className="text-xs px-2 py-1 rounded-md bg-red-500/20 text-red-400">
                              {stats.errorPages} error
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {pdfPages.map((page) => (
                          <motion.div
                            key={page.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                              page.status === 'loaded' && selectedPdfPages.has(page.pageNumber)
                                ? 'border-purple-500 ring-2 ring-purple-500/20'
                                : page.status === 'loaded'
                                ? 'border-slate-700 hover:border-purple-400/50 cursor-pointer'
                                : page.status === 'splitting' || page.status === 'converting'
                                ? 'border-blue-500/50'
                                : page.status === 'error'
                                ? 'border-red-500/50'
                                : 'border-slate-700/30'
                            }`}
                            onClick={() => {
                              if (page.status === 'loaded') {
                                handleSelectPdfPage(page.pageNumber);
                              }
                            }}
                          >
                            {/* Page status indicator */}
                            <div className="absolute top-1 right-1 z-10">
                              {page.status === 'splitting' && (
                                <div className="w-5 h-5 rounded-full bg-blue-500/90 backdrop-blur-sm flex items-center justify-center">
                                  <Scissors className="w-3 h-3 text-white" />
                                </div>
                              )}
                              {page.status === 'converting' && (
                                <div className="w-5 h-5 rounded-full bg-blue-500/90 backdrop-blur-sm flex items-center justify-center">
                                  <RefreshCw className="w-3 h-3 text-white animate-spin" />
                                </div>
                              )}
                              {page.status === 'loaded' && selectedPdfPages.has(page.pageNumber) && (
                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                              {page.status === 'error' && (
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                  <AlertCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Page number badge */}
                            <div className="absolute top-1 left-1 z-10">
                              <div className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm">
                                <span className="text-xs font-medium text-white">
                                  {page.pageNumber}
                                </span>
                              </div>
                            </div>

                            {/* Page thumbnail or placeholder */}
                            <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                              {page.status === 'loaded' && page.imageUrl ? (
                                <img
                                  src={page.imageUrl}
                                  alt={`Page ${page.pageNumber}`}
                                  className="w-full h-full object-contain"
                                />
                              ) : page.status === 'splitting' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                  <Scissors className="w-6 h-6 text-blue-400 mb-1" />
                                  <p className="text-xs text-blue-300 text-center">Splitting</p>
                                </div>
                              ) : page.status === 'converting' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                  <RefreshCw className="w-6 h-6 text-blue-400 mb-1 animate-spin" />
                                  <p className="text-xs text-blue-300 text-center">Converting</p>
                                </div>
                              ) : page.status === 'error' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                  <AlertCircle className="w-5 h-5 text-red-400 mb-1" />
                                  <p className="text-xs text-red-300 text-center">Error</p>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-slate-600" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Settings & Statistics */}
          <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="glass rounded-2xl p-2 border border-slate-700/50">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Statistics
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Page Selection Settings */}
                <div className="glass rounded-2xl p-6 border border-slate-700/50">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                    <Filter className="w-4 h-4 text-purple-400" />
                    Page Selection
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="split-pdf" className="flex items-center gap-2 cursor-pointer">
                        <Scissors className="w-4 h-4" />
                        Select Specific Pages
                      </Label>
                      <Switch
                        id="split-pdf"
                        checked={settings.splitPdf}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, splitPdf: checked }))
                        }
                        disabled={pdfPageCount === 0}
                      />
                    </div>
                    
                    {settings.splitPdf && pdfPageCount > 0 && (
                      <div className="space-y-4 pl-4 border-l-2 border-purple-500/30">
                        <div className="space-y-2">
                          <Label className="text-sm">Page Range</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min={1}
                              max={pdfPageCount}
                              value={settings.splitStartPage}
                              onChange={(e) => 
                                setSettings(prev => ({ 
                                  ...prev, 
                                  splitStartPage: Math.min(Math.max(1, parseInt(e.target.value) || 1), prev.splitEndPage)
                                }))
                              }
                              className="w-20"
                              disabled={isProcessingPdf}
                            />
                            <span className="text-slate-400">to</span>
                            <Input
                              type="number"
                              min={settings.splitStartPage}
                              max={pdfPageCount}
                              value={settings.splitEndPage}
                              onChange={(e) => 
                                setSettings(prev => ({ 
                                  ...prev, 
                                  splitEndPage: Math.min(Math.max(prev.splitStartPage, parseInt(e.target.value) || 1), pdfPageCount)
                                }))
                              }
                              className="w-20"
                              disabled={isProcessingPdf}
                            />
                            <span className="text-sm text-slate-400">
                              of {pdfPageCount}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Only selected pages will be converted
                          </p>
                        </div>
                        
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <p className="text-sm text-slate-300">
                            Selected: {Math.max(0, settings.splitEndPage - settings.splitStartPage + 1)} pages
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Format Settings */}
               <div className="glass rounded-2xl p-6 border border-slate-700/50">
  <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
    <Palette className="w-4 h-4 text-blue-400" />
    Image Format
  </h4>
  <div className="space-y-3">
    {[
      { key: 'high', title: 'JPEG - High Quality', subtitle: '95% quality • Recommended' },
      { key: 'png', title: 'PNG - Lossless', subtitle: 'Perfect quality • Larger files' },
      { key: 'webp', title: 'WebP - Modern Format', subtitle: '90% quality • Best compression' },
    ].map(option => (
      <label
        key={option.key}
        className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-colors duration-200
          ${settings.imageQuality === option.key 
            ? 'bg-blue-500/20 border-blue-500' 
            : 'glass'}`}
      >
        <input
          type="radio"
          name="quality"
          value={option.key}
          checked={settings.imageQuality === option.key}
          onChange={() => setSettings(prev => ({ ...prev, imageQuality: option.key }))}
          className="hidden"
          disabled={isProcessingPdf}
        />
        <div>
          <span className="text-sm text-white font-medium">{option.title}</span>
          <p className="text-xs text-slate-400">{option.subtitle}</p>
        </div>
      </label>
    ))}
  </div>
</div>


                {/* Image Quality Settings */}
                <div className="glass rounded-2xl p-6 border border-slate-700/50">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                    <Grid3x3 className="w-4 h-4 text-emerald-400" />
                    Image Quality
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center justify-between">
                        <span>DPI: {settings.imageDpi}</span>
                        <span className="text-xs text-slate-400">Resolution</span>
                      </Label>
                      <Slider
                        value={[settings.imageDpi]}
                        onValueChange={([value]) => 
                          setSettings(prev => ({ ...prev, imageDpi: value }))
                        }
                        min={72}
                        max={400}
                        step={72}
                        className="w-full"
                        disabled={isProcessingPdf}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>72 DPI (Web)</span>
                        <span>150 DPI (Print)</span>
                        <span>300 DPI (High)</span>
                        <span>400 DPI (Max)</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center justify-between">
                        <span>Max Dimension: {settings.maxDimension}px</span>
                        <span className="text-xs text-slate-400">Size Limit</span>
                      </Label>
                      <Slider
                        value={[settings.maxDimension]}
                        onValueChange={([value]) => 
                          setSettings(prev => ({ ...prev, maxDimension: value }))
                        }
                        min={800}
                        max={4000}
                        step={400}
                        className="w-full"
                        disabled={isProcessingPdf}
                      />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>800px</span>
                        <span>2000px</span>
                        <span>4000px</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Larger values preserve more detail but create bigger files
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Overall Statistics */}
                <div className="glass rounded-2xl p-6 border border-slate-700/50">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    Processing Stats
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {stats.totalPages}
                        </div>
                        <div className="text-xs text-slate-400">Total Pages</div>
                      </div>
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <div className="text-2xl font-bold text-emerald-400 mb-1">
                          {stats.loadedPages}
                        </div>
                        <div className="text-xs text-slate-400">Converted</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {stats.selectedPages}
                        </div>
                        <div className="text-xs text-slate-400">Selected</div>
                      </div>
                      <div className="bg-slate-800/30 rounded-lg p-3">
                        <div className="text-2xl font-bold text-pink-400 mb-1">
                          {stats.pendingPages}
                        </div>
                        <div className="text-xs text-slate-400">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Status */}
                <div className="glass rounded-2xl p-6 border border-slate-700/50">
                  <h4 className="font-semibold mb-4 text-white">Processing Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-300">Converted</span>
                      </div>
                      <span className="text-sm font-medium">{stats.loadedPages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-300">Processing</span>
                      </div>
                      <span className="text-sm font-medium">{stats.splittingPages + stats.convertingPages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                        <span className="text-sm text-slate-300">Pending</span>
                      </div>
                      <span className="text-sm font-medium">{stats.pendingPages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-slate-300">Error</span>
                      </div>
                      <span className="text-sm font-medium">{stats.errorPages}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Pages Info */}
                {selectedPdfPages.size > 0 && (
                  <div className="glass rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-semibold mb-4 text-white">Selected Images</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-slate-300">
                        {selectedPdfPages.size} image{selectedPdfPages.size !== 1 ? 's' : ''} ready for download
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(selectedPdfPages)
                          .sort((a, b) => a - b)
                          .slice(0, 8)
                          .map(pageNumber => (
                            <span 
                              key={pageNumber}
                              className="px-2 py-1 text-xs rounded-md bg-purple-500/20 text-purple-300"
                            >
                              {pageNumber}
                            </span>
                          ))}
                        {selectedPdfPages.size > 8 && (
                          <span className="px-2 py-1 text-xs rounded-md bg-slate-700/50 text-slate-400">
                            +{selectedPdfPages.size - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
        <p>PDF to Images Converter • Uses PDF.js for reliable PDF rendering</p>
        <p className="mt-2">All processing happens locally in your browser</p>
      </footer>
    </div>
  );
}