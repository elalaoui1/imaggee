import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { MetadataTool } from "@/components/MetadataTool";

const MetadataPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>View & Remove Image Metadata - EXIF Data Editor | Imaggee</title>
        <meta
          name="description"
          content="Free image metadata viewer and editor. View and remove EXIF data, location information, and camera details from your photos for privacy protection."
        />
        <link rel="canonical" href="https://yoursite.com/metadata" />
      </Helmet>
      <MetadataTool />
    </Layout>
  );
};

export default MetadataPage;
