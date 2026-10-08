const prisma = require('../lib/prisma');
const { ConflictError, NotFoundError } = require('../lib/errors');
const { formatDate, formatDateTime } = require('../lib/date');

const toEnrollmentDTO = (e) => ({
  id: e.id,
  status: e.status,
  enrolledAt: formatDate(e.enrolledAt),
  enrolledAtTime: formatDateTime(e.enrolledAt),
  course: {
    id: e.course.id,
    name: e.course.name,
    category: e.course.category,
    instructor: e.course.instructor,
    tuitionFee: e.course.tuitionFee,
  },
});

const alreadyEnrolled = () => new ConflictError('Bạn đã ghi danh khóa học này rồi', 'ALREADY_ENROLLED');

async function enroll(userId, courseId) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Đã ghi danh chưa? (kiểm tra trước để không báo nhầm "hết chỗ")
      const existing = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { id: true },
      });
      if (existing) throw alreadyEnrolled();

      // 2. Giữ chỗ nguyên tử: chỉ tăng khi còn chỗ và khóa không bị ẩn
      const reserved = await tx.$executeRaw`
        UPDATE "courses"
        SET "enrolled_count" = "enrolled_count" + 1
        WHERE "id" = ${courseId}
          AND "is_hidden" = false
          AND "enrolled_count" < "capacity"`;

      // 3. Không giữ được chỗ: phân biệt "không tồn tại" và "hết chỗ"
      if (reserved === 0) {
        const course = await tx.course.findUnique({ where: { id: courseId }, select: { isHidden: true } });
        if (!course || course.isHidden) throw new NotFoundError('Không tìm thấy khóa học');
        throw new ConflictError('Khóa học đã hết chỗ', 'COURSE_FULL');
      }

      // 4. Tạo enrollment. Lỗi ở đây sẽ rollback luôn bước giữ chỗ
      const enrollment = await tx.enrollment.create({
        data: { userId, courseId },
        include: { course: true },
      });
      return toEnrollmentDTO(enrollment);
    });
  } catch (err) {
    // Hai request của cùng một học viên chạy song song: unique constraint chặn request thứ hai
    if (err.code === 'P2002') throw alreadyEnrolled();
    throw err;
  }
}

async function listMine(userId) {
  const rows = await prisma.enrollment.findMany({
    where: { userId }, // userId lấy từ token, KHÔNG nhận từ client
    include: { course: true },
    orderBy: { enrolledAt: 'desc' },
  });
  return rows.map(toEnrollmentDTO);
}

async function listByCourse(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, name: true },
  });
  if (!course) throw new NotFoundError('Không tìm thấy khóa học');

  const rows = await prisma.enrollment.findMany({
    where: { courseId },
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { enrolledAt: 'asc' },
  });

  return {
    course,
    total: rows.length,
    enrollments: rows.map((r) => ({
      id: r.id,
      fullName: r.user.fullName,
      email: r.user.email,
      courseName: course.name,
      enrolledAt: formatDate(r.enrolledAt),
      enrolledAtTime: formatDateTime(r.enrolledAt),
      status: r.status,
    })),
  };
}

module.exports = { enroll, listMine, listByCourse };