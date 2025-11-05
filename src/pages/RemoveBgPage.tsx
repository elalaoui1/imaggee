import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { BackgroundRemoverTool } from "@/components/BackgroundRemoverTool";

const RemoveBgPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Remove Background from Images - AI Background Remover | ImageForge</title>
        <meta
          name="description"
          content="Free AI-powered background removal tool. Remove image backgrounds instantly with transparent, solid, or gradient replacements. No upload required."
        />
        <link rel="canonical" href="https://yoursite.com/remove-background" />
      </Helmet>
      <BackgroundRemoverTool />
    </Layout>
  );
};

export default RemoveBgPage;
