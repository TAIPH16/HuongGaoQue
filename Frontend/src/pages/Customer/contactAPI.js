import axios from "axios";

const BASE_URL = "http://localhost:3000/api/contacts";

const contactAPI = {
  // Submit liên hệ từ khách hàng
  submit: (data) => axios.post(`${BASE_URL}/submit`, data),

  // Lấy tất cả contacts với search + filter
  getAll: (params) => axios.get(BASE_URL, { params }),

  // Update contact (mark replied)
  update: (id, data) => axios.put(`${BASE_URL}/${id}`, data),

  // Delete contact
  delete: (id) => axios.delete(`${BASE_URL}/${id}`),
};

export default contactAPI;