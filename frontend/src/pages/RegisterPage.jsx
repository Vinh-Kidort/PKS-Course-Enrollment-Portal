import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/auth';
import Button from '../components/ui/Button';
import { FormField, TextInput } from '../components/ui/FormField';
import { getFieldErrors } from '../lib/apiError';

const INITIAL = { fullName: '', email: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const found = {};
    if (values.fullName.trim().length < 2) found.fullName = 'Họ tên tối thiểu 2 ký tự';
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) found.email = 'Email không hợp lệ';
    if (values.password.length < 8) found.password = 'Mật khẩu tối thiểu 8 ký tự';
    else if (values.password.length > 72) found.password = 'Mật khẩu tối đa 72 ký tự';
    if (values.confirmPassword !== values.password) found.confirmPassword = 'Mật khẩu nhập lại không khớp';
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await authApi.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login', { replace: true, state: { email: values.email.trim() } });
    } catch (error) {
      toast.error(error.message); // ví dụ 409: Email đã được sử dụng
      const fieldErrors = getFieldErrors(error);
      if (error.code === 'EMAIL_ALREADY_EXISTS') fieldErrors.email = error.message;
      setErrors(fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, props) => (
    <TextInput
      id={name}
      value={values[name]}
      error={errors[name]}
      disabled={submitting}
      onChange={setField(name)}
      {...props}
    />
  );

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Đăng ký tài khoản học viên để ghi danh khóa học.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <FormField label="Họ và tên" htmlFor="fullName" error={errors.fullName}>
            {field('fullName', { autoComplete: 'name', placeholder: 'Nguyễn Văn A' })}
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email}>
            {field('email', { type: 'email', autoComplete: 'email', placeholder: 'ban@example.com' })}
          </FormField>
          <FormField label="Mật khẩu" htmlFor="password" error={errors.password} hint="Tối thiểu 8 ký tự">
            {field('password', { type: 'password', autoComplete: 'new-password' })}
          </FormField>
          <FormField label="Nhập lại mật khẩu" htmlFor="confirmPassword" error={errors.confirmPassword}>
            {field('confirmPassword', { type: 'password', autoComplete: 'new-password' })}
          </FormField>
          <Button type="submit" loading={submitting} className="w-full">
            {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
