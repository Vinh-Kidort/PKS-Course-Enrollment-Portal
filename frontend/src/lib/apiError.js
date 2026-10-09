// Mọi lỗi từ API đều được chuyển thành ApiError để UI xử lý thống nhất
export class ApiError extends Error {
  constructor({ status = 0, code = 'UNKNOWN', message, errors = [] }) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = không kết nối được máy chủ
    this.code = code; // ví dụ: COURSE_FULL, ALREADY_ENROLLED
    this.errors = errors; // [{ field, message }] khi lỗi validation
  }
}

// [{ field: 'email', message: '...' }] -> { email: '...' }
export const getFieldErrors = (error) =>
  Object.fromEntries((error?.errors ?? []).map((e) => [e.field, e.message]));
