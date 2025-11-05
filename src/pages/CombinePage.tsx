import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { CombineTool } from "@/components/CombineTool";

const CombinePage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Combine Images Online - Merge Multiple Images | ImageForge</title>
        <meta
          name="description"
          content="Free online image combiner tool. Merge multiple images into one, create collages, overlays, and composites. Drag and drop interface."
        />
        <link rel="canonical" href="https://yoursite.com/combine" />
      </Helmet>
      <CombineTool />
    </Layout>
  );
};

export default CombinePage;
