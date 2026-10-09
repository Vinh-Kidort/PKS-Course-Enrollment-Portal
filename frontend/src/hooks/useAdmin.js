import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../api/admin';

export const useAdminCourses = () =>
  useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: adminApi.listCourses,
  });

export const useCourseEnrollments = (courseId) =>
  useQuery({
    queryKey: ['admin', 'enrollments', courseId],
    queryFn: () => adminApi.courseEnrollments(courseId),
  });

// Admin đổi dữ liệu khóa học -> làm mới cả phía admin lẫn phía học viên
function useInvalidateCourses() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin'] }),
      queryClient.invalidateQueries({ queryKey: ['courses'] }),
      queryClient.invalidateQueries({ queryKey: ['course'] }),
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
    ]);
}

export function useCreateCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: adminApi.createCourse,
    onSuccess: () => {
      toast.success('Tạo khóa học thành công');
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.updateCourse(id, data),
    onSuccess: () => {
      toast.success('Cập nhật khóa học thành công');
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSetCourseVisibility() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: ({ id, isHidden }) => adminApi.setVisibility(id, isHidden),
    onSuccess: (course) => {
      toast.success(course.isHidden ? 'Đã ẩn khóa học' : 'Đã hiển thị khóa học');
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteCourse() {
  const invalidate = useInvalidateCourses();
  return useMutation({
    mutationFn: adminApi.deleteCourse,
    onSuccess: () => {
      toast.success('Đã xóa khóa học');
      invalidate();
    },
    onError: (error) => toast.error(error.message), // 409: khóa học đã có học viên, hãy ẩn thay vì xóa
  });
}
