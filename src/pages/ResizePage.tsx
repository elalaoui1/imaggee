import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { ResizeTool } from "@/components/ResizeTool";
import { Footer } from "@/components/Footer";

const ResizePage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Resize Images Online - Instagram, YouTube Presets | Imaggee</title>
        <meta
          name="description"
          content="Free online image resizer with social media presets. Resize images for Instagram, YouTube, Facebook, or custom dimensions. Maintain aspect ratio."
        />
        <link rel="canonical" href="https://imaggee.com/resize" />
      </Helmet>
      <ResizeTool />
      <Footer />
    </Layout>
  );
};

export default ResizePage;
