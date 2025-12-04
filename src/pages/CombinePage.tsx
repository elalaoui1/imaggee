import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { CombineTool } from "@/components/CombineTool";
import { Footer } from "@/components/Footer";

const CombinePage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Combine Images Online - Merge Multiple Images | Imaggee</title>
        <meta
          name="description"
          content="Free online image combiner tool. Merge multiple images into one, create collages, overlays, and composites. Drag and drop interface."
        />
        <link rel="canonical" href="https://imaggee.com/combine" />
      </Helmet>
      <CombineTool />
      <Footer />
    </Layout>
  );
};

export default CombinePage;
