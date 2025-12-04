import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import PdfSplitTool from "@/components/PdfSplitTool";
import { Footer } from "@/components/Footer";

const PdfSplitPage = () => {
  return (
    <Layout>
      <Helmet>
       <title>Split PDF Online - Extract Pages from PDF | Imaggee</title>
        <meta
          name="description"
          content="Free online PDF splitter. Easily extract specific pages or ranges from your PDF files. Fast, secure, and 100% client-side—drag, drop, and split instantly."
        />

        <link rel="canonical" href="https://imaggee.com/pdf-split" />
      </Helmet>
      <PdfSplitTool />
      <Footer />
    </Layout>
  );
};

export default PdfSplitPage;
