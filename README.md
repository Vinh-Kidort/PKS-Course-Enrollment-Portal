### Tài khoản Demo:
- **Quản trị viên (Admin):** `admin@pks.test` | Mật khẩu: `Admin@123`
- **Học viên (Student):** `student@pks.test` | Mật khẩu: `Student@123`

### Khởi tạo & Dữ liệu mẫu:
1. Chạy CSDL: `docker compose up -d`
2. Cài đặt Backend: `cd backend && npm install`
3. Cấu hình file `.env` từ `.env.example`
4. Khởi tạo DB & Seed: `npm run db:reset` (hoặc `npm run db:seed`)
5. Chạy server: `npm run dev`

### Khóa học mẫu để test nhanh:
- Khóa đã đầy (20/20): `MOS Excel Expert` (dùng để test từ chối ghi danh 409).
- Khóa còn đúng 1 slot (29/30): `ReactJS Co-op Thực chiến` (dùng để test ghi danh suất cuối & race condition).
- Khóa đang bị ẩn: `Mini-ERP nội bộ` (chỉ Admin nhìn thấy).