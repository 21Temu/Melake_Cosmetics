export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  is_staff: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  image: string;
  is_featured: boolean;
  created_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Bank {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  order_number: string;
  user: User;
  items: OrderItem[];
  total_amount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shipping_address: string;
  payment_method: 'OFFLINE' | 'ONLINE';
  bank?: Bank;
  payment_proof?: string;
  created_at: string;
}
