import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
          {/* Tools */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/compress" className="hover:text-foreground transition-colors">Compress Images</Link></li>
              <li><Link to="/convert" className="hover:text-foreground transition-colors">Convert Images</Link></li>
              <li><Link to="/combine" className="hover:text-foreground transition-colors">Combine Images</Link></li>
              <li><Link to="/blur-emoji" className="hover:text-foreground transition-colors">Blur & Emoji</Link></li>
              <li><Link to="/resize" className="hover:text-foreground transition-colors">Resize Images</Link></li>
              <li><Link to="/palette" className="hover:text-foreground transition-colors">Color Palette</Link></li>
              <li><Link to="/metadata" className="hover:text-foreground transition-colors">Image Metadata</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Imaggee</h3>
            <p className="text-sm text-muted-foreground">
              Professional image editing tools that run entirely in your browser. 100% private and secure.
            </p>
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
