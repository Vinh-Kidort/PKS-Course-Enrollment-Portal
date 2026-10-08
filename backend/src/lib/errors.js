class AppError extends Error {
  constructor(statusCode, message, { code, errors } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
  }
}

class ValidationError extends AppError {
  constructor(errors, message = 'Dữ liệu không hợp lệ') {
    super(400, message, { code: 'VALIDATION_ERROR', errors });
  }
}
class UnauthorizedError extends AppError {
  constructor(message = 'Vui lòng đăng nhập để tiếp tục', code = 'UNAUTHORIZED') {
    super(401, message, { code });
  }
}
class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này') {
    super(403, message, { code: 'FORBIDDEN' });
  }
}
class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy dữ liệu') {
    super(404, message, { code: 'NOT_FOUND' });
  }
}
class ConflictError extends AppError {
  constructor(message, code = 'CONFLICT') {
    super(409, message, { code });
  }
}

module.exports = { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError };