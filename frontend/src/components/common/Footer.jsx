import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">ShopHub</h3>
            <p className="text-sm text-muted-foreground">
              Your one-stop destination for quality products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <Link to="#" className="hover:text-primary">
                <FaFacebookF className="h-5 w-5" />
              </Link>
              <Link to="#" className="hover:text-primary">
                <FaInstagram className="h-5 w-5" />
              </Link>
              <Link to="#" className="hover:text-primary">
                <FaXTwitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="hover:text-primary">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
