import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import ImagesToPdfTool from "@/components/ImagesToPdfTool";
import { Footer } from "@/components/Footer";

const ImagesToPdfPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Images to PDF Online - Convert PNG, JPG, WebP to PDF | Imaggee</title>
        <meta
          name="description"
          content="Free online tool to convert images (PNG, JPG, WebP) into a single PDF. Merge multiple images easily with fast, secure, and 100% client-side processing."
        />

        <link rel="canonical" href="https://imaggee.com/image-to-pdf" />
      </Helmet>
      <ImagesToPdfTool />
      <Footer />
    </Layout>
  );
};

export default ImagesToPdfPage;
