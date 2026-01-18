import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance for seller
const sellerApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add seller token
sellerApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('sellerToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
sellerApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('sellerToken');
            localStorage.removeItem('seller');
            window.location.href = '/seller/login';
        }
        return Promise.reject(error);
    }
);

// Seller Products API
export const sellerProductsAPI = {
    getAll: (params) => sellerApi.get('/seller/products', { params }),
    getById: (id) => sellerApi.get(`/seller/products/${id}`),
    create: (formData) => sellerApi.post('/seller/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, formData) => sellerApi.put(`/seller/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => sellerApi.delete(`/seller/products/${id}`),
    updateStock: (id, stock) => sellerApi.patch(`/seller/products/${id}/stock`, { stock }),
};

// Seller Orders API
export const sellerOrdersAPI = {
    getAll: (params) => sellerApi.get('/seller/orders', { params }),
    getById: (id) => sellerApi.get(`/seller/orders/${id}`),
    getDashboard: () => sellerApi.get('/seller/orders/dashboard'),
};

// Seller Profile API
export const sellerProfileAPI = {
    get: () => sellerApi.get('/seller/auth/profile'),
    update: (formData) => sellerApi.put('/seller/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Seller Stock API
export const sellerStockAPI = {
    getAll: (params) => sellerApi.get('/seller/stock', { params }),
    getById: (id) => sellerApi.get(`/seller/stock/${id}`),
    getHistory: (id) => sellerApi.get(`/seller/stock/${id}/history`),
    update: (id, data) => sellerApi.patch(`/seller/stock/${id}`, data),
    addStock: (id, quantity) => sellerApi.post(`/seller/stock/${id}/add`, { quantity }),
};

export default sellerApi;
