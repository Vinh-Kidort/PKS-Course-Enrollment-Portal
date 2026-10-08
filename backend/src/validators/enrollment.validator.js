const { z } = require('zod');

exports.enrollSchema = z.object({
  courseId: z
    .number({ required_error: 'courseId là bắt buộc', invalid_type_error: 'courseId phải là số' })
    .int('courseId không hợp lệ')
    .positive('courseId không hợp lệ'),
});