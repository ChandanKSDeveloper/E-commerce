import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button, Input, toast } from "@/components/ui/index.js";
import { Search as SearchIcon, X, Filter } from "lucide-react";

import useProductStore from "../../store/useProductStore";
import { ProductGridSkeleton } from "@/components/loader-skeleton";
import { ErrorPage, MetaData, Pagination } from "@/components/common/index.js";

const categories = [
  "Electronics","Mobile Phones","Computers & Tablets","Cameras",
  "Audio & Headphones","Wearable Technology","Video Games & Consoles",
  "Clothing","Men's Fashion","Women's Fashion","Kids' Fashion",
  "Footwear","Accessories","Jewelry","Home & Kitchen","Furniture",
  "Home Decor","Garden & Outdoor","Tools & Hardware","Beauty & Personal Care",
  "Skincare","Makeup","Hair Care","Fragrance","Health & Wellness",
  "Sports & Fitness","Exercise Equipment","Outdoor Recreation",
  "Camping & Hiking","Cycling","Books","Movies & TV","Music",
  "Stationery & Office Supplies","Toys & Games","Baby Products",
  "Educational Toys","Automotive","Pet Supplies","Groceries & Food",
  "Arts & Crafts","Industrial Supplies","Business & Industrial","Other"
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  const {
    products,
    loading,
    error,
    getAllProducts,
    currentPage,
    totalPages,
    productsCount
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState(query);
  const [showFilters, setShowFilters] = useState(false);

  
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: ''
  });

  // FETCH PRODUCTS
  useEffect(() => {
    if (!query) return;

    const params = {
      keyword: query,
      page,
    };

    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.priceMin = filters.minPrice;
    if (filters.maxPrice) params.priceMax = filters.maxPrice;
    if (filters.rating) params.rating = filters.rating;

    getAllProducts(params);
  }, [query, page, filters]);

  // SEARCH
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Enter search term");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchTerm)}&page=1`);
  };

  // PAGINATION FIX
  const handlePageChange = (p) => {
    setSearchParams({ q: query, page: p.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FILTER CHANGE
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchParams({ q: query, page: '1' });
  };

  const clearFilters = () => {
    setFilters({ category:'', minPrice:'', maxPrice:'', rating:'' });
  };

  const productsArray = Array.isArray(products) ? products : [];

  if (error) return <ErrorPage error={error} />;

  return (
    <>
      <MetaData title={`Search: ${query}`} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* HEADER */}
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="rounded-lg"
            />
            <Button type="submit">
              <SearchIcon className="h-4 w-4"/>
            </Button>
          </form>

          {/* MOBILE FILTER BUTTON */}
          <div className="lg:hidden mb-4">
            <Button onClick={() => setShowFilters(true)} className="w-full">
              <Filter className="mr-2 h-4 w-4"/> Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* FILTER SIDEBAR */}
            <div className={`lg:block ${showFilters ? 'fixed inset-0 bg-black/40 z-50' : 'hidden'}`}>
              <div className="bg-white dark:bg-gray-800 p-4 h-full lg:h-auto lg:rounded-lg">

                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X />
                  </button>
                </div>

                {/* CATEGORY */}
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 mb-3 border rounded"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>

                {/* PRICE */}
                <div className="flex gap-2 mb-3">
                  <input type="number" placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e)=>handleFilterChange('minPrice', e.target.value)}
                    className="w-1/2 p-2 border rounded"
                  />
                  <input type="number" placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e)=>handleFilterChange('maxPrice', e.target.value)}
                    className="w-1/2 p-2 border rounded"
                  />
                </div>

                {/* RATING */}
                <select
                  value={filters.rating}
                  onChange={(e)=>handleFilterChange('rating', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4★+</option>
                  <option value="3">3★+</option>
                </select>

                <Button onClick={clearFilters} className="mt-3 w-full">
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="lg:col-span-3">

              {loading ? <ProductGridSkeleton /> :

              productsArray.length === 0 ? (
                <div className="text-center py-12">
                  <p>No products found</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productsArray.map(p => (
                      <Link key={p._id} to={`/product/${p._id}`}
                        className="border p-3 rounded-xl bg-white dark:bg-gray-800">
                        <img src={p.image?.[0]?.url} className="h-40 w-full object-cover rounded"/>
                        <h3 className="mt-2">{p.name}</h3>
                        <p className="text-primary">₹{p.price}</p>
                      </Link>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        maxButtons={Math.min(5, totalPages)} // 🔥 FIX
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;