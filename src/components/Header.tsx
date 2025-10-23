import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <img src={logo} alt="ImageForge Logo" className="w-12 h-12" />
        <h1 className="text-4xl font-bold gradient-text">ImageForge</h1>
      </div>
      <p className="text-muted-foreground text-lg">
        Compress. Convert. Combine. Instantly.
      </p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        100% client-side • Privacy-first • No uploads
      </p>
    </motion.header>
  );
};
