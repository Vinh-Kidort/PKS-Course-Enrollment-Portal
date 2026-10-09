const request = require('supertest');
const { app, prisma, PASSWORD, resetDb, createUser } = require('./helpers');

beforeAll(resetDb);
afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

describe('Auth', () => {
  const body = { fullName: 'Nguyễn Văn Jest', email: 'new@jest.test', password: 'Jest@1234' };

  test('register 201 và không lộ passwordHash', async () => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|password_hash/);
  });

  test('register trùng email: 409 EMAIL_ALREADY_EXISTS', async () => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  test('register thiếu field: 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@jest.test' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  test('login sai mật khẩu: 401 INVALID_CREDENTIALS', async () => {
    const user = await createUser();
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'sai-mat-khau' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  test('login đúng rồi gọi /me bằng token: 200', async () => {
    const user = await createUser();
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: PASSWORD });
    expect(login.status).toBe(200);

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.data.token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(user.email);
  });

  test('/me với token rác: 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc.def.ghi');
    expect(res.status).toBe(401);
  });
});