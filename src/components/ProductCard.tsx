import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    if (!token) {
      toast.error('Please login to add items to cart');
      window.location.href = '/login';
      return;
    }
    
    const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock as string) || 0;
    
    if (stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    setIsAdding(true);
    
    try {
      const result = await addToCart(product, 1);
      
      if (result.success) {
        toast.success(`${product.name || product.product_name} added to cart!`);
      } else {
        toast.error(result.message || 'Failed to add to cart');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: any): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const getStock = (): number => {
    if (typeof product.stock === 'number') return product.stock;
    if (typeof product.stock === 'string') return parseInt(product.stock) || 0;
    return 0;
  };

  const getImageUrl = (): string => {
    const img = product.product_image || product.image;
    if (img) {
      return img.startsWith('http') ? img : `http://localhost:8000${img}`;
    }
    return `https://picsum.photos/seed/${product.id || Math.random()}/400/500`;
  };

  const stock = getStock();
  const price = formatPrice(product.price);
  const productId = product.product_id || product.id;
  const productName = product.name || product.product_name || 'Product';

  return (
    <Link to={`/product/${productId}`} className="group block h-full">
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <div className="aspect-[4/5] overflow-hidden bg-muted relative">
          <img
            src={getImageUrl()}
            alt={productName}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {stock <= 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold uppercase">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {productName}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-xl font-medium text-foreground"> {price} Birr</span>
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0 || isAdding}
              className="p-3 rounded-full bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50"
            >
              {isAdding ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                <ShoppingCart size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}