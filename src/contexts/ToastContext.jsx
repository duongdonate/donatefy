// Thông báo nổi giữa đáy màn hình, sát trên dock ở /listen, đè lên mọi lớp (z cao nhất app đang là 50)
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";

export const ToastContext = createContext(null);

const DURATION = 4000;
let seq = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // action: { label, onClick } → nút bên phải (vd. "Hoàn tác"); bấm xong toast tự đóng. Trả id để dismiss sớm.
  const showToast = useCallback(
    (message, { action, duration = DURATION } = {}) => {
      const id = ++seq;
      setToasts((prev) => [...prev, { id, message, action }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-1/2 right-0 z-[100] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              message={t.message}
              action={t.action}
              onAction={() => {
                t.action.onClick();
                dismiss(t.id);
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
