import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import Badge from './ui/Badge';
import Button from './ui/Button';

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    navigate('/', { replace: true });
    logout();
    toast.success('Đã đăng xuất');
  };

  const links = (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
        Khóa học
      </NavLink>
      {user?.role === 'STUDENT' && (
        <NavLink to="/my-courses" className={navLinkClass} onClick={closeMenu}>
          Khóa học của tôi
        </NavLink>
      )}
      {user?.role === 'ADMIN' && (
        <NavLink to="/admin/courses" className={navLinkClass} onClick={closeMenu}>
          Quản trị
        </NavLink>
      )}
    </>
  );

  const account = isLoading ? (
    <div className="h-8 w-28 animate-pulse rounded bg-slate-200" aria-label="Đang tải tài khoản" />
  ) : user ? (
    <>
      <span className="flex items-center gap-2 text-sm text-slate-600">
        <span>
          Xin chào, <strong className="font-semibold text-slate-900">{user.fullName}</strong>
        </span>
        {user.role === 'ADMIN' && <Badge tone="amber">Admin</Badge>}
      </span>
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </>
  ) : (
    <>
      <Link
        to="/login"
        onClick={closeMenu}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Đăng nhập
      </Link>
      <Link
        to="/register"
        onClick={closeMenu}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Đăng ký
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900" onClick={closeMenu}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
              PKS
            </span>
            <span className="hidden sm:inline">Course Portal</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">{account}</div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">{links}</nav>
          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">{account}</div>
        </div>
      )}
    </header>
  );
}
