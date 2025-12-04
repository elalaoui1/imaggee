import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import PdfToImagesTool from "@/components/PdfToImagesTool";
import { Footer } from "@/components/Footer";

const PdfToImagesPage = () => {
  return (
    <Layout>
      <Helmet>
       <title>Convert PDF to Images Online - PNG, JPG, WebP | Imaggee</title>
        <meta
          name="description"
          content="Free online tool to convert PDF pages into images (PNG, JPG, WebP). Fast, secure, and 100% client-side processing—extract images from PDFs instantly."
        />

        <link rel="canonical" href="https://imaggee.com/pdf-to-image" />
      </Helmet>
      <PdfToImagesTool />
      <Footer />
    </Layout>
  );
};

export default PdfToImagesPage;
