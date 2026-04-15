import { useEffect } from "react";
import { Button } from "@/components/ui/button";

import MetaData from "@/components/common/Metadata";
import useProductStore from "../../../store/useProductStore";



export default function Home() {
    const { products, loading, error, getAllProducts } = useProductStore();

    useEffect(() => {
        getAllProducts();
    }, [getAllProducts]);

    const productsArray = Array.isArray(products) ? products : [];

    if (loading) {
        return <div>Loading...</div>
    }
    if (error) {
        return <div>Error: {error}</div>
    }
    if (productsArray.length === 0) {
        return <div>No products found.</div>
    }

  return (
    <>
    <MetaData title="Home" />
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/60 text-white rounded-2xl p-6 md:p-10 mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-3">
          Welcome to ShopHub
        </h1>
        <p className="text-sm md:text-lg mb-4">
          Discover amazing products at unbeatable prices.
        </p>
        <Button className="bg-white text-black hover:bg-gray-200">
          Shop Now
        </Button>
      </div>

      {/* Products Section */}
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        Featured Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {productsArray.map((product) => (
          <div
            key={product._id}
            className="border rounded-xl p-3 hover:shadow-lg transition"
          >
            {product.image?.[0]?.url ? (
              <img
                src={product.image[0].url}
                alt={product.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-40 rounded-lg mb-3 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}

            <h3 className="text-sm md:text-base font-medium">
              {product.name}
            </h3>

            <p className="text-primary font-semibold mb-2">
              Rs. {product.price}
            </p>

            <Button className="w-full text-sm">Add to Cart</Button>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
