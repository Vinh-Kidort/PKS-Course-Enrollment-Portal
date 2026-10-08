const asyncHandler = require('../lib/asyncHandler');
const { sendSuccess } = require('../lib/response');
const authService = require('../services/auth.service');

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  sendSuccess(res, user, { status: 201, message: 'Đăng ký tài khoản thành công' });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, { message: 'Đăng nhập thành công' });
});

exports.me = (req, res) => sendSuccess(res, authService.toUserDTO(req.user));