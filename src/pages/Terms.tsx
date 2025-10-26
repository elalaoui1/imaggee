import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <Layout>
      <div className="relative z-10 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/">
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
                <FileText className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card className="glass bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed">
                Welcome to ImageForge. By accessing and using our website and tools, you agree to be 
                bound by these Terms of Service. Please read them carefully before using our services.
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using ImageForge ("the Service"), you agree to be bound by these Terms 
                  of Service ("Terms"). If you disagree with any part of these terms, you may not access 
                  the Service. These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-3">
                  ImageForge provides free, browser-based image processing tools including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Image compression and optimization</li>
                  <li>Image format conversion (PNG, JPG, WebP, etc.)</li>
                  <li>Image combination and collage creation</li>
                  <li>Background removal with various replacement options</li>
                  <li>Image resizing with preset dimensions</li>
                  <li>Color palette extraction</li>
                  <li>Image metadata viewing and editing</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  All processing occurs locally in your browser without uploading images to our servers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Acceptable Use</h2>
                <p className="text-muted-foreground mb-3">
                  You agree to use ImageForge only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Process images that contain illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content</li>
                  <li>Process images that infringe upon intellectual property rights of others</li>
                  <li>Use the Service to create content that violates any local, state, national, or international law</li>
                  <li>Attempt to gain unauthorized access to any portion of the Service or any systems or networks</li>
                  <li>Use automated systems (bots, scrapers) to access the Service in a manner that sends more requests than a human can reasonably produce</li>
                  <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Intellectual Property Rights</h2>
                <p className="text-muted-foreground mb-3">
                  <strong>Our Content:</strong> The Service and its original content, features, and functionality 
                  are owned by ImageForge and are protected by international copyright, trademark, patent, trade 
                  secret, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground mb-3">
                  <strong>Your Content:</strong> You retain all rights to the images you process using our tools. 
                  ImageForge claims no ownership or rights to your images. Since processing happens locally in your 
                  browser, we never have access to your images in the first place.
                </p>
                <p className="text-muted-foreground">
                  <strong>License to Use Service:</strong> We grant you a limited, non-exclusive, non-transferable, 
                  revocable license to access and use the Service for personal or commercial purposes, subject to 
                  these Terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. User Responsibilities</h2>
                <p className="text-muted-foreground mb-3">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Ensuring you have the necessary rights and permissions to process any images you upload</li>
                  <li>Complying with all applicable laws and regulations when using the Service</li>
                  <li>Maintaining the security of your device and browser</li>
                  <li>Any consequences resulting from your use of the Service</li>
                  <li>Backing up your original images before processing (though our tools are non-destructive)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground mb-3">
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                  <li>Warranties that the Service will be uninterrupted, timely, secure, or error-free</li>
                  <li>Warranties regarding the accuracy, reliability, or quality of any information obtained through the Service</li>
                  <li>Warranties that defects will be corrected</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Your use of the Service is at your own risk. While we strive to provide reliable tools, we 
                  cannot guarantee specific results or outcomes from using our image processing features.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IMAGEFORGE SHALL NOT BE LIABLE FOR ANY 
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
                  OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
                  OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Your use or inability to use the Service</li>
                  <li>Any unauthorized access to or use of our servers</li>
                  <li>Any interruption or cessation of transmission to or from the Service</li>
                  <li>Any bugs, viruses, or similar issues transmitted through the Service by any third party</li>
                  <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted or shared through the Service</li>
                  <li>Loss or corruption of images during processing</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to defend, indemnify, and hold harmless ImageForge and its officers, directors, 
                  employees, and agents from and against any claims, liabilities, damages, judgments, awards, 
                  losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or 
                  relating to your violation of these Terms or your use of the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Third-Party Links and Services</h2>
                <p className="text-muted-foreground">
                  The Service may contain links to third-party websites or services that are not owned or 
                  controlled by ImageForge. We have no control over and assume no responsibility for the 
                  content, privacy policies, or practices of any third-party websites or services. You 
                  acknowledge and agree that ImageForge shall not be responsible or liable for any damage 
                  or loss caused by or in connection with the use of any such third-party content or services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">10. Modifications to Service</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) 
                  at any time, with or without notice. We may also impose limits on certain features or 
                  restrict access to parts of the Service without notice or liability. We will not be liable 
                  to you or any third party for any modification, suspension, or discontinuance of the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">11. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify or replace these Terms at any time at our sole discretion. 
                  If a revision is material, we will provide at least 30 days' notice prior to any new terms 
                  taking effect. What constitutes a material change will be determined at our sole discretion. 
                  By continuing to access or use our Service after those revisions become effective, you agree 
                  to be bound by the revised terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">12. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms shall be governed and construed in accordance with the laws applicable in your 
                  jurisdiction, without regard to its conflict of law provisions. Our failure to enforce any 
                  right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">13. Severability</h2>
                <p className="text-muted-foreground">
                  If any provision of these Terms is held to be invalid or unenforceable by a court, the 
                  remaining provisions of these Terms will remain in effect. These Terms constitute the 
                  entire agreement between us regarding our Service and supersede any prior agreements 
                  we might have had between us regarding the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
                <p className="text-muted-foreground mb-3">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> <a href="mailto:legal@imageforge.com" className="text-primary hover:underline">legal@imageforge.com</a>
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  By using ImageForge, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms of Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-3">Ready to start editing?</h3>
              <p className="text-muted-foreground mb-6">
                Now that you understand our terms, let's create something amazing.
              </p>
              <Button asChild size="lg">
                <Link to="/">
                  Try Our Tools
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

export default Terms;
