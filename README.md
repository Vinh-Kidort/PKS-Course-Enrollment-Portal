# PKS Course & Enrollment Portal

Cổng đăng ký khóa học: học viên xem danh sách khóa học, ghi danh; quản trị viên quản lý khóa học và xem danh sách học viên đã ghi danh. Dự án làm cho bài kiểm tra Fullstack Developer Intern (Vòng 2) của PKS.

| | Link |
|---|---|
| Ứng dụng (Frontend, Vercel) | `<https://pks-course-enrollment-portal.vercel.app/>` |
| API (Backend, Render) | `<https://pks-portal-api.onrender.com>/api` (kiểm tra nhanh: `/api/health`) |

> **Lưu ý khi mở bản demo:** API chạy trên gói miễn phí của Render nên tự ngủ sau 15 phút không có truy cập. Lần truy cập đầu tiên có thể mất khoảng 1 phút để khởi động lại (giao diện sẽ hiện banner báo "máy chủ đang khởi động"). Các lần sau chạy bình thường.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@pks.test` | `Admin@123` |
| Học viên | `student@pks.test` | `Student@123` |

Dữ liệu seed gồm 6 khóa học, trong đó có 1 khóa **đã đầy** (MOS Excel Expert), 1 khóa **chỉ còn đúng 1 suất** (ReactJS Co-op Thực chiến) và 1 khóa **đang bị ẩn** (Mini-ERP nội bộ) để thử các trường hợp biên.

## Tính năng

**Học viên**
- Đăng ký, đăng nhập, xem danh sách khóa học (tìm kiếm theo tên, lọc theo danh mục) và trang chi tiết.
- Ghi danh khóa học và xem "Khóa học của tôi".

**Quản trị viên**
- Thêm, sửa, ẩn/hiện, xóa khóa học và cấu hình sĩ số (`capacity`).
- Xem danh sách học viên đã ghi danh theo từng khóa.

**Quy tắc nghiệp vụ**
- Một học viên không thể ghi danh cùng một khóa hai lần (`ALREADY_ENROLLED`).
- Không thể ghi danh khi `enrolled_count >= capacity` (`COURSE_FULL`).
- Ghi danh suất cuối cùng được xử lý bằng **transaction và cập nhật nguyên tử** (xem mục bên dưới), nên không bao giờ bị vượt sĩ số dù nhiều người bấm cùng lúc.
- Không thể hạ `capacity` thấp hơn số học viên đã ghi danh (`CAPACITY_BELOW_ENROLLED`) và không thể xóa khóa đã có học viên (`COURSE_HAS_ENROLLMENTS`, hãy dùng chức năng Ẩn).
- Khóa bị ẩn không xuất hiện ở trang công khai và không thể ghi danh.

## Công nghệ

| Tầng | Công nghệ |
|---|---|
| Frontend | React 19, Vite, React Router v6 (Protected Routes), TanStack Query, Axios, Tailwind CSS 4, Sonner (toast) |
| Backend | Node.js, Express 4, Zod (validate), JWT, bcrypt, Helmet, CORS, Day.js |
| Cơ sở dữ liệu | PostgreSQL 16, Prisma ORM 6 |
| Kiểm thử | Jest, Supertest, Postman |
| Hạ tầng | Docker Compose (DB local), Neon (DB cloud), Render (API), Vercel (Frontend) |

## Cấu trúc thư mục

```
.
├── backend/
│   ├── prisma/           # schema.prisma, migrations, seed.js
│   ├── scripts/          # race-test.js (bắn request song song)
│   ├── src/
│   │   ├── config/ lib/ middlewares/
│   │   ├── validators/ services/ controllers/ routes/
│   │   ├── app.js        # cấu hình Express (được Supertest import)
│   │   └── server.js     # mở cổng
│   └── tests/            # Jest + Supertest
├── frontend/
│   └── src/              # pages, components, hooks, lib, context
├── docs/
│   ├── erd.md            # sơ đồ ERD (Mermaid) và erd.png
│   ├── screenshots/      # ảnh kiểm thử Postman, race test, Jest
│   └── *.postman_*.json  # Postman collection và environment
└── docker-compose.yml
```

## Chạy trên máy (local)

**Yêu cầu:** Node.js ≥ 20.19 (hoặc ≥ 22.12), Docker Desktop, Git.

```bash
git clone <https://github.com/Vinh-Kidort/PKS-Course-Enrollment-Portal>
cd <pks-course-portal>
```

### 1. Cơ sở dữ liệu

```bash
docker compose up -d
docker compose ps        # chờ trạng thái "healthy"
```

Nếu cổng 5432 đã bị chiếm, đổi thành `"5433:5432"` trong `docker-compose.yml` và dùng cổng 5433 trong `DATABASE_URL`.

### 2. Backend

```bash
cd backend
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm install
npx prisma migrate deploy   # áp dụng migration (kèm CHECK constraint)
npm run db:seed             # dữ liệu mẫu + tài khoản demo
npm run dev                 # API tại http://localhost:5000
```

Mở thử `http://localhost:5000/api/health`, kết quả đúng là `{"success":true,"data":{"status":"ok"}}`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### Biến môi trường

**`backend/.env`** (xem `backend/.env.example`)

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL |
| `JWT_SECRET` | Có | Khóa ký JWT. Dùng chuỗi ngẫu nhiên dài, **không** commit giá trị thật |
| `JWT_EXPIRES_IN` | Không | Thời hạn token, mặc định `1d` |
| `CLIENT_URL` | Không | Origin được phép gọi API (CORS), nhiều giá trị ngăn cách bằng dấu phẩy. Mặc định `http://localhost:5173` |
| `PORT` | Không | Cổng API, mặc định `5000` |

**`frontend/.env`**

| Biến | Mô tả |
|---|---|
| `VITE_API_URL` | URL gốc của API, ví dụ `http://localhost:5000/api`. Được nhúng lúc build nên đổi giá trị phải build/deploy lại |

### Đặt lại dữ liệu mẫu

```bash
cd backend && npm run db:seed
```

Lệnh seed **xóa và tạo lại** toàn bộ khóa học và ghi danh (giữ nguyên tài khoản demo).

## Kiểm thử

### Jest + Supertest

Test chạy trên database riêng `pks_test` và tự từ chối chạy nếu tên DB không chứa chữ `test`, nên không thể làm mất dữ liệu dev.

```bash
docker compose exec db psql -U pks -d postgres -c "CREATE DATABASE pks_test;"   
cd backend
cp .env.test.example .env.test
npm test
```

Các nhóm test chính: ghi danh thành công, ghi danh trùng, khóa đã đầy, khóa không tồn tại hoặc bị ẩn, dữ liệu sai (400), thiếu token (401), sai vai trò (403), và **race condition** (5 người giành 1 suất, 12 người giành 3 suất, bấm đúp song song).

### Postman

Import hai file trong `docs/`:
- `PKS-Portal.postman_collection.json`
- `PKS-Portal.postman_environment.json`

Chọn environment, đặt `baseUrl` (local hoặc link Render), chạy request *Login* trước để lưu token vào biến, sau đó chạy các folder theo thứ tự. Ảnh kết quả nằm ở `docs/screenshots/`.

### Chứng minh race condition bằng script

```bash
cd backend
npm run db:seed
npm run dev                      # cửa sổ terminal khác
node scripts/race-test.js        # kết quả đúng: 1 dòng 201 và 4 dòng 409 COURSE_FULL
```

## Cách xử lý race condition khi ghi danh

Toàn bộ luồng chạy trong một `prisma.$transaction`:

1. Kiểm tra học viên đã ghi danh chưa, nếu có thì trả `409 ALREADY_ENROLLED`.
2. Giữ chỗ bằng **một câu UPDATE có điều kiện**:
   ```sql
   UPDATE courses SET enrolled_count = enrolled_count + 1
   WHERE id = ? AND is_hidden = false AND enrolled_count < capacity
   ```
3. Nếu không có dòng nào bị ảnh hưởng thì khóa đã đầy (`409 COURSE_FULL`) hoặc không tồn tại/bị ẩn (`404`).
4. Tạo bản ghi `enrollments`. Nếu bước này lỗi, transaction rollback nên chỗ vừa giữ cũng được hoàn lại.

Khi hai request cùng cập nhật một dòng, PostgreSQL khóa dòng đó. Request đến sau phải chờ rồi đánh giá lại điều kiện `WHERE` với giá trị mới, nên không có khoảng hở giữa "kiểm tra còn chỗ" và "ghi". Hai lớp bảo vệ phía sau:

- `UNIQUE (user_id, course_id)` chặn ghi danh trùng, kể cả khi bấm đúp song song.
- `CHECK (enrolled_count <= capacity)` ở cấp DB, đảm bảo sĩ số không bao giờ bị vượt dù code có lỗi.

## Tài liệu API

Tất cả endpoint có tiền tố `/api`. Endpoint cần đăng nhập gửi header `Authorization: Bearer <token>`.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | Công khai | Đăng ký (vai trò mặc định là học viên) |
| POST | `/auth/login` | Công khai | Đăng nhập, trả về JWT |
| GET | `/auth/me` | Đã đăng nhập | Thông tin người dùng hiện tại |
| GET | `/courses` | Công khai | Danh sách khóa học (`?search=`, `?category=`) |
| GET | `/courses/categories` | Công khai | Danh sách danh mục |
| GET | `/courses/:id` | Công khai | Chi tiết khóa học |
| POST | `/enrollments` | Học viên | Ghi danh, body `{ "courseId": number }` |
| GET | `/enrollments/me` | Đã đăng nhập | Các khóa của tôi |
| GET | `/admin/courses` | Admin | Tất cả khóa học (gồm khóa ẩn) |
| POST | `/admin/courses` | Admin | Tạo khóa học |
| PUT | `/admin/courses/:id` | Admin | Cập nhật khóa học |
| PATCH | `/admin/courses/:id/visibility` | Admin | Ẩn/hiện khóa học |
| DELETE | `/admin/courses/:id` | Admin | Xóa khóa học (chỉ khi chưa có học viên) |
| GET | `/admin/courses/:id/enrollments` | Admin | Danh sách học viên của khóa |
| GET | `/health` | Công khai | Kiểm tra trạng thái |

**Định dạng phản hồi thống nhất**

```jsonc
// Thành công
{ "success": true, "message": "Ghi danh thành công", "data": { } }

// Lỗi
{ "success": false, "code": "COURSE_FULL", "message": "Khóa học đã hết chỗ", "errors": [] }
```

Mã lỗi nghiệp vụ: `VALIDATION_ERROR`, `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `ALREADY_ENROLLED`, `COURSE_FULL`, `CAPACITY_BELOW_ENROLLED`, `COURSE_HAS_ENROLLMENTS`.

Ngày tháng trả về theo định dạng `YYYY-MM-DD` (múi giờ `Asia/Ho_Chi_Minh`).

## Bảo mật

- Mật khẩu băm bằng **bcrypt (salt rounds = 10)**, không bao giờ trả `passwordHash` ra API.
- **JWT có thời hạn** (`JWT_EXPIRES_IN`), phân biệt rõ `TOKEN_EXPIRED` và `INVALID_TOKEN`.
- Phân quyền theo vai trò ở backend: toàn bộ `/api/admin/*` yêu cầu JWT và vai trò `ADMIN`. Frontend chỉ ẩn/hiện giao diện, không phải lớp bảo vệ duy nhất.
- `userId` của thao tác ghi danh lấy từ token, không nhận từ client.
- Dữ liệu đầu vào được kiểm tra bằng Zod; Prisma dùng truy vấn tham số hóa nên không dính SQL injection.
- Helmet và CORS giới hạn theo origin; thông tin lỗi hệ thống không lộ ra client.
- Bí mật không nằm trong Git: `.env` bị `.gitignore` chặn, chỉ commit `.env.example`.

**Đánh đổi đã biết:** token được lưu ở `localStorage` để giữ đăng nhập sau khi tải lại trang. Cách này đơn giản nhưng có thể bị đánh cắp nếu ứng dụng dính lỗi XSS. Hướng cải thiện cho môi trường production là dùng cookie `httpOnly` + `SameSite` kèm refresh token.

## Giao diện

- Đủ các trạng thái **Loading** (skeleton), **Empty**, **Error** (có nút thử lại) và **Disabled** (nút đang xử lý, đã ghi danh, hết chỗ).
- Thông báo bằng toast, không dùng `alert()`.
- Hỗ trợ responsive (có thanh ghi danh cố định ở đáy trên điện thoại), điều hướng bàn phím và trình đọc màn hình.
- Banner báo mất mạng và máy chủ phản hồi chậm (cold start).

## Triển khai

| Thành phần | Nền tảng | Cấu hình chính |
|---|---|---|
| Database | Neon (PostgreSQL) | Dùng chuỗi **direct** (không có `-pooler`) cho Prisma |
| Backend | Render (Web Service) | Root `backend`; Build `npm ci && npx prisma migrate deploy`; Start `npm start`; đặt `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` |
| Frontend | Vercel | Root `frontend`; đặt `VITE_API_URL`; `vercel.json` rewrite để tải lại trang con không bị 404 |

`CLIENT_URL` trên Render phải chứa đúng origin của Vercel (có `https://`, không có dấu `/` ở cuối).

## Tài liệu trong `docs/`

- [`erd.md`](docs/erd.md): sơ đồ quan hệ thực thể (Users, Courses, Enrollments).
- [`screenshots/`](docs/screenshots/): ảnh kiểm thử Postman (thành công, 400, 401, 403, 404, 409), race condition và Jest.
- Postman collection và environment để import.

## Lịch sử commit

Dự án dùng [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `test`, `docs`, `chore`...), xem bằng `git log --oneline`.

## Hạn chế và hướng phát triển

- Chưa có chức năng hủy ghi danh, thanh toán và danh sách chờ khi khóa đã đầy.
- Token lưu ở `localStorage` (xem mục Bảo mật); chưa có refresh token.
- Chưa có phân trang cho danh sách khóa học và danh sách ghi danh vì quy mô dữ liệu mẫu nhỏ.
- Gói miễn phí của Render và Neon có cold start, và dữ liệu demo có thể cần seed lại.
