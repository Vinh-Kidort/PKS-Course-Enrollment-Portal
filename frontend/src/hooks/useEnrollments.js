import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { enrollmentApi } from '../api/enrollments';

export const useMyEnrollments = () =>
  useQuery({
    queryKey: ['my-enrollments'],
    queryFn: enrollmentApi.mine,
  });

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => enrollmentApi.enroll(courseId),
    onSuccess: () => toast.success('Ghi danh thành công!'),
    onError: (error) => toast.error(error.message), // ALREADY_ENROLLED, COURSE_FULL... dùng thông báo từ server
    // Thành công hay thất bại đều tải lại để số chỗ và trạng thái luôn đúng
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
    },
  });
}
