import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Truck,
    RotateCcw,
    ShieldCheck,
    Minus,
    Plus,
    Check,
    AlertCircle,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import MetaData from "@/components/common/Metadata";
import useProductStore from '../../store/useProductStore';
import { useEffect, useState } from "react";
import ErrorPage from "@/components/common/Error";

const ProductPage = () => {
    const { id } = useParams(); // Fixed: extract id properly
    const navigate = useNavigate();
    const { product, loading, error, getProductById } = useProductStore();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (id) {
            const productDetailSection = document.getElementById('product-detail-section');
            if (productDetailSection) {
                productDetailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            getProductById(id);
        }
    }, [id, getProductById]);

    useEffect(() => {
        setQuantity(1);
        setSelectedImage(0);
    }, [product]);

    const handleQuantityChange = (type) => {
        if (type === 'increase' && quantity < product?.stock) {
            setQuantity(prev => prev + 1);
        }
        if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    }

    const handleAddToCart = () => {
        toast.success(`${quantity} × ${product?.name} added to your cart`, {
            description: "Continue shopping or proceed to checkout",
            duration: 3000,
            action: {
                label: "View Cart",
                onClick: () => navigate("/cart"),
            },
        });
    };

    const handleBuyNow = () => {
        toast.loading("Processing...", {
            description: "Redirecting to checkout",
        });
        setTimeout(() => {
            toast.dismiss();
            toast.success("Redirecting to checkout page");
            // navigate("/checkout");
        }, 1500);
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        if (!isWishlisted) {
            toast.success(`${product?.name} added to wishlist`, {
                description: "You can view it in your wishlist",
                action: {
                    label: "View Wishlist",
                    onClick: () => navigate("/wishlist"),
                },
            });
        } else {
            toast.info(`${product?.name} removed from wishlist`);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: product?.name,
            text: product?.description,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } catch (err) {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied!", {
                    description: "Product link copied to clipboard",
                });
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied!", {
                description: "Product link copied to clipboard",
            });
        }
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center gap-1">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                {hasHalfStar && (
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
                ))}
            </div>
        );
    };

    if (loading) {
        return <ProductPageSkeleton />;
    }

    if (error) {
        return (
            <ErrorPage
                error={error}
                resetError={() => getProductById(id)}
                showHomeButton={true}
                showRetryButton={true}
                showBackButton={true}
            />
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate("/")}>Back to Home</Button>
                </div>
            </div>
        );
    }

    const discount = 15;
    const originalPrice = product.price;
    const discountedPrice = originalPrice * (1 - discount / 100);
    const isInStock = product.stock > 0;
    const isLowStock = product.stock <= 10;

    return (
        <>
            <MetaData title={`${product.name} | ShopHub`} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div id="product-detail-section" className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                    {/* Breadcrumb & Back Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Column - Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border shadow-sm">
                                <img
                                    src={product.image?.[selectedImage]?.url || product.image?.[0]?.url}
                                    alt={product.name}
                                    className="w-full h-auto object-cover aspect-square"
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {product.image && product.image.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {product.image.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : "border-gray-200 hover:border-primary/50"
                                                }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={`${product.name} - view ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Product Info */}
                        <div className="space-y-6">
                            {/* Category & Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="text-sm">
                                    {product.category}
                                </Badge>
                                {discount > 0 && (
                                    <Badge variant="destructive" className="text-sm">
                                        {discount}% OFF
                                    </Badge>
                                )}
                                {isLowStock && isInStock && (
                                    <Badge variant="outline" className="text-sm bg-orange-100 text-orange-700 border-orange-200">
                                        Only {product.stock} left
                                    </Badge>
                                )}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                                {product.name}
                            </h1>

                            {/* Seller Info */}
                            <p className="text-gray-600 dark:text-gray-400">
                                by <span className="font-medium text-primary">{product.seller}</span>
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-3">
                                {renderStars(product.rating)}
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {product.rating} ({product.numberOfReviews || 0} reviews)
                                </span>
                            </div>

                            {/* Price Section */}
                            <div className="border-t border-b py-4 space-y-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-primary">
                                        ₹{discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    {discount > 0 && (
                                        <>
                                            <span className="text-lg text-gray-500 line-through">
                                                ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-green-600 font-semibold">
                                                Save ₹{(originalPrice - discountedPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-green-600">
                                    Inclusive of all taxes
                                </p>
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                {isInStock ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-600" />
                                        <span className="text-green-600 font-medium">In Stock</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <span className="text-red-600 font-medium">Out of Stock</span>
                                    </>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {isInStock && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Quantity:
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => handleQuantityChange("decrease")}
                                                disabled={quantity <= 1}
                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-medium">{quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange("increase")}
                                                disabled={quantity >= product.stock}
                                                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {product.stock} pieces available
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={!isInStock}
                                    size="lg"
                                    className="flex-1 gap-2"
                                    variant="outline"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </Button>
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={!isInStock}
                                    size="lg"
                                    className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                                >
                                    Buy Now
                                </Button>
                                <Button
                                    onClick={handleWishlist}
                                    size="lg"
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                </Button>
                                <Button
                                    onClick={handleShare}
                                    size="lg"
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Truck className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Free Delivery</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Enter your pincode for delivery availability
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <RotateCcw className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">7 Days Return Policy</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Easy returns and replacement
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">1 Year Warranty</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Manufacturer warranty included
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="mt-12">
                        <Tabs defaultValue="description" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 max-w-md">
                                <TabsTrigger value="description">Description</TabsTrigger>
                                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="mt-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-3">Product Description</h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="specifications" className="mt-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
                                    <div className="space-y-3">
                                        <div className="flex py-2 border-b">
                                            <span className="w-1/3 font-medium">Category</span>
                                            <span className="w-2/3 text-gray-600 dark:text-gray-400">{product.category}</span>
                                        </div>
                                        <div className="flex py-2 border-b">
                                            <span className="w-1/3 font-medium">Seller</span>
                                            <span className="w-2/3 text-gray-600 dark:text-gray-400">{product.seller}</span>
                                        </div>
                                        <div className="flex py-2 border-b">
                                            <span className="w-1/3 font-medium">Stock</span>
                                            <span className="w-2/3 text-gray-600 dark:text-gray-400">{product.stock} units</span>
                                        </div>
                                        <div className="flex py-2 border-b">
                                            <span className="w-1/3 font-medium">Added on</span>
                                            <span className="w-2/3 text-gray-600 dark:text-gray-400">
                                                {new Date(product.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                                    {product.reviews && product.reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {product.reviews.map((review, idx) => (
                                                <div key={idx} className="border-b pb-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {renderStars(review.rating)}
                                                        <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}

// Skeleton Component for Product Page
function ProductPageSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <div className="mb-6">
                    <Skeleton className="h-6 w-24" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="w-full aspect-square rounded-2xl" />
                        <div className="flex gap-3">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                            ))}
                        </div>
                    </div>

                    {/* Info Skeleton */}
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-32" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="border-t border-b py-4">
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-12 flex-1" />
                            <Skeleton className="h-12 flex-1" />
                            <Skeleton className="h-12 w-12" />
                            <Skeleton className="h-12 w-12" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;