import { lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import GuestRoute from './components/GuestRoute';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProvider from './context/AuthProvider';
import { queryClient } from './lib/queryClient';

// Code splitting: mỗi trang là một file JS riêng, chỉ tải khi người dùng vào trang đó
const HomePage = lazy(() => import('./pages/HomePage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyCoursesPage = lazy(() => import('./pages/MyCoursesPage'));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'));
const AdminEnrollmentsPage = lazy(() => import('./pages/admin/AdminEnrollmentsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public
      { index: true, element: <HomePage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },

      // Chỉ dành cho khách
      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },

      // Chỉ học viên
      {
        element: <ProtectedRoute roles={['STUDENT']} />,
        children: [{ path: 'my-courses', element: <MyCoursesPage /> }],
      },

      // Chỉ admin
      {
        path: 'admin',
        element: <ProtectedRoute roles={['ADMIN']} />,
        children: [
          { index: true, element: <Navigate to="courses" replace /> },
          { path: 'courses', element: <AdminCoursesPage /> },
          { path: 'courses/:id/enrollments', element: <AdminEnrollmentsPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="bottom-right" closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
