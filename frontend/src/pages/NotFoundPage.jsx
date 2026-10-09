import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Không tìm thấy trang');
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-slate-500">Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        Về trang chủ
      </Link>
    </div>
  );
}
