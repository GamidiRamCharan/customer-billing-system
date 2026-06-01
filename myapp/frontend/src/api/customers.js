import api from './axiosInstance';

export const fetchCustomers = (page = 1, limit = 20) =>
  api.get('/customers', { params: { page, limit } });

export const fetchCustomer = (id) => api.get(`/customers/${id}`);

export const createCustomer = (data) => api.post('/customers', data);

export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);

export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
