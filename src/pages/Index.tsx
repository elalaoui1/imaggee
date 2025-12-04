import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ToolsShowcase } from "@/components/ToolsShowcase";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import  FeatureCardSection  from "@/components/FeatureCardSection";
import  Supporters from "@/components/Supporters";
import heroBg from "@/assets/hero-bg.png";
import { Minimize2, Repeat, Layers, Smile, Crop, Palette, FileX, Menu, X, ArrowRight, Download, Shield, Star, Bolt, Ruler, Expand, Coffee, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  const tools = [
    // Image Tools
    {
      id: "compress",
      name: "Compress",
      description: "Reduce image file size up to 80% while keeping visual quality",
      features: ["Smart compression", "Quality preservation", "Batch processing"],
      color: "purple",
      icon: "fas fa-compress-alt",
      url: "/compress",
      category: "image",
      stats: [
        { icon: "fas fa-download", label: "Smaller" },
        { icon: "fas fa-shield-alt", label: "Quality" }
      ]
    },
    {
      id: "convert",
      name: "Convert",
      description: "Convert between PNG, JPG, WebP, GIF, BMP, and more formats",
      features: ["10+ formats", "Instant conversion", "Quality control"],
      color: "pink",
      icon: "fas fa-sync-alt",
      url: "/convert",
      category: "image",
      stats: [
        { icon: "fas fa-star", label: "10+ Formats" },
        { icon: "fas fa-bolt", label: "Instant" }
      ]
    },
    {
      id: "resize",
      name: "Resize",
      description: "Resize images to exact dimensions with smart aspect ratio control",
      features: ["Precision control", "Batch resizing", "Aspect ratio"],
      color: "orange",
      icon: "",
      icon2: Crop,
      url: "/resize",
      category: "image",
      stats: [
        { icon: "fas fa-ruler", label: "Precision" },
        { icon: "fas fa-layer-group", label: "Batch" }
      ]
    },
    {
      id: "combine",
      name: "Combine",
      description: "Merge multiple images into stunning collages and creative compositions",
      features: ["Multiple layouts", "Smart alignment", "Custom spacing"],
      color: "blue",
      icon: "fas fa-layer-group",
      url: "/combine",
      category: "image",
      stats: [
        { icon: "fas fa-star", label: "Layouts" },
        { icon: "fas fa-bolt", label: "Smart" }
      ]
    },
    {
      id: "blur-emoji",
      name: "Blur & Emoji",
      description: "Add artistic blur effects and expressive emojis to your images",
      features: ["Adjustable blur", "Emoji library", "Real-time preview"],
      color: "cyan",
      icon: "fas fa-smile",
      url: "/blur-emoji",
      category: "image",
      stats: [
        { icon: "fas fa-shield-alt", label: "Privacy" },
        { icon: "fas fa-star", label: "Fun" }
      ]
    },
    {
      id: "palette",
      name: "Color Palette",
      description: "Extract beautiful color palettes from your images for design projects",
      features: ["Smart detection", "Multiple formats", "Export options"],
      color: "yellow",
      icon: "fas fa-palette",
      url: "/palette",
      category: "image",
      stats: [
        { icon: "fas fa-star", label: "Smart" },
        { icon: "fas fa-download", label: "Export" }
      ]
    },
    {
      id: "metadata",
      name: "Metadata",
      description: "View, edit, and manage image metadata including EXIF and IPTC data",
      features: ["EXIF editing", "Batch metadata", "Privacy protection"],
      color: "indigo",
      icon: "fas fa-info-circle",
      url: "/metadata",
      category: "image",
      stats: [
        { icon: "fas fa-shield-alt", label: "Privacy" },
        { icon: "fas fa-bolt", label: "Edit" }
      ]
    },
    {
      id: "remove-bg",
      name: "Remove Background",
      description: "Automatically remove image backgrounds with AI-powered precision",
      features: ["AI technology", "High precision", "Instant results"],
      color: "green",
      icon: "fas fa-eraser",
      url: "/remove-bg",
      category: "image",
      stats: [
        { icon: "fas fa-star", label: "AI Powered" },
        { icon: "fas fa-bolt", label: "Instant" }
      ]
    },
    // PDF Tools
    {
      id: "merge-pdf",
      name: "Merge PDF",
      description: "Combine multiple PDF files into a single document seamlessly",
      features: ["Drag & drop", "Order control", "Fast processing"],
      color: "red",
      icon: "fas fa-file-pdf",
      url: "/merge-pdf",
      category: "pdf",
      stats: [
        { icon: "fas fa-layer-group", label: "Merge" },
        { icon: "fas fa-bolt", label: "Fast" }
      ]
    },
    {
      id: "pdf-split",
      name: "Split PDF",
      description: "Extract specific pages or sections from PDF files quickly",
      features: ["Page selection", "Range extraction", "Batch splitting"],
      color: "orange",
      icon: "fas fa-cut",
      url: "/pdf-split",
      category: "pdf",
      stats: [
        { icon: "fas fa-scissors", label: "Split" },
        { icon: "fas fa-layer-group", label: "Batch" }
      ]
    },
     {
      id: "image-to-pdf",
      name: "Images to PDF",
      description: "Convert images into a single PDF document effortlessly",
      features: ["Multiple images", "Custom layout", "Fast conversion"],
      color: "blue",
      icon: "fas fa-file-image",
      url: "/image-to-pdf",
      category: "pdf",
      stats: [
        { icon: "fas fa-image", label: "Multi Formats" },
        { icon: "fas fa-bolt", label: "Fast" }
      ]
    },
    {
      id: "pdf-to-image",
      name: "PDF to Image",
      description: "Convert PDF pages into high-quality images in various formats",
      features: ["Multiple formats", "High resolution", "Fast conversion"],
      color: "cyan",
      icon: "fas fa-images",
      url: "/pdf-to-image",
      category: "pdf",
      stats: [
        { icon: "fas fa-image", label: "High Quality" },
        { icon: "fas fa-bolt", label: "Instant" }
      ]
    },
   
    // QR Tools
    {
      id: "qr-generator",
      name: "QR Generator",
      description: "Create custom QR codes for URLs, text, contacts, and more",
      features: ["Customizable", "Multiple types", "High resolution"],
      color: "teal",
      icon: "fas fa-qrcode",
      url: "/qr-generator",
      category: "qr",
      stats: [
        { icon: "fas fa-star", label: "Custom" },
        { icon: "fas fa-download", label: "Export" }
      ]
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      purple: {
        bg: "from-purple-500/10 to-purple-500/5",
        border: "border-purple-500/20 hover:border-purple-500/40",
        gradient: "from-purple-500 to-purple-600",
        shadow: "group-hover:shadow-purple-500/20",
        text: "group-hover:text-purple-400",
        icon: "text-purple-400",
        focus: "focus:ring-purple-500",
        blurColor: "bg-purple-500",
        blurColor2: "bg-purple-400"
      },
      pink: {
        bg: "from-pink-500/10 to-pink-500/5",
        border: "border-pink-500/20 hover:border-pink-500/40",
        gradient: "from-pink-500 to-pink-600",
        shadow: "group-hover:shadow-pink-500/20",
        text: "group-hover:text-pink-400",
        icon: "text-pink-400",
        focus: "focus:ring-pink-500",
        blurColor: "bg-pink-500",
        blurColor2: "bg-pink-400"
      },
      orange: {
        bg: "from-orange-500/10 to-orange-500/5",
        border: "border-orange-500/20 hover:border-orange-500/40",
        gradient: "from-orange-500 to-orange-600",
        shadow: "group-hover:shadow-orange-500/20",
        text: "group-hover:text-orange-400",
        icon: "text-orange-400",
        focus: "focus:ring-orange-500",
        blurColor: "bg-orange-500",
        blurColor2: "bg-orange-400"
      },
      blue: {
        bg: "from-blue-500/10 to-blue-500/5",
        border: "border-blue-500/20 hover:border-blue-500/40",
        gradient: "from-blue-500 to-blue-600",
        shadow: "group-hover:shadow-blue-500/20",
        text: "group-hover:text-blue-400",
        icon: "text-blue-400",
        focus: "focus:ring-blue-500",
        blurColor: "bg-blue-500",
        blurColor2: "bg-blue-400"
      },
      cyan: {
        bg: "from-cyan-500/10 to-cyan-500/5",
        border: "border-cyan-500/20 hover:border-cyan-500/40",
        gradient: "from-cyan-500 to-cyan-600",
        shadow: "group-hover:shadow-cyan-500/20",
        text: "group-hover:text-cyan-400",
        icon: "text-cyan-400",
        focus: "focus:ring-cyan-500",
        blurColor: "bg-cyan-500",
        blurColor2: "bg-cyan-400"
      },
      yellow: {
        bg: "from-yellow-500/10 to-yellow-500/5",
        border: "border-yellow-500/20 hover:border-yellow-500/40",
        gradient: "from-yellow-500 to-yellow-600",
        shadow: "group-hover:shadow-yellow-500/20",
        text: "group-hover:text-yellow-400",
        icon: "text-yellow-400",
        focus: "focus:ring-yellow-500",
        blurColor: "bg-yellow-500",
        blurColor2: "bg-yellow-400"
      },
      indigo: {
        bg: "from-indigo-500/10 to-indigo-500/5",
        border: "border-indigo-500/20 hover:border-indigo-500/40",
        gradient: "from-indigo-500 to-indigo-600",
        shadow: "group-hover:shadow-indigo-500/20",
        text: "group-hover:text-indigo-400",
        icon: "text-indigo-400",
        focus: "focus:ring-indigo-500",
        blurColor: "bg-indigo-500",
        blurColor2: "bg-indigo-400"
      },
      green: {
        bg: "from-green-500/10 to-green-500/5",
        border: "border-green-500/20 hover:border-green-500/40",
        gradient: "from-green-500 to-green-600",
        shadow: "group-hover:shadow-green-500/20",
        text: "group-hover:text-green-400",
        icon: "text-green-400",
        focus: "focus:ring-green-500",
        blurColor: "bg-green-500",
        blurColor2: "bg-green-400"
      },
      red: {
        bg: "from-red-500/10 to-red-500/5",
        border: "border-red-500/20 hover:border-red-500/40",
        gradient: "from-red-500 to-red-600",
        shadow: "group-hover:shadow-red-500/20",
        text: "group-hover:text-red-400",
        icon: "text-red-400",
        focus: "focus:ring-red-500",
        blurColor: "bg-red-500",
        blurColor2: "bg-red-400"
      },
      teal: {
        bg: "from-teal-500/10 to-teal-500/5",
        border: "border-teal-500/20 hover:border-teal-500/40",
        gradient: "from-teal-500 to-teal-600",
        shadow: "group-hover:shadow-teal-500/20",
        text: "group-hover:text-teal-400",
        icon: "text-teal-400",
        focus: "focus:ring-teal-500",
        blurColor: "bg-teal-500",
        blurColor2: "bg-teal-400"
      } 
    };
    
    return colorMap[color] || colorMap.purple;
  };

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  const categoryLabels = {
    image: "Image Tools",
    pdf: "PDF Tools", 
    qr: "QR Tools"
  };

  return (
    <Layout>
      <Helmet>
        <title>Imaggee - 100% Free Online Tools | Images, PDFs, QR Codes</title>
        <meta
          name="description"
          content="100% free online tools: compress images, convert formats, merge PDFs, generate QR codes, remove backgrounds, and more. All processing happens in your browser - no uploads, complete privacy."
        />
        <meta
          name="keywords"
          content="free image tools, compress images, convert images, merge PDF, QR code generator, remove background, resize images, online tools 100% free"
        />
        <link rel="canonical" href="https://imaggee.com/" />
      </Helmet>

      {/* Updated Background with Grid */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10">
        <HeroSection />
        
        {/* Buy Me a Coffee Section */}
       <motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="relative py-10 sm:py-12 bg-gradient-to-b from-black via-zinc-900/40 to-black border border-amber-950 rounded-sm overflow-hidden"
>

  {/* Soft glow background */}
  <div className="absolute inset-0">
    <div className="absolute -top-20 right-0 w-40 h-40 bg-amber-700/20 blur-2xl"></div>
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-700/20 blur-2xl"></div>
  </div>

  <div className="relative z-10 container mx-auto px-5 text-center max-w-2xl">

    {/* Icon */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-5 w-14 h-14 bg-gradient-to-br from-amber-700 to-orange-700 rounded-xl 
                 flex items-center justify-center border border-amber-600/40 shadow-lg"
    >
      <Coffee className="text-amber-100 text-xl" />
    </motion.div>

    {/* Heading */}
    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 bg-clip-text text-transparent mb-2">
      Support Imaggee
    </h2>

    {/* Subtitle */}
    <p className="text-amber-100/70 text-sm leading-relaxed mb-6">
      Help keep Imaggee fast, free, and improving every week.  
      Your support keeps the project alive ❤️
    </p>

    {/* Button */}
          <motion.a
            href="https://ko-fi.com/imaggee"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-2 px-6 py-3 
                      rounded-xl font-semibold text-base overflow-hidden
                      bg-gradient-to-r from-amber-700 to-orange-700
                      text-amber-50 border border-amber-600/40
                      shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40
                      transition-all duration-300"
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r 
                            from-transparent via-amber-100/20 to-transparent 
                            -skew-x-12 transform translate-x-[-100%] 
                            group-hover:translate-x-[100%] 
                            transition-transform duration-1000">
            </div>

            <Coffee className="text-amber-100 text-lg relative z-10" />
            <span className="relative z-10">Support on Ko-fi</span>
          </motion.a>


    {/* Small footer note */}
    <div className="text-xs text-amber-400/60 mt-4">
      Every bit of support helps keep Imaggee 100% free.
    </div>

  </div>
</motion.section>


        {/* Enhanced Tools Showcase */}
        <section className="py-12 sm:py-20 relative" id="alltools">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 gradient-text">
                Professional Imaggee Tools
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                100% free, privacy-focused tools that work directly in your browser. 
                No uploads, no waiting, complete control.
              </p>
            </motion.div>

            {/* Render tools by category */}
            {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
              <div key={category} className="mb-16 last:mb-0">
                {/* Category Header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {categoryLabels[category]}
                  </h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
                </motion.div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
                  {categoryTools.map((tool, index) => {
                    const colorClasses = getColorClasses(tool.color);
                    
                    return (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Link
                          to={tool.url}
                          className={`
                            group tool-card bg-linear-to-br ${colorClasses.bg} 
                            border ${colorClasses.border} ${colorClasses.shadow}
                            rounded-xl lg:rounded-2xl p-5 sm:p-6 hover:shadow-2xl 
                            transition-all duration-300 overflow-hidden focus:outline-none 
                            focus:ring-2 ${colorClasses.focus} focus:ring-offset-2 
                            focus:ring-offset-background block relative
                          `}
                        >
                          {/* Hover Effects */}
                          <div className="hover-blur absolute inset-0 backdrop-filter backdrop-blur-0 opacity-0 group-hover:backdrop-blur-md group-hover:opacity-100 transition-all duration-500 z-0 rounded-xl" />
                          
                          <div className="hover-shapes absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-0">
                            <div className={`hover-shape hover-shape-1 w-32 h-32 ${colorClasses.blurColor} -top-10 -right-10 absolute rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-all duration-600 group-hover:translate-x-2 group-hover:-translate-y-2`} />
                            <div className={`hover-shape hover-shape-2 w-24 h-24 ${colorClasses.blurColor2} bottom-5 left-5 absolute rounded-full filter blur-xl opacity-20 group-hover:opacity-30 transition-all duration-600 group-hover:-translate-x-2 group-hover:translate-y-2`} />
                          </div>
                          
                          <div className="content-wrapper relative z-2">
                            <div className="mb-4 relative inline-block">
                              <div className={`absolute inset-0 bg-linear-to-br ${colorClasses.gradient} blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 rounded-xl`} />
                              <div className={`
                                relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-linear-to-br ${colorClasses.gradient} 
                                rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg 
                                group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 tool-icon
                              `}
                              >
                                {tool.icon && tool.icon.trim() !== "" ? (
                                  <i className={`${tool.icon} text-white text-xl sm:text-2xl drop-shadow-lg`} />
                                ) : (
                                  (() => {
                                    const IconComp = tool.icon2;
                                    return <IconComp className="text-white text-xl sm:text-2xl drop-shadow-lg" />;
                                  })()
                                )}
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-card/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-md">
                                <i className="fas fa-arrow-right text-foreground text-xs" />
                              </div>
                            </div>
                            
                            <div>
                              <h3 className={`text-lg font-bold text-foreground mb-2 ${colorClasses.text} transition-colors duration-300`}>
                                {tool.name}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-foreground/80 transition-colors duration-300">
                                {tool.description}
                              </p>
                            </div>
                            
                            <div className="relative mt-4 pt-3 border-t border-border/50">
                              <div className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
                                <div className="flex items-center gap-3">
                                  {tool.stats.map((stat, statIndex) => (
                                    <div key={statIndex} className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                                      <i className={`${stat.icon} ${colorClasses.icon} text-xs`} />
                                      <span className="text-xs font-medium">{stat.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="absolute top-3 left-0 right-0 flex items-center justify-between opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Click to use
                                </span>
                                <i className={`fas fa-bolt ${colorClasses.icon} text-sm animate-pulse`} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
        <FeatureCardSection />
        <WhyChooseUs />
        <Supporters />

        {/* Enhanced CTA Section */}
        <motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
  viewport={{ once: true }}
  className="relative py-16 sm:py-24 bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden rounded-sm"
>
  {/* Premium Background Elements */}
  <div className="absolute inset-0 overflow-hidden">
    {/* Animated gradient orbs */}
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl"></div>
    
    {/* Grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
    
    {/* Shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform -translate-x-full animate-shimmer"></div>
  </div>

  <div className="container mx-auto px-4 sm:px-6 relative z-10">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto text-center"
    >
      {/* Premium Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 text-sm font-medium mb-8 backdrop-blur-sm"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        Trusted by 10,000+ Users Worldwide
      </motion.div>

      {/* Main Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight"
      >
        Ready to Transform Your
        <motion.span 
          className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ backgroundSize: '200% auto' }}
        >
          Creative Workflow?
        </motion.span>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto"
      >
        Join thousands of professionals who trust Imaggee for their image, PDF, and QR code needs. 
        Enterprise-grade tools, completely free forever.
      </motion.p>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
        className="flex justify-center items-center gap-8 mb-8 text-sm text-gray-400"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>10K+ Monthly Users</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>99.9% Uptime</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>Zero Data Collection</span>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(120, 119, 198, 0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const element = document.getElementById("alltools");
            if (element) {
              const top = element.getBoundingClientRect().top + window.scrollY - 40; // 20px offset
              window.scrollTo({
                top,
                behavior: "smooth",
              });
            }
          }}
          className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex items-center gap-3 overflow-hidden"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Processing Now
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const element = document.getElementById("alltools");
            if (element) {
              const top = element.getBoundingClientRect().top + window.scrollY - 40; // 20px offset
              window.scrollTo({
                top,
                behavior: "smooth",
              });
            }
          }}

          className="group border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-6 py-4 rounded-xl font-medium text-lg transition-all duration-300 backdrop-blur-sm"
        >
          View All Features
          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </motion.button>
      </motion.div>
    </motion.div>
  </div>

  {/* Privacy Notice - Premium Version */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.8 }}
    className="text-center text-sm text-gray-500 mt-12 relative z-10"
  >
    <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-700/50">
      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      <span>All processing happens locally in your browser</span>
      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
      <span>No data uploaded or stored</span>
      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
      <span>Complete privacy guaranteed</span>
    </div>
  </motion.div>

  <style jsx>{`
    @keyframes shimmer {
      0% { transform: translateX(-100%) skewX(-12deg); }
      100% { transform: translateX(200%) skewX(-12deg); }
    }
    .animate-shimmer {
      animation: shimmer 3s ease-in-out infinite;
    }
  `}</style>
</motion.section>
        <Footer />
      </div>

      <style jsx>{`
        .tool-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          isolation: isolate;
        }
        
        /* Hover overlay effects */
        .tool-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
          pointer-events: none;
        }
        
        .tool-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 50%);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
          pointer-events: none;
        }
        
        .tool-card:hover::before,
        .tool-card:hover::after {
          opacity: 1;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .tool-icon {
          position: relative;
          z-index: 2;
        }
        
        .tool-icon::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          height: 80%;
          background: inherit;
          border-radius: inherit;
          filter: blur(15px);
          opacity: 0.6;
          z-index: -1;
        }
        
        /* Blur effect on hover */
        .tool-card .hover-blur {
          position: absolute;
          inset: 0;
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          opacity: 0;
          transition: all 0.5s ease;
          z-index: 0;
          border-radius: inherit;
        }
        
        .tool-card:hover .hover-blur {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          opacity: 1;
        }
        
        /* Floating shapes inside cards on hover */
        .tool-card .hover-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }
        
        .tool-card:hover .hover-shapes {
          opacity: 1;
        }
        
        .hover-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(25px);
          opacity: 0.2;
          transition: all 0.6s ease;
        }
        
        .tool-card:hover .hover-shape-1 {
          transform: translate(20px, -20px) scale(1.2);
        }
        
        .tool-card:hover .hover-shape-2 {
          transform: translate(-20px, 20px) scale(1.1);
        }
      .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 3s ease infinite;
    }
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
      `}</style>
    </Layout>
  );
};

export default Index;