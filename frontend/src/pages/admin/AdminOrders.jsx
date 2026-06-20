import { useEffect, useState } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import MetaData from "@/components/common/Metadata";
import useOrderStore from "../../../store/useOrderStore";
import { toast } from "sonner";
import { 
  Eye, 
  Trash2, 
  X, 
  Loader2, 
  AlertCircle,
  Truck,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminOrders() {
  const { 
    orders, 
    loading, 
    error, 
    getAllOrders, 
    updateOrder, 
    deleteOrder 
  } = useOrderStore();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  const handleOpenManage = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.orderStatus);
  };

  const handleCloseManage = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    setUpdating(true);
    const result = await updateOrder(selectedOrder._id, updateStatus);
    if (result && result.success) {
      toast.success("Order status updated successfully!");
      setSelectedOrder(null);
    } else {
      toast.error("Failed to update order status.");
    }
    setUpdating(false);
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const result = await deleteOrder(id);
      if (result && result.success) {
        toast.success("Order deleted successfully.");
      } else {
        toast.error("Failed to delete order.");
      }
    }
  };

  return (
    <>
      <MetaData title="Manage Orders - Admin" />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Manage Orders
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fulfill buyer orders, track shipping logistics, and review client purchases.
            </p>
          </div>

          {loading && orders.length === 0 ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-500">Retrieving transactions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex gap-4 text-red-700 dark:text-red-400">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Orders</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No buyer orders are registered yet.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Purchased Items</th>
                      <th className="py-4 px-6">Fulfillment Status</th>
                      <th className="py-4 px-6">Grand Total</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-750">
                    {orders.map((order) => (
                      <tr key={order._id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition">
                        {/* Order ID */}
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                          {order._id}
                        </td>

                        {/* Order Items Summary */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="font-medium text-gray-950 dark:text-gray-200 truncate">
                            {order.orderItems?.map((item) => `${item.name} (x${item.quantity})`).join(", ")}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.orderItems?.length || 0} distinct type(s)</p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            order.orderStatus === "Delivered" 
                              ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                              : order.orderStatus === "Shipped"
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                          }`}>
                            {order.orderStatus === "Delivered" && <CheckCircle className="h-3.5 w-3.5" />}
                            {order.orderStatus === "Shipped" && <Truck className="h-3.5 w-3.5" />}
                            {order.orderStatus === "Processing" && <Clock className="h-3.5 w-3.5" />}
                            <span>{order.orderStatus}</span>
                          </span>
                        </td>

                        {/* Total Price */}
                        <td className="py-4 px-6 font-bold text-gray-950 dark:text-white">
                          Rs. {order.totalPrice?.toLocaleString("en-IN")}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenManage(order)}
                              className="h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDeleteOrder(order._id)}
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

          {/* Manage Order Modal Overlay */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto border dark:border-gray-700 animate-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Process Order</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Fulfillment workflow and transaction invoice details</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCloseManage} className="h-8 w-8 rounded-lg">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  
                  {/* Order Overview info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border dark:border-gray-850">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">Order Identifier</p>
                      <p className="text-xs font-mono text-gray-800 dark:text-gray-200 mt-0.5">{selectedOrder._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase">Grand Bill Total</p>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Rs. {selectedOrder.totalPrice?.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2 uppercase tracking-wide text-gray-400">Shipping Details</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p><span className="font-semibold text-gray-400">Address:</span> {selectedOrder.shippingInfo?.address}</p>
                      <p><span className="font-semibold text-gray-400">Location:</span> {selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.state} - {selectedOrder.shippingInfo?.pinCode}</p>
                      <p><span className="font-semibold text-gray-400">Contact Phone:</span> {selectedOrder.shippingInfo?.phoneNo}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3 uppercase tracking-wide text-gray-400">Purchase Receipt</h4>
                    <div className="space-y-3">
                      {selectedOrder.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border dark:border-gray-700 bg-gray-50/20 dark:bg-gray-800">
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-xs text-gray-400">Unit Cost: Rs. {item.price?.toLocaleString()}</p>
                          </div>
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Update Status Form */}
                  <form onSubmit={handleUpdateStatus} className="pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label htmlFor="orderStatus" className="text-xs font-semibold text-gray-400 uppercase">Change Dispatch Status</label>
                      <select
                        id="orderStatus"
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        disabled={selectedOrder.orderStatus === "Delivered"}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end self-end sm:self-center">
                      <Button variant="outline" type="button" onClick={handleCloseManage} className="rounded-xl px-5 h-10">
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updating || selectedOrder.orderStatus === "Delivered"} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-10 flex items-center gap-1.5 font-medium transition"
                      >
                        {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span>Update Order</span>
                      </Button>
                    </div>
                  </form>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
