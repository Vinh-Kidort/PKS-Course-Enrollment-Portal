import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { PageSpinner } from './ui/Spinner';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Các trang được tải theo yêu cầu (code splitting), Suspense hiển thị spinner trong lúc tải */}
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        PKS Course &amp; Enrollment Portal - bài test Fullstack Developer Intern
      </footer>
    </div>
  );
}
