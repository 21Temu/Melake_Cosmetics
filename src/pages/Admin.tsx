import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, Building2, TrendingUp } from 'lucide-react';
import { apiClient } from '../api/client';
import { Order, Product, User } from '../types';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });

  useEffect(() => {
    // Mock fetching stats
    setStats({
      totalOrders: 156,
      totalRevenue: 12450.00,
      totalProducts: 48,
      totalUsers: 320
    });
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-4xl font-bold text-foreground mb-12">Admin Dashboard</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 sticky top-24">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-primary text-primary-foreground font-medium shadow-md' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <TrendingUp size={20} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-primary text-primary-foreground font-medium shadow-md' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <ShoppingBag size={20} />
                Orders
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === 'products' 
                    ? 'bg-primary text-primary-foreground font-medium shadow-md' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Package size={20} />
                Products
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Users size={20} />
                Users
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Building2 size={20} />
                Banks
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <h2 className="font-serif text-2xl font-bold text-foreground">Overview</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <TrendingUp size={32} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                  <p className="font-serif text-3xl font-bold text-foreground">$\{(stats.totalRevenue).toLocaleString()}</p>
                </div>
                
                <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                  <p className="font-serif text-3xl font-bold text-foreground">{stats.totalOrders}</p>
                </div>
                
                <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Products</p>
                  <p className="font-serif text-3xl font-bold text-foreground">{stats.totalProducts}</p>
                </div>
                
                <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Users size={32} />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Users</p>
                  <p className="font-serif text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl font-bold text-foreground">Manage Orders</h2>
              </div>
              <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-8 text-center text-muted-foreground">
                  Order management interface coming soon.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-2xl font-bold text-foreground">Manage Products</h2>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
                  Add Product
                </button>
              </div>
              <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-8 text-center text-muted-foreground">
                  Product management interface coming soon.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
