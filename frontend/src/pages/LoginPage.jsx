import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../components/ui/Button';
import { FormField, TextInput } from '../components/ui/FormField';
import PasswordInput from '../components/ui/PasswordInput';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getFieldErrors } from '../lib/apiError';

const DEMO_ACCOUNTS = {
  student: { label: 'Student', email: 'student@pks.test', password: 'Student@123' },
  admin: { label: 'Admin', email: 'admin@pks.test', password: 'Admin@123' },
};

export default function LoginPage() {
  useDocumentTitle('Đăng nhập');
  const { login } = useAuth();
  const location = useLocation();
  const [values, setValues] = useState({ email: location.state?.email ?? '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const found = {};
    if (!values.email.trim()) found.email = 'Vui lòng nhập email';
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) found.email = 'Email không hợp lệ';
    if (!values.password) found.password = 'Vui lòng nhập mật khẩu';
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login({ email: values.email.trim(), password: values.password });
      toast.success(`Chào mừng ${user.fullName}!`);
      // Việc chuyển trang do <GuestRoute> đảm nhiệm khi thấy user đã đăng nhập
    } catch (error) {
      toast.error(error.message);
      setErrors(getFieldErrors(error));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (key) => {
    const { email, password } = DEMO_ACCOUNTS[key];
    setValues({ email, password });
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
        <p className="mt-1 text-sm text-slate-500">Đăng nhập để ghi danh và quản lý khóa học của bạn.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              value={values.email}
              error={errors.email}
              disabled={submitting}
              onChange={setField('email')}
            />
          </FormField>
          <FormField label="Mật khẩu" htmlFor="password" error={errors.password}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={values.password}
              error={errors.password}
              disabled={submitting}
              onChange={setField('password')}
            />
          </FormField>
          <Button type="submit" loading={submitting} className="w-full">
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-center">
        <p className="text-xs text-slate-500">Tài khoản demo cho người chấm bài</p>
        <div className="mt-2 flex justify-center gap-2">
          {Object.entries(DEMO_ACCOUNTS).map(([key, account]) => (
            <Button key={key} variant="secondary" size="sm" disabled={submitting} onClick={() => fillDemo(key)}>
              Điền tài khoản {account.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
