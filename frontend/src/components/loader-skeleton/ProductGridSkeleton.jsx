import ProductCardSkeleton from "./ProductCardSkeleton";

const ProductGridSkeleton = ({
    count = 8,
    columns = { sm: 2, md: 3, lg: 4 }
}) => {
    const getGridCols = () => {
        const cols = [];
        if (columns.sm) cols.push(`grid-cols-${columns.sm}`);
        if (columns.md) cols.push(`md:grid-cols-${columns.md}`);
        if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
        return cols.join(' ');
    };

    return (
        <div className={`grid grid-cols-2 sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} gap-4 md:gap-6`}>
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
            ))}
        </div>
    );
}

export default ProductGridSkeleton;