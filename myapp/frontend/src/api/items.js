import api from './axiosInstance';

export const fetchItems = (page = 1, limit = 20) =>
  api.get('/items', { params: { page, limit } });

export const fetchItem = (id) => api.get(`/items/${id}`);

export const createItem = (data) => api.post('/items', data);

export const updateItem = (id, data) => api.put(`/items/${id}`, data);

export const deleteItem = (id) => api.delete(`/items/${id}`);
