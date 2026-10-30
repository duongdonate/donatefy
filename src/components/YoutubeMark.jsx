// Logo YouTube (nền đỏ, tam giác trắng) để đánh dấu playlist nhập từ YouTube
export default function YoutubeMark({ size = 16, className = "" }) {
  return (
    <svg viewBox="0 0 28 20" width={size} height={(size * 20) / 28} aria-hidden="true" className={className}>
      <rect width="28" height="20" rx="5" fill="#FF0000" />
      <path d="M11 5.5v9l8-4.5z" fill="#fff" />
    </svg>
  );
}

// Nhãn "YouTube" đặt ở góc bìa playlist nhập
export function YoutubeTag({ className = "" }) {
  return (
    <span
      className={`pointer-events-none absolute flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-bold leading-none text-white backdrop-blur-sm ${className}`}
    >
      <YoutubeMark size={14} /> YouTube
    </span>
  );
}
