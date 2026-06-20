import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/layout/AdminSidebar";
import MetaData from "@/components/common/Metadata";
import api from "@/config/axios";
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  IndianRupee, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const { data } = await api.get("/admin/stats");
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Compute daily sales data for the SVG chart
  const getChartData = () => {
    if (!stats || !stats.orders || stats.orders.length === 0) return [];
    
    // Group orders by date (YYYY-MM-DD)
    const dailyMap = {};
    
    // Pre-populate last 7 days with 0 to ensure we have a nice timeline
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      dailyMap[dateString] = 0;
    }

    stats.orders.forEach(order => {
      const dateString = new Date(order.createdAt).toISOString().split("T")[0];
      if (dailyMap[dateString] !== undefined) {
        dailyMap[dateString] += order.totalPrice;
      } else {
        // If older than 7 days, check if we want to include it or just stick to 7 days
        dailyMap[dateString] = order.totalPrice;
      }
    });

    // Convert map to sorted array
    return Object.keys(dailyMap)
      .sort()
      .map(date => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount: dailyMap[date]
      }));
  };

  const chartData = getChartData();

  // Create SVG path points for the Area Chart
  const generateSvgPoints = (data, width = 600, height = 200) => {
    if (data.length === 0) return { path: "", area: "", points: [] };

    const maxVal = Math.max(...data.map(d => d.amount), 100);
    const paddingX = 40;
    const paddingY = 20;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const points = data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * chartW;
      // Invert Y axis for screen coordinates
      const y = height - paddingY - (d.amount / maxVal) * chartH;
      return { x, y, amount: d.amount, date: d.date };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    // Path closed at bottom for filled area
    const areaD = pathD 
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : "";

    return { path: pathD, area: areaD, points };
  };

  const svgWidth = 700;
  const svgHeight = 220;
  const { path, area, points } = generateSvgPoints(chartData, svgWidth, svgHeight);

  return (
    <>
      <MetaData title="Admin Dashboard" />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Overview Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time monitoring of products, sales, orders, and registered customers.
            </p>
          </div>

          {loading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-500">Loading summary statistics...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex gap-4 items-start text-red-700 dark:text-red-400">
              <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg">Error Loading Dashboard</h3>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Sales */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Sales</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        Rs. {stats?.totalAmount?.toLocaleString("en-IN") || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
                </div>

                {/* Products */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Products</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats?.productsCount || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Package className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
                </div>

                {/* Orders */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Orders</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats?.ordersCount || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>

                {/* Users */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Users</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {stats?.usersCount || 0}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
                </div>

              </div>

              {/* Chart & Summary Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Chart Card */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">Sales Trend</h3>
                      <p className="text-xs text-gray-400">Total daily revenue generated over the last 7 days</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full font-semibold">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Live</span>
                    </div>
                  </div>

                  {chartData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-12 text-gray-400 text-sm">
                      No sales data available.
                    </div>
                  ) : (
                    <div className="flex-1 w-full overflow-x-auto">
                      <div className="min-w-[500px] h-[220px]">
                        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="40" y1="20" x2={svgWidth - 40} y2="20" stroke="#f1f5f9" className="dark:stroke-gray-700/40" strokeWidth="1" />
                          <line x1="40" y1="70" x2={svgWidth - 40} y2="70" stroke="#f1f5f9" className="dark:stroke-gray-700/40" strokeWidth="1" />
                          <line x1="40" y1="120" x2={svgWidth - 40} y2="120" stroke="#f1f5f9" className="dark:stroke-gray-700/40" strokeWidth="1" />
                          <line x1="40" y1="170" x2={svgWidth - 40} y2="170" stroke="#f1f5f9" className="dark:stroke-gray-700/40" strokeWidth="1" />
                          <line x1="40" y1="200" x2={svgWidth - 40} y2="200" stroke="#e2e8f0" className="dark:stroke-gray-700" strokeWidth="1.5" />

                          {/* Filled Area */}
                          {area && <path d={area} fill="url(#chartGradient)" />}

                          {/* Line */}
                          {path && (
                            <path 
                              d={path} 
                              fill="none" 
                              stroke="#6366f1" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                          )}

                          {/* Nodes/Dots with interactive tooltips */}
                          {points.map((pt, i) => (
                            <g key={i} className="group/node cursor-pointer">
                              <circle 
                                cx={pt.x} 
                                cy={pt.y} 
                                r="5" 
                                fill="#ffffff" 
                                stroke="#6366f1" 
                                strokeWidth="3" 
                                className="transition-all duration-150 hover:r-7 hover:fill-indigo-600"
                              />
                              {/* Hover tooltip */}
                              <rect 
                                x={pt.x - 45} 
                                y={pt.y - 45} 
                                width="90" 
                                height="32" 
                                rx="6" 
                                fill="#1e293b" 
                                className="opacity-0 pointer-events-none group-hover/node:opacity-100 transition-opacity duration-200"
                              />
                              <text 
                                x={pt.x} 
                                y={pt.y - 25} 
                                fill="#ffffff" 
                                fontSize="10" 
                                fontWeight="bold" 
                                textAnchor="middle" 
                                className="opacity-0 pointer-events-none group-hover/node:opacity-100 transition-opacity duration-200"
                              >
                                Rs.{pt.amount.toLocaleString()}
                              </text>
                              {/* X Axis Labels */}
                              <text 
                                x={pt.x} 
                                y={svgHeight - 2} 
                                fill="#94a3b8" 
                                fontSize="10" 
                                textAnchor="middle"
                              >
                                {pt.date}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Short statistics break down */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Stock Alerts</h3>
                  {stats?.productsCount === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      No products added.
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px]">
                      <p className="text-xs text-gray-400 mb-2">Monitor catalog availability and restock items immediately.</p>
                      
                      <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-950">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Operational Catalog</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats?.productsCount} items</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/50 dark:border-emerald-950">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Active Order Dispatch</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats?.ordersCount} orders</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100/50 dark:border-rose-950">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Registered Audience</span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{stats?.usersCount} buyers</span>
                      </div>

                    </div>
                  )}
                </div>

              </div>

              {/* Recent Orders List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Recent Orders</h3>
                  <Link 
                    to="/admin/orders" 
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    View All Orders
                  </Link>
                </div>

                {!stats?.orders || stats.orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No orders recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                          <th className="pb-3 pr-4">Order ID</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 px-4">Total Price</th>
                          <th className="pb-3 pl-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {stats.orders.slice(0, 5).map((order) => (
                          <tr key={order._id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                            <td className="py-4 pr-4 font-mono text-xs">{order._id}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.orderStatus === "Delivered" 
                                  ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                                  : order.orderStatus === "Shipped"
                                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                              }`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                              Rs. {order.totalPrice.toLocaleString("en-IN")}
                            </td>
                            <td className="py-4 pl-4 text-right">
                              <Link 
                                to={`/admin/orders`}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-semibold"
                              >
                                Manage
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
