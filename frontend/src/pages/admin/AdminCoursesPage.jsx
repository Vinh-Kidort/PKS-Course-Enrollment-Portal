import { useState } from 'react';
import { Link } from 'react-router-dom';
import CourseFormModal from '../../components/CourseFormModal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ScrollTable from '../../components/ui/ScrollTable';
import Skeleton from '../../components/ui/Skeleton';
import { useAdminCourses, useDeleteCourse, useSetCourseVisibility } from '../../hooks/useAdmin';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatCurrency } from '../../lib/format';

export default function AdminCoursesPage() {
  useDocumentTitle('Quản lý khóa học');
  const { data: courses, isLoading, isError, error, refetch, isFetching } = useAdminCourses();
  const visibility = useSetCourseVisibility();
  const remove = useDeleteCourse();

  const [formState, setFormState] = useState({ open: false, course: null });
  const [courseToDelete, setCourseToDelete] = useState(null);

  const openCreate = () => setFormState({ open: true, course: null });
  const closeForm = () => setFormState({ open: false, course: null });

  let content;
  if (isLoading) {
    content = (
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  } else if (isError) {
    content = <ErrorState message={error.message} onRetry={refetch} retrying={isFetching} />;
  } else if (courses.length === 0) {
    content = (
      <EmptyState
        title="Chưa có khóa học nào"
        description="Tạo khóa học đầu tiên để học viên có thể ghi danh."
        action={<Button onClick={openCreate}>Thêm khóa học</Button>}
      />
    );
  } else {
    content = (
      <ScrollTable label="Bảng danh sách khóa học">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Khóa học</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Học phí</th>
              <th className="px-4 py-3">Sĩ số</th>
              <th className="px-4 py-3">Hiển thị</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => {
              const togglingThis = visibility.isPending && visibility.variables?.id === course.id;
              return (
                <tr key={course.id} className={course.isHidden ? 'bg-slate-50/60 text-slate-500' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{course.name}</p>
                    <p className="text-xs text-slate-500">{course.instructor}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{course.category}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatCurrency(course.tuitionFee)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {course.enrolledCount}/{course.capacity}
                    {course.status === 'FULL' && (
                      <span className="ml-2">
                        <Badge tone="red">Đầy</Badge>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={course.isHidden ? 'gray' : 'green'}>{course.isHidden ? 'Đang ẩn' : 'Hiển thị'}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        to={`/admin/courses/${course.id}/enrollments`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50"
                      >
                        Ghi danh
                      </Link>
                      <Button variant="secondary" size="sm" onClick={() => setFormState({ open: true, course })}>
                        Sửa
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={togglingThis}
                        onClick={() => visibility.mutate({ id: course.id, isHidden: !course.isHidden })}
                      >
                        {course.isHidden ? 'Hiện' : 'Ẩn'}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setCourseToDelete(course)}>
                        Xóa
                      </Button>
                    </div>
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý khóa học</h1>
          <p className="mt-1 text-sm text-slate-500">Thêm, chỉnh sửa, ẩn hoặc xóa khóa học và cấu hình sĩ số.</p>
        </div>
        <Button onClick={openCreate}>+ Thêm khóa học</Button>
      </div>

      {content}

      <CourseFormModal open={formState.open} course={formState.course} onClose={closeForm} />

      <ConfirmDialog
        open={Boolean(courseToDelete)}
        title="Xóa khóa học"
        message={`Bạn có chắc muốn xóa khóa học "${courseToDelete?.name}"? Khóa học đã có học viên ghi danh sẽ không xóa được, khi đó hãy dùng chức năng Ẩn.`}
        confirmLabel="Xóa khóa học"
        loading={remove.isPending}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={() => remove.mutate(courseToDelete.id, { onSettled: () => setCourseToDelete(null) })}
      />
    </section>
  );
}
