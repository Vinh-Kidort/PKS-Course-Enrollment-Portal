const asyncHandler = require('../lib/asyncHandler');
const { sendSuccess } = require('../lib/response');
const enrollmentService = require('../services/enrollment.service');

exports.enroll = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.enroll(req.user.id, req.body.courseId);
  sendSuccess(res, enrollment, { status: 201, message: 'Ghi danh thành công' });
});

exports.myEnrollments = asyncHandler(async (req, res) => {
  sendSuccess(res, await enrollmentService.listMine(req.user.id));
});

exports.adminListByCourse = asyncHandler(async (req, res) => {
  sendSuccess(res, await enrollmentService.listByCourse(req.params.id));
});