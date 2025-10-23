import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { CompressTool } from "@/components/CompressTool";
import { ConvertTool } from "@/components/ConvertTool";
import { CombineTool } from "@/components/CombineTool";
import { Minimize2, Repeat, Layers } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("compress");

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
            <TabsList className="grid w-full grid-cols-3 mb-8 glass">
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
            </TabsList>

            <TabsContent value="compress" className="animate-fade-in">
              <CompressTool />
            </TabsContent>

            <TabsContent value="convert" className="animate-fade-in">
              <ConvertTool />
            </TabsContent>

            <TabsContent value="combine" className="animate-fade-in">
              <CombineTool />
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
