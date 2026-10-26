// Đường kẻ "hoặc" giữa Google và form mật khẩu
export default function OrDivider() {
  return (
    <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-[.2em] text-ink-soft">
      <span className="h-px flex-1 bg-current opacity-25" />
      hoặc
      <span className="h-px flex-1 bg-current opacity-25" />
    </div>
  );
}
