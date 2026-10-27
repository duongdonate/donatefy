// Một thông báo dạng viên kính (kiểu UndoBar cũ), có thể kèm một nút hành động
import { motion } from "framer-motion";
import Glass from "./Glass";
import { focusRing } from "./Button";

export default function Toast({ message, action, onAction }) {
  return (
    <motion.div
      // Chỉ transform + opacity (không layout, không spring): kính mờ đi kèm nên giữ chuyển động nhẹ cho khỏi khựng
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ willChange: "transform, opacity" }}
      className="pointer-events-auto"
    >
      <Glass className="flex items-center gap-5 rounded-full px-6 py-3.5 text-[15px] text-[#eef3e6] shadow-lg">
        <span className="max-w-[70vw] truncate sm:max-w-[40vw]">{message}</span>
        {action && (
          <button
            type="button"
            onClick={onAction}
            className={`shrink-0 whitespace-nowrap rounded-full px-2 font-bold text-matcha-1 hover:underline ${focusRing}`}
          >
            {action.label}
          </button>
        )}
      </Glass>
    </motion.div>
  );
}
