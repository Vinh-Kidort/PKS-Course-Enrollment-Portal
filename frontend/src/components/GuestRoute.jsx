import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPostLoginPath } from '../lib/format';
import { PageSpinner } from './ui/Spinner';

// Trang chỉ dành cho khách (Login/Register). Đã đăng nhập thì chuyển đi nơi khác.
// Đây cũng là chỗ điều hướng sau khi đăng nhập thành công: quay lại trang đang xem trước đó (state.from).
export default function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;
  if (user) return <Navigate to={getPostLoginPath(user, location.state?.from)} replace />;
  return <Outlet />;
}
