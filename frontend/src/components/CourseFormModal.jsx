import { useState } from 'react';
import { useCreateCourse, useUpdateCourse } from '../hooks/useAdmin';
import { useCategories } from '../hooks/useCourses';
import { getFieldErrors } from '../lib/apiError';
import Button from './ui/Button';
import { FormField, TextArea, TextInput } from './ui/FormField';
import Modal from './ui/Modal';

const EMPTY = {
  name: '',
  category: '',
  instructor: '',
  shortDescription: '',
  description: '',
  tuitionFee: '',
  capacity: '',
};

function validate(values, course) {
  const errors = {};
  if (values.name.trim().length < 3) errors.name = 'Tên khóa học tối thiểu 3 ký tự';
  if (!values.category.trim()) errors.category = 'Vui lòng nhập danh mục';
  if (values.instructor.trim().length < 2) errors.instructor = 'Vui lòng nhập tên giảng viên';
  if (!values.shortDescription.trim()) errors.shortDescription = 'Vui lòng nhập mô tả ngắn';
  if (!values.description.trim()) errors.description = 'Vui lòng nhập mô tả chi tiết';

  const fee = Number(values.tuitionFee);
  if (values.tuitionFee === '' || !Number.isInteger(fee) || fee < 0) {
    errors.tuitionFee = 'Học phí phải là số nguyên không âm';
  }

  const capacity = Number(values.capacity);
  if (values.capacity === '' || !Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = 'Sĩ số tối đa phải là số nguyên từ 1 trở lên';
  } else if (course && capacity < course.enrolledCount) {
    errors.capacity = `Không được thấp hơn số học viên đã ghi danh (${course.enrolledCount})`;
  }
  return errors;
}

// Form nằm trong component riêng để state được reset mỗi khi mở lại modal
function CourseForm({ course, onDone, onCancel }) {
  const isEdit = Boolean(course);
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const pending = createMutation.isPending || updateMutation.isPending;

  const [values, setValues] = useState(() =>
    course
      ? {
          name: course.name,
          category: course.category,
          instructor: course.instructor,
          shortDescription: course.shortDescription,
          description: course.description,
          tuitionFee: String(course.tuitionFee),
          capacity: String(course.capacity),
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState({});

  const bind = (field) => ({
    id: `course-${field}`,
    value: values[field],
    error: errors[field],
    disabled: pending,
    onChange: (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values, course);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      name: values.name.trim(),
      category: values.category.trim(),
      instructor: values.instructor.trim(),
      shortDescription: values.shortDescription.trim(),
      description: values.description.trim(),
      tuitionFee: Number(values.tuitionFee),
      capacity: Number(values.capacity),
    };
    const options = {
      onSuccess: onDone,
      onError: (error) => setErrors(getFieldErrors(error)), // hiện lỗi validation của server dưới từng ô
    };

    if (isEdit) updateMutation.mutate({ id: course.id, data: payload }, options);
    else createMutation.mutate(payload, options);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField label="Tên khóa học" htmlFor="course-name" error={errors.name}>
        <TextInput {...bind('name')} placeholder="VD: ReactJS Co-op Thực chiến" />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Danh mục" htmlFor="course-category" error={errors.category}>
          <TextInput {...bind('category')} list="category-options" placeholder="VD: Lập trình Web" />
          <datalist id="category-options">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </FormField>
        <FormField label="Giảng viên" htmlFor="course-instructor" error={errors.instructor}>
          <TextInput {...bind('instructor')} />
        </FormField>
      </div>

      <FormField label="Mô tả ngắn" htmlFor="course-shortDescription" error={errors.shortDescription}>
        <TextInput {...bind('shortDescription')} maxLength={255} />
      </FormField>

      <FormField label="Mô tả chi tiết" htmlFor="course-description" error={errors.description}>
        <TextArea {...bind('description')} rows={4} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Học phí (VND)" htmlFor="course-tuitionFee" error={errors.tuitionFee}>
          <TextInput {...bind('tuitionFee')} type="number" min="0" step="1" inputMode="numeric" />
        </FormField>
        <FormField
          label="Sĩ số tối đa"
          htmlFor="course-capacity"
          error={errors.capacity}
          hint={isEdit ? `Hiện có ${course.enrolledCount} học viên đã ghi danh` : undefined}
        >
          <TextInput {...bind('capacity')} type="number" min="1" step="1" inputMode="numeric" />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={pending}>
          Hủy
        </Button>
        <Button type="submit" loading={pending}>
          {isEdit ? 'Lưu thay đổi' : 'Tạo khóa học'}
        </Button>
      </div>
    </form>
  );
}

export default function CourseFormModal({ open, course, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={course ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}>
      <CourseForm course={course} onDone={onClose} onCancel={onClose} />
    </Modal>
  );
}
