import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  Users, 
  Star, 
  Menu, 
  X, 
  ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Create Product", path: "/admin/product/new", icon: PlusCircle },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Reviews", path: "/admin/reviews", icon: Star },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:opacity-85 transition">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Back to Shop</span>
        </Link>
        {/* Mobile close button */}
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-6 py-4">
        <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Admin Panel
        </h2>
      </div>

      {/* Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-center">
        &copy; {new Date().getFullYear()} ShopHub Admin
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar (Only visible on small/medium screens) */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-30">
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Admin Controls</span>
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-64 min-h-screen sticky top-0 h-screen overflow-hidden flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 md:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {sidebarContent}
      </div>
    </>
  );
}
