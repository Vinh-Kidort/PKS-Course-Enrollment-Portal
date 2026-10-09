import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-bold text-red-500">403</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Bạn không có quyền truy cập</h1>
      <p className="mt-2 text-slate-500">Trang này dành cho vai trò khác. Vui lòng quay lại trang chủ.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Về trang chủ
      </Link>
    </div>
  );
}
