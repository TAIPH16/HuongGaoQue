import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance for profile API
const profileApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to header
profileApi.interceptors.request.use(
  (config) => {
    // Try customer token first, then admin token
    const customerToken = localStorage.getItem('customer_token');
    const adminToken = localStorage.getItem('token');
    const token = customerToken || adminToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Profile API
export const profileAPI = {
  // Update customer profile
  updateCustomer: (formData) => {
    return profileApi.put('/profile/customer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Update admin profile
  updateAdmin: (formData) => {
    return profileApi.put('/profile/admin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default profileApi;

