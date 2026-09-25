import api from './client';

export const checkout = (payload) => api.post('/orders/checkout', payload).then((r) => r.data);
export const listMyOrders = (page = 0, size = 10) => api.get('/orders', { params: { page, size } }).then((r) => r.data);
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`).then((r) => r.data);
