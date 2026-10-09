const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount) => currency.format(amount);

export const ENROLLMENT_STATUS = {
  ACTIVE: { label: 'Đã ghi danh', tone: 'green' },
  CANCELLED: { label: 'Đã hủy', tone: 'gray' },
};

// Chọn trang đích sau khi đăng nhập: quay lại trang đang xem nếu phù hợp với vai trò
export function getPostLoginPath(user, from) {
  const isAdmin = user.role === 'ADMIN';
  const defaultPath = isAdmin ? '/admin/courses' : '/';
  if (!from?.pathname) return defaultPath;
  if (from.pathname === '/login' || from.pathname === '/register') return defaultPath;
  // Admin chỉ quay lại trang /admin/*, Student thì không vào /admin/*
  if (isAdmin !== from.pathname.startsWith('/admin')) return defaultPath;
  return `${from.pathname}${from.search ?? ''}`;
}
