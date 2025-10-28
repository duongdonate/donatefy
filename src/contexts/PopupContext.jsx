// PopupContext.jsx
import { createContext, useState, useCallback } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({
    isOpen: false,
    content: null,
  });

  const openPopup = useCallback((content) => {
    setPopup({ isOpen: true, content });
  }, []);

  const closePopup = useCallback(() => {
    setPopup({ isOpen: false, content: null });
  }, []);

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
            className="fixed w-full h-full inset-0 flex items-center justify-center z-50 glass backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-screen-md max-h-screen bg-card rounded-xl p-10 shadow-xl relative"
            >
              {popup.content}
              <button
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-background-hover cursor-pointer"
                onClick={closePopup}
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PopupContext.Provider>
  );
};
