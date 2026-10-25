// Menu ⋯ của playlist ở giữa dải bìa: Đổi tên / Xoá
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../../design";

export default function PlaylistMenu({
  onRename,
  onDelete,
  editLabel = "Đổi tên",
  label = "Tuỳ chọn playlist",
  size,
  triggerClass = "!text-[#eef3e6] hover:!bg-white/10",
  menuClass = "bottom-full right-0 mb-2",
  flipClass, // nếu có: dùng khi dưới nút không đủ chỗ trong khung cuộn
}) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const [flip, setFlip] = useState(false);

  const toggle = () => {
    if (!open && flipClass) {
      let box = root.current.parentElement;
      while (box && !/(auto|scroll|hidden|clip)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
      const limit = Math.min(box ? box.getBoundingClientRect().bottom : Infinity, window.innerHeight);
      setFlip(root.current.getBoundingClientRect().bottom + 112 > limit);
    }
    setOpen(!open);
  };

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

  const item = (Icon, text, fn, danger) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpen(false);
        fn();
      }}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-1 ${danger ? "hover:bg-red-600 focus-visible:bg-red-600" : "hover:bg-white/10"}`}
    >
      <Icon size={16} aria-hidden="true" /> {text}
    </button>
  );

  return (
    <div ref={root} className="relative">
      <IconButton
        label={label}
        size={size}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={triggerClass}
      >
        <MoreHorizontal size={20} />
      </IconButton>
      {open && (
        <div
          role="menu"
          className={`absolute z-30 w-40 ${flip ? flipClass : menuClass} rounded-xl border border-white/15 bg-[rgba(10,16,9,.95)] p-1 text-[#eef3e6] shadow-xl`}
        >
          {item(Pencil, editLabel, onRename)}
          {item(Trash2, "Xoá", onDelete, true)}
        </div>
      )}
    </div>
  );
}
