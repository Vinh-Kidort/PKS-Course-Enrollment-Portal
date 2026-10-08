const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const asyncHandler = require('../lib/asyncHandler');
const { UnauthorizedError, ForbiddenError } = require('../lib/errors');

// Trả user nếu có token hợp lệ, null nếu không gửi token, ném lỗi nếu token sai/hết hạn
async function resolveUser(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Token không hợp lệ', 'INVALID_TOKEN');
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw new UnauthorizedError('Tài khoản không còn tồn tại', 'INVALID_TOKEN');
  return user;
}

exports.authenticate = asyncHandler(async (req, res, next) => {
  const user = await resolveUser(req);
  if (!user) throw new UnauthorizedError();
  req.user = user;
  next();
});

// Dùng cho route public nhưng muốn biết người xem là ai (nếu có)
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    req.user = (await resolveUser(req)) || undefined;
  } catch (err) {
    if (!(err instanceof UnauthorizedError)) throw err; // token xấu thì coi như khách
  }
  next();
});

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (!roles.includes(req.user.role)) return next(new ForbiddenError());
  next();
};