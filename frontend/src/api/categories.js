import api from './client';

export const listCategories = () => api.get('/categories').then((r) => r.data);
