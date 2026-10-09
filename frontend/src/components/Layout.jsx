import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import StatusBanner from './StatusBanner';
import { PageSpinner } from './ui/Spinner';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Liên kết bỏ qua thanh điều hướng, chỉ hiện khi người dùng bàn phím nhấn Tab */}
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Bỏ qua điều hướng
      </a>
      <Navbar />
      <StatusBanner />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Các trang được tải theo yêu cầu (code splitting), Suspense hiển thị spinner trong lúc tải */}
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        PKS Course &amp; Enrollment Portal - bài test Fullstack Developer Intern
      </footer>
      {/* Chuyển trang thì cuộn lên đầu, bấm Back thì trở lại vị trí cũ. Khóa theo đường dẫn để đổi bộ lọc (?q=) không bị nhảy lên đầu */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </div>
  );
}
