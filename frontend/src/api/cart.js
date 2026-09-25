import api from './client';

export const getCart = () => api.get('/cart').then((r) => r.data);
export const addItem = (payload) => api.post('/cart/items', payload).then((r) => r.data);
export const updateItem = (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }).then((r) => r.data);
export const removeItem = (itemId) => api.delete(`/cart/items/${itemId}`).then((r) => r.data);
export const clearCart = () => api.delete('/cart').then((r) => r.data);
