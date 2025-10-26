import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompressTool } from "@/components/CompressTool";
import { ConvertTool } from "@/components/ConvertTool";
import { CombineTool } from "@/components/CombineTool";
import { BackgroundRemoverTool } from "@/components/BackgroundRemoverTool";
import { ResizeTool } from "@/components/ResizeTool";
import { PaletteTool } from "@/components/PaletteTool";
import { MetadataTool } from "@/components/MetadataTool";
import { Minimize2, Repeat, Layers, Eraser, Crop, Palette, FileX, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("compress");
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <Layout>
      <Helmet>
        <title>ImageForge - Free Online Image Tools | Compress, Convert, Edit Images</title>
        <meta
          name="description"
          content="Professional online image tools: compress images, convert formats (PNG, JPG, WebP), remove backgrounds, resize images, extract color palettes, and edit metadata. 100% free and private - all processing happens in your browser."
        />
        <meta
          name="keywords"
          content="online image tools, compress images, convert images, remove background, resize images, image editor, color palette extractor, image metadata, PNG to JPG, WebP converter, free image tools"
        />
        <link rel="canonical" href="https://yoursite.com/" />
      </Helmet>

      {/* Hero Background */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10">
        <Header />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Desktop/Tablet - Horizontal Scroll */}
            <div className="hidden md:block mb-8">
              <TabsList className="inline-flex w-auto glass overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="compress">
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Compress
                </TabsTrigger>
                <TabsTrigger value="convert">
                  <Repeat className="w-4 h-4 mr-2" />
                  Convert
                </TabsTrigger>
                <TabsTrigger value="combine">
                  <Layers className="w-4 h-4 mr-2" />
                  Combine
                </TabsTrigger>
                <TabsTrigger value="remove-bg">
                  <Eraser className="w-4 h-4 mr-2" />
                  Remove BG
                </TabsTrigger>
                <TabsTrigger value="resize">
                  <Crop className="w-4 h-4 mr-2" />
                  Resize
                </TabsTrigger>
                <TabsTrigger value="palette">
                  <Palette className="w-4 h-4 mr-2" />
                  Palette
                </TabsTrigger>
                <TabsTrigger value="metadata">
                  <FileX className="w-4 h-4 mr-2" />
                  Metadata
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile - Fixed Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-safe">
              <div className="grid grid-cols-4 gap-1 p-2">
                <button
                  onClick={() => setActiveTab("compress")}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                    activeTab === "compress"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Minimize2 className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Compress</span>
                </button>
                <button
                  onClick={() => setActiveTab("convert")}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                    activeTab === "convert"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Convert</span>
                </button>
                <button
                  onClick={() => setActiveTab("combine")}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                    activeTab === "combine"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Combine</span>
                </button>
                <button
                  onClick={() => setActiveTab("remove-bg")}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                    activeTab === "remove-bg"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Eraser className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Remove BG</span>
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-1 px-2 pb-2">
                <button
                  onClick={() => setActiveTab("resize")}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                    activeTab === "resize"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Crop className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Resize</span>
                </button>
                <button
                  onClick={() => setActiveTab("palette")}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                    activeTab === "palette"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Palette</span>
                </button>
                <button
                  onClick={() => setActiveTab("metadata")}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${
                    activeTab === "metadata"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <FileX className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Metadata</span>
                </button>
              </div>
            </div>

            <TabsContent value="compress" className="animate-fade-in">
              <CompressTool />
            </TabsContent>

            <TabsContent value="convert" className="animate-fade-in">
              <ConvertTool />
            </TabsContent>

            <TabsContent value="combine" className="animate-fade-in">
              <CombineTool />
            </TabsContent>

            <TabsContent value="remove-bg" className="animate-fade-in">
              <BackgroundRemoverTool />
            </TabsContent>

            <TabsContent value="resize" className="animate-fade-in">
              <ResizeTool />
            </TabsContent>

            <TabsContent value="palette" className="animate-fade-in">
              <PaletteTool />
            </TabsContent>

            <TabsContent value="metadata" className="animate-fade-in">
              <MetadataTool />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center text-sm text-muted-foreground pb-8"
        >
          <p>All processing happens locally in your browser.</p>
          <p className="mt-1">No data is uploaded or stored. Complete privacy guaranteed.</p>
        </motion.div>

        <Footer />
      </div>
    </Layout>
  );
};

export default Index;
