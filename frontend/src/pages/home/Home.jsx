import { useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import MetaData from "@/components/common/Metadata";
import useProductStore from "../../../store/useProductStore";
import { ProductGridSkeleton, HeroSkeleton } from "@/components/loader-skeleton";
import ErrorPage from "@/components/common/Error";
import Pagination from "@/components/common/Pagination";
import PaginationInfo from "@/components/PaginationInfo";

export default function Home() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { 
        products, 
        loading, 
        error, 
        getAllProducts,
        currentPage,
        totalPages,
        productsCount,
        resultPerPage,
        count,
        isChangingPage
    } = useProductStore();

    // Get page from URL or default to 1
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        // Fetch products when page changes
        getAllProducts({ page: pageFromUrl, limit: 10 });
    }, [pageFromUrl, getAllProducts]);

    const handlePageChange = useCallback((page) => {
        // Update URL with new page
        setSearchParams({ page: page.toString() });
        // Scroll to products section
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [setSearchParams]);

    const handleAddToCart = useCallback((e, product) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();
        
        toast.success(`${product.name} added to cart`, {
            description: `Quantity: 1`,
            action: {
                label: "View Cart",
                onClick: () => navigate("/cart"),
            },
        });
    }, [navigate]);

    const productsArray = Array.isArray(products) ? products : [];

    if (error) {
        return <ErrorPage error={error} resetError={() => getAllProducts({ page: 1, limit: 10 })} />;
    }

    // Show skeleton only on initial load (not on page change)
    const showInitialLoading = loading && !isChangingPage && productsArray.length === 0;
    const showPageChangeLoading = loading && isChangingPage;

    return (
        <>
            <MetaData title="Home" />
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Hero Section - Don't show skeleton on page change */}
                {showInitialLoading ? (
                    <HeroSkeleton />
                ) : (
                    <div className="bg-gradient-to-r from-primary to-primary/60 text-white rounded-2xl p-6 md:p-10 mb-8">
                        <h1 className="text-2xl md:text-4xl font-bold mb-3">
                            Welcome to ShopHub
                        </h1>
                        <p className="text-sm md:text-lg mb-4">
                            Discover amazing products at unbeatable prices.
                        </p>
                        <Button 
                            className="bg-white text-black hover:bg-gray-200"
                            onClick={() => {
                                const productsSection = document.getElementById('products-section');
                                productsSection?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Shop Now
                        </Button>
                    </div>
                )}

                {/* Products Section */}
                <div id="products-section">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h2 className="text-xl md:text-2xl font-semibold">
                            Featured Products
                        </h2>
                        {!loading && productsCount > 0 && (
                            <PaginationInfo 
                                currentPage={currentPage}
                                resultPerPage={resultPerPage}
                                productsCount={productsCount}
                                count={count}
                            />
                        )}
                    </div>

                    {/* Page Change Loading Overlay */}
                    {showPageChangeLoading && (
                        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 shadow-xl">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="text-sm font-medium">Loading products...</span>
                            </div>
                        </div>
                    )}

                    {/* Initial Loading or Products Grid */}
                    {showInitialLoading ? (
                        <ProductGridSkeleton />
                    ) : productsArray.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No products found.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                {productsArray.map((product) => (
                                    <Link
                                        key={product._id}
                                        to={`/product/${product._id}`}
                                        className="border rounded-xl p-3 hover:shadow-lg transition group"
                                    >
                                        {product.image?.[0]?.url ? (
                                            <img
                                                src={product.image[0].url}
                                                alt={product.name}
                                                className="w-full h-40 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-40 rounded-lg mb-3 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                                                No image
                                            </div>
                                        )}

                                        <h3 className="text-sm md:text-base font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>

                                        <p className="text-primary font-semibold mb-2">
                                            Rs. {product.price?.toLocaleString('en-IN')}
                                        </p>

                                        {product.stock > 0 ? (
                                            <Button 
                                                className="w-full text-sm"
                                                onClick={(e) => handleAddToCart(e, product)}
                                            >
                                                Add to Cart
                                            </Button>
                                        ) : (
                                            <Button 
                                                className="w-full text-sm"
                                                variant="outline"
                                                disabled
                                            >
                                                Out of Stock
                                            </Button>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    showFirstLast={true}
                                    maxButtons={5}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}