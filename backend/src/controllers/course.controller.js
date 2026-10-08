const asyncHandler = require('../lib/asyncHandler');
const { sendSuccess } = require('../lib/response');
const courseService = require('../services/course.service');

// Public
exports.list = asyncHandler(async (req, res) => {
  sendSuccess(res, await courseService.listPublic(req.query));
});
exports.categories = asyncHandler(async (req, res) => {
  sendSuccess(res, await courseService.listCategories());
});
exports.detail = asyncHandler(async (req, res) => {
  sendSuccess(res, await courseService.getPublicById(req.params.id, req.user?.id));
});

// Admin
exports.adminList = asyncHandler(async (req, res) => {
  sendSuccess(res, await courseService.listAll());
});
exports.adminCreate = asyncHandler(async (req, res) => {
  sendSuccess(res, await courseService.create(req.body), { status: 201, message: 'Tạo khóa học thành công' });
});
exports.adminUpdate = asyncHandler(async (req, res) => {
  sendSuccess(res, await courseService.update(req.params.id, req.body), { message: 'Cập nhật khóa học thành công' });
});
exports.adminSetVisibility = asyncHandler(async (req, res) => {
  const course = await courseService.setVisibility(req.params.id, req.body.isHidden);
  sendSuccess(res, course, { message: course.isHidden ? 'Đã ẩn khóa học' : 'Đã hiển thị khóa học' });
});
exports.adminRemove = asyncHandler(async (req, res) => {
  await courseService.remove(req.params.id);
  sendSuccess(res, null, { message: 'Đã xóa khóa học' });
});