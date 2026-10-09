const { Prisma } = require('@prisma/client');
const { AppError, ConflictError, NotFoundError } = require('../lib/errors');

function normalize(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'Body JSON không hợp lệ', { code: 'INVALID_JSON' });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return new ConflictError('Dữ liệu đã tồn tại', 'DUPLICATE');
    if (err.code === 'P2025') return new NotFoundError('Không tìm thấy dữ liệu');
    if (err.code === 'P2003' || err.code === 'P2014') {
      return new ConflictError('Dữ liệu đang được tham chiếu', 'IN_USE');
    }
  }
  return null; // lỗi không lường trước
}

exports.notFound = (req, res, next) =>
  next(new NotFoundError(`Không tìm thấy đường dẫn ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  const known = normalize(err);
  if (!known) console.error(err); // chỉ log lỗi lạ, không lộ chi tiết ra client

  res.status(known?.statusCode ?? 500).json({
    success: false,
    code: known?.code ?? 'INTERNAL_ERROR',
    message: known ? known.message : 'Lỗi hệ thống, vui lòng thử lại sau',
    errors: known?.errors ?? [],
  });
};