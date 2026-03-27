import { Link } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useThemeStore } from '../store/useThemeStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, fetchCart, resetCart } = useCartStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Navbar: User authenticated, fetching cart...');
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Subscribe to cart items changes
  const cartItemCount = items?.reduce((total, item) => total + (item?.quantity || 0), 0) || 0;
  
  console.log('Navbar rendered, cart items count:', cartItemCount, 'items:', items?.length);

  const handleLogout = async () => {
    // Reset cart first
    resetCart();
    // Then logout
    logout();
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-primary">Melake Cosmetics</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Shop</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-muted">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link to="/cart" className="relative p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-muted">
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full min-w-[20px] h-5">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            <Link to="/messages" className="relative p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-muted">
               <MessageSquare size={20} />
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-foreground/80 hover:text-primary transition-colors rounded-full hover:bg-muted">
                  <User size={20} />
                </button>
                <div className="absolute right-0 w-48 py-2 mt-2 bg-card border border-border rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-foreground hover:bg-muted">Orders</Link>
                  {user?.is_staff && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-primary hover:bg-muted">Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Sign In</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-foreground/80 hover:text-primary transition-colors">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/cart" className="relative p-2 text-foreground/80 hover:text-primary transition-colors">
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full min-w-[20px] h-5">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground/80 hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
              <Link to="/messages" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>Messages</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                  <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>Orders</Link>
                  {user?.is_staff && (
                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-muted">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-muted" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}