require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const DEMO_ADMIN = { email: 'admin@pks.test', password: 'Admin@123' };
const DEMO_STUDENT = { email: 'student@pks.test', password: 'Student@123' };


const courseDefs = [
  {
    name: 'MOS Excel Expert',
    category: 'Tin học quốc tế MOS',
    instructor: 'Nguyễn Thị Lan',
    shortDescription: 'Luyện thi chứng chỉ MOS Excel Expert.',
    description: 'Khóa học tập trung công thức nâng cao, PivotTable, Macro cơ bản và luyện đề theo cấu trúc thi MOS quốc tế.',
    tuitionFee: 2500000,
    capacity: 20,
    seats: 20, 
  },
  {
    name: 'ReactJS Co-op Thực chiến',
    category: 'Lập trình Web',
    instructor: 'Trần Minh Khoa',
    shortDescription: 'Xây dựng ứng dụng React theo quy trình doanh nghiệp.',
    description: 'Học React, React Router, quản lý state và gọi API qua dự án thực tế theo mô hình Co-op.',
    tuitionFee: 4500000,
    capacity: 30,
    seats: 29, 
  },
  {
    name: 'Node.js & Express Backend',
    category: 'Lập trình Web',
    instructor: 'Lê Hoàng Nam',
    shortDescription: 'Xây dựng RESTful API với Node.js và Express.',
    description: 'Từ routing, middleware, xác thực JWT đến làm việc với PostgreSQL qua Prisma.',
    tuitionFee: 4000000,
    capacity: 25,
    seats: 5, 
  },
  {
    name: 'MOS Word Specialist',
    category: 'Tin học quốc tế MOS',
    instructor: 'Phạm Thu Hà',
    shortDescription: 'Chuẩn bị thi chứng chỉ MOS Word.',
    description: 'Định dạng văn bản chuyên nghiệp, mục lục, trộn thư và luyện đề thi MOS.',
    tuitionFee: 1800000,
    capacity: 20,
    seats: 8,
  },
  {
    name: 'Python cho Phân tích dữ liệu',
    category: 'Phân tích dữ liệu',
    instructor: 'Võ Đức Anh',
    shortDescription: 'Làm quen Pandas và trực quan hóa dữ liệu.',
    description: 'Xử lý dữ liệu với Pandas, vẽ biểu đồ với Matplotlib, bài tập từ dữ liệu thực.',
    tuitionFee: 3500000,
    capacity: 15,
    seats: 0,
  },
  {
    name: 'Mini-ERP nội bộ',
    category: 'Giải pháp doanh nghiệp',
    instructor: 'Đặng Quốc Bảo',
    shortDescription: 'Khóa đang được ẩn, dùng để thử chức năng Admin.',
    description: 'Thiết kế và triển khai mô-đun Mini-ERP cho doanh nghiệp nhỏ.',
    tuitionFee: 6000000,
    capacity: 10,
    seats: 0,
    isHidden: true, 
  },
];

async function main() {
  const adminHash = await bcrypt.hash(DEMO_ADMIN.password, SALT_ROUNDS);
  const studentHash = await bcrypt.hash(DEMO_STUDENT.password, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: DEMO_ADMIN.email },
    update: { passwordHash: adminHash, role: 'ADMIN' },
    create: {
      fullName: 'PKS Admin',
      email: DEMO_ADMIN.email,
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: DEMO_STUDENT.email },
    update: { passwordHash: studentHash },
    create: {
      fullName: 'Học viên Demo',
      email: DEMO_STUDENT.email,
      passwordHash: studentHash,
      role: 'STUDENT',
    },
  });

  
  const maxSeats = Math.max(...courseDefs.map((c) => c.seats));
  const fillers = [];
  for (let i = 1; i <= maxSeats; i++) {
    const email = `filler${i}@pks.test`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        fullName: `Học viên mẫu ${i}`,
        email,
        passwordHash: studentHash,
        role: 'STUDENT',
      },
    });
    fillers.push(user);
  }

  
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();

  for (const { seats, ...data } of courseDefs) {
    const course = await prisma.course.create({
      data: { ...data, enrolledCount: seats },
    });
    if (seats > 0) {
      await prisma.enrollment.createMany({
        data: fillers.slice(0, seats).map((u) => ({
          userId: u.id,
          courseId: course.id,
        })),
      });
    }
  }

  console.log('Seed hoàn tất.');
  console.log(`Admin:   ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
  console.log(`Student: ${DEMO_STUDENT.email} / ${DEMO_STUDENT.password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());