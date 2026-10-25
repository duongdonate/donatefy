// Menu ⋯ của playlist ở giữa dải bìa: Đổi tên / Xoá
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../../design";

export default function PlaylistMenu({ onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      root.current?.querySelector("button")?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = (Icon, text, fn) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpen(false);
        fn();
      }}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-1"
    >
      <Icon size={16} aria-hidden="true" /> {text}
    </button>
  );

  return (
    <div ref={root} className="relative">
      <IconButton
        label="Tuỳ chọn playlist"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="!text-[#eef3e6] hover:!bg-white/10"
      >
        <MoreHorizontal size={20} />
      </IconButton>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-30 mb-2 w-40 rounded-xl border border-white/15 bg-[rgba(10,16,9,.95)] p-1 text-[#eef3e6] shadow-xl"
        >
          {item(Pencil, "Đổi tên", onRename)}
          {item(Trash2, "Xoá", onDelete)}
        </div>
      )}
    </div>
  );
}
