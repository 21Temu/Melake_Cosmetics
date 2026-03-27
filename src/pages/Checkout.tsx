import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { apiClient } from '../api/client';
import { Bank } from '../types';
import { toast } from 'sonner';
import { CreditCard, Building2, CheckCircle2, UploadCloud } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuthStore();
  const { items, total, clearCart, fetchCart } = useCartStore();
  const navigate = useNavigate();

  const [banks, setBanks] = useState<Bank[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'OFFLINE' | 'ONLINE'>('OFFLINE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.username || '',
    phone: user?.phone_number || user?.phone || '',
    shippingAddress: '',
    bankId: '',
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  // Fetch user profile to get saved address
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && user?.id) {
          // Fetch the UserProfile directly using the correct endpoint
          // First try to get user profile by user ID
          const response = await apiClient.get(`user-profiles/?user=${user.id}`);
          console.log('User profile response:', response.data);
          
          let profileData = null;
          if (response.data.results) {
            profileData = response.data.results[0];
          } else if (Array.isArray(response.data)) {
            profileData = response.data[0];
          } else if (response.data) {
            profileData = response.data;
          }
          
          if (profileData) {
            setUserProfile(profileData);
            // Auto-fill address if exists
            if (profileData.address) {
              setFormData(prev => ({
                ...prev,
                shippingAddress: profileData.address
              }));
            }
            // Auto-fill name and phone
            if (profileData.full_name) {
              setFormData(prev => ({
                ...prev,
                fullName: profileData.full_name
              }));
            }
            if (profileData.phone_number) {
              setFormData(prev => ({
                ...prev,
                phone: profileData.phone_number
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }

    const fetchBanks = async () => {
      try {
        const res = await apiClient.get('banks/');
        console.log('Banks response:', res.data);
        
        let banksData = [];
        if (res.data.results) {
          banksData = res.data.results;
        } else if (Array.isArray(res.data)) {
          banksData = res.data;
        }
        
        const mappedBanks = banksData.map((bank: any) => ({
          id: bank.id,
          bank_name: bank.bank_name,
          account_number: bank.account_number,
          account_name: bank.account_name || 'Melake Mihiret'
        }));
        
        setBanks(mappedBanks);
      } catch (error) {
        console.error('Error fetching banks:', error);
        setBanks([
          { id: 1, bank_name: 'Commercial Bank of Ethiopia', account_name: 'Melake Mihiret', account_number: '1000123456789' },
          { id: 2, bank_name: 'Dashen Bank', account_name: 'Melake Mihiret', account_number: '0012345678901' },
          { id: 3, bank_name: 'Awash Bank', account_name: 'Melake Mihiret', account_number: '01320123456700' },
        ]);
      }
    };

    fetchBanks();
  }, [items, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'ONLINE') {
      toast.info('Online payment coming soon');
      return;
    }

    if (!formData.shippingAddress) {
      toast.error('Shipping address is required');
      return;
    }

    if (!formData.bankId) {
      toast.error('Please select a bank');
      return;
    }

    if (!paymentProof) {
      toast.error('Please upload payment proof');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting order with items:', items);
      console.log('User data:', user);
      
      // Create orders and payments for each cart item
      const results = [];
      
      for (const item of items) {
        const productId = item.product.product_id || item.product.id;
        const amount = item.product.price * item.quantity;
        const productName = item.product.name;
        
        // Step 1: Create Payment record first
        const paymentFormData = new FormData();
        paymentFormData.append('user', user?.id.toString());
        paymentFormData.append('product', productId.toString());
        paymentFormData.append('product_name', productName);
        paymentFormData.append('name', formData.fullName);
        paymentFormData.append('amount', amount.toString());
        paymentFormData.append('quantity', item.quantity.toString());
        paymentFormData.append('address', formData.shippingAddress);
        paymentFormData.append('phone_number', formData.phone);
        
        if (paymentProof) {
          paymentFormData.append('payment_image', paymentProof);
        }
        
        console.log('Creating payment record for product:', productName);
        const paymentResponse = await apiClient.post('payments/', paymentFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const payment = paymentResponse.data;
        console.log('Payment created:', payment);
        
        // Step 2: Create Order record linked to the payment
        const orderFormData = new FormData();
        orderFormData.append('product', productId.toString());
        orderFormData.append('user', user?.id.toString());
        orderFormData.append('product_name', productName);
        orderFormData.append('name', formData.fullName);
        orderFormData.append('amount', amount.toString());
        orderFormData.append('quantity', item.quantity.toString());
        orderFormData.append('address', formData.shippingAddress);
        orderFormData.append('phone_number', formData.phone);
        orderFormData.append('payment', payment.payment_id.toString());
        
        if (paymentProof) {
          orderFormData.append('payment_image', paymentProof);
        }
        
        console.log('Creating order record for product:', productName);
        const orderResponse = await apiClient.post('orders/', orderFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        results.push(orderResponse.data);
        console.log('Order created:', orderResponse.data);
      }
      
      toast.success('Order placed successfully!');
      clearCart();
      await fetchCart();
      navigate('/orders');
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      console.error('Error response data:', error.response?.data);
      
      // Show detailed error message
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          Object.keys(errors).forEach(key => {
            toast.error(`${key}: ${errors[key]}`);
          });
        } else {
          toast.error(errors.message || 'Failed to place order');
        }
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (product: any): string => {
    const img = product.product_image || product.image;
    if (img) {
      if (img.startsWith('http')) {
        return img;
      }
      return `http://localhost:8000${img}`;
    }
    return `https://picsum.photos/seed/${product.id || product.product_id}/100/100`;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-foreground mb-12">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setPaymentMethod('OFFLINE')}
                className={`flex-1 py-6 px-4 flex items-center justify-center gap-3 font-medium text-lg transition-colors ${
                  paymentMethod === 'OFFLINE' 
                    ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Building2 size={24} />
                Offline Payment
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`flex-1 py-6 px-4 flex items-center justify-center gap-3 font-medium text-lg transition-colors ${
                  paymentMethod === 'ONLINE' 
                    ? 'bg-primary/5 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <CreditCard size={24} />
                Online Payment
              </button>
            </div>

            <div className="p-8">
              {paymentMethod === 'OFFLINE' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="font-serif text-2xl font-semibold text-foreground">Shipping Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="shippingAddress" className="text-sm font-medium text-foreground">Shipping Address</label>
                      <textarea
                        id="shippingAddress"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                        placeholder="Enter your full delivery address..."
                      />
                      {userProfile?.address && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ✓ Using saved address: {userProfile.address.substring(0, 100)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-border">
                    <h3 className="font-serif text-2xl font-semibold text-foreground">Payment Details</h3>
                    
                    <div className="space-y-4">
                      <label className="text-sm font-medium text-foreground">Select Bank to Transfer To</label>
                      <div className="grid grid-cols-1 gap-4">
                        {banks.map((bank) => (
                          <label 
                            key={bank.id} 
                            className={`relative flex cursor-pointer rounded-2xl border p-4 focus:outline-none transition-all ${
                              formData.bankId === bank.id.toString() 
                                ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                                : 'border-border bg-card hover:bg-muted/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="bankId"
                              value={bank.id}
                              checked={formData.bankId === bank.id.toString()}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div className="flex w-full items-center justify-between">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <p className="font-medium text-foreground">{bank.bank_name}</p>
                                  <div className="text-muted-foreground mt-1">
                                    <p>Account Name: <span className="font-medium text-foreground">{bank.account_name}</span></p>
                                    <p>Account Number: <span className="font-medium text-foreground font-mono">{bank.account_number}</span></p>
                                  </div>
                                </div>
                              </div>
                              {formData.bankId === bank.id.toString() && (
                                <CheckCircle2 className="h-6 w-6 text-primary" />
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Upload Payment Proof (Receipt/Screenshot)</label>
                      <div className="mt-2 flex justify-center rounded-2xl border border-dashed border-border px-6 py-10 hover:bg-muted/30 transition-colors">
                        <div className="text-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
                            <label
                              htmlFor="paymentProof"
                              className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                            >
                              <span>Upload a file</span>
                              <input 
                                id="paymentProof" 
                                name="paymentProof" 
                                type="file" 
                                accept="image/*" 
                                className="sr-only" 
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB</p>
                          {paymentProof && (
                            <p className="mt-4 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 py-2 px-4 rounded-full inline-block">
                              Selected: {paymentProof.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 px-8 rounded-full font-medium text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                    ) : (
                      `Place Order (${total.toFixed(2)} Birr)`
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-24 text-center flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                    <CreditCard size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-foreground mb-4">Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-lg">
                    We are currently working on integrating secure online payment gateways. 
                    For now, please use our Offline Payment method to complete your purchase.
                  </p>
                  <button
                    onClick={() => setPaymentMethod('OFFLINE')}
                    className="mt-8 px-8 py-3 bg-muted text-foreground rounded-full hover:bg-muted/80 font-medium transition-colors"
                  >
                    Switch to Offline Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-muted/50 rounded-3xl p-8 border border-border/50 sticky top-24">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                    <img 
                      src={getImageUrl(item.product)} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/${item.product.id}/100/100`;
                      }}
                    />
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{(item.product.price * item.quantity).toFixed(2)} Birr</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-border pt-6 space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-medium">{total.toFixed(2)} Birr</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-foreground font-medium">Free</span>
              </div>
            </div>
            
            <div className="border-t border-border mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="font-serif text-xl font-bold text-foreground">Total</span>
                <span className="font-serif text-2xl font-bold text-primary">{total.toFixed(2)} Birr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}