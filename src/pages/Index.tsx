import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
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

            {/* Mobile - Native Style Navigation */}
            <div className="md:hidden mb-8 relative">
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("compress")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                    activeTab === "compress"
                      ? "glass ring-2 ring-primary"
                      : "glass-subtle hover:glass"
                  }`}
                >
                  <Minimize2 className="w-6 h-6" />
                  <span className="text-xs font-medium">Compress</span>
                </button>
                <button
                  onClick={() => setActiveTab("convert")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                    activeTab === "convert"
                      ? "glass ring-2 ring-primary"
                      : "glass-subtle hover:glass"
                  }`}
                >
                  <Repeat className="w-6 h-6" />
                  <span className="text-xs font-medium">Convert</span>
                </button>
                <button
                  onClick={() => setActiveTab("combine")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                    activeTab === "combine"
                      ? "glass ring-2 ring-primary"
                      : "glass-subtle hover:glass"
                  }`}
                >
                  <Layers className="w-6 h-6" />
                  <span className="text-xs font-medium">Combine</span>
                </button>
                <button
                  onClick={() => setActiveTab("remove-bg")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                    activeTab === "remove-bg"
                      ? "glass ring-2 ring-primary"
                      : "glass-subtle hover:glass"
                  }`}
                >
                  <Eraser className="w-6 h-6" />
                  <span className="text-xs font-medium">Remove BG</span>
                </button>
              </div>

              {/* More Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreHorizontal className="w-4 h-4 mr-2" />
                More Tools
              </Button>

              {/* More Menu */}
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 grid grid-cols-3 gap-2"
                  >
                    <button
                      onClick={() => {
                        setActiveTab("resize");
                        setShowMoreMenu(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                        activeTab === "resize"
                          ? "glass ring-2 ring-primary"
                          : "glass-subtle hover:glass"
                      }`}
                    >
                      <Crop className="w-6 h-6" />
                      <span className="text-xs font-medium">Resize</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("palette");
                        setShowMoreMenu(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                        activeTab === "palette"
                          ? "glass ring-2 ring-primary"
                          : "glass-subtle hover:glass"
                      }`}
                    >
                      <Palette className="w-6 h-6" />
                      <span className="text-xs font-medium">Palette</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("metadata");
                        setShowMoreMenu(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                        activeTab === "metadata"
                          ? "glass ring-2 ring-primary"
                          : "glass-subtle hover:glass"
                      }`}
                    >
                      <FileX className="w-6 h-6" />
                      <span className="text-xs font-medium">Metadata</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center text-sm text-muted-foreground pb-8"
        >
          <p>All processing happens locally in your browser.</p>
          <p className="mt-1">No data is uploaded or stored. Complete privacy guaranteed.</p>
        </motion.footer>
      </div>
    </Layout>
  );
};

export default Index;
