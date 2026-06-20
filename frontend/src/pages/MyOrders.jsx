import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, ExternalLink, ShoppingBag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MetaData from "@/components/common/Metadata";
import useOrderStore from "../../store/useOrderStore";

const statusConfig = {
    Processing: {
        color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        dot: "bg-amber-500",
    },
    Shipped: {
        color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        dot: "bg-blue-500",
    },
    Delivered: {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        dot: "bg-emerald-500",
    },
};

const MyOrders = () => {
    const { orders, loading, error, getMyOrders } = useOrderStore();

    useEffect(() => {
        getMyOrders();
    }, [getMyOrders]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.Processing;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
                {status}
            </span>
        );
    };

    if (loading) return <MyOrdersSkeleton />;

    if (error) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Failed to load orders</h2>
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                    <Button onClick={getMyOrders} variant="outline">Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <MetaData title="My Orders | ShopHub" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                                </p>
                            </div>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <ShoppingBag className="w-12 h-12 text-gray-400" />
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No orders yet</h2>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                    Looks like you haven't placed any orders. Start shopping and your orders will show up here!
                                </p>
                            </div>
                            <Link to="/">
                                <Button className="gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Start Shopping
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
                                <table className="w-full" id="orders-table">
                                    <thead>
                                        <tr className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {orders.map((order) => (
                                            <tr
                                                key={order._id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex -space-x-2">
                                                            {order.orderItems.slice(0, 3).map((item, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        ₹{order.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(order.orderStatus)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/order/${order._id}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            View <ExternalLink className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card List */}
                            <div className="md:hidden space-y-3">
                                {orders.map((order) => (
                                    <Link
                                        key={order._id}
                                        to={`/order/${order._id}`}
                                        className="block bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4 hover:shadow-md transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            {getStatusBadge(order.orderStatus)}
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex -space-x-2">
                                                {order.orderItems.slice(0, 3).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-10 h-10 rounded-lg border-2 border-white dark:border-gray-800 object-cover"
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                ₹{order.totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

// Skeleton Loader
function MyOrdersSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                <div className="flex items-center gap-3 mb-8">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div>
                        <Skeleton className="h-7 w-40 mb-1" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-28" />
                            <div className="flex -space-x-2">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <Skeleton className="w-8 h-8 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-8 w-16 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyOrders;
