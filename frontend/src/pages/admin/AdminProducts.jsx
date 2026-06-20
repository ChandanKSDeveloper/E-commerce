import { useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import MetaData from "@/components/common/Metadata";
import useProductStore from "../../../store/useProductStore";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminProducts() {
  const { 
    products, 
    loading, 
    error, 
    getAllProducts, 
    deleteProduct,
    message 
  } = useProductStore();

  useEffect(() => {
    getAllProducts({ limit: 100 }); // Fetch all products for admin view
  }, [getAllProducts]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      const result = await deleteProduct(id);
      if (result && result.success) {
        toast.success(`Product "${name}" deleted successfully.`);
      } else {
        toast.error("Failed to delete product.");
      }
    }
  };

  return (
    <>
      <MetaData title="All Products - Admin" />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Page Title & Add Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                Manage Products
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View, modify, or delete items from the store catalog.
              </p>
            </div>
            
            <Link to="/admin/product/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 px-5 py-2.5 shadow-sm transition">
                <Plus className="h-5 w-5" />
                <span>Create Product</span>
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-500">Retrieving catalog items...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex gap-4 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Products</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No products found in the database. Click "Create Product" to add your first item.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-4 px-6">Product Details</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-750">
                    {products.map((product) => (
                      <tr key={product._id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition">
                        {/* Title & Image */}
                        <td className="py-4 px-6 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center border dark:border-gray-600">
                            {product.image?.[0]?.url ? (
                              <img 
                                src={product.image[0].url} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400">No Image</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{product._id}</p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg text-gray-600 dark:text-gray-300 font-medium">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                          Rs. {product.price?.toLocaleString("en-IN")}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6">
                          {product.stock <= 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400">
                              Out of Stock
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                              Low Stock ({product.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                              In Stock ({product.stock})
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/product/${product._id}`}>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                              >
                                <Edit className="h-4.5 w-4.5" />
                              </Button>
                            </Link>
                            
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDelete(product._id, product.name)}
                              className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
