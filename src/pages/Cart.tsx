import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

export default function Cart() {
  const { items, total, updateQuantity, removeFromCart, fetchCart, isLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const formatPrice = (price: any): number => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const handleRemoveItem = async (itemId: number, itemName: string) => {
    if (!itemId) {
      toast.error('Invalid item ID');
      return;
    }
    
    setDeletingItemId(itemId);
    try {
      const result = await removeFromCart(itemId);
      if (result.success) {
        toast.success(`${itemName} removed from cart`);
      } else {
        toast.error(result.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setDeletingItemId(null);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number, itemName: string) => {
    if (!itemId) {
      toast.error('Invalid item ID');
      return;
    }
    
    try {
      const result = await updateQuantity(itemId, newQuantity);
      if (result.success) {
        toast.success(`${itemName} quantity updated`);
      } else {
        toast.error(result.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error(`Failed to update ${itemName} quantity`);
    }
  };

  const openDeleteModal = (itemId: number, itemName: string) => {
    setItemToDelete({ id: itemId, name: itemName });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      handleRemoveItem(itemToDelete.id, itemToDelete.name);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const getImageUrl = (product: any): string => {
    const img = product.product_image || product.image;
    if (img) {
      if (img.startsWith('http')) {
        return img;
      }
      return `http://localhost:8000${img}`;
    }
    return `https://picsum.photos/seed/${product.id || product.product_id || Math.random()}/200/200`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
          <ShoppingBag size={48} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added any premium cosmetics to your cart yet.
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const safeTotal = items.reduce((sum, item) => {
    const price = formatPrice(item.product.price);
    return sum + (price * item.quantity);
  }, 0);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-12">Shopping Cart ({items.length} items)</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            {items.map((item) => {
              const price = formatPrice(item.product.price);
              const itemTotal = price * item.quantity;
              const productId = item.product.product_id || item.product.id;
              const productName = item.product.name || item.product.product_name || 'Product';
              const productImage = getImageUrl(item.product);
              
              return (
                <div key={item.id || Math.random()} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <Link to={`/product/${productId}`} className="shrink-0">
                    <img 
                      src={productImage} 
                      alt={productName} 
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.error('Image failed to load:', productImage);
                        e.currentTarget.src = `https://picsum.photos/seed/fallback${productId}/200/200`;
                      }}
                    />
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between h-full w-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs font-medium text-secondary uppercase tracking-wider mb-1">
                          {item.product.category_name || 'Cosmetics'}
                        </div>
                        <Link to={`/product/${productId}`} className="font-serif text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                          {productName}
                        </Link>
                      </div>
                      <span className="font-medium text-lg text-foreground ml-4 shrink-0">
                        {itemTotal.toFixed(2)} Birr
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-border rounded-full p-1 bg-background">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, productName)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 rounded-full hover:bg-muted text-foreground disabled:opacity-50 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, productName)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1.5 rounded-full hover:bg-muted text-foreground disabled:opacity-50 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button 
                        onClick={() => openDeleteModal(item.id, productName)}
                        disabled={deletingItemId === item.id}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors disabled:opacity-50"
                      >
                        {deletingItemId === item.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-destructive"></div>
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="bg-muted/50 rounded-3xl p-8 border border-border/50 sticky top-24">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">{safeTotal.toFixed(2)} Birr</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-xl font-bold text-foreground">Total</span>
                  <span className="font-serif text-2xl font-bold text-primary"> {safeTotal.toFixed(2)} Birr</span>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                disabled={items.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 px-8 rounded-full font-medium text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>
              
              <div className="mt-6 text-center">
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">Confirm Removal</h3>
                <button
                  onClick={cancelDelete}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-foreground mb-2">
                Are you sure you want to remove <span className="font-semibold text-primary">{itemToDelete?.name}</span> from your cart?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-5 py-2 rounded-full border border-border text-foreground hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium"
              >
                Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}