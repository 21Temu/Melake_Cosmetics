import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, ArrowLeft, Star } from 'lucide-react';
import { Product } from '../types';
import { apiClient } from '../api/client';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Debug: Log the ID/Slug from URL
  useEffect(() => {
    console.log('Product ID from URL:', id);
    console.log('Product Slug from URL:', slug);
  }, [id, slug]);

  // Safe price formatting function
  const formatPrice = (price: any): number => {
    if (price === undefined || price === null) return 0;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 0 : numPrice;
  };

  // Safe stock formatting function
  const getStock = (stock: any): number => {
    if (stock === undefined || stock === null) return 0;
    const numStock = typeof stock === 'string' ? parseInt(stock) : stock;
    return isNaN(numStock) ? 0 : numStock;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      const productIdentifier = id || slug;
      
      if (!productIdentifier) {
        console.error('No product identifier provided');
        setError('No product identifier provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log(`Fetching product with identifier: ${productIdentifier}`);
        console.log(`API URL: products/${productIdentifier}/`);
        
        const res = await apiClient.get(`products/${productIdentifier}/`);
        console.log('API Response:', res.data);
        
        const fetchedProduct = res.data;
        
        if (!fetchedProduct) {
          throw new Error('No product data received');
        }
        
        // Convert price and stock to numbers
        const processedProduct: Product = {
          id: fetchedProduct.product_id || fetchedProduct.id,
          product_id: fetchedProduct.product_id,
          name: fetchedProduct.product_name || fetchedProduct.name,
          product_name: fetchedProduct.product_name,
          description: fetchedProduct.description || '',
          price: formatPrice(fetchedProduct.price),
          stock: getStock(fetchedProduct.stock),
          image: fetchedProduct.product_image || fetchedProduct.image,
          product_image: fetchedProduct.product_image,
          category: fetchedProduct.category_name || fetchedProduct.category,
          category_name: fetchedProduct.category_name,
          is_featured: fetchedProduct.status === true || fetchedProduct.is_featured,
          status: fetchedProduct.status,
          sold_count: fetchedProduct.sold_count || 0,
          created_at: fetchedProduct.created_at,
          slug: fetchedProduct.slug
        };
        
        console.log('Processed product:', processedProduct);
        setProduct(processedProduct);
        
      } catch (error: any) {
        console.error('Error fetching product:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        setError(error.response?.data?.message || error.message || 'Failed to load product');
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, slug]);

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (product) {
      const currentStock = getStock(product.stock);
      if (type === 'increment' && quantity < currentStock) {
        setQuantity(q => q + 1);
      } else if (type === 'decrement' && quantity > 1) {
        setQuantity(q => q - 1);
      }
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      const currentStock = getStock(product.stock);
      if (currentStock > 0) {
        const productWithNumberPrice = {
          ...product,
          price: formatPrice(product.price),
          stock: currentStock
        };
        await addToCart(productWithNumberPrice, quantity);
        toast.success(`${quantity} ${product.name} added to cart`);
      } else {
        toast.error('Product is out of stock');
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
          <p className="text-xs text-muted-foreground mt-2">Product ID: {id || slug || 'none'}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Product not found</h2>
        <p className="text-muted-foreground mb-4">
          {error || 'The product you are looking for does not exist.'}
        </p>
        <p className="text-sm text-muted-foreground mb-6">Product identifier: {id || slug || 'none'}</p>
        <button 
          onClick={() => navigate('/products')} 
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={18} />
          Return to Shop
        </button>
      </div>
    );
  }

  // Get the actual product image from the product data
  const getProductImage = (): string => {
    if (product.product_image) {
      if (product.product_image.startsWith('http')) {
        return product.product_image;
      }
      return `http://localhost:8000${product.product_image}`;
    }
    if (product.image) {
      if (product.image.startsWith('http')) {
        return product.image;
      }
      return `http://localhost:8000${product.image}`;
    }
    return `https://picsum.photos/seed/${product.id}/800/1000`;
  };

  const productImage = getProductImage();
  const images = [productImage];
  const currentStock = getStock(product.stock);
  const currentPrice = formatPrice(product.price);
  const productName = product.name || product.product_name || 'Product';
  const categoryName = typeof product.category === 'object' 
    ? product.category?.name 
    : product.category_name || product.category || 'Cosmetics';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Product Images */}
        <div className="space-y-6">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-muted border border-border/50">
            <img 
              src={images[activeImage]} 
              alt={productName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.error('Image failed to load:', images[activeImage]);
                e.currentTarget.src = `https://picsum.photos/seed/fallback${product.id}/800/1000`;
              }}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-2 text-sm font-medium text-secondary uppercase tracking-wider">
            {categoryName}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {productName}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-medium text-foreground">
              {currentPrice.toFixed(2)} Birr
            </span>
            {/* <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({product.sold_count || 128} reviews)
              </span>
            </div> */}
          </div>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {product.description || 'Premium quality cosmetic product for your daily beauty routine.'}
          </p>

          <div className="space-y-6 border-t border-border pt-8">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Availability</span>
              {currentStock > 0 ? (
                <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                  In Stock ({currentStock} available)
                </span>
              ) : (
                <span className="text-destructive bg-destructive/10 px-3 py-1 rounded-full text-sm font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center border border-border rounded-full p-1 bg-background">
                <button 
                  onClick={() => handleQuantityChange('decrement')}
                  disabled={quantity <= 1 || currentStock <= 0}
                  className="p-2 rounded-full hover:bg-muted text-foreground disabled:opacity-50 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange('increment')}
                  disabled={quantity >= currentStock || currentStock <= 0}
                  className="p-2 rounded-full hover:bg-muted text-foreground disabled:opacity-50 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 px-8 rounded-full font-medium text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                <ShoppingBag size={20} />
                {currentStock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}