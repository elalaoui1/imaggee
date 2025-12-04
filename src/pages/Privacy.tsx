import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <Layout>
      <div className="relative z-10 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card className="glass bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Privacy Commitment</h2>
              <p className="text-lg leading-relaxed">
                At Imaggee, your privacy is not just a priority—it's fundamental to how we operate. 
                All image processing happens entirely in your browser. We never upload, access, store, 
                or transmit your images to any server. Your data stays on your device, period.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">1. Information We Don't Collect</h2>
                <p className="text-muted-foreground mb-3">
                  Unlike most online services, Imaggee is designed to collect as little information as possible:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Your Images:</strong> We never upload or access your images. All processing happens locally in your browser.</li>
                  <li><strong>Personal Information:</strong> We don't require accounts, emails, or any personal details to use our tools.</li>
                  <li><strong>File Contents:</strong> The content of your images never leaves your device.</li>
                  <li><strong>Processing Results:</strong> Edited images are generated and stored only on your device.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. How Our Tools Work</h2>
                <p className="text-muted-foreground mb-3">
                  Imaggee uses modern web technologies to process images entirely in your browser:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Client-Side Processing:</strong> All operations use JavaScript, WebAssembly, and HTML5 Canvas APIs that run in your browser.</li>
                  <li><strong>No Server Upload:</strong> Images are loaded from your device's memory directly into the browser's processing environment.</li>
                  <li><strong>Local Storage Only:</strong> Any temporary data is stored in your browser's memory and is automatically cleared when you close the tab.</li>
                  <li><strong>No Cloud Computing:</strong> We don't use cloud services or external APIs for image processing.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Analytics and Cookies</h2>
                <p className="text-muted-foreground mb-3">
                  To improve our service and understand how users interact with our tools, we use minimal analytics:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Anonymous Usage Statistics:</strong> We may collect anonymous data about which tools are used and how often, without any personal identifiers.</li>
                  <li><strong>Technical Information:</strong> Basic information like browser type, device type, and screen resolution to optimize our tools.</li>
                  <li><strong>No Tracking Cookies:</strong> We don't use cookies to track you across websites.</li>
                  <li><strong>Essential Cookies Only:</strong> We only use cookies that are necessary for the website to function properly (like remembering your preferences).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
                <p className="text-muted-foreground mb-3">
                  Imaggee may use the following third-party services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Analytics Services:</strong> We may use privacy-focused analytics tools (like Google Analytics with IP anonymization) to understand usage patterns.</li>
                  <li><strong>Advertising:</strong> We may display ads through Google AdSense or similar services. These services may use cookies for ad personalization, but they never receive your images or processing data.</li>
                  <li><strong>CDN Services:</strong> We use Content Delivery Networks (CDNs) to serve our website code faster, but they never access your images.</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  These third-party services operate independently and have their own privacy policies. We carefully select partners who respect user privacy.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Your Rights and Control</h2>
                <p className="text-muted-foreground mb-3">
                  You have complete control over your data:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Data Ownership:</strong> You own all your images and processed results. We claim no rights to them.</li>
                  <li><strong>Browser Controls:</strong> You can clear your browser's cache and local storage at any time to remove all traces of your activity.</li>
                  <li><strong>Opt-Out:</strong> You can disable cookies and analytics tracking through your browser settings.</li>
                  <li><strong>No Account Deletion Needed:</strong> Since we don't create accounts, there's nothing to delete.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
                <p className="text-muted-foreground mb-3">
                  Since your images never leave your device, they're as secure as your device itself:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>HTTPS Encryption:</strong> Our website uses HTTPS to encrypt all communication between your browser and our servers.</li>
                  <li><strong>No Data Transmission:</strong> Images are never transmitted over the internet during processing.</li>
                  <li><strong>Modern Security Standards:</strong> We follow web security best practices to protect our website from vulnerabilities.</li>
                  <li><strong>Regular Updates:</strong> We keep our code and dependencies up to date with the latest security patches.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Imaggee does not knowingly collect any information from children under 13. Our service 
                  is designed to be used without providing any personal information, making it safe for users 
                  of all ages. However, we recommend that children use our tools under parental supervision.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. International Users</h2>
                <p className="text-muted-foreground">
                  Imaggee is accessible worldwide. Since all processing happens in your browser, your 
                  data never crosses international borders. Our website may be hosted in various locations 
                  through CDNs, but this only affects the delivery of our code, not your images or personal data.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect changes in our practices 
                  or for legal reasons. We will notify users of any significant changes by updating the 
                  "Last updated" date at the top of this page. We encourage you to review this policy 
                  periodically to stay informed about how we protect your privacy.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
                <p className="text-muted-foreground mb-3">
                  If you have any questions or concerns about this Privacy Policy or our privacy practices, 
                  please contact us at:
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:contact.imaggee@gmail.com" className="text-primary hover:underline">contact.imaggee@gmail.com</a>
                </p>
                <p className="text-muted-foreground mt-3">
                  We take privacy concerns seriously and will respond to all inquiries as quickly as possible.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-3">Questions about our privacy practices?</h3>
              <p className="text-muted-foreground mb-6">
                We're here to help. Reach out to us anytime.
              </p>
              <Button asChild>
                <Link to="/contact" onClick={() => window.scrollTo({ top: 0, })}>
                  Contact Us
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Footer />
      </div>
    </Layout>
  );
};

export default Privacy;
