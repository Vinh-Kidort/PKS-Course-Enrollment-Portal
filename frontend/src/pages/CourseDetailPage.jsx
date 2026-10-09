import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ErrorState from '../components/ui/ErrorState';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useCourse } from '../hooks/useCourses';
import { useEnroll } from '../hooks/useEnrollments';
import { formatCurrency } from '../lib/format';

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]" aria-hidden="true">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Đợi xác thực xong mới gọi API để nhận đúng isEnrolled của người đang đăng nhập
  const {
    data: course,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCourse(id, { userId: user?.id, enabled: !authLoading });
  const enroll = useEnroll();

  const backLink = (
    <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
      &larr; Tất cả khóa học
    </Link>
  );

  if (authLoading || isLoading) {
    return (
      <div>
        <div className="mb-6">{backLink}</div>
        <DetailSkeleton />
      </div>
    );
  }

  if (isError) {
    const notFound = error.status === 404;
    return (
      <div>
        <div className="mb-6">{backLink}</div>
        <ErrorState
          title={notFound ? 'Không tìm thấy khóa học' : 'Không tải được khóa học'}
          message={notFound ? 'Khóa học này không tồn tại hoặc đã bị ẩn.' : error.message}
          onRetry={notFound ? undefined : refetch}
          retrying={isFetching}
        />
      </div>
    );
  }

  const isFull = course.status === 'FULL';
  const isAdmin = user?.role === 'ADMIN';
  const percent = Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100));

  const handleEnroll = () => {
    if (!user) {
      // Chưa đăng nhập: chuyển tới Login, đăng nhập xong sẽ quay lại đúng trang này
      toast.info('Vui lòng đăng nhập để ghi danh');
      navigate('/login', { state: { from: location } });
      return;
    }
    enroll.mutate(course.id);
  };

  let action;
  if (isAdmin) {
    action = (
      <Button disabled className="w-full">
        Tài khoản quản trị không thể ghi danh
      </Button>
    );
  } else if (course.isEnrolled) {
    action = (
      <Button disabled variant="secondary" className="w-full">
        ✓ Bạn đã ghi danh khóa học này
      </Button>
    );
  } else if (isFull) {
    action = (
      <Button disabled className="w-full">
        Khóa học đã hết chỗ
      </Button>
    );
  } else {
    action = (
      <Button className="w-full" loading={enroll.isPending} onClick={handleEnroll}>
        {enroll.isPending ? 'Đang xử lý...' : user ? 'Ghi danh ngay' : 'Đăng nhập để ghi danh'}
      </Button>
    );
  }

  return (
    <div>
      <div className="mb-6">{backLink}</div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo">{course.category}</Badge>
            <Badge tone={isFull ? 'red' : 'green'}>{isFull ? 'Hết chỗ' : 'Còn chỗ'}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{course.name}</h1>
          <p className="mt-2 text-slate-500">Giảng viên: {course.instructor}</p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Giới thiệu khóa học</h2>
          <p className="mt-2 font-medium text-slate-700">{course.shortDescription}</p>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{course.description}</p>
        </article>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-24">
          <p className="text-sm text-slate-500">Học phí</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(course.tuitionFee)}</p>

          <div className="mt-5">
            <div className="mb-1 flex justify-between text-sm text-slate-600">
              <span>Đã ghi danh</span>
              <span>
                {course.enrolledCount}/{course.capacity}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {isFull ? 'Khóa học đã đủ học viên' : `Còn ${course.availableSeats} chỗ trống`}
            </p>
          </div>

          <div className="mt-6">{action}</div>
        </aside>
      </div>
    </div>
  );
}
