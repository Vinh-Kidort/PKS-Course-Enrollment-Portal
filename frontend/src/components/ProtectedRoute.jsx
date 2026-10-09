import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ForbiddenPage from '../pages/ForbiddenPage';
import { PageSpinner } from './ui/Spinner';

// roles: danh sách vai trò được phép, bỏ trống = chỉ cần đã đăng nhập
// Đây chỉ là lớp chặn ở giao diện. Quyền thật sự được Backend kiểm tra ở mọi API.
export default function ProtectedRoute({ roles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner label="Đang xác thực..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <ForbiddenPage />;
  return <Outlet />;
}
