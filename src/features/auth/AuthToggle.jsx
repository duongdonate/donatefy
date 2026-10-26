// Dòng chuyển qua lại giữa đăng nhập và đăng ký, dùng chung cho hai form
export default function AuthToggle({ ask, go, to, busy, onToggle }) {
  return (
    <p className="mt-4 text-center text-sm text-ink-soft">
      {ask}{" "}
      <button
        type="button"
        disabled={busy}
        onClick={() => onToggle(to)}
        className="font-bold text-matcha-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 dark:text-matcha-1"
      >
        {go}
      </button>
    </p>
  );
}
