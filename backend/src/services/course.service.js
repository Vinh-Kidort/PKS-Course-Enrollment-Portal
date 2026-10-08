const prisma = require('../lib/prisma');
const { NotFoundError, ConflictError } = require('../lib/errors');
const { formatDate } = require('../lib/date');

// Còn chỗ/Hết chỗ được TÍNH từ capacity và enrolledCount, không lưu thành cột riêng
const toCourseDTO = (c) => ({
  id: c.id,
  name: c.name,
  category: c.category,
  instructor: c.instructor,
  shortDescription: c.shortDescription,
  description: c.description,
  tuitionFee: c.tuitionFee,
  capacity: c.capacity,
  enrolledCount: c.enrolledCount,
  availableSeats: Math.max(c.capacity - c.enrolledCount, 0),
  status: c.enrolledCount >= c.capacity ? 'FULL' : 'AVAILABLE',
  isHidden: c.isHidden,
  createdAt: formatDate(c.createdAt),
  updatedAt: formatDate(c.updatedAt),
});

// ---------- Public ----------
async function listPublic({ search, category }) {
  const courses = await prisma.course.findMany({
    where: {
      isHidden: false,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(category && { category }),
    },
    orderBy: { createdAt: 'desc' },
  });
  return courses.map(toCourseDTO);
}

async function listCategories() {
  const rows = await prisma.course.findMany({
    where: { isHidden: false },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return rows.map((r) => r.category);
}

async function getPublicById(id, userId) {
  const course = await prisma.course.findFirst({ where: { id, isHidden: false } });
  if (!course) throw new NotFoundError('Không tìm thấy khóa học');

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
      select: { id: true },
    });
    isEnrolled = Boolean(enrollment);
  }
  return { ...toCourseDTO(course), isEnrolled };
}

// ---------- Admin ----------
async function listAll() {
  const courses = await prisma.course.findMany({ orderBy: { id: 'asc' } });
  return courses.map(toCourseDTO);
}

async function create(data) {
  return toCourseDTO(await prisma.course.create({ data }));
}

async function update(id, data) {
  // Atomic: chỉ cập nhật khi enrolled_count <= capacity mới. Không có khoảng hở giữa "kiểm tra" và "ghi"
  const result = await prisma.course.updateMany({
    where: { id, enrolledCount: { lte: data.capacity } },
    data,
  });

  if (result.count === 0) {
    const course = await prisma.course.findUnique({ where: { id }, select: { enrolledCount: true } });
    if (!course) throw new NotFoundError('Không tìm thấy khóa học');
    throw new ConflictError(
      `Sĩ số tối đa không được thấp hơn số học viên đã ghi danh (${course.enrolledCount})`,
      'CAPACITY_BELOW_ENROLLED',
    );
  }
  return toCourseDTO(await prisma.course.findUnique({ where: { id } }));
}

async function setVisibility(id, isHidden) {
  // Không tồn tại thì Prisma ném P2025, errorHandler đổi thành 404
  return toCourseDTO(await prisma.course.update({ where: { id }, data: { isHidden } }));
}

async function remove(id) {
  try {
    await prisma.course.delete({ where: { id } });
  } catch (err) {
    if (err.code === 'P2003') {
      throw new ConflictError(
        'Khóa học đã có học viên ghi danh, hãy ẩn khóa học thay vì xóa',
        'COURSE_HAS_ENROLLMENTS',
      );
    }
    throw err;
  }
}

module.exports = { listPublic, listCategories, getPublicById, listAll, create, update, setVisibility, remove };