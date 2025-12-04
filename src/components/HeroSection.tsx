import { motion } from "framer-motion";
import { Sparkles, Lock, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12 space-y-6"
    >
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold">
          <span className="gradient-text">Fix, Enhance, Convert</span>
          <br />
          <span className="text-2xl md:text-4xl text-muted-foreground">
            Without the Hassle.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Imaggee: Professional image editing tools. Compress, convert, resize, 
          pdf's tools, and more — all in your browser with complete privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="glass rounded-xl p-4 flex items-center gap-3"
>
  <Sparkles className="w-6 h-6 text-primary" />
  <div className="text-left">
    <h3 className="font-semibold">100% Free</h3>
    <p className="text-sm text-muted-foreground">No hidden costs</p>
  </div>
</motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 flex items-center gap-3"
        >
          <Lock className="w-6 h-6 text-primary" />
          <div className="text-left">
            <h3 className="font-semibold">100% Private</h3>
            <p className="text-sm text-muted-foreground">Processing in browser</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4 flex items-center gap-3"
        >
          <Zap className="w-6 h-6 text-primary" />
          <div className="text-left">
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Instant results</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};