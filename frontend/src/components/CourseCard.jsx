import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/format';
import Badge from './ui/Badge';
import Skeleton from './ui/Skeleton';

export default function CourseCard({ course }) {
  const isFull = course.status === 'FULL';
  const percent = Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100));

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge tone="indigo">{course.category}</Badge>
        <Badge tone={isFull ? 'red' : 'green'}>{isFull ? 'Hết chỗ' : 'Còn chỗ'}</Badge>
      </div>

      <h2 className="text-lg font-semibold leading-snug text-slate-900">{course.name}</h2>
      <p className="mt-1 text-sm text-slate-500">Giảng viên: {course.instructor}</p>
      <p className="mt-3 line-clamp-3 text-sm text-slate-600">{course.shortDescription}</p>

      <div className="mt-auto pt-5">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Sĩ số</span>
          <span>
            {course.enrolledCount}/{course.capacity} học viên
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label={`Sĩ số: ${course.enrolledCount}/${course.capacity} học viên`}
          aria-valuenow={course.enrolledCount}
          aria-valuemin={0}
          aria-valuemax={course.capacity}
        >
          <div className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-slate-900">{formatCurrency(course.tuitionFee)}</span>
          <Link
            to={`/courses/${course.id}`}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200" aria-hidden="true">
      <div className="mb-3 flex justify-between">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-6 h-1.5 w-full rounded-full" />
      <div className="mt-4 flex justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}
