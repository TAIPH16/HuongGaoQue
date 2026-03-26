import axios from "axios";

// Đảm bảo dùng port 3001 đồng bộ với backend hiện tại của bạn
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Thêm token admin vào header cho mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getRevenueStats: (params) => api.get("/products/stats/revenue", { params }), // Route Dashboard
  approve: (id) => api.put(`/products/${id}/approve`),
  reject: (id) => api.put(`/products/${id}/reject`),
};

export const ordersAPI = {
  getStatsByDate: (params) => api.get("/orders/stats/by-date", { params }), // Route Dashboard
  getStats: () => api.get("/orders/stats"),
};

export const notificationsAPI = {
  getAll: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read`),
};

export const postsAPI = {
  getAll: (params) => api.get("/posts", { params }),
  getViewsByDate: (params) => api.get("/posts/stats/views-by-date", { params }),
};

export const postCategoriesAPI = {
  getAll: (params) => api.get("/post-categories", { params }),
};

export const customersAPI = {
  getAll: (params) => api.get("/customers", { params }),
  getStats: () => api.get("/customers/stats/summary"),
};

export const sellersAPI = {
  getAll: (params) => api.get("/sellers", { params }),
  getStats: () => api.get("/sellers/stats/summary"),
};

export const reviewsAPI = {
  getAll: (params) => api.get("/reviews", { params }),
};

export const categoriesAPI = {
  getAll: (params) => api.get("/categories", { params }),
};

export default api;
