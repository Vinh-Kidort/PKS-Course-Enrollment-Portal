import axios from 'axios';
import { ApiError } from './apiError';

const TOKEN_KEY = 'pks_token';
let memoryToken = null; // dự phòng khi localStorage bị chặn

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY) ?? memoryToken;
    } catch {
      return memoryToken;
    }
  },
  set(token) {
    memoryToken = token;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* bỏ qua: vẫn dùng được bản trong bộ nhớ */
    }
  },
  clear() {
    memoryToken = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* bỏ qua */
    }
  },
};

// AuthProvider đăng ký hàm này để xử lý khi token hết hạn / không hợp lệ
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // Render gói miễn phí cần ~1 phút để khởi động lại, nên không đặt timeout quá ngắn
  timeout: 60_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let apiError;
    if (error.response) {
      const { status, data } = error.response;
      apiError = new ApiError({
        status,
        code: data?.code,
        message: data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại',
        errors: data?.errors,
      });
    } else {
      apiError = new ApiError({
        status: 0,
        code: 'NETWORK_ERROR',
        message:
          'Không kết nối được máy chủ. Máy chủ có thể đang khởi động (mất khoảng 1 phút), vui lòng thử lại sau ít phút.',
      });
    }

    // 401 do token hỏng/hết hạn (không phải sai mật khẩu khi đăng nhập)
    if (apiError.status === 401 && apiError.code !== 'INVALID_CREDENTIALS' && tokenStorage.get()) {
      unauthorizedHandler?.(apiError);
    }
    return Promise.reject(apiError);
  },
);

export default api;
