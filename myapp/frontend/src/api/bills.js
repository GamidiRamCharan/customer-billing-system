import api from './axiosInstance';

export const fetchBills = (page = 1, limit = 20) =>
  api.get('/bills', { params: { page, limit } });

export const fetchBill = (id) => api.get(`/bills/${id}`);

export const createBill = (data) => api.post('/bills', data);

export const updateBill = (id, data) => api.put(`/bills/${id}`, data);

export const deleteBill = (id) => api.delete(`/bills/${id}`);
