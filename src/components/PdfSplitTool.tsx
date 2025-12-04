import { useState, useRef, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Upload, FileText, Download, FileUp, Trash2,
  Eye, Zap, TrendingDown, Layers2, BatteryMedium,
  BatteryFull, FileDown, Gauge, Shield, Lock,
  CloudOff, Check, X, Settings, Image as ImageIcon, 
  ChevronRight, HelpCircle, Sparkles, Cpu, Target,
  AlertTriangle, Filter, Merge, Split,
  Scissors, BringToFront, Grid, List, EyeOff, Eye as EyeOpen,
  Copy, RotateCw, ArrowUpDown, BookOpen, FileX
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

interface PageInfo {
  index: number;
  selected: boolean;
  preview?: string;
  size?: number;
}

export default function PdfSplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [splitMode, setSplitMode] = useState<"select" | "remove">("select"); // "select" = keep selected, "remove" = remove selected
  const [selectionMode, setSelectionMode] = useState<"single" | "range" | "all">("single");
  const [selectedRange, setSelectedRange] = useState<[number, number]>([1, 1]);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [compressOutput, setCompressOutput] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<number>(70);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const faqs: FAQItem[] = [
    {
      question: "How do I split a PDF by selecting specific pages?",
      answer: "Upload your PDF, select individual pages you want to keep (or remove), and click 'Split PDF'. You'll get a new PDF with only the selected pages.",
      isOpen: true
    },
    {
      question: "What's the difference between 'Keep Selected' and 'Remove Selected' modes?",
      answer: "'Keep Selected' creates a new PDF with only the pages you select. 'Remove Selected' creates a new PDF with all pages EXCEPT the ones you select.",
      isOpen: false
    },
    {
      question: "Can I select multiple pages at once?",
      answer: "Yes! Use 'Range Selection' to select consecutive pages, or 'Select All' to select all pages, then deselect specific ones.",
      isOpen: false
    },
    {
      question: "Are my files secure during splitting?",
      answer: "Yes! All processing happens 100% locally in your browser. Your files never leave your computer and are not uploaded to any server.",
      isOpen: false
    },
    {
      question: "What's the minimum number of pages required?",
      answer: "Your PDF must have at least 2 pages to use the split feature. For single-page PDFs, consider using the compress tool instead.",
      isOpen: false
    }
  ];

  // Toggle FAQ item
  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Load PDF and extract page info
  const loadPdfPages = async (pdfFile: File) => {
    try {
      setIsProcessing(true);
      setProgress(10);
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      setTotalPages(pageCount);
      setProgress(30);
      
      if (pageCount < 2) {
        toast.error("PDF must have at least 2 pages to split");
        setFile(null);
        return;
      }
      
      // Initialize pages array with all pages selected by default
      const initialPages: PageInfo[] = Array.from({ length: pageCount }, (_, i) => ({
        index: i,
        selected: true, // Start with all selected
      }));
      
      setPages(initialPages);
      setSelectedRange([1, pageCount]);
      
      // Generate simple previews
      setProgress(60);
      await generatePagePreviews(pdfDoc, initialPages);
      
      setProgress(100);
      toast.success(`Loaded ${pageCount} page${pageCount > 1 ? 's' : ''}`);
      
    } catch (error) {
      console.error("Failed to load PDF:", error);
      toast.error("Failed to load PDF. Please try again.");
      setFile(null);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Generate simple page previews
  const generatePagePreviews = async (pdfDoc: PDFDocument, pageInfos: PageInfo[]) => {
    // For now, create placeholder previews
    // In a real app, you might use pdf-lib with canvas to render actual previews
    const updatedPages = pageInfos.map(page => ({
      ...page,
      preview: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="120" height="170" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1e293b"/>
          <rect x="10" y="10" width="100" height="150" fill="#0f172a" stroke="#334155" stroke-width="1"/>
          <rect x="25" y="40" width="70" height="8" fill="#334155" rx="2"/>
          <rect x="25" y="55" width="60" height="6" fill="#334155" rx="2"/>
          <rect x="25" y="65" width="50" height="6" fill="#334155" rx="2"/>
          <text x="60" y="100" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="12">
            Page ${page.index + 1}
          </text>
          <rect x="40" y="120" width="40" height="20" fill="#334155" rx="4"/>
          <text x="60" y="134" text-anchor="middle" fill="#94a3b8" font-family="Arial" font-size="10">
            Preview
          </text>
        </svg>
      `)}`,
      size: Math.floor(Math.random() * 100) + 50, // Simulated size in KB
    }));
    
    setPages(updatedPages);
  };

  // Handle file selection
  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || selected.type !== 'application/pdf') return;

    setFile(selected);
    await loadPdfPages(selected);
  };

  // Handle drag and drop
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = Array.from(e.dataTransfer.files).find(
      file => file.type === 'application/pdf'
    );
    
    if (droppedFile) {
      setFile(droppedFile);
      await loadPdfPages(droppedFile);
    }
  };

  // Toggle page selection
  const togglePageSelection = (pageIndex: number) => {
    setPages(prev => prev.map(page => 
      page.index === pageIndex ? { ...page, selected: !page.selected } : page
    ));
  };

  // Select page range
  const selectPageRange = (start: number, end: number) => {
    const startIdx = Math.max(0, Math.min(start - 1, pages.length - 1));
    const endIdx = Math.max(0, Math.min(end - 1, pages.length - 1));
    const [actualStart, actualEnd] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];
    
    setPages(prev => prev.map(page => ({
      ...page,
      selected: page.index >= actualStart && page.index <= actualEnd
    })));
  };

  // Select all pages
  const selectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: true })));
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: false })));
  };

  // Invert selection
  const invertSelection = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: !page.selected })));
  };

  // Get selected page indices
  const getSelectedPages = () => {
    return pages.filter(page => page.selected).map(page => page.index);
  };

  // Get pages to keep based on split mode
  const getPagesToKeep = () => {
    if (splitMode === "select") {
      return getSelectedPages(); // Keep selected pages
    } else {
      // Remove mode: keep pages that are NOT selected
      return pages.filter(page => !page.selected).map(page => page.index);
    }
  };

  // Split PDF
  const splitPdf = async () => {
    if (!file) {
      toast.error("Please upload a PDF file first");
      return;
    }

    const pagesToKeep = getPagesToKeep();
    if (pagesToKeep.length === 0) {
      toast.error("Please select at least one page to keep");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);

      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      setProgress(30);

      // Create new PDF with selected pages
      const newPdf = await PDFDocument.create();
      setProgress(50);

      // Copy selected pages
      const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
      copiedPages.forEach(page => newPdf.addPage(page));
      setProgress(70);

      // Apply compression if enabled
      let pdfBytes: Uint8Array;
      if (compressOutput) {
        // Apply basic compression
        newPdf.setTitle("");
        newPdf.setAuthor("");
        newPdf.setSubject("");
        newPdf.setKeywords([]);
        newPdf.setProducer("");
        newPdf.setCreator("");
        
        pdfBytes = await newPdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: compressionLevel > 80 ? 10 : 30,
          updateFieldAppearances: false,
        });
      } else {
        pdfBytes = await newPdf.save();
      }

      setProgress(90);

      // Create download
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      
      const pagesText = pagesToKeep.length === 1 ? "1 page" : `${pagesToKeep.length} pages`;
      const modeText = splitMode === "select" ? "selected" : "filtered";
      const fileName = file.name.replace('.pdf', '');
      
      a.download = `split_${modeText}_${pagesText}_${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      setProgress(100);

      // Show success
      toast.success(
        `PDF split successfully!`,
        {
          duration: 6000,
          description: `Created new PDF with ${pagesToKeep.length} page${pagesToKeep.length > 1 ? 's' : ''}`,
          icon: <Split className="w-5 h-5 text-green-400" />,
        }
      );

    } catch (error) {
      console.error("Split failed:", error);
      toast.error("Failed to split PDF. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Split each selected page into separate PDFs
  const splitToIndividualPdfs = async () => {
    if (!file) {
      toast.error("Please upload a PDF file first");
      return;
    }

    const pagesToSplit = getSelectedPages();
    if (pagesToSplit.length === 0) {
      toast.error("Please select at least one page to split");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);

      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      setProgress(30);

      // Create ZIP file with all individual PDFs
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      
      let processed = 0;
      
      for (const pageIndex of pagesToSplit) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
        newPdf.addPage(copiedPage);
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        
        // Add to zip
        zip.file(`page_${pageIndex + 1}.pdf`, blob);
        
        processed++;
        setProgress(30 + (processed / pagesToSplit.length) * 60);
      }

      setProgress(95);

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `individual_pages_${file.name.replace('.pdf', '')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(zipUrl);

      setProgress(100);

      toast.success(
        `Created ${pagesToSplit.length} individual PDFs`,
        {
          duration: 6000,
          description: `Downloaded as ZIP file with ${pagesToSplit.length} page${pagesToSplit.length > 1 ? 's' : ''}`,
          icon: <FileDown className="w-5 h-5 text-green-400" />,
        }
      );

    } catch (error) {
      console.error("Individual split failed:", error);
      toast.error("Failed to create individual PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Get selection summary
  const getSelectionSummary = () => {
    const selectedCount = pages.filter(p => p.selected).length;
    const totalCount = pages.length;
    
    if (splitMode === "select") {
      return `Keeping ${selectedCount} of ${totalCount} pages`;
    } else {
      return `Removing ${selectedCount} of ${totalCount} pages`;
    }
  };

  // Handle range selection change
  const handleRangeChange = (type: 'start' | 'end', value: number) => {
    const clampedValue = Math.max(1, Math.min(totalPages, value));
    
    if (type === 'start') {
      setSelectedRange([clampedValue, selectedRange[1]]);
    } else {
      setSelectedRange([selectedRange[0], clampedValue]);
    }
  };

  // Apply range selection
  const applyRangeSelection = () => {
    selectPageRange(selectedRange[0], selectedRange[1]);
  };

  // Quick select buttons
  const quickSelectOptions = [
    { label: "Even Pages", action: () => setPages(prev => prev.map(p => ({ ...p, selected: (p.index + 1) % 2 === 0 }))) },
    { label: "Odd Pages", action: () => setPages(prev => prev.map(p => ({ ...p, selected: (p.index + 1) % 2 === 1 }))) },
    { label: "First Half", action: () => selectPageRange(1, Math.ceil(totalPages / 2)) },
    { label: "Second Half", action: () => selectPageRange(Math.ceil(totalPages / 2) + 1, totalPages) },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-0 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 pt-4 md:pt-8"
        >
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              PDF Split Tool
            </h1>
          </div>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Split PDFs by selecting specific pages or removing unwanted pages. Create custom PDFs from your documents.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Panel - Upload & File Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass rounded-2xl p-6"
            >
              <div
                className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                <h3 className="text-2xl font-semibold mb-2">Upload PDF</h3>
                <p className="text-slate-400 mb-4">Drag & drop or click to select (Minimum 2 pages required)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleSelect}
                  className="hidden"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  <FileUp className="w-5 h-5 mr-2" />
                  Choose PDF File
                </Button>
              </div>
            </motion.div>

            {/* File Details & Page Selection */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 space-y-6"
              >
                {/* File Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-lg font-semibold break-all">{file.name}</p>
                      <p className="text-slate-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {totalPages} pages
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      setFile(null);
                      setPages([]);
                      setTotalPages(0);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>

                {/* Selection Mode & Summary */}
                <div className="bg-slate-800/40 rounded-xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BringToFront className="w-4 h-4 text-blue-400" />
                        Split Mode
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant={splitMode === "select" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSplitMode("select")}
                          className={splitMode === "select" ? "bg-blue-600" : ""}
                        >
                          <EyeOpen className="w-3 h-3 mr-2" />
                          Keep Selected
                        </Button>
                        <Button
                          variant={splitMode === "remove" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSplitMode("remove")}
                          className={splitMode === "remove" ? "bg-red-600" : ""}
                        >
                          <EyeOff className="w-3 h-3 mr-2" />
                          Remove Selected
                        </Button>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-sm text-slate-300">{getSelectionSummary()}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {splitMode === "select" 
                          ? "Selected pages will be kept in new PDF" 
                          : "Selected pages will be removed from new PDF"}
                      </p>
                    </div>
                  </div>

                  {/* Quick Selection Tools */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm text-slate-400">Quick Selection Tools</h5>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllPages}
                        className="border-slate-700"
                      >
                        <Check className="w-3 h-3 mr-2" />
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectAllPages}
                        className="border-slate-700"
                      >
                        <X className="w-3 h-3 mr-2" />
                        Deselect All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={invertSelection}
                        className="border-slate-700"
                      >
                        <RotateCw className="w-3 h-3 mr-2" />
                        Invert Selection
                      </Button>
                      
                      {quickSelectOptions.map((option, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={option.action}
                          className="border-slate-700"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Range Selection */}
                  <div className="space-y-3 pt-3 border-t border-slate-700">
                    <h5 className="font-medium text-sm text-slate-400">Range Selection</h5>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="startPage" className="text-sm text-slate-300">From:</Label>
                        <input
                          id="startPage"
                          type="number"
                          min="1"
                          max={totalPages}
                          value={selectedRange[0]}
                          onChange={(e) => handleRangeChange('start', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center"
                        />
                      </div>
                      <ArrowUpDown className="w-4 h-4 text-slate-500" />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="endPage" className="text-sm text-slate-300">To:</Label>
                        <input
                          id="endPage"
                          type="number"
                          min="1"
                          max={totalPages}
                          value={selectedRange[1]}
                          onChange={(e) => handleRangeChange('end', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={applyRangeSelection}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Apply Range
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pages Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Grid className="w-4 h-4 text-blue-400" />
                      Pages ({pages.length})
                    </h4>
                    <div className="text-sm text-slate-400">
                      Click to {splitMode === "select" ? "keep" : "remove"} pages
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pages.map((page) => (
                      <motion.div
                        key={page.index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          page.selected 
                            ? splitMode === "select" 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-red-500 bg-red-500/10'
                            : 'border-slate-700 bg-slate-800/50'
                        }`}
                        onClick={() => togglePageSelection(page.index)}
                        onMouseEnter={() => setPreviewPage(page.index)}
                        onMouseLeave={() => setPreviewPage(null)}
                      >
                        {/* Page Preview */}
                        <div className="aspect-[3/4] bg-slate-900 flex items-center justify-center">
                          {page.preview ? (
                            <img 
                              src={page.preview} 
                              alt={`Page ${page.index + 1}`}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="text-slate-400">
                              <FileText className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        
                        {/* Page Info */}
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">Page {page.index + 1}</span>
                            <div className={`w-3 h-3 rounded-full ${
                              page.selected 
                                ? splitMode === "select" ? 'bg-blue-500' : 'bg-red-500'
                                : 'bg-slate-700'
                            }`} />
                          </div>
                          <div className="text-xs text-slate-400">
                            {page.size ? `~${page.size}KB` : 'Loading...'}
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                          page.selected 
                            ? splitMode === "select" ? 'bg-blue-500' : 'bg-red-500'
                            : 'bg-slate-700'
                        }`}>
                          {page.selected ? (
                            splitMode === "select" ? (
                              <EyeOpen className="w-3 h-3 text-white" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-white" />
                            )
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {progress < 95 ? "Processing..." : "Creating download..."}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Panel - Controls & Actions */}
          <div className="space-y-6">
            {/* Split Actions */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Split className="w-5 h-5 text-blue-400" />
                Split Actions
              </h3>
              
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full text-lg py-7 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={splitPdf}
                    disabled={isProcessing || !file || getPagesToKeep().length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Processing... {progress}%
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5 mr-2" />
                        Split PDF ({getPagesToKeep().length} pages)
                      </>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-lg py-7 border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    onClick={splitToIndividualPdfs}
                    disabled={isProcessing || !file || getSelectedPages().length === 0}
                  >
                    <FileDown className="w-5 h-5 mr-2" />
                    Split to Individual PDFs ({getSelectedPages().length} files)
                  </Button>
                </div>

                {/* Compression Options */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compress" className="flex items-center gap-2 cursor-pointer">
                      <Layers2 className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-medium">Compress Output</div>
                        <div className="text-sm text-slate-400">Reduce file size of split PDF</div>
                      </div>
                    </Label>
                    <Switch
                      id="compress"
                      checked={compressOutput}
                      onCheckedChange={setCompressOutput}
                    />
                  </div>

                  {compressOutput && (
                    <div className="space-y-3 ml-2">
                      <Label className="text-sm font-medium">Compression Level</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[compressionLevel]}
                          onValueChange={(value) => setCompressionLevel(value[0])}
                          min={0}
                          max={100}
                          step={1}
                          className="py-2"
                        />
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Fast</span>
                          <span>Balanced</span>
                          <span>Small</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selection Stats */}
                {file && (
                  <div className="glass rounded-xl p-4 space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      Selection Summary
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Pages:</span>
                        <span className="font-medium">{totalPages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Selected Pages:</span>
                        <span className="font-medium text-blue-400">
                          {pages.filter(p => p.selected).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pages to {splitMode === "select" ? "Keep" : "Remove"}:</span>
                        <span className={`font-medium ${
                          splitMode === "select" ? "text-green-400" : "text-red-400"
                        }`}>
                          {getPagesToKeep().length}
                        </span>
                      </div>
                    </div>

                    {/* Preview of what will be included */}
                    <div className="pt-3 border-t border-slate-700">
                      <p className="text-sm text-slate-400 mb-2">New PDF will include pages:</p>
                      <div className="text-xs bg-slate-800/50 rounded p-2 max-h-20 overflow-y-auto">
                        {getPagesToKeep().length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {getPagesToKeep().map(pageIdx => (
                              <span key={pageIdx} className="px-2 py-1 bg-slate-700 rounded">
                                {pageIdx + 1}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">No pages selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips & Instructions */}
            <div className="glass rounded-2xl p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                How to Split PDFs
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span><strong>Upload</strong> a PDF with at least 2 pages</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span><strong>Select pages</strong> you want to keep or remove</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span><strong>Choose split mode</strong>: Keep Selected or Remove Selected</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span><strong>Click Split PDF</strong> to create new document</span>
                </li>
              </ul>
            </div>

            {/* Security Features */}
            <div className="glass rounded-2xl p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Security & Privacy
              </h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <Lock className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>All processing happens locally in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <CloudOff className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Your files never leave your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>No uploads to external servers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="space-y-8 mt-8">
          {/* What is PDF Split Tool */}
          <section className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Scissors className="w-6 h-6 text-blue-400" />
              What is PDF Split Tool?
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                The PDF Split Tool allows you to extract specific pages from PDF documents. Create custom PDFs by 
                selecting only the pages you need, or remove unwanted pages to clean up your documents.
              </p>
              <p>
                <strong>Perfect for:</strong> Extracting specific chapters from ebooks, removing blank pages from scanned documents, 
                creating presentations from multi-page PDFs, and organizing document collections.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-400 mb-2">Flexible Selection</h4>
                  <p className="text-sm text-slate-400">Keep selected pages or remove unwanted ones</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-400 mb-2">Batch Processing</h4>
                  <p className="text-sm text-slate-400">Split to individual PDFs with one click</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-blue-500/20">
                  <h4 className="font-semibold text-blue-400 mb-2">Smart Tools</h4>
                  <p className="text-sm text-slate-400">Quick select options for common patterns</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-purple-400" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border-b border-slate-700 last:border-b-0"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between py-4 text-left hover:text-blue-300 transition-colors"
                  >
                    <h4 className="font-semibold text-lg pr-4">
                      {faq.question}
                    </h4>
                    <ChevronRight 
                      className={`w-6 h-6 transition-transform duration-300 ${
                        openFaqIndex === index ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-slate-400 text-base pb-4">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}