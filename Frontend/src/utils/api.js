import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    const authApi = axios.create({
      baseURL: API_BASE_URL.replace('/api', ''),
      headers: { 'Content-Type': 'application/json' },
    });
    return authApi.post('/api/auth/login', credentials);
  },
  requestPasswordOtp: (email) => {
    const authApi = axios.create({
      baseURL: API_BASE_URL.replace('/api', ''),
      headers: { 'Content-Type': 'application/json' },
    });
    return authApi.post('/api/auth/forgot-password/request-otp', { email });
  },
  verifyPasswordOtp: (email, otp) => {
    const authApi = axios.create({
      baseURL: API_BASE_URL.replace('/api', ''),
      headers: { 'Content-Type': 'application/json' },
    });
    return authApi.post('/api/auth/forgot-password/verify-otp', { email, otp });
  },
  resetPasswordWithOtp: (payload) => {
    const authApi = axios.create({
      baseURL: API_BASE_URL.replace('/api', ''),
      headers: { 'Content-Type': 'application/json' },
    });
    return authApi.post('/api/auth/forgot-password/reset-with-otp', payload);
  },
  forgotPassword: (email) => {
    const authApi = axios.create({
      baseURL: API_BASE_URL.replace('/api', ''),
      headers: { 'Content-Type': 'application/json' },
    });
    return authApi.post('/api/auth/forgot-password', { email });
  },
  resetPassword: (payload) => {
    const authApi = axios.create({
      baseURL: API_BASE_URL.replace('/api', ''),
      headers: { 'Content-Type': 'application/json' },
    });
    return authApi.post('/api/auth/reset-password', payload);
  },
  logout: () => {
    const token = localStorage.getItem('token');
    const authApi = axios.create({
      baseURL: API_BASE_URL.replace('/api', ''),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return authApi.post('/api/auth/logout');
  },
  getProfile: () => api.get('/auth/profile'),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/products/${id}`),
  approve: (id) => api.put(`/products/${id}/approve`),
  reject: (id) => api.put(`/products/${id}/reject`),
  getRevenueStats: (params) => api.get('/products/stats/revenue', { params }),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getStats: () => api.get('/orders/stats'),
};

// src/utils/api.js (hoặc file chứa code này)

export const customersAPI = {
  // Lấy danh sách khách hàng
  getAll: (params) => api.get('/customers', { params }),

  // Lấy chi tiết khách hàng (Sửa lỗi dùng adminApi -> api)
  getById: (id) => api.get(`/customers/${id}`),

  // Tạo mới (nếu có)
  create: (formData) => api.post('/customers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Cập nhật thông tin
  update: (id, formData) => api.put(`/customers/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Xóa cứng (nếu cần)
  delete: (id) => api.delete(`/customers/${id}`),

  // --- CÁC HÀM BAN/UNBAN (Đã sửa lại cho khớp Backend) ---

  // Cấm khách hàng (Dùng PATCH và dùng biến 'api')
  ban: (id) => api.patch(`/customers/${id}/ban`),

  // Mở khóa khách hàng
  unban: (id) => api.patch(`/customers/${id}/unban`),

  // Ẩn khách hàng
  hide: (id) => api.patch(`/customers/${id}/hide`),

  // Hiện khách hàng
  unhide: (id) => api.patch(`/customers/${id}/unhide`),

  // Thống kê (Khớp với route backend /customers/stats)
  getStats: () => api.get('/customers/stats/summary'),
};

// Sellers API
export const sellersAPI = {
  // Lấy danh sách người bán
  getAll: (params) => api.get('/sellers', { params }),

  // Lấy chi tiết người bán
  getById: (id) => api.get(`/sellers/${id}`),

  // Cập nhật thông tin
  update: (id, formData) => api.put(`/sellers/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Duyệt người bán
  approve: (id) => api.post(`/sellers/${id}/approve`),

  // Từ chối người bán
  reject: (id) => api.post(`/sellers/${id}/reject`),

  // Cấm người bán
  ban: (id) => api.patch(`/sellers/${id}/ban`),

  // Mở khóa người bán
  unban: (id) => api.patch(`/sellers/${id}/unban`),

  // Ẩn người bán
  hide: (id) => api.patch(`/sellers/${id}/hide`),

  // Hiện người bán
  unhide: (id) => api.patch(`/sellers/${id}/unhide`),

  // Thống kê
  getStats: () => api.get('/sellers/stats/summary'),
};
// Posts API
export const postsAPI = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/posts/${id}`),
  incrementView: (id) => api.post(`/posts/${id}/increment-view`),
};

// Post Categories API
export const postCategoriesAPI = {
  getAll: (params) => api.get('/post-categories', { params }),
  getById: (id) => api.get(`/post-categories/${id}`),
  create: (data) => api.post('/post-categories', data),
  update: (id, data) => api.put(`/post-categories/${id}`, data),
  delete: (id) => api.delete(`/post-categories/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (formData) => api.post('/reviews', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/reviews/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/reviews/${id}`),
  getStats: (productId) => api.get(`/reviews/stats/${productId}`),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, formData) => api.put(`/users/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};


export default api;

