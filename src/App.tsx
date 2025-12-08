import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import CompressPage from "./pages/CompressPage";
import ConvertPage from "./pages/ConvertPage";
import CombinePage from "./pages/CombinePage";
import BlurEmojiPage from "./pages/BlurEmojiPage";
import ResizePage from "./pages/ResizePage";
import PalettePage from "./pages/PalettePage";
import MetadataPage from "./pages/MetadataPage";
import MergePDFPage from "./pages/MergePDFPage";
import PdfCompressPage from "./pages/PdfCompressPage";
import PdfSplitPage from "./pages/PdfSplitPage";
import QrGeneratorPage from "./pages/QrGeneratorPage";
import ImagesToPdfPage from "./pages/ImagesToPdfPage";
import PdfToImagesPage from "./pages/PdfToImagesPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import { Analytics } from '@vercel/analytics/react';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/compress" element={<CompressPage />} />
            <Route path="/convert" element={<ConvertPage />} />
            <Route path="/combine" element={<CombinePage />} />
            <Route path="/blur-emoji" element={<BlurEmojiPage />} />
            <Route path="/resize" element={<ResizePage />} />
            <Route path="/palette" element={<PalettePage />} />
            <Route path="/metadata" element={<MetadataPage />} />
            <Route path="/merge-pdf" element={<MergePDFPage />} />
            {/* <Route path="/pdf-compress" element={<PdfCompressPage />} /> */}
            <Route path="/pdf-split" element={<PdfSplitPage />} />
            <Route path="/qr-generator" element={<QrGeneratorPage />} />
            <Route path="/image-to-pdf" element={<ImagesToPdfPage />} />
            <Route path="/pdf-to-image" element={<PdfToImagesPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          <Analytics />
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
