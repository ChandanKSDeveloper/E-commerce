import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, User, Search, Menu, X, LogOut, Loader2 } from "lucide-react";
import useUserStore from "../../../store/useUserStore";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user, loading, authChecked, logoutUser } = useUserStore();

  // Clear search when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes('/search')) {
      setSearchTerm("");
    }
    // Close menus on route change
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileMenuOpen && !e.target.closest('.profile-dropdown')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logoutUser();
    navigate('/');
  };

  // Render user button based on auth state
  const renderUserButton = ({ mobile = false } = {}) => {
    // Still checking auth - show loading
    if (!authChecked || loading) {
      if (mobile) {
        return (
          <Button variant="ghost" className="w-full justify-start" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
          </Button>
        );
      }
      return (
        <Button variant="ghost" size="icon" className="sm:px-3" disabled>
          <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      );
    }

    // Authenticated - show profile menu
    if (isAuthenticated && user) {
      if (mobile) {
        return (
          <>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" /> Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </>
        );
      }

      return (
        <div className="relative profile-dropdown">
          <Button
            variant="ghost"
            size="icon"
            className="sm:px-3 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileMenuOpen(!isProfileMenuOpen);
            }}
          >
            {user.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </Button>

          {/* Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-background shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <User className="h-4 w-4" /> My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      );
    }

    // Not authenticated - show login button
    if (mobile) {
      return (
        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" /> Login
          </Button>
        </Link>
      );
    }

    return (
      <Link to="/login">
        <Button variant="ghost" size="icon" className="sm:px-3">
          <User className="h-5 w-5" />
        </Button>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ShopHub
          </Link>
        </div>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-lg mx-6"
        >
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-20 rounded-full"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-3"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {renderUserButton()}

          <Link to="/cart" className="relative">
            <Button variant="outline" size="icon" className="sm:px-3">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t px-4 pb-4 space-y-4 animate-in slide-in-from-top">
          <form onSubmit={handleSearch} className="flex gap-2 pt-4">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-full"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            {renderUserButton({ mobile: true })}

            <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" /> Cart
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
