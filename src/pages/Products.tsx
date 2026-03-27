import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';
import { apiClient } from '../api/client';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('categories/');
        console.log('Categories response:', res.data);
        
        let categoriesData = [];
        if (res.data.results) {
          categoriesData = res.data.results;
        } else if (Array.isArray(res.data)) {
          categoriesData = res.data;
        }
        
        const mappedCategories = categoriesData.map((cat: any) => ({
          id: cat.category_id || cat.id,
          name: cat.name,
          slug: cat.name?.toLowerCase().replace(/\s+/g, '-') || `cat-${cat.id}`,
          description: cat.description
        }));
        
        console.log('Mapped categories:', mappedCategories);
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([
          { id: 1, name: 'Skincare', slug: 'skincare' },
          { id: 2, name: 'Makeup', slug: 'makeup' },
          { id: 3, name: 'Fragrance', slug: 'fragrance' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let url = '';
        const params = new URLSearchParams();
        
        // Handle category filtering - use the by_category endpoint
        if (selectedCategory) {
          const selectedCat = categories.find(c => c.slug === selectedCategory);
          if (selectedCat) {
            // Use the by_category endpoint for category filtering
            url = `products/by_category/?category_id=${selectedCat.id}`;
          } else {
            url = 'products/';
          }
        } else {
          url = 'products/';
        }
        
        // Add search parameter if exists
        if (searchTerm) {
          // Use the search endpoint for search
          if (selectedCategory) {
            // If category is selected, we need to combine both? 
            // For now, let's just do search separately
            url = `products/search/?q=${searchTerm}`;
          } else {
            url = `products/search/?q=${searchTerm}`;
          }
        }
        
        console.log('Fetching products from:', url);
        const res = await apiClient.get(url);
        
        let productsData = [];
        if (res.data.results) {
          productsData = res.data.results;
        } else if (Array.isArray(res.data)) {
          productsData = res.data;
        } else {
          productsData = [res.data];
        }
        
        // Filter out null/undefined
        productsData = productsData.filter(p => p !== null && p !== undefined);
        
        const mappedProducts = productsData.map((product: any) => ({
          id: product.product_id || product.id,
          product_id: product.product_id,
          name: product.product_name || product.name,
          product_name: product.product_name,
          slug: product.slug || (product.product_name?.toLowerCase().replace(/\s+/g, '-')),
          description: product.description,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          stock: typeof product.stock === 'string' ? parseInt(product.stock) : product.stock,
          category: product.category_name || product.category,
          category_name: product.category_name,
          image: product.product_image || product.image,
          product_image: product.product_image,
          is_featured: product.is_featured || product.status === true,
          created_at: product.created_at
        }));
        
        console.log('Mapped products:', mappedProducts.length);
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (categories.length > 0 || !selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory, searchTerm, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
    setIsFilterOpen(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">My Collection</h1>
          <p className="text-muted-foreground">Discover the perfect products for your beauty routine.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </form>
          
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden p-2 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="sticky top-24 bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-semibold text-foreground">Categories</h3>
              {isFilterOpen && (
                <button onClick={() => setIsFilterOpen(false)} className="md:hidden text-muted-foreground">
                  <X size={20} />
                </button>
              )}
            </div>
            
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === null 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategorySelect(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="bg-muted aspect-[4/5] rounded-2xl mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-card rounded-2xl border border-border border-dashed">
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                {selectedCategory 
                  ? `No products found in ${categories.find(c => c.slug === selectedCategory)?.name} category.` 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  handleCategorySelect(null);
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}