import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Order } from '../types';
import { apiClient } from '../api/client';
import { toast } from 'sonner';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('orders/');
      console.log('Orders response:', res.data);
      
      // Handle paginated response
      let ordersData = [];
      if (res.data.results) {
        ordersData = res.data.results;
      } else if (Array.isArray(res.data)) {
        ordersData = res.data;
      }
      
      // Fetch product details for each order if needed
      const ordersWithProductImages = await Promise.all(
        ordersData.map(async (order: any) => {
          // If the order has product relationship and we need more details
          if (order.product && !order.product_image) {
            try {
              // Fetch product details to get image
              const productRes = await apiClient.get(`products/${order.product}/`);
              return {
                ...order,
                product_image: productRes.data.product_image,
                product_name: productRes.data.product_name,
                product_price: productRes.data.price
              };
            } catch (err) {
              console.error('Error fetching product for order:', order.id, err);
              return order;
            }
          }
          return order;
        })
      );
      
      setOrders(ordersWithProductImages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await apiClient.patch(`orders/${orderId}/`, { status: 'cancelled' });
        toast.success('Order cancelled successfully');
        fetchOrders();
      } catch (error: any) {
        console.error('Error cancelling order:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending': return <Clock className="text-amber-500" size={20} />;
      case 'processing': return <Package className="text-blue-500" size={20} />;
      case 'shipped': return <Truck className="text-indigo-500" size={20} />;
      case 'delivered': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'cancelled': return <XCircle className="text-destructive" size={20} />;
      default: return <Package className="text-muted-foreground" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatPrice = (price: any): number => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const getImageUrl = (order: any): string => {
    // Try to get image from various sources
    // 1. Direct product_image from order
    if (order.product_image) {
      if (order.product_image.startsWith('http')) {
        return order.product_image;
      }
      return `http://localhost:8000${order.product_image}`;
    }
    
    // 2. From product object if it exists
    if (order.product_details?.product_image) {
      const img = order.product_details.product_image;
      if (img.startsWith('http')) {
        return img;
      }
      return `http://localhost:8000${img}`;
    }
    
    // 3. Try to get from product relationship
    if (order.product?.product_image) {
      const img = order.product.product_image;
      if (img.startsWith('http')) {
        return img;
      }
      return `http://localhost:8000${img}`;
    }
    
    // 4. Fallback to placeholder
    return `https://picsum.photos/seed/order${order.id}/100/100`;
  };

  const getProductName = (order: any): string => {
    if (order.product_name) return order.product_name;
    if (order.product_details?.product_name) return order.product_details.product_name;
    if (order.product?.product_name) return order.product.product_name;
    return 'Product';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
          <Package size={48} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground mb-4">No orders yet</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You haven't placed any orders. Start exploring our premium cosmetics collection.
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-foreground mb-12">Your Orders</h1>

      <div className="space-y-8">
        {orders.map((order) => {
          const amount = formatPrice(order.amount);
          const quantity = order.quantity || 1;
          const productName = getProductName(order);
          const status = order.status || 'pending';
          const address = order.address || order.shipping_address;
          const orderNumber = order.order_number || `ORD-${order.id}`;
          const createdAt = order.created_at;
          const productImage = getImageUrl(order);
          
          return (
            <div key={order.id} className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-serif text-xl font-bold text-foreground">Order #{orderNumber}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-serif text-2xl font-bold text-primary">{amount.toFixed(2)} Birr</p>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="shrink-0">
                      <img 
                        src={productImage} 
                        alt={productName} 
                        className="w-20 h-20 object-cover rounded-xl border border-border"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.error('Image failed to load:', productImage);
                          e.currentTarget.src = `https://picsum.photos/seed/fallback${order.id}/100/100`;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground line-clamp-1">
                        {productName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantity: {quantity} | Price: {formatPrice(order.product_price || amount / quantity).toFixed(2)} Birr each
                      </p>
                    </div>
                    <div className="font-medium text-foreground">
                      {amount.toFixed(2)} Birr
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Shipping Address:</span><br/>
                    {address || 'Address not provided'}
                  </div>
                  
                  {/* {status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-6 py-2 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full font-medium transition-colors"
                    >
                      Cancel Order
                    </button>
                  )} */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}