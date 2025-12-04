import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Heart } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-16 border-t border-border/50 py-8"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* About */}
          <div>
            <img src={logo} className="w-28" />
            <p className="text-sm text-muted-foreground">
              Professional image editing tools that run entirely in your browser. 100% private and secure.
            </p>
          </div>
        
          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" onClick={() => window.scrollTo({ top: 0, })} className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo({ top: 0, })} className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" onClick={() => window.scrollTo({ top: 0, })} className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" onClick={() => window.scrollTo({ top: 0, })} className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Support - Replaced Tools with Buy Me a Coffee */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Support Imaggee</h3>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Help keep Imaggee free and support development
              </p>
              <motion.a
                href="https://ko-fi.com/imaggee"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-amber-600 to-orange-700 text-amber-50 px-4 py-3 rounded-sm font-medium text-sm shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden border border-amber-500/40 w-full"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <Coffee className="w-4 h-4 text-amber-100" />
                <span>Support on Ko-fi</span>
                <Heart className="w-3 h-3 text-red-300" />
              </motion.a>
              <p className="text-xs text-muted-foreground/70 text-center">
                Every contribution helps! ❤️
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Imaggee. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Your images, your privacy, your control.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};