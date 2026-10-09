import api from '../lib/api';

export const courseApi = {
  list: ({ search, category } = {}) =>
    api
      .get('/courses', { params: { search: search || undefined, category: category || undefined } })
      .then((res) => res.data.data),
  categories: () => api.get('/courses/categories').then((res) => res.data.data),
  detail: (id) => api.get(`/courses/${id}`).then((res) => res.data.data),
};
