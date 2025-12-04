import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import PdfCompressTool from "@/components/PdfCompressTool";
import { Footer } from "@/components/Footer";

const PdfCompressPage = () => {
  return (
    <Layout>
      <Helmet>
       <title>Compress PDF Online - Reduce PDF File Size | Imaggee</title>
        <meta
          name="description"
          content="Free online PDF compressor. Reduce the size of your PDF files without losing quality. Fast, secure, and 100% client-side—drag, drop, and compress instantly."
        />

        <link rel="canonical" href="https://imaggee.com/pdf-compress" />
      </Helmet>
      <PdfCompressTool />
      <Footer />
    </Layout>
  );
};

export default PdfCompressPage;
