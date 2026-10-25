import { Glass } from "../../design";
import { focusRing } from "../../design/Button";

// Nổi phía trên Music Layer (AppShell chừa pb-28)
export default function UndoBar({ name, onUndo }) {
  return (
    <Glass
      role="status"
      className="fixed bottom-32 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full px-5 py-3 text-sm text-[#eef3e6]"
    >
      <span className="max-w-[40vw] truncate">{`Đã gỡ "${name}"`}</span>
      <button type="button" onClick={onUndo} className={`rounded-full px-2 font-bold text-matcha-1 hover:underline ${focusRing}`}>
        Hoàn tác
      </button>
    </Glass>
  );
}
