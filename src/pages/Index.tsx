import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ToolsShowcase } from "@/components/ToolsShowcase";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import heroBg from "@/assets/hero-bg.png";

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Imaggee - Free Online Image Tools | Compress, Convert, Edit Images</title>
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
        <HeroSection />
        <ToolsShowcase />
        <WhyChooseUs />

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
