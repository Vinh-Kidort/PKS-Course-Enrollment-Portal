import { useEffect } from 'react';

const APP_NAME = 'PKS Course Portal';

// Mỗi trang một tiêu đề riêng: dễ nhận biết khi mở nhiều tab và tốt cho trợ năng
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);
}
