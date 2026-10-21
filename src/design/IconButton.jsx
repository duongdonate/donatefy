import { focusRing } from "./Button";

export default function IconButton({ label, pressed, size = 40, className = "", style, type = "button", children, ...props }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={`inline-grid shrink-0 place-items-center rounded-full transition duration-200 ease-matcha active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
        pressed ? "bg-white/55 text-matcha-4 dark:bg-white/10 dark:text-matcha-1" : "text-ink hover:bg-white/55 dark:hover:bg-white/10"
      } ${focusRing} ${className}`}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
