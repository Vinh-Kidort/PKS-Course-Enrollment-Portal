import api from '../lib/api';

export const adminApi = {
  listCourses: () => api.get('/admin/courses').then((res) => res.data.data),
  createCourse: (data) => api.post('/admin/courses', data).then((res) => res.data.data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data).then((res) => res.data.data),
  setVisibility: (id, isHidden) =>
    api.patch(`/admin/courses/${id}/visibility`, { isHidden }).then((res) => res.data.data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`).then((res) => res.data.data),
  courseEnrollments: (id) =>
    api.get(`/admin/courses/${id}/enrollments`).then((res) => res.data.data), // { course, total, enrollments }
};
