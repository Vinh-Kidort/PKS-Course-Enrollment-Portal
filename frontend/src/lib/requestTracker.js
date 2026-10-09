// Theo dõi các request đang chờ để báo "máy chủ đang khởi động" khi chờ quá lâu
// (Render gói miễn phí cần khoảng 1 phút để thức dậy sau khi ngủ)
const SLOW_AFTER_MS = 4000;

const timers = new Map(); // id -> timer
const slowIds = new Set();
const listeners = new Set();
let nextId = 0;

const emit = () => listeners.forEach((listener) => listener());

export const requestTracker = {
  start() {
    const id = nextId++;
    timers.set(
      id,
      setTimeout(() => {
        slowIds.add(id);
        emit();
      }, SLOW_AFTER_MS),
    );
    return id;
  },
  finish(id) {
    if (id === undefined) return;
    clearTimeout(timers.get(id));
    timers.delete(id);
    if (slowIds.delete(id)) emit();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  isSlow: () => slowIds.size > 0,
};
