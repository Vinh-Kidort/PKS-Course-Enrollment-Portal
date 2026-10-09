import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard, { CourseCardSkeleton } from '../components/CourseCard';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { Select, TextInput } from '../components/ui/FormField';
import { useCategories, useCourses } from '../hooks/useCourses';
import { useDebounce } from '../hooks/useDebounce';

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? '';
  const [searchInput, setSearchInput] = useState(params.get('q') ?? '');

  // Chỉ gọi API sau khi người dùng ngừng gõ 400ms (xóa trắng ô tìm kiếm thì áp dụng ngay)
  const trimmedInput = searchInput.trim();
  const search = useDebounce(trimmedInput, trimmedInput ? 400 : 0);

  // Lưu từ khóa lên URL để bấm Back từ trang chi tiết vẫn giữ nguyên kết quả tìm kiếm
  useEffect(() => {
    if ((params.get('q') ?? '') === search) return;
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (search) next.set('q', search);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  }, [search, params, setParams]);

  const updateCategory = (value) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set('category', value);
        else next.delete('category');
        return next;
      },
      { replace: true },
    );

  const clearFilters = () => {
    setSearchInput(''); // từ khóa trên URL sẽ tự được xóa theo
    updateCategory('');
  };

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: courses, isLoading, isError, error, refetch, isFetching, isPlaceholderData } = useCourses({
    search,
    category,
  });

  const hasFilters = Boolean(search || category);

  let content;
  if (isLoading) {
    content = (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <CourseCardSkeleton key={index} />
        ))}
      </div>
    );
  } else if (isError) {
    content = <ErrorState message={error.message} onRetry={refetch} retrying={isFetching} />;
  } else if (courses.length === 0) {
    content = hasFilters ? (
      <EmptyState
        title="Không tìm thấy khóa học phù hợp"
        description="Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc."
        action={
          <Button variant="secondary" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        }
      />
    ) : (
      <EmptyState title="Chưa có khóa học nào" description="Vui lòng quay lại sau." />
    );
  } else {
    content = (
      <div
        className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isPlaceholderData ? 'opacity-60' : ''}`}
        aria-busy={isPlaceholderData}
      >
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Khám phá khóa học công nghệ</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Tra cứu các khóa học thực chiến Co-op IT, tin học quốc tế MOS và giải pháp công nghệ, rồi ghi danh chỉ với vài
          bước.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_16rem]">
        <TextInput
          type="search"
          aria-label="Tìm kiếm theo tên khóa học"
          placeholder="Tìm kiếm theo tên khóa học..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          aria-label="Lọc theo danh mục"
          value={category}
          disabled={categoriesLoading}
          onChange={(event) => updateCategory(event.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </div>

      {content}
    </section>
  );
}
