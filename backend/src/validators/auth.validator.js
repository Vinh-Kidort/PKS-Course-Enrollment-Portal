const { z } = require('zod');

const email = z
  .string({ required_error: 'Email là bắt buộc' })
  .trim()
  .toLowerCase()
  .email('Email không hợp lệ');

exports.registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Họ tên là bắt buộc' })
    .trim()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  email,
  // bcrypt chỉ xử lý 72 byte đầu nên giới hạn tối đa 72
  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .max(72, 'Mật khẩu tối đa 72 ký tự'),
});

exports.loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Mật khẩu là bắt buộc' }).min(1, 'Mật khẩu là bắt buộc'),
});