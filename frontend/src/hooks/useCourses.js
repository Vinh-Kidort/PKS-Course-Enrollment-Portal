import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { courseApi } from '../api/courses';

// filters = { search, category }
export const useCourses = (filters) =>
  useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseApi.list(filters),
    placeholderData: keepPreviousData, // giữ danh sách cũ trong lúc tải kết quả lọc mới, không bị nháy
  });

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: courseApi.categories,
    staleTime: 5 * 60_000,
  });

// userId nằm trong key vì kết quả (isEnrolled) phụ thuộc người đang đăng nhập
export const useCourse = (id, { userId, enabled = true } = {}) =>
  useQuery({
    queryKey: ['course', id, userId ?? 'guest'],
    queryFn: () => courseApi.detail(id),
    enabled,
  });
