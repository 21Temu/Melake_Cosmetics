import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://melakeshop.onrender.com/api/';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage
    const token = localStorage.getItem('token');
    
    console.log('=== API Request Debug ===');
    console.log('URL:', config.method?.toUpperCase(), config.url);
    console.log('Token found in localStorage:', token ? 'Yes' : 'No');
    
    if (token) {
      console.log('Token value:', token.substring(0, 20) + '...');
      // For Django REST Framework Token Authentication
      // The format MUST be: "Token <token>"
      config.headers.Authorization = `Token ${token}`;
      console.log('Authorization header set:', `Token ${token.substring(0, 20)}...`);
    } else {
      console.log('No token found in localStorage');
    }
    
    console.log('Final headers:', JSON.stringify(config.headers, null, 2));
    console.log('========================');
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('=== API Response ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config.url);
    console.log('===================');
    return response;
  },
  async (error) => {
    console.error('=== API Error ===');
    console.error('Status:', error.response?.status);
    console.error('URL:', error.response?.config?.url);
    console.error('Response data:', error.response?.data);
    console.error('Request headers:', error.response?.config?.headers);
    console.error('================');
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication failed. Clearing token...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
