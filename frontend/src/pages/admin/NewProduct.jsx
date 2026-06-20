import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import MetaData from "@/components/common/Metadata";
import useProductStore from "../../../store/useProductStore";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "Electronics",
  "Mobile Phones",
  "Computers & Tablets",
  "Cameras",
  "Audio & Headphones",
  "Wearable Technology",
  "Video Games & Consoles",
  "Clothing",
  "Men's Fashion",
  "Women's Fashion",
  "Kids' Fashion",
  "Footwear",
  "Accessories",
  "Jewelry",
  "Home & Kitchen",
  "Furniture",
  "Home Decor",
  "Garden & Outdoor",
  "Tools & Hardware",
  "Beauty & Personal Care",
  "Skincare",
  "Makeup",
  "Hair Care",
  "Fragrance",
  "Health & Wellness",
  "Sports & Fitness",
  "Exercise Equipment",
  "Outdoor Recreation",
  "Camping & Hiking",
  "Cycling",
  "Books",
  "Movies & TV",
  "Music",
  "Stationery & Office Supplies",
  "Toys & Games",
  "Baby Products",
  "Educational Toys",
  "Automotive",
  "Pet Supplies",
  "Groceries & Food",
  "Arts & Crafts",
  "Industrial Supplies",
  "Business & Industrial",
  "Other"
];

export default function NewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { 
    product, 
    loading, 
    error, 
    getProductById, 
    createProduct, 
    updateProduct,
    setProduct
  } = useProductStore();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Electronics",
    stock: "1",
    seller: "",
    imageUrl: ""
  });

  const [fetchingProduct, setFetchingProduct] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      async function loadProduct() {
        setFetchingProduct(true);
        const data = await getProductById(id);
        if (data && data.product) {
          const prod = data.product;
          setFormData({
            name: prod.name || "",
            price: prod.price?.toString() || "",
            description: prod.description || "",
            category: prod.category || "Electronics",
            stock: prod.stock?.toString() || "0",
            seller: prod.seller || "",
            imageUrl: prod.image?.[0]?.url || ""
          });
        } else {
          toast.error("Failed to retrieve product details.");
          navigate("/admin/products");
        }
        setFetchingProduct(false);
      }
      loadProduct();
    } else {
      setProduct(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "Electronics",
        stock: "1",
        seller: "",
        imageUrl: ""
      });
    }
  }, [id, isEditMode, getProductById, navigate, setProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, description, category, stock, seller, imageUrl } = formData;

    if (!name.trim() || !price || !description.trim() || !seller.trim() || !imageUrl.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Format payload to match backend expectations
    const payload = {
      name,
      price: Number(price),
      description,
      category,
      stock: Number(stock),
      seller,
      image: [
        {
          public_id: isEditMode && product?.image?.[0]?.public_id ? product.image[0].public_id : `prod_${Date.now()}`,
          url: imageUrl
        }
      ]
    };

    let result;
    if (isEditMode) {
      result = await updateProduct(id, payload);
    } else {
      result = await createProduct(payload);
    }

    if (result && result.success) {
      toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
      navigate("/admin/products");
    } else {
      toast.error(error || "An error occurred while saving the product.");
    }
  };

  return (
    <>
      <MetaData title={isEditMode ? "Edit Product - Admin" : "Create Product - Admin"} />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link 
              to="/admin/products" 
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Products</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              {isEditMode ? "Modify Product details" : "Add New Catalog Item"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditMode 
                ? "Update pricing, description, stock status, or cover images."
                : "Fill out the fields to publish a new product to the shopping platform."
              }
            </p>
          </div>

          {fetchingProduct ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-500">Fetching item configuration...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Product Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Product Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Wireless Noise Cancelling Headphones"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Price (Rs.) *
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="e.g. 4999"
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label htmlFor="stock" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Initial Stock *
                    </label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="e.g. 50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Dropdown */}
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Product Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seller */}
                  <div className="space-y-2">
                    <label htmlFor="seller" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Seller / Brand *
                    </label>
                    <Input
                      id="seller"
                      name="seller"
                      type="text"
                      value={formData.seller}
                      onChange={handleChange}
                      placeholder="e.g. Sony Audio Systems"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Product Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description of features, specifications, box contents, etc."
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Image Link / URL *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="e.g. https://example.com/images/headphones.jpg"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400">Provide a direct web link to the product cover image.</p>
                </div>

                {/* Image Preview */}
                {formData.imageUrl.trim() && (
                  <div className="p-4 border border-dashed rounded-xl flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-900/50">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" /> Live Image Preview
                    </span>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="max-h-48 object-contain rounded-lg shadow-sm mt-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        toast.error("Failed to load image preview from provided URL.");
                      }}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 px-6 py-3 transition"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>{isEditMode ? "Update Product" : "Publish Product"}</span>
                  </Button>
                </div>

              </form>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
