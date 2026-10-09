const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.test'), override: true });

process.env.NODE_ENV = 'test';

// Chốt chặn an toàn: tuyệt đối không chạy test (có xóa dữ liệu) trên DB thật
const dbName = new URL(process.env.DATABASE_URL || 'postgresql://x/none').pathname;
if (!/test/i.test(dbName)) {
  throw new Error(`Từ chối chạy test: DATABASE_URL trỏ tới "${dbName}", tên DB phải chứa "test"`);
}