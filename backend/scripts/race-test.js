const BASE = process.env.API_URL || 'http://localhost:5000/api';
const COURSE_NAME = 'ReactJS Co-op Thực chiến'; 
const N = 5;

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

async function main() {
  const list = await call('/courses');
  const course = list.json.data.find((c) => c.name === COURSE_NAME);
  console.log(`Khóa "${course.name}": ${course.enrolledCount}/${course.capacity}`);

  const stamp = Date.now();
  const tokens = [];
  for (let i = 0; i < N; i++) {
    const email = `race${stamp}_${i}@pks.test`;
    await call('/auth/register', { method: 'POST', body: { fullName: `Race ${i}`, email, password: 'Race@1234' } });
    const login = await call('/auth/login', { method: 'POST', body: { email, password: 'Race@1234' } });
    tokens.push(login.json.data.token);
  }

  console.log(`Bắn ${N} yêu cầu ghi danh ĐỒNG THỜI...`);
  const results = await Promise.all(
    tokens.map((token) => call('/enrollments', { method: 'POST', token, body: { courseId: course.id } })),
  );
  results.forEach((r, i) => console.log(`  #${i + 1}: ${r.status} ${r.json.code || 'OK'}`));

  const ok = results.filter((r) => r.status === 201).length;
  console.log(`Thành công: ${ok} (kỳ vọng: 1)`);
  process.exit(ok === 1 ? 0 : 1);
}

main();