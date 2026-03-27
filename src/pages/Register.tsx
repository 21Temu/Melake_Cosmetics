import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { toast } from 'sonner';
import { ArrowRight, Mail, Lock, User, Phone } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '', // ADD CONFIRM PASSWORD FIELD
    full_name: '',
    phone_number: '+251', // Ethiopian code pre-filled
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number to ensure +251 stays at beginning
    if (name === 'phone_number') {
      let phoneValue = value;
      // If user deletes everything, restore +251
      if (!phoneValue || phoneValue === '') {
        phoneValue = '+251';
      }
      // If user types, ensure +251 is always at start
      else if (!phoneValue.startsWith('+251')) {
        // If user starts typing numbers without +251, add it
        if (phoneValue.match(/^[0-9]+$/)) {
          phoneValue = '+251' + phoneValue;
        }
        // If user types something else, keep +251
        else if (!phoneValue.includes('+251')) {
          phoneValue = '+251';
        }
      }
      setFormData(prev => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle phone number focus to ensure cursor goes to end
  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    // Move cursor to end of input
    setTimeout(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate password match
      if (formData.password !== formData.confirm_password) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Validate password length
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        setIsLoading(false);
        return;
      }

      // Validate phone number format
      const phoneRegex = /^\+251[0-9]{9}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        toast.error('Phone number must be in format: +251XXXXXXXXX (9 digits after +251)');
        setIsLoading(false);
        return;
      }

      const registerData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim()
      };
      
      console.log('Registering with:', registerData);
      
      const response = await apiClient.post('users/register/', registerData);
      
      console.log('Registration response:', response.data);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
      
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      
      // Handle different error responses
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Check for specific field errors
        if (errors.username) {
          toast.error(`Username: ${errors.username}`);
        } else if (errors.email) {
          toast.error(`Email: ${errors.email}`);
        } else if (errors.phone_number) {
          toast.error(`Phone: ${errors.phone_number}`);
        } else if (errors.password) {
          toast.error(`Password: ${errors.password}`);
        } else if (errors.detail) {
          toast.error(errors.detail);
        } else if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error('Registration failed. Please check your information.');
        }
      } else {
        toast.error('Failed to connect to server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-3xl border border-border/50 shadow-xl">
        <div className="text-center">
          <h2 className="mt-6 text-center font-serif text-4xl font-bold text-foreground">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Join Melake Mihiret Cosmetics today
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Username Field */}
            <div className="relative">
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-10 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:z-10 sm:text-sm transition-all bg-background"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Full Name Field */}
            <div className="relative">
              <label htmlFor="full_name" className="sr-only">Full Name</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-10 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:z-10 sm:text-sm transition-all bg-background"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Email Field */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-10 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:z-10 sm:text-sm transition-all bg-background"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Phone Number Field with Ethiopian Code */}
            <div className="relative">
              <label htmlFor="phone_number" className="sr-only">Phone Number</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                onFocus={handlePhoneFocus}
                className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-10 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:z-10 sm:text-sm transition-all bg-background"
                placeholder="+251 912 345 678"
                value={formData.phone_number}
                onChange={handleInputChange}
              />
            </div>
            <p className="text-xs text-muted-foreground -mt-2 ml-2">
                   e.g., +251912345678
            </p>
            
            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-10 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:z-10 sm:text-sm transition-all bg-background"
                placeholder="Password "
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Confirm Password Field - ADD THIS */}
            <div className="relative">
              <label htmlFor="confirm_password" className="sr-only">Confirm Password</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-10 border border-border placeholder-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:z-10 sm:text-sm transition-all bg-background"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-full text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  Create Account
                  <span className="absolute right-4 inset-y-0 flex items-center pl-3">
                    <ArrowRight className="h-5 w-5 text-primary-foreground/70 group-hover:text-primary-foreground transition-colors" aria-hidden="true" />
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}