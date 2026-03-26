import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import { ArrowRight, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state, or default to '/'
  const from = (location.state as any)?.from?.pathname || '/';
  
  console.log('Login page - Redirect to:', from);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Attempting login with username:', username);
      const response = await apiClient.post('users/login/', { 
        username, 
        password 
      });
      
      console.log('Login response:', response.data);
      
      // Check what token format your backend returns
      let token = null;
      
      if (response.data.token) {
        token = response.data.token;
        console.log('Token found in response:', token.substring(0, 20) + '...');
      } else if (response.data.access) {
        token = response.data.access;
      } else if (response.data.key) {
        token = response.data.key;
      } else {
        console.error('No token found in response');
        toast.error('Invalid server response');
        setIsLoading(false);
        return;
      }
      
      // Store user data
      let userData = response.data.user;
      if (!userData) {
        userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          full_name: response.data.full_name || username,
          phone_number: response.data.phone_number || '',
          is_staff: response.data.is_staff || false
        };
      }
      
      // Store token and user
      login(userData, token);
      toast.success('Successfully logged in!');
      
      // Wait for token to be set
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('Token stored in localStorage:', storedToken ? 'Yes' : 'No');
      
      if (storedToken) {
        // Fetch cart after login
        console.log('Fetching cart after login...');
        const { useCartStore } = await import('../store/useCartStore');
        await useCartStore.getState().fetchCart();
        console.log('Cart fetched successfully');
        
        // Navigate to the page they were trying to access
        console.log('Navigating to:', from);
        navigate(from, { replace: true });
      } else {
        console.error('Token was not stored properly');
        toast.error('Login succeeded but token not stored');
        navigate('/');
      }
      
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl border border-border/50 shadow-xl">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign in to your Melake Mihiret account
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Demo: testuser / testpass123
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-full font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}