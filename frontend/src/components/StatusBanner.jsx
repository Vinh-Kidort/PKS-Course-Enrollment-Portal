import { useOnlineStatus, useServerSlow } from '../hooks/useNetworkStatus';
import Spinner from './ui/Spinner';

// Thanh thông báo trạng thái mạng. Không hiện gì khi mọi thứ bình thường.
export default function StatusBanner() {
  const online = useOnlineStatus();
  const serverSlow = useServerSlow();

  if (!online) {
    return (
      <div role="alert" className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
        Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng.
      </div>
    );
  }

  if (serverSlow) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white"
      >
        <Spinner className="h-4 w-4 shrink-0" />
        <span>Máy chủ đang khởi động, có thể mất khoảng 1 phút. Vui lòng chờ...</span>
      </div>
    );
  }

  return null;
}
