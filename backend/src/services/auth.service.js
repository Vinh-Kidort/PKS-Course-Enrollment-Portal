const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const env = require('../config/env');
const { ConflictError, UnauthorizedError } = require('../lib/errors');
const { formatDate } = require('../lib/date');

const toUserDTO = (u) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  createdAt: formatDate(u.createdAt),
});

async function register({ fullName, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('Email đã được sử dụng', 'EMAIL_ALREADY_EXISTS');

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  try {
    const user = await prisma.user.create({ data: { fullName, email, passwordHash } }); // role mặc định STUDENT
    return toUserDTO(user);
  } catch (err) {
    // Hai request đăng ký cùng email chạy song song: unique constraint là chốt chặn cuối
    if (err.code === 'P2002') throw new ConflictError('Email đã được sử dụng', 'EMAIL_ALREADY_EXISTS');
    throw err;
  }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  // Cùng một thông báo cho "sai email" và "sai mật khẩu" để không lộ email nào tồn tại
  if (!valid) throw new UnauthorizedError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');

  const token = jwt.sign({ sub: String(user.id) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  return { token, user: toUserDTO(user) };
}

module.exports = { register, login, toUserDTO };