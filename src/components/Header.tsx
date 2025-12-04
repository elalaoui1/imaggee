import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
  Minimize2,
  RefreshCw,
  Layers,
  Smile,
  Crop,
  Palette,
  Info,
  Files,
  QrCode,
  User,
  Phone,
  Home,
  FileImage,
  Scissors,
  Images,
  ChevronDown
} from "lucide-react";
import { SiDiscord } from "react-icons/si";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";
import path from "path";

// =====================
// COLOR SYSTEM
// =====================
const colorVariants: any = {
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

// ===================================
// Navigation with color assignment
// ===================================
const navigation = [
  { name: "Home", path: "/", icon: Home },

  {
    name: "Image Tools",
    type: "dropdown",
    items: [
      { name: "Compress", path: "/compress", icon: Minimize2, color: "purple", stats: [
        { icon: "fas fa-download", label: "Smaller" },
        { icon: "fas fa-shield-alt", label: "Quality" }
      ] },
      { name: "Convert", path: "/convert", icon: RefreshCw, color: "pink", stats: [
        { icon: "fas fa-star", label: "10+ Formats" },
        { icon: "fas fa-bolt", label: "Instant" }
      ] },
      { name: "Resize", path: "/resize", icon: Crop, color: "orange", stats: [
        { icon: "fas fa-ruler", label: "Precision" },
        { icon: "fas fa-layer-group", label: "Batch" }
      ] },
      { name: "Combine", path: "/combine", icon: Layers, color: "blue",stats: [
        { icon: "fas fa-star", label: "Layouts" },
        { icon: "fas fa-bolt", label: "Smart" }
      ] },
      { name: "Blur & Emoji", path: "/blur-emoji", icon: Smile, color: "cyan",stats: [
        { icon: "fas fa-shield-alt", label: "Privacy" },
        { icon: "fas fa-star", label: "Fun" }
      ] },
      { name: "Palette", path: "/palette", icon: Palette, color: "yellow", stats: [
        { icon: "fas fa-star", label: "Smart" },
        { icon: "fas fa-download", label: "Export" }
      ] },
      { name: "Metadata", path: "/metadata", icon: Info,icon2:"fas fa-info-circle" ,color: "indigo",stats: [
        { icon: "fas fa-shield-alt", label: "Privacy" },
        { icon: "fas fa-bolt", label: "Edit" }
      ] },
    ]
  },

  {
    name: "PDF Tools",
    type: "dropdown",
    items: [
      {
        name: "Merge PDFs",
        path: "/merge-pdf",
        icon: null,
        icon2: "fas fa-file-pdf",
        color: "red",
        stats: [
        { icon: "fas fa-layer-group", label: "Merge" },
        { icon: "fas fa-bolt", label: "Fast" }
      ]
      },
      // {
      //   name: "Compress PDF",
      //   path: "/pdf-compress",
      //   icon: FileText,
      //   color: "pink",
      //   stats: [
      //   { icon: "fas fa-download", label: "Smaller" },
      //   { icon: "fas fa-shield-alt", label: "Quality" }
      // ]
      // },
      {
        name: "Split PDF",
        path: "/pdf-split",
        icon: Scissors,
        color: "orange",
        stats: [
        { icon: "fas fa-cut", label: "Split" },
        { icon: "fas fa-shield-alt", label: "Secure" }
      ]
      },
      {
        name: "Image to PDF",
        path: "/image-to-pdf",
        icon: FileImage,
        color: "blue",
        stats: [
        { icon: "fas fa-image", label: "Multi Formats" },
        { icon: "fas fa-bolt", label: "Fast" }
      ]
      },
      {
        name: "PDF to Image",
        path: "/pdf-to-image",
        icon: Images,
        color: "cyan",
        stats: [
        { icon: "fas fa-image", label: "High Quality" },
        { icon: "fas fa-bolt", label: "Instant" }
      ]
      },
    ]
  },

  { name: "QR Generator", path: "/qr-generator", icon: QrCode },
  { name: "About", path: "/about", icon: User },
  { name: "Contact", path: "/contact", icon: Phone },
];

export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="md:container md:max-w-7xl mb-8 md:mt-4 sticky top-0 md:top-4 z-50 glass border border-border/40 rounded-xl shadow-sm"
    >
      <div className="mx-auto px-6 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div>
            <img src={logo} className="w-28" />
              {/* <h1 className="text-2xl font-bold gradient-text">Imaggee</h1> */}
              <p className="text-xs text-muted-foreground hidden sm:block">
                100% client-side • Privacy-first
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              if (item.type === "dropdown") {
                const open = activeDropdown === item.name;

                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/40 transition-all`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 -left-44 mt-1 bg-black p-4 rounded-xl border grid grid-cols-4 gap-3 min-w-[800px] max-w-[90vw] border-white-500/40 shadow-white-500/20"
                      >
                        {item.items.map((tool) => {
                          const Icon = tool.icon;
                          const color = colorVariants[tool.color];
                          return (
                            <Link
                              key={tool.path}
                              to={tool.path}
                              className={`group tool-card bg-linear-to-br ${color.bg} border ${color.border} rounded-xl px-4 py-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl relative overflow-hidden h-[120px]`}
                            >
                              {/* Colored Blur Glow */}
                              <div className="absolute inset-0 pointer-events-none">
                                <div className={`absolute top-2 left-2 w-24 h-24 ${color.blurColor}/30 blur-2xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                              </div>

                              {/* Top Row */}
                              <div className="flex items-center justify-between relative">
                                {/* Icon */}
                                <div className="relative w-10 h-10">
                                  {/* Colored Blur Behind Icon */}
                                  <div className={`absolute inset-0 ${color.blurColor}/50 blur-xl rounded-xl opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                                  {/* Icon container */}
                                 <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
  {tool.icon ? (
    <tool.icon className={`w-5 h-5 ${color.icon}`} />
  ) : (
    <i className={`${tool.icon2} text-xl ${color.icon}`}></i>
  )}
</div>

                                </div>

                                {/* Title */}
                                <h3 className={`text-base font-semibold text-foreground ${color.text} transition-colors whitespace-nowrap z-10`}>
                                  {tool.name}
                                </h3>

                                {/* Arrow */}
                                <i className={`fas fa-arrow-right ${color.icon} text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10`}></i>
                              </div>

                              {/* Feature Strip */}
                              <div className="relative mt-3 pt-3 border-t border-border/50">
                                {/* Default */}
                                <div className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
                                  <div className="flex items-center gap-4">
                              {tool.stats.map((stat, statIndex) => (

                                    <div key={statIndex} className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap">
                                      <i className={`${stat.icon} ${color.icon} text-[10px]`}></i>
                                      <span className="text-xs font-medium">{stat.label}</span>
                                    </div>
                              ))}
                                  </div>
                                </div>

                                {/* Hover */}
                                <div className="absolute top-3 left-0 right-0 flex items-center justify-between opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Click to use</span>
                                  <i className={`fas fa-bolt ${color.icon} text-sm animate-pulse`}></i>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                );
              }

              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 flex items-center gap-2 hover:bg-muted/40 rounded-lg transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>
        <a
          href="https://discord.gg/73jg9VtNwb"
          target="_blank"
          rel="noopener noreferrer"
          className="
            p-3 rounded-md cursor-pointer
            bg-gradient-to-br from-indigo-600/30 to-purple-600/30
            border border-indigo-400/40
            shadow-lg hover:shadow-indigo-500/50
            flex items-center justify-center
          "
        >
          {/* Spin only the icon */}
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.4, ease: "linear" }}
          >
            <SiDiscord className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)]" />
          </motion.div>
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content
        side="bottom"
        align="center"
        className="
          bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-sm
    shadow-lg shadow-indigo-500/50
          animate-fade-in
          z-50
        "
      >
        Join the Imaggee Community
        <Tooltip.Arrow className="fill-black" />
      </Tooltip.Content>
    </Tooltip.Root>

          </nav>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-muted/40 rounded-lg"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="lg:hidden mt-4 space-y-2"
          >
            {navigation.map((item) => {
              if (item.type === "dropdown") {
                const open = activeDropdown === item.name;

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setActiveDropdown(open ? null : item.name)}
                      className="w-full flex justify-between items-center px-4 py-3 bg-muted/20 rounded-lg"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`${open ? "rotate-180" : ""}`} />
                    </button>

                    {open && (
                      <div className="grid grid-cols-2 gap-3 p-3 pl-6">
                        {item.items.map((tool) => {
                          const Icon = tool.icon;
                          const color = colorVariants[tool.color];

                          return (
                            <Link
                              key={tool.path}
                              to={tool.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`group p-3 rounded-xl border ${color.border} bg-linear-to-br ${color.bg} flex flex-col gap-2 transition-all`}
                            >
                              <Icon className={`w-5 h-5 ${color.icon}`} />
                              <span className="text-sm">{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/40"
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};