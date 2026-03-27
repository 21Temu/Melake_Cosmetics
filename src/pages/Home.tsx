import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';
import { apiClient } from '../api/client';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await apiClient.get('products/');
        
        // Get featured products (first 4)
        const products = productsRes.data?.results || productsRes.data || [];
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error('Error fetching home data:', error);
        // Mock data for preview if backend is unavailable
        setFeaturedProducts([
          { 
            id: 1, 
            name: 'Luminous Silk Foundation', 
            slug: 'luminous-silk', 
            description: 'Flawless coverage', 
            price: 64.00, 
            stock: 10, 
            category: { id: 1, name: 'Face', slug: 'face' }, 
            image: 'https://picsum.photos/seed/cosmetics1/400/500', 
            is_featured: true, 
            created_at: new Date().toISOString() 
          },
          { 
            id: 2, 
            name: 'Velvet Matte Lipstick', 
            slug: 'velvet-matte', 
            description: 'Long-lasting color', 
            price: 38.00, 
            stock: 5, 
            category: { id: 2, name: 'Lips', slug: 'lips' }, 
            image: 'https://picsum.photos/seed/cosmetics2/400/500', 
            is_featured: true, 
            created_at: new Date().toISOString() 
          },
          { 
            id: 3, 
            name: 'Radiant Glow Highlighter', 
            slug: 'radiant-glow', 
            description: 'Subtle shimmer', 
            price: 42.00, 
            stock: 15, 
            category: { id: 1, name: 'Face', slug: 'face' }, 
            image: 'https://picsum.photos/seed/cosmetics3/400/500', 
            is_featured: true, 
            created_at: new Date().toISOString() 
          },
          { 
            id: 4, 
            name: 'Volume Mascara', 
            slug: 'volume-mascara', 
            description: 'Intense volume', 
            price: 28.00, 
            stock: 20, 
            category: { id: 3, name: 'Eyes', slug: 'eyes' }, 
            image: 'https://picsum.photos/seed/cosmetics4/400/500', 
            is_featured: true, 
            created_at: new Date().toISOString() 
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-muted">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/hero-cosmetics/1920/1080?blur=2" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60 dark:opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wider uppercase mb-6 border border-primary/20">
              Melake Mihiret
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
              Discover Your <br/>
              <span className="text-primary italic">True Beauty</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Melake cosmetics curated for the modern, confident individual.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
              >
                Shop Collection
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center justify-center space-x-4 p-6 rounded-2xl bg-muted/50">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Star size={24} />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg">Premium Quality</h3>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4 p-6 rounded-2xl bg-muted/50">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg">Cruelty Free</h3>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-4 p-6 rounded-2xl bg-muted/50">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg">Fast Shipping</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Trending Now</h2>
              <p className="text-muted-foreground">Our most loved products, carefully selected for you.</p>
            </div>
            <Link to="/products" className="group inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors mt-6 md:mt-0">
              View All Products
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="bg-muted aspect-[4/5] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category Button */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Shop by Category</h2>
            <p className="text-muted-foreground mb-8">
              Explore our curated collections designed for your specific beauty needs.
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
            >
              Browse All Categories
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
