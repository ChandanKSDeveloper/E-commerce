import { Helmet } from "react-helmet-async";

const MetaData = ({ title = "ShopHub" }) => {
  return (
    <Helmet>
      <title>{title ? `${title} | ShopHub` : "ShopHub"}</title>
      <meta name="description" content="Best products at affordable prices" />
    </Helmet>
  );
};

export default MetaData;