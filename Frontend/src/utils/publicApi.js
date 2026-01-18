import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Public API client - không cần authentication
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public Products API - for customer viewing
export const publicProductsAPI = {
  getAll: (params) => publicApi.get('/public/products', { params }),
  getById: (id) => publicApi.get(`/public/products/${id}`),
};

// Public Posts API
export const publicPostsAPI = {
  getAll: (params) => publicApi.get('/public/posts', { params }),
  getById: (id) => publicApi.get(`/public/posts/${id}`),
};

// Public Reviews API
export const publicReviewsAPI = {
  getAll: (params) => publicApi.get('/public/reviews', { params }),
  getById: (id) => publicApi.get(`/public/reviews/${id}`),
};

// Public Categories API
export const publicCategoriesAPI = {
  getAll: (params) => publicApi.get('/public/categories', { params }),
  getById: (id) => publicApi.get(`/public/categories/${id}`),
};

export default publicApi;

