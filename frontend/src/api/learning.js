import api from './client';

export const catalog = (bookId) => api.get('/learning/catalog', { params: bookId ? { bookId } : {} }).then((r) => r.data);
export const purchased = () => api.get('/learning/purchased').then((r) => r.data);
export const purchase = (contentId, paymentMethod = 'ONLINE') =>
  api.post(`/learning/${contentId}/purchase`, null, { params: { paymentMethod } }).then((r) => r.data);
