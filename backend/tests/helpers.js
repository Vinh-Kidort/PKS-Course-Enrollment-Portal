const bcrypt = require('bcrypt');
const request = require('supertest');
const prisma = require('../src/lib/prisma');
const app = require('../src/app');

const PASSWORD = 'Test@1234';
let passwordHash;
let seq = 0;

async function resetDb() {
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(role = 'STUDENT') {
  passwordHash ??= await bcrypt.hash(PASSWORD, 10);
  seq += 1;
  return prisma.user.create({
    data: { fullName: `Test ${role} ${seq}`, email: `${role.toLowerCase()}${seq}@jest.test`, passwordHash, role },
  });
}

// Đăng nhập qua API thật để lấy token, giống cách FE làm
async function loginAs(user) {
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password: PASSWORD });
  return res.body.data.token;
}

async function createCourse(overrides = {}) {
  seq += 1;
  return prisma.course.create({
    data: {
      name: `Khóa học test ${seq}`,
      category: 'Lập trình Web',
      instructor: 'Giảng viên Jest',
      shortDescription: 'Mô tả ngắn',
      description: 'Mô tả đầy đủ',
      tuitionFee: 1000000,
      capacity: 10,
      ...overrides,
    },
  });
}

const enrollAs = (token, courseId) => {
  const req = request(app).post('/api/enrollments');
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req.send(courseId === undefined ? {} : { courseId });
};

// Trạng thái thật trong DB: số đếm lưu sẵn và số dòng enrollment phải luôn khớp
async function seatState(courseId) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  const rows = await prisma.enrollment.count({ where: { courseId } });
  return { enrolledCount: course.enrolledCount, rows };
}

module.exports = { app, prisma, PASSWORD, resetDb, createUser, loginAs, createCourse, enrollAs, seatState };