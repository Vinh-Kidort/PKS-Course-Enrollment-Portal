import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { Select } from '../../components/ui/FormField';
import ScrollTable from '../../components/ui/ScrollTable';
import Skeleton from '../../components/ui/Skeleton';
import { useAdminCourses, useCourseEnrollments } from '../../hooks/useAdmin';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ENROLLMENT_STATUS } from '../../lib/format';

export default function AdminEnrollmentsPage() {
  useDocumentTitle('Danh sách ghi danh');
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: courses = [] } = useAdminCourses(); // dùng cho ô chọn khóa học
  const { data, isLoading, isError, error, refetch, isFetching } = useCourseEnrollments(id);

  let content;
  if (isLoading) {
    content = (
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  } else if (isError) {
    const notFound = error.status === 404;
    content = (
      <ErrorState
        title={notFound ? 'Không tìm thấy khóa học' : 'Không tải được danh sách ghi danh'}
        message={error.message}
        onRetry={notFound ? undefined : refetch}
        retrying={isFetching}
      />
    );
  } else if (data.enrollments.length === 0) {
    content = (
      <EmptyState
        title="Chưa có học viên ghi danh"
        description={`Khóa học "${data.course.name}" hiện chưa có học viên nào ghi danh.`}
      />
    );
  } else {
    content = (
      <ScrollTable label="Bảng danh sách ghi danh">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Khóa học</th>
              <th className="px-4 py-3">Thời gian đăng ký</th>
              <th className="px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.enrollments.map((row, index) => {
              const status = ENROLLMENT_STATUS[row.status] ?? { label: row.status, tone: 'gray' };
              return (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{row.fullName}</td>
                  <td className="whitespace-nowrap px-4 py-3">{row.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{row.courseName}</td>
                  <td className="whitespace-nowrap px-4 py-3">{row.enrolledAtTime}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollTable>
    );
  }

  return (
    <section>
      <div className="mb-2">
        <Link to="/admin/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          &larr; Quản lý khóa học
        </Link>
      </div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Danh sách ghi danh</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.course.name} - ${data.total} học viên` : 'Chọn khóa học để xem học viên đã đăng ký.'}
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Select
            aria-label="Chọn khóa học"
            value={id}
            onChange={(event) => navigate(`/admin/courses/${event.target.value}/enrollments`)}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {content}
    </section>
  );
}
