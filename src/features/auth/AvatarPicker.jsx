// Chọn ảnh đại diện lúc đăng ký: vòng tròn bấm hoặc Enter/Space để chọn, xem trước ngay
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AvatarPicker({ file, onChange, error, disabled }) {
  const input = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        disabled={disabled}
        aria-label={file ? "Đổi ảnh đại diện" : "Chọn ảnh đại diện"}
        aria-describedby={error ? "avatar-error" : undefined}
        onClick={() => input.current?.click()}
        className={`grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white/55 bg-cover bg-center text-matcha-4 transition duration-200 ease-matcha hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 focus-visible:ring-offset-2 ${
          preview ? "border-2 border-white" : "border-2 border-dashed border-matcha-4/45"
        } ${error ? "border-[#b3261e]" : ""}`}
        style={preview ? { backgroundImage: `url(${preview})` } : undefined}
      >
        {!preview && <Plus size={22} />}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/gif"
        hidden
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <span className="text-xs text-ink-soft">Ảnh đại diện, không bắt buộc</span>
      {error && (
        <span id="avatar-error" className="text-xs font-semibold text-[#b3261e]">
          {error}
        </span>
      )}
    </div>
  );
}
