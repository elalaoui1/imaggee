import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PaletteTool } from "@/components/PaletteTool";

const PalettePage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Extract Color Palette from Images - HEX & RGB Codes | Imaggee</title>
        <meta
          name="description"
          content="Free color palette extractor. Extract dominant colors from any image with HEX and RGB codes. Perfect for designers and developers."
        />
        <link rel="canonical" href="https://yoursite.com/palette" />
      </Helmet>
      <PaletteTool />
    </Layout>
  );
};

export default PalettePage;
