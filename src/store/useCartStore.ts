import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { apiClient } from '../api/client';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  total: number;
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, quantity: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: number, quantity: number) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (itemId: number) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<void>;
  resetCart: () => void;  // ADD THIS NEW METHOD
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      total: 0,
      
      fetchCart: async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          set({ items: [], total: 0 });
          return;
        }
        
        set({ isLoading: true });
        try {
          const response = await apiClient.get('cart/');
          
          // Handle paginated response
          let rawItems = [];
          if (response.data.results) {
            rawItems = response.data.results;
          } else if (Array.isArray(response.data)) {
            rawItems = response.data;
          }
          
          // Process each cart item - using product_details instead of product
          const items = rawItems.map((item: any) => {
            // Get product data from product_details
            const productData = item.product_details || {};
            
            // Get the correct ID
            const itemId = item.cart_id || item.id;
            
            // Parse price to number
            const price = typeof productData.price === 'string' 
              ? parseFloat(productData.price) 
              : (productData.price || 0);
            
            return {
              id: itemId,
              cart_id: itemId,
              product: {
                id: productData.product_id || productData.id,
                product_id: productData.product_id,
                name: productData.product_name || productData.name || 'Product',
                product_name: productData.product_name,
                price: price,
                description: productData.description || '',
                stock: typeof productData.stock === 'string' ? parseInt(productData.stock) : (productData.stock || 0),
                image: productData.product_image || '',
                product_image: productData.product_image || '',
                category: productData.category_name || productData.category,
                category_name: productData.category_name,
                status: productData.status,
                sold_count: productData.sold_count || 0
              },
              quantity: item.quantity,
              price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0)
            };
          });
          
          const total = items.reduce((sum: number, item: CartItem) => {
            return sum + (item.product.price * item.quantity);
          }, 0);
          
          set({ items, total, isLoading: false });
        } catch (error: any) {
          console.error('Failed to fetch cart:', error);
          set({ isLoading: false });
        }
      },
      
      addToCart: async (product: Product, quantity: number) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          return { success: false, message: 'Please login to add items to cart' };
        }
        
        try {
          const productId = product.product_id || product.id;
          const requestData = { 
            product_id: productId,
            quantity: quantity 
          };
          
          await apiClient.post('cart/', requestData);
          await get().fetchCart();
          
          return { success: true, message: 'Added to cart successfully' };
        } catch (error: any) {
          console.error('Failed to add to cart:', error);
          
          let errorMessage = 'Failed to add to cart';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          }
          
          return { success: false, message: errorMessage };
        }
      },
      
      updateQuantity: async (itemId: number, quantity: number) => {
        try {
          await apiClient.patch(`cart/${itemId}/`, { quantity });
          await get().fetchCart();
          return { success: true, message: 'Quantity updated' };
        } catch (error: any) {
          console.error('Failed to update quantity:', error);
          return { success: false, message: 'Failed to update quantity' };
        }
      },
      
      removeFromCart: async (itemId: number) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          return { success: false, message: 'Not authenticated' };
        }
        
        if (!itemId) {
          return { success: false, message: 'Invalid item ID' };
        }
        
        try {
          await apiClient.delete(`cart/${itemId}/`);
          
          const currentItems = get().items;
          const updatedItems = currentItems.filter(item => item.id !== itemId);
          const updatedTotal = updatedItems.reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
          }, 0);
          
          set({ items: updatedItems, total: updatedTotal });
          
          return { success: true, message: 'Item removed successfully' };
        } catch (error: any) {
          console.error('Failed to remove from cart:', error);
          await get().fetchCart();
          return { success: false, message: error.response?.data?.message || 'Failed to remove item' };
        }
      },
      
      clearCart: async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          set({ items: [], total: 0 });
          return;
        }
        
        try {
          const currentItems = get().items;
          
          for (const item of currentItems) {
            await apiClient.delete(`cart/${item.id}/`);
          }
          
          set({ items: [], total: 0 });
        } catch (error: any) {
          console.error('Failed to clear cart:', error);
          await get().fetchCart();
        }
      },
      
      // ADD THIS NEW METHOD - Resets cart without API calls (for logout)
      resetCart: () => {
        set({ items: [], total: 0 });
        // Remove cart from localStorage
        localStorage.removeItem('cart-storage');
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);