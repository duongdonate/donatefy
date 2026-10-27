// PopupContext.jsx
import { createContext, useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Glass, IconButton } from "../components";

export const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    isOpen: false,
    content: null,
    bare: false,
    overlayClass: "",
  });
  const dismissRef = useRef(null);

  // onDismiss: gọi khi popup đóng (X, Esc, bấm ra nền); useConfirm coi là Hủy; trả false = chưa cho đóng (vd. đang gửi)
  // bare: nội dung tự vẽ khung (Glass, nút Đóng, bề ngang); overlayClass: cách đặt hộp trên nền (vd. tấm đáy ở mobile)
  const openPopup = useCallback((content, onDismiss = null, { bare = false, overlayClass = "grid place-items-center p-4" } = {}) => {
    dismissRef.current = onDismiss;
    setPopup({ isOpen: true, content, bare, overlayClass });
  }, []);

  const closePopup = useCallback(() => {
    if (dismissRef.current?.() === false) return;
    dismissRef.current = null;
    setPopup((p) => ({ ...p, isOpen: false, content: null }));
  }, []);

  useEffect(() => {
    if (!popup.isOpen) return;
    // Pha capture: menu playlist bên dưới chặn Esc ở document (stopPropagation)
    const onEsc = (e) => e.key === "Escape" && closePopup();
    window.addEventListener("keydown", onEsc, true);
    return () => window.removeEventListener("keydown", onEsc, true);
  }, [popup.isOpen, closePopup]);

  return (
    <PopupContext.Provider value={{ ...popup, openPopup, closePopup }}>
      {children}
      {/* 👇 PopupRoot được nhét ngay đây */}
      <AnimatePresence>
        {popup.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-50 bg-[rgba(5,8,4,.5)] ${popup.overlayClass}`}
            onMouseDown={(e) => e.target === e.currentTarget && closePopup()}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={popup.bare ? "flex max-h-full w-full flex-col items-center" : "w-full max-w-md"}
            >
              {popup.bare ? popup.content : <Glass
                role="dialog"
                aria-modal="true"
                blur={30}
                className="relative w-full rounded-[28px] !border-white/15 !bg-[rgba(40,48,36,.72)] p-6 text-[#eef3e6]"
              >
                {popup.content}
                <IconButton label="Đóng" onClick={closePopup} className="absolute right-3 top-3 !text-[#eef3e6] hover:!bg-white/10">
                  <X size={18} />
                </IconButton>
              </Glass>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PopupContext.Provider>
  );
};
