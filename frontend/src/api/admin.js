import api, { cleanParams } from './client';

export const getDashboard = () => api.get('/admin/dashboard').then((r) => r.data);

// books
export const createBook = (payload) => api.post('/admin/books', payload).then((r) => r.data);
export const updateBook = (id, payload) => api.put(`/admin/books/${id}`, payload).then((r) => r.data);
export const updateStock = (id, stock) => api.patch(`/admin/books/${id}/stock`, { stock }).then((r) => r.data);
export const deleteBook = (id) => api.delete(`/admin/books/${id}`).then((r) => r.data);

// categories
export const createCategory = (payload) => api.post('/admin/categories', payload).then((r) => r.data);
export const updateCategory = (id, payload) => api.put(`/admin/categories/${id}`, payload).then((r) => r.data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data);

// users
export const listUsers = (params) => api.get('/admin/users', { params: cleanParams(params) }).then((r) => r.data);
export const setUserEnabled = (id, enabled) => api.patch(`/admin/users/${id}/status`, { enabled }).then((r) => r.data);

// orders
export const listOrders = (params) => api.get('/admin/orders', { params: cleanParams(params) }).then((r) => r.data);
export const getOrder = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

// learning content
export const listLearningContent = () => api.get('/admin/learning').then((r) => r.data);
export const createLearningContent = (payload) => api.post('/admin/learning', payload).then((r) => r.data);
export const updateLearningContent = (id, payload) => api.put(`/admin/learning/${id}`, payload).then((r) => r.data);
export const deleteLearningContent = (id) => api.delete(`/admin/learning/${id}`);
