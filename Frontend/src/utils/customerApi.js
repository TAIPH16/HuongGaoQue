import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Customer API client - sử dụng customer_token
const customerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm customer_token vào header
customerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Customer Orders API
export const customerOrdersAPI = {
  create: (data) => customerApi.post('/customer/orders', data),
  getAll: (params) => customerApi.get('/customer/orders', { params }),
  getById: (id) => customerApi.get(`/customer/orders/${id}`),
};

// Customer Wishlist API
export const customerWishlistAPI = {
  add: (productId, note) => customerApi.post('/wishlist', { product_id: productId, note }),
  getAll: (params) => customerApi.get('/wishlist', { params }),
  remove: (id) => customerApi.delete(`/wishlist/delete/${id}`),
  clear: (groupId) => customerApi.delete('/wishlist/clear', { params: { group_id: groupId } }),
};

// VNPay API
export const vnpayAPI = {
  createPaymentUrl: (data) => customerApi.post('/vnpay/create-payment-url', data),
  checkStatus: (orderId) => customerApi.get(`/vnpay/check-status/${orderId}`),
};

export default customerApi;

