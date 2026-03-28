import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

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
        
        if (selectedCategory) {
          const selectedCat = categories.find(c => c.slug === selectedCategory);
          if (selectedCat) {
            url = `products/by_category/?category_id=${selectedCat.id}`;
          } else {
            url = 'products/';
          }
        } else {
          url = 'products/';
        }
        
        if (searchTerm) {
          if (selectedCategory) {
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
        
        productsData = productsData.filter(p => p !== null && p !== undefined);
        
        let mappedProducts = productsData.map((product: any) => ({
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
        
        // Sort products
        if (sortBy === 'price_low') {
          mappedProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_high') {
          mappedProducts.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
          mappedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        
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
  }, [selectedCategory, searchTerm, categories, sortBy]);

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

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 mb-8 sm:mb-12">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">My Collection</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Discover the perfect products for your beauty routine.</p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm sm:text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
          </form>
          
          <div className="flex gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm sm:text-base"
              >
                Sort
                <ChevronDown size={16} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                        sortBy === option.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Filter Button (Mobile) */}
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors"
            >
              <Filter size={18} />
              <span>Filter</span>
              {selectedCategory && <span className="w-2 h-2 bg-primary rounded-full"></span>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar Filters */}
        <aside className={`${isFilterOpen ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-6' : 'hidden'} md:block md:relative md:bg-transparent md:p-0 md:w-64 shrink-0`}>
          <div className="bg-card rounded-2xl p-5 md:p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-semibold text-foreground">Categories</h3>
              {isFilterOpen && (
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
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
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
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
            
            {isFilterOpen && (
              <button
                onClick={() => setIsFilterOpen(false)}
                className="mt-6 w-full py-3 bg-primary text-primary-foreground rounded-full font-medium text-sm md:hidden"
              >
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid - Mobile: 2 columns */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={`skeleton-${i}`} className="animate-pulse">
                  <div className="bg-muted aspect-[4/5] rounded-xl sm:rounded-2xl mb-3"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-5 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-24 bg-card rounded-2xl border border-border border-dashed">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-6 px-4">
                {selectedCategory 
                  ? `No products found in ${categories.find(c => c.slug === selectedCategory)?.name} category.` 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  handleCategorySelect(null);
                  setSortBy('newest');
                }}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Overlay Backdrop */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}
