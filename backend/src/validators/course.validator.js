const { z } = require('zod');

const text = (label, min = 1, max = 255) =>
  z
    .string({ required_error: `${label} là bắt buộc`, invalid_type_error: `${label} không hợp lệ` })
    .trim()
    .min(min, `${label} tối thiểu ${min} ký tự`)
    .max(max, `${label} tối đa ${max} ký tự`);

const courseBase = z.object({
  name: text('Tên khóa học', 3, 150),
  category: text('Danh mục', 1, 100),
  instructor: text('Giảng viên', 2, 100),
  shortDescription: text('Mô tả ngắn', 1, 255),
  description: text('Mô tả chi tiết', 1, 5000),
  tuitionFee: z
    .number({ required_error: 'Học phí là bắt buộc', invalid_type_error: 'Học phí phải là số' })
    .int('Học phí phải là số nguyên')
    .min(0, 'Học phí không được âm'),
  capacity: z
    .number({ required_error: 'Sĩ số tối đa là bắt buộc', invalid_type_error: 'Sĩ số tối đa phải là số' })
    .int('Sĩ số tối đa phải là số nguyên')
    .min(1, 'Sĩ số tối đa phải từ 1 trở lên')
    .max(1000, 'Sĩ số tối đa không vượt quá 1000'),
});

// Create được phép đặt isHidden. Update thì không, để sửa thông tin không vô tình bật lại khóa đã ẩn
exports.createCourseSchema = courseBase.extend({ isHidden: z.boolean().optional() });
exports.updateCourseSchema = courseBase;

exports.visibilitySchema = z.object({
  isHidden: z.boolean({ required_error: 'isHidden là bắt buộc', invalid_type_error: 'isHidden phải là true/false' }),
});

exports.listQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

exports.idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'ID không hợp lệ' })
    .int('ID không hợp lệ')
    .positive('ID không hợp lệ'),
});