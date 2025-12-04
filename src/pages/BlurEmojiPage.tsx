import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { BlurEmojiTool } from "@/components/BlurEmojiTool";
import { Footer } from "@/components/Footer";

const BlurEmojiPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Blur & Add Emojis to Images - Free Online Editor | Imaggee</title>
        <meta
          name="description"
          content="Free blur and emoji editor. Add selective blur effects or fun emojis to your photos. Live preview, adjustable settings, no upload required."
        />
        <link rel="canonical" href="https://imaggee.com/blur-emoji" />
      </Helmet>
      <BlurEmojiTool />
      <Footer />
    </Layout>
  );
};

export default BlurEmojiPage;
