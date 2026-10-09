import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Skeleton from '../components/ui/Skeleton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMyEnrollments } from '../hooks/useEnrollments';
import { ENROLLMENT_STATUS, formatCurrency } from '../lib/format';

export default function MyCoursesPage() {
  useDocumentTitle('Khóa học của tôi');
  const { data: enrollments, isLoading, isError, error, refetch, isFetching } = useMyEnrollments();

  let content;
  if (isLoading) {
    content = (
      <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-2xl" />
        ))}
      </div>
    );
  } else if (isError) {
    content = <ErrorState message={error.message} onRetry={refetch} retrying={isFetching} />;
  } else if (enrollments.length === 0) {
    content = (
      <EmptyState
        title="Bạn chưa ghi danh khóa học nào"
        description="Hãy khám phá danh sách khóa học và ghi danh khóa học đầu tiên của bạn."
        action={
          <Link to="/" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Xem danh sách khóa học
          </Link>
        }
      />
    );
  } else {
    content = (
      <ul className="grid gap-4 sm:grid-cols-2">
        {enrollments.map((enrollment) => {
          const status = ENROLLMENT_STATUS[enrollment.status] ?? { label: enrollment.status, tone: 'gray' };
          return (
            <li key={enrollment.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="indigo">{enrollment.course.category}</Badge>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">
                <Link to={`/courses/${enrollment.course.id}`} className="hover:text-indigo-600">
                  {enrollment.course.name}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-slate-500">Giảng viên: {enrollment.course.instructor}</p>
              <dl className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-sm">
                <div>
                  <dt className="text-slate-500">Ngày ghi danh</dt>
                  <dd className="font-medium text-slate-900">{enrollment.enrolledAt}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-slate-500">Học phí</dt>
                  <dd className="font-medium text-slate-900">{formatCurrency(enrollment.course.tuitionFee)}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-900">Khóa học của tôi</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Các khóa học bạn đã ghi danh.</p>
      {content}
    </section>
  );
}
