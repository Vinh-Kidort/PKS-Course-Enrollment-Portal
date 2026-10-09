import api from '../lib/api';

export const enrollmentApi = {
  enroll: (courseId) => api.post('/enrollments', { courseId }).then((res) => res.data.data),
  mine: () => api.get('/enrollments/me').then((res) => res.data.data),
};
