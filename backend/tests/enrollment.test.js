const request = require('supertest');
const { app, prisma, resetDb, createUser, loginAs, createCourse, enrollAs, seatState } = require('./helpers');

let student;
let studentToken;
let adminToken;

beforeAll(async () => {
  await resetDb();
  student = await createUser('STUDENT');
  studentToken = await loginAs(student);
  adminToken = await loginAs(await createUser('ADMIN'));
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

describe('POST /api/enrollments', () => {
  test('201: ghi danh thành công và tăng enrolled_count', async () => {
    const course = await createCourse({ capacity: 5 });

    const res = await enrollAs(studentToken, course.id);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.course.id).toBe(course.id);
    expect(await seatState(course.id)).toEqual({ enrolledCount: 1, rows: 1 });
  });

  test('409 ALREADY_ENROLLED: không cho ghi danh trùng và không đổi số chỗ', async () => {
    const course = await createCourse({ capacity: 5 });
    await enrollAs(studentToken, course.id);

    const res = await enrollAs(studentToken, course.id);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ success: false, code: 'ALREADY_ENROLLED' });
    expect(await seatState(course.id)).toEqual({ enrolledCount: 1, rows: 1 });
  });

  test('409 COURSE_FULL: khóa đã đủ học viên', async () => {
    const course = await createCourse({ capacity: 1 });
    const other = await createUser();
    expect((await enrollAs(await loginAs(other), course.id)).status).toBe(201);

    const res = await enrollAs(studentToken, course.id);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ success: false, code: 'COURSE_FULL' });
    expect(await seatState(course.id)).toEqual({ enrolledCount: 1, rows: 1 });
  });

  test('404: khóa học không tồn tại', async () => {
    const res = await enrollAs(studentToken, 99999999);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('404: khóa học đã bị ẩn', async () => {
    const course = await createCourse({ isHidden: true });
    const res = await enrollAs(studentToken, course.id);
    expect(res.status).toBe(404);
    expect((await seatState(course.id)).enrolledCount).toBe(0);
  });

  test.each([
    ['thiếu courseId', undefined],
    ['courseId là chữ', 'abc'],
    ['courseId âm', -5],
  ])('400 VALIDATION_ERROR: %s', async (_label, courseId) => {
    const res = await enrollAs(studentToken, courseId);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('401: không có token', async () => {
    const course = await createCourse();
    const res = await enrollAs(null, course.id);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('403: admin không được ghi danh', async () => {
    const course = await createCourse();
    const res = await enrollAs(adminToken, course.id);
    expect(res.status).toBe(403);
    expect((await seatState(course.id)).enrolledCount).toBe(0);
  });
});

describe('Race condition (giữ chỗ nguyên tử)', () => {
  test('5 học viên cùng giành 1 suất cuối: đúng 1 thành công, 4 COURSE_FULL', async () => {
    const course = await createCourse({ capacity: 1 });
    const tokens = await Promise.all(
      Array.from({ length: 5 }, async () => loginAs(await createUser())),
    );

    const results = await Promise.all(tokens.map((t) => enrollAs(t, course.id)));

    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([201, 409, 409, 409, 409]);
    results.filter((r) => r.status === 409).forEach((r) => expect(r.body.code).toBe('COURSE_FULL'));
    expect(await seatState(course.id)).toEqual({ enrolledCount: 1, rows: 1 });
  });

  test('12 học viên giành 3 suất: đúng 3 thành công, không bao giờ vượt capacity', async () => {
    const course = await createCourse({ capacity: 3 });
    const tokens = await Promise.all(
      Array.from({ length: 12 }, async () => loginAs(await createUser())),
    );

    const results = await Promise.all(tokens.map((t) => enrollAs(t, course.id)));

    expect(results.filter((r) => r.status === 201)).toHaveLength(3);
    expect(results.filter((r) => r.status === 409)).toHaveLength(9);
    expect(results.some((r) => r.status >= 500)).toBe(false);
    expect(await seatState(course.id)).toEqual({ enrolledCount: 3, rows: 3 });
  });

  test('Bấm đúp: cùng 1 học viên gửi 2 request song song chỉ được 1 lần', async () => {
    const course = await createCourse({ capacity: 5 });
    const user = await createUser();
    const token = await loginAs(user);

    const results = await Promise.all([enrollAs(token, course.id), enrollAs(token, course.id)]);

    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(results.find((r) => r.status === 409).body.code).toBe('ALREADY_ENROLLED');
    expect(await seatState(course.id)).toEqual({ enrolledCount: 1, rows: 1 });
  });
});

describe('GET /api/enrollments/me', () => {
  test('200: chỉ trả khóa của chính mình', async () => {
    const mine = await createUser();
    const stranger = await createUser();
    const courseA = await createCourse();
    const courseB = await createCourse();
    const myToken = await loginAs(mine);
    await enrollAs(myToken, courseA.id);
    await enrollAs(await loginAs(stranger), courseB.id);

    const res = await request(app).get('/api/enrollments/me').set('Authorization', `Bearer ${myToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].course.id).toBe(courseA.id);
  });

  test('401: không có token', async () => {
    const res = await request(app).get('/api/enrollments/me');
    expect(res.status).toBe(401);
  });
});