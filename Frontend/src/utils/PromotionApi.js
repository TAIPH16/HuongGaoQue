import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ================= Customer =================
// Lấy danh sách khuyến mãi
export const getPromotions = async () => {
  return axios.get(`${API_URL}/promotions`).then(res => res.data);
};

// Lấy chi tiết khuyến mãi
export const getPromotionDetail = async (id) => {
  return axios.get(`${API_URL}/promotions/${id}`).then(res => res.data);
};

// ================= Admin =================
// Thêm khuyến mãi mới
export const createPromotion = async (promotionData, token) => {
  return axios.post(`${API_URL}/promotions`, promotionData, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// Cập nhật khuyến mãi
export const updatePromotion = async (id, promotionData, token) => {
  return axios.put(`${API_URL}/promotions/${id}`, promotionData, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// Xóa khuyến mãi
export const deletePromotion = async (id, token) => {
  return axios.delete(`${API_URL}/promotions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ================= Export =================
export const promotionAPI = {
  list: getPromotions,
  detail: getPromotionDetail,
  create: createPromotion,
  update: updatePromotion,
  delete: deletePromotion,
};