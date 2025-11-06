import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Minimize2, Repeat, Layers, Smile, Crop, Palette, FileX, Menu, X } from "lucide-react";
import { useState } from "react";

const tools = [
  { name: "Compress", path: "/compress", icon: Minimize2 },
  { name: "Convert", path: "/convert", icon: Repeat },
  { name: "Combine", path: "/combine", icon: Layers },
  { name: "Blur & Emoji", path: "/blur-emoji", icon: Smile },
  { name: "Resize", path: "/resize", icon: Crop },
  { name: "Palette", path: "/palette", icon: Palette },
  { name: "Metadata", path: "/metadata", icon: FileX },
];

export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="ImageForge Logo" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold gradient-text">ImageForge</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                100% client-side • Privacy-first
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = location.pathname === tool.path;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tool.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-muted/50 rounded-lg"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="lg:hidden mt-4 pb-4 grid grid-cols-2 gap-2"
          >
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = location.pathname === tool.path;
              return (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tool.name}</span>
                </Link>
              );
            })}
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
};
