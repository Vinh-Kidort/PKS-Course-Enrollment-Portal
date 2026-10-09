import api from '../lib/api';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((res) => res.data.data),
  login: (data) => api.post('/auth/login', data).then((res) => res.data.data), // { token, user }
  me: () => api.get('/auth/me').then((res) => res.data.data),
};
