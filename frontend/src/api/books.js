import api, { cleanParams } from './client';

export const listBooks = (params) => api.get('/books', { params: cleanParams(params) }).then((r) => r.data);
export const getBook = (id) => api.get(`/books/${id}`).then((r) => r.data);
