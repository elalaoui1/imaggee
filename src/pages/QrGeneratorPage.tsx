import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import QrGeneratorTool from "@/components/QrGeneratorTool";
import { Footer } from "@/components/Footer";

const QrGeneratorPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>QR Code Generator Online - Create QR Codes | Imaggee</title>
        <meta
          name="description"
          content="Free online QR code generator. Create QR codes instantly for URLs, text, or contact info. Fast, secure, and 100% client-side—download or share your QR codes easily."
        />

        <link rel="canonical" href="https://imaggee.com/qr-generator" />
      </Helmet>
      <QrGeneratorTool />
      <Footer />
    </Layout>
  );
};

export default QrGeneratorPage;
