import { Link, useRouteError } from 'react-router-dom';
import Button from './ui/Button';

// Lỗi tải file JS của trang (thường do vừa phát hành phiên bản mới) hoặc lỗi bất ngờ khi hiển thị
const isChunkError = (error) =>
  /dynamically imported module|Importing a module script failed|Loading chunk/i.test(error?.message ?? '');

export default function RouteErrorPage() {
  const error = useRouteError();
  const chunkError = isChunkError(error);

  return (
    <div className="py-20 text-center" role="alert">
      <p className="text-4xl font-bold text-red-500">Rất tiếc</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {chunkError ? 'Không tải được trang này' : 'Đã có lỗi xảy ra'}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-slate-500">
        {chunkError
          ? 'Có thể ứng dụng vừa được cập nhật hoặc kết nối mạng không ổn định. Hãy tải lại trang để thử lại.'
          : 'Trang gặp sự cố bất ngờ. Bạn có thể tải lại trang hoặc quay về trang chủ.'}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
        <Link
          to="/"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
