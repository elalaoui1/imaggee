import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>404 - Page Not Found | Imaggee</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to Imaggee to access our free online image tools." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
              <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
              <p className="text-muted-foreground">
                Oops! The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
                <a>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </a>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">
                Looking for our tools?
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-xs">
                <Link to="/compress" className="text-primary hover:underline">Compress</Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/convert" className="text-primary hover:underline">Convert</Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/combine" className="text-primary hover:underline">Combine</Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/merge-pdf" className="text-primary hover:underline">Merge PDF</Link>
                <span className="text-muted-foreground">•</span>
                <Link to="/qr-generator" className="text-primary hover:underline">QR Generator</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;
