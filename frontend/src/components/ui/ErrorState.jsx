import Button from './Button';

// onRetry: bỏ trống nếu lỗi không thể thử lại (ví dụ 404)
export default function ErrorState({ title = 'Đã có lỗi xảy ra', message, onRetry, retrying = false, action }) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
      role="alert"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-red-700">{message}</p>}
      <div className="mt-5 flex gap-3">
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} loading={retrying}>
            Thử lại
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
