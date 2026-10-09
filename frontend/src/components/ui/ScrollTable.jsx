// Khung bọc bảng có thanh cuộn ngang trên mobile. role/tabIndex giúp người dùng bàn phím cuộn được.
export default function ScrollTable({ label, children }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      {children}
    </div>
  );
}
