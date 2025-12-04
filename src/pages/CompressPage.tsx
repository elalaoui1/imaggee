import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { CompressTool } from "@/components/CompressTool";
import { Footer } from "@/components/Footer";

const CompressPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Compress Images Online - Reduce File Size | Imaggee</title>
        <meta
          name="description"
          content="Free online image compression tool. Reduce image file size up to 90% while maintaining quality. Supports JPG, PNG, WebP formats. No upload required."
        />
        <link rel="canonical" href="https://imaggee.com/compress" />
      </Helmet>
      <CompressTool />
      <Footer />
    </Layout>
  );
};

export default CompressPage;
