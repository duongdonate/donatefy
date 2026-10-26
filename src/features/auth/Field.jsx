// Một ô trong form đăng nhập / đăng ký: nhãn ẩn, ô nhập, gợi ý hoặc lỗi bên dưới
import { useDevice } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";

// Mobile chữ 16px để iOS không tự phóng to trang khi chạm vào ô
const FONT = { [DEVICE.MOBILE]: "text-base", [DEVICE.TABLET]: "text-[15px]", [DEVICE.DESKTOP]: "text-[15px]" };

const inputCls = (bad, font) =>
  `h-[50px] w-full rounded-[14px] border bg-white/55 px-4 ${font} text-[#1f2e17] placeholder:text-[#55624c]/70 outline-none transition duration-200 focus:bg-white/80 ${
    bad
      ? "border-[#b3261e] shadow-[0_0_0_4px_rgba(179,38,30,.12)]"
      : "border-white/70 focus:border-matcha-3 focus:shadow-[0_0_0_4px_rgba(104,142,49,.18)]"
  }`;

export default function Field({ id, label, error, hint, children }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-semibold text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ id, error, hint, className = "", ...props }) {
  const font = FONT[useDevice()];
  return (
    <input
      id={id}
      {...props}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={className ? `${inputCls(error, font)} ${className}` : inputCls(error, font)}
    />
  );
}
