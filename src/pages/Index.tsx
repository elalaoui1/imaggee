import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ToolsShowcase } from "@/components/ToolsShowcase";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import heroBg from "@/assets/hero-bg.png";
import { Minimize2, Repeat, Layers, Smile, Crop, Palette, FileX, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const emojis = ['😀', '😂', '🥰', '😎', '🤩', '😍', '🤗', '🙃', '😇'];
const iconSet = [Minimize2, Repeat, Layers, Smile];

// Tool Demo Components
const CompressDemo = () => (
  <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl border border-white/10">
    
    {/* Floating file size tag — RIGHT SIDE */}
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-[9px] right-4 px-3 py-1.5 rounded-lg backdrop-blur-md bg-black/50 border border-white/10 text-white text-sm font-medium shadow-md flex items-center gap-2"
    >
      <span>2.4MB → 450KB</span>

      {/* status dot on the right */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-green-500"
      />
    </motion.div>

    {/* Compression "box" visual */}
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 0.9, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-40 h-40 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-[0_0_35px_8px_rgba(255,255,255,0.15)]"
      />

      {/* Compressed inner box */}
      <motion.div
        animate={{ scale: [0.7, 0.5, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-20 h-20 rounded-lg bg-white/10 border border-white/20 shadow-[0_0_25px_4px_rgba(0,0,0,0.25)]"
      />
    </div>

    {/* Animated quality bars */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {[100, 80, 60, 40].map((q, i) => (
        <motion.div
          key={q}
          initial={{ opacity: 0, height: 10 }}
          animate={{ opacity: 1, height: [12, 28 - i * 4, 12] }}
          transition={{
            duration: 1.8,
            delay: i * 0.25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-3 rounded-md bg-white/70 shadow-md"
        />
      ))}
    </div>

    {/* Light overlay for premium depth */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
  </div>
);

const ConvertDemo = () => {
  const [inputFormat, setInputFormat] = useState('PNG');
  const [outputFormat, setOutputFormat] = useState('JPG');
  
  const formats = ['PNG', 'JPG', 'WEBP', 'AVIF', 'GIF', 'BMP'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = formats.indexOf(outputFormat);
      const nextIndex = (currentIndex + 1) % formats.length;
      setOutputFormat(formats[nextIndex]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [outputFormat]);

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden p-6">
      
      {/* Main Conversion Flow */}
      <div className="absolute inset-0 flex items-center justify-center space-x-8">
        
        {/* Input File */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-20 h-24 bg-white rounded-xl shadow-2xl flex flex-col"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="h-6 bg-blue-400 rounded-t-xl flex items-center justify-center">
              <span className="text-xs text-white font-bold">.{inputFormat}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg" />
            </div>
          </motion.div>
          <motion.div
            className="mt-2 text-white text-sm font-medium bg-black/30 px-2 py-1 rounded"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Input
          </motion.div>
        </div>

        {/* Conversion Arrow */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-3xl text-white mb-2">→</div>
          <div className="text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
            Convert
          </div>
        </motion.div>

        {/* Output File */}
        <div className="flex flex-col items-center">
          <motion.div
            key={outputFormat}
            className="w-20 h-24 bg-green-50 rounded-xl shadow-2xl flex flex-col"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-6 bg-green-500 rounded-t-xl flex items-center justify-center">
              <span className="text-xs text-white font-bold">.{outputFormat}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  borderRadius: ['8px', '12px', '8px']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
          <motion.div
            className="mt-2 text-white text-sm font-medium bg-black/30 px-2 py-1 rounded"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Output
          </motion.div>
        </div>

      </div>

      {/* Format Cycling Display */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
        <div className="flex items-center gap-3 text-white text-sm">
          <span className="text-blue-300">.{inputFormat}</span>
          <motion.div
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Repeat />
          </motion.div>
          <motion.span
            key={outputFormat}
            className="text-green-300 font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            .{outputFormat}
          </motion.span>
        </div>
      </div>      

      {/* Processing Animation */}
      <div className="absolute bottom-4 right-4">
        <motion.div
          className="w-16 h-2 bg-white/30 rounded-full overflow-hidden"
          animate={{ width: [48, 64, 48] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="h-full bg-yellow-400"
            animate={{ x: [-64, 64] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </motion.div>
      </div>

    </div>
  );
};

const RemoveBgDemo = () => (
  <div className="relative w-full h-64 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl overflow-hidden">
    {/* Before/After comparison */}
    <div className="absolute inset-0 flex">
      <motion.div
        className="flex-1 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(45deg, #666 25%, transparent 25%), linear-gradient(-45deg, #666 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #666 75%), linear-gradient(-45deg, transparent 75%, #666 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        <motion.div
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-32 bg-white/90 rounded-lg absolute top-1/2 left-1/4 transform -translate-y-1/2 shadow-lg"
        />
      </motion.div>
      
      <motion.div
        className="flex-1 bg-transparent"
        animate={{ backgroundColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <motion.div
          animate={{ x: [-100, 0, -100] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-24 h-32 bg-white/90 rounded-lg absolute top-1/2 left-3/4 transform -translate-y-1/2 shadow-lg"
        />
      </motion.div>
    </div>
    
    {/* AI processing indicator */}
    <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        AI Processing
      </motion.div>
    </div>
  </div>
);

// Combine Tool Demo Component
const CombineDemo = () => (
  <div className="relative w-full h-64 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl overflow-hidden">
    {/* Multiple images merging animation */}
    <div className="absolute inset-0 flex items-center justify-center">
      {/* First image */}
      <motion.div
        animate={{ 
          x: [-60, 0, -60],
          y: [-20, 0, -20],
          rotate: [-5, 0, -5]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-20 h-24 bg-white/80 rounded-lg shadow-lg border-2 border-white/60"
      >
        <div className="w-full h-1/2 bg-gradient-to-br from-blue-400 to-blue-300 rounded-t-lg" />
        <div className="w-full h-1/2 bg-gradient-to-br from-green-400 to-green-300 rounded-b-lg" />
      </motion.div>
      
      {/* Second image */}
      <motion.div
        animate={{ 
          x: [60, 0, 60],
          y: [20, 0, 20],
          rotate: [5, 0, 5]
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute w-20 h-24 bg-white/80 rounded-lg shadow-lg border-2 border-white/60"
      >
        <div className="w-full h-1/3 bg-gradient-to-br from-red-400 to-red-300 rounded-t-lg" />
        <div className="w-full h-1/3 bg-gradient-to-br from-yellow-400 to-yellow-300" />
        <div className="w-full h-1/3 bg-gradient-to-br from-purple-400 to-purple-300 rounded-b-lg" />
      </motion.div>
      
      {/* Combined result */}
      <motion.div
        animate={{ 
          scale: [0.8, 1, 0.8],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-24 h-28 bg-white/90 rounded-xl shadow-2xl border-2 border-white/80 backdrop-blur-sm"
      >
        <div className="w-full h-1/4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-xl" />
        <div className="w-full h-1/4 bg-gradient-to-r from-green-400 to-yellow-400" />
        <div className="w-full h-1/4 bg-gradient-to-r from-red-400 to-pink-400" />
        <div className="w-full h-1/4 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-b-xl" />
      </motion.div>
    </div>
    
    {/* Merge animation indicator */}
    {/* <motion.div
      className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-1 rounded-full text-sm"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      🔄 Merging...
    </motion.div> */}
    
    {/* Layout options */}
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      {['Grid', 'Collage', 'Stack'].map((layout, i) => (
        <motion.div
          key={layout}
          className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.7, repeat: Infinity }}
        >
          {layout}
        </motion.div>
      ))}
    </div>
  </div>
);

// Blur & Emoji Tool Demo Component
const BlurEmojiDemo = () => {
  const [placedEmojis, setPlacedEmojis] = useState([]);
  const [blurAreas, setBlurAreas] = useState([]);

  const handlePlaceEmoji = (emoji, x, y) => {
    setPlacedEmojis([...placedEmojis, { emoji, x, y }]);
  };

  const handleAddBlur = (x, y) => {
    setBlurAreas([...blurAreas, { x, y }]);
  };

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl overflow-hidden shadow-xl border border-white/10">

      {/* Main canvas */}
      <div className="absolute inset-0 flex items-center justify-center cursor-crosshair">
        <div className="relative w-64 h-40 bg-white/5 rounded-xl overflow-hidden border border-white/20">
          
          {/* Placed blur overlays */}
          {blurAreas.map((b, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/20"
              style={{ left: b.x, top: b.y }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ))}

          {/* Placed emojis */}
          {placedEmojis.map((e, i) => (
            <motion.div
              key={i}
              className="absolute w-10 h-10 flex items-center justify-center text-xl"
              style={{ left: e.x, top: e.y }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {e.emoji}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Emoji selection panel */}
      <div className="absolute top-14 left-4 bg-white/10 backdrop-blur-sm rounded-2xl p-3">
        <div className="grid grid-cols-3 gap-2">
          {emojis.map((emoji, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.3, rotate: 10 }}
              onClick={() => handlePlaceEmoji(emoji, Math.random() * 180, Math.random() * 120)}
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute top-14 right-4 bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-lg">
      <div className="grid grid-cols-2 gap-3">
        {['small', 'medium', 'large', 'custom'].map((size, i) => (
          <motion.div
            key={size}
            className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors relative overflow-hidden shadow-inner"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddBlur(size, Math.random() * 160, Math.random() * 100)}
          >
            {/* Animated blur preview */}
            <motion.div
              className={`absolute bg-white/50 rounded-full ${
                size === 'small' ? 'w-3 h-3' :
                size === 'medium' ? 'w-5 h-5' :
                size === 'large' ? 'w-7 h-7' :
                'w-4 h-2'
              }`}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: i * 0.2 }}
            />
          </motion.div>
        ))}
      </div>
    </div>


      {/* Blur selection button (placeholder) */}
      <motion.button
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white font-medium shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleAddBlur(Math.random() * 180, Math.random() * 120)}
      >
        Add Blur
      </motion.button>

      {/* Real-time preview indicator */}
      <motion.div
        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2"
        animate={{ boxShadow: ['0 0 0px rgba(255,255,255,0.3)', '0 0 15px rgba(255,255,255,0.6)', '0 0 0px rgba(255,255,255,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          className="w-2 h-2 bg-green-400 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-white text-sm font-medium">Live Preview</span>
      </motion.div>
    </div>
  );
};

const ResizeDemo = () => {
  const presets = {
    instagram: { name: 'Instagram', ratio: '1:1', width: 1080, height: 1080 },
    story: { name: 'Story', ratio: '9:16', width: 1080, height: 1920 },
    facebook: { name: 'Facebook', ratio: '16:9', width: 1200, height: 630 },
    twitter: { name: 'Twitter', ratio: '16:9', width: 1200, height: 675 },
    whatsapp: { name: 'WhatsApp', ratio: '1:1', width: 800, height: 800 },
    custom: { name: 'Custom', ratio: 'Free', width: '?', height: '?' }
  };

  const presetKeys = Object.keys(presets);
  const [activePreset, setActivePreset] = useState(presetKeys[0]);

  // Auto-cycle presets every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePreset(prev => {
        const idx = presetKeys.indexOf(prev);
        return presetKeys[(idx + 1) % presetKeys.length];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl overflow-hidden p-4">

      {/* Platform Name Display */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-0 bg-black/30 backdrop-blur-sm rounded-xl p-1">
        {presetKeys.map((key) => (
          <motion.div
            key={key}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activePreset === key ? 'bg-white text-purple-600' : 'text-white/70'
            }`}
            animate={{ scale: activePreset === key ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {presets[key].name}
          </motion.div>
        ))}
      </div>

      {/* Resized Preview */}
      <div className="absolute inset-0 flex items-center justify-center mt-8 gap-6">
        {/* Original Image */}
        <motion.div
          className="relative w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg shadow-lg border-2 border-white/50 flex items-center justify-center text-white/80 text-xs"
        >
          Original
        </motion.div>

        <motion.div
          className="text-2xl text-white/70"
          animate={{ x: [-3, 3, -3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.div>

        {/* Resized Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePreset}
            className="relative bg-gradient-to-br from-green-400 to-emerald-300 shadow-lg border-2 border-white/50 rounded-lg flex items-center justify-center text-white/80 text-xs"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.5 }}
            style={{
              width: presets[activePreset].width === 1080 ? 120 :
                     presets[activePreset].width === 1200 ? 140 : 100,
              height: presets[activePreset].height === 1080 ? 120 :
                      presets[activePreset].height === 1920 ? 80 :
                      presets[activePreset].height === 630 ? 70 : 100,
            }}
          >
            {presets[activePreset].name}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

const PaletteDemo = () => (
  <div className="relative w-full h-64 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl overflow-hidden">
    {/* Color palette animation */}
    <div className="absolute inset-0 flex">
      {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'].map((color, i) => (
        <motion.div
          key={i}
          className="flex-1"
          style={{ backgroundColor: color }}
          animate={{ 
            scaleY: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2, 
            delay: i * 0.3,
            repeat: Infinity 
          }}
        />
      ))}
    </div>
    
    {/* Color codes */}
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
      {['#FF6B6B', '#4ECDC4', '#45B7D1'].map((color, i) => (
        <motion.div
          key={i}
          className="px-2 py-1 rounded text-xs font-mono bg-black/80 text-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
        >
          {color}
        </motion.div>
      ))}
    </div>
  </div>
);

const MetadataDemo = () => (
  <div className="relative w-full h-64 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl overflow-hidden">
    {/* Metadata table animation */}
    <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-10">
      <div className="space-y-2">
        {[
          { label: 'Camera', value: 'Canon EOS R5' },
          { label: 'Aperture', value: 'f/2.8' },
          { label: 'ISO', value: '200' },
          { label: 'Date', value: '2024-01-15' }
        ].map((item, i) => (
          <motion.div
            key={i}
            className="flex justify-between text-white text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <span className="font-semibold">{item.label}:</span>
            <span>{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
    
    {/* Edit indicator */}
    <motion.div
      className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-sm"
      animate={{ backgroundColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      ✏️ Editing
    </motion.div>
  </div>
);

const Index = () => {
  const tools = [
    {
      id: "compress",
      name: "Image Compressor",
      description: "Drastically reduce image file size while preserving visual quality. Perfect for web optimization and faster loading times.",
      features: ["Smart compression algorithms", "Quality adjustment slider", "Batch processing", "Format optimization"],
      demo: <CompressDemo />,
      color: "from-blue-500 to-purple-600",
      icon: <Minimize2 />,
      url: "/compress"
    },
    {
      id: "convert",
      name: "Format Converter",
      description: "Seamlessly convert between all major image formats including PNG, JPG, WebP, AVIF, and more with one click.",
      features: ["30+ format support", "Bulk conversion", "Quality preservation", "Fast processing"],
      demo: <ConvertDemo />,
      color: "from-green-500 to-teal-600",
      icon: <Repeat />,
      url: "/convert"
    },
    // {
    //   id: "remove-bg",
    //   name: "Background Remover",
    //   description: "AI-powered background removal with precision edge detection. Get clean, transparent backgrounds in seconds.",
    //   features: ["AI-powered detection", "Hair & fine details", "Batch processing", "Transparent PNG output"],
    //   demo: <RemoveBgDemo />,
    //   color: "from-pink-500 to-rose-600",
    //   icon: "✂️",
    //   url: "/remove-bg"
    // },
    {
    id: "combine",
    name: "Image Combiner",
    description: "Merge multiple images into stunning collages, grids, and creative compositions. Perfect for social media posts and photo albums.",
    features: ["Multiple layout options", "Smart alignment", "Custom spacing", "Batch processing"],
    demo: <CombineDemo />,
    color: "from-purple-500 to-indigo-600",
    icon: <Layers />,
    url: "/combine"
  },
  {
    id: "blur-emoji",
    name: "Blur & Emoji",
    description: "Add artistic blur effects and expressive emojis to your images. Protect privacy or add fun elements to your photos.",
    features: ["Adjustable blur intensity", "Emoji library", "Real-time preview", "Position controls"],
    demo: <BlurEmojiDemo />,
    color: "from-cyan-500 to-blue-600",
    icon: <Smile />,
    url: "/blur-emoji"
  },
    {
      id: "resize",
      name: "Smart Resizer",
      description: "Intelligent image resizing with content-aware scaling. Maintain proportions or crop to exact dimensions.",
      features: ["Content-aware scaling", "Multiple resize modes", "Preset templates", "Bulk resizing"],
      demo: <ResizeDemo />,
      color: "from-orange-500 to-red-600",
      icon: <Crop />,
      url: "/resize"
    },
    {
      id: "palette",
      name: "Color Palette Extractor",
      description: "Extract beautiful color palettes from your images. Perfect for designers and brand development.",
      features: ["Smart color detection", "Multiple palette types", "HEX/RGB/HSL codes", "Export options"],
      demo: <PaletteDemo />,
      color: "from-yellow-500 to-amber-600",
      icon: <Palette />,
      url: "/palette"
    },
    {
      id: "metadata",
      name: "Metadata Editor",
      description: "View, edit, and manage image metadata including EXIF, IPTC, and XMP data for better organization.",
      features: ["EXIF data editing", "Batch metadata", "Privacy protection", "Data export"],
      demo: <MetadataDemo />,
      color: "from-indigo-500 to-blue-600",
      icon: <FileX />,
      url: "/metadata"
    }
  ];

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
        <link rel="canonical" href="https://imaggee.com/" />
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
        
        {/* Enhanced Tools Showcase */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                Professional Image Tools
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful, privacy-focused tools that work directly in your browser. 
                No uploads, no waiting, complete control.
              </p>
            </motion.div>

            {/* Tools Grid */}
            <div className="space-y-32">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex flex-col ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } items-center gap-12 lg:gap-20`}
                >
                  {/* Demo Container with 3D Effect */}
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ 
                        scale: 1.02,
                        rotateY: index % 2 === 0 ? 5 : -5,
                        transition: { duration: 0.3 }
                      }}
                      className="relative group"
                    >
                      {/* 3D Container */}
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl transform-gpu transition-all duration-300 group-hover:shadow-3xl">
                        {/* Gradient Border */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-20 rounded-2xl`}></div>
                        
                        {/* Main Demo Container */}
                        <div className="relative bg-card rounded-2xl p-1 transform-gpu">
                          {tool.demo}
                          
                          {/* Floating Badge */}
                          <div
                            className={`absolute ${
                              tool.name === "Smart Resizer" ? "bottom-4 left-4" : "top-4 left-4"
                            }`}
                          >
                            <span className="bg-background/80 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                              <span className="text-lg">{tool.icon}</span>
                              {tool.name}
                            </span>
                          </div>

                          {/* Hover Effect Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end justify-center pb-4">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                              to={tool.url} // your link here
                              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold shadow-lg"
                            >
                              Try Now
                            </Link>
                          </motion.div>
                        </div>
                        </div>
                      </div>
                      
                      {/* Floating Elements */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Tool Icon & Name */}
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${tool.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {tool.icon}
                        </div>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {tool.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>

                      {/* Features List */}
                      <ul className="space-y-3">
                        {tool.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + featureIndex * 0.1 }}
                            className="flex items-center gap-3 text-foreground/80"
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tool.color}`}></div>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="pt-4"
                      >
                       <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            to={tool.url}
                            className={`bg-gradient-to-r ${tool.color} text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                          >
                            Use {tool.name} →
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <WhyChooseUs />

        {/* Enhanced CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background"
        >
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Ready to Transform Your Images?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of users who trust Imaggee for their image processing needs. 
                Fast, secure, and completely free - no strings attached.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Processing Images Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-primary text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary/10 transition-all"
                >
                  View All Tools
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground pb-8 bg-background"
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