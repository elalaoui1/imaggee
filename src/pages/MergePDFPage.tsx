import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import MergePDFTool from "@/components/MergePDFTool";
import { Footer } from "@/components/Footer";

const MergePDFPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Merge Pdf's Online - Merge Multiple Pdf's | Imaggee</title>
       <meta
          name="description"
          content="Free online PDF merger. Combine multiple PDF files into a single document with high quality. Fast, secure, and easy to use—drag, drop, and merge instantly."
        />
        <link rel="canonical" href="https://imaggee.com/merge-pdf" />
      </Helmet>
      <MergePDFTool />
      <Footer />
    </Layout>
  );
};

export default MergePDFPage;
