import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ConvertTool } from "@/components/ConvertTool";
import { Footer } from "@/components/Footer";

const ConvertPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Convert Images Online - PNG, JPG, WebP Converter | Imaggee</title>
        <meta
          name="description"
          content="Free online image format converter. Convert between PNG, JPG, WebP, and BMP formats instantly. No quality loss, 100% client-side processing."
        />
        <link rel="canonical" href="https://imaggee.com/convert" />
      </Helmet>
      <ConvertTool />
      <Footer />
    </Layout>
  );
};

export default ConvertPage;
