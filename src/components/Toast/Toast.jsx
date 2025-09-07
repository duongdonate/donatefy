// components/Toast/Toast.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./Toast.module.css";
import { X, CircleCheck } from "lucide-react";

export default function Toast({ id, message, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onRemove(id);
          return 0;
        }
        return prev - 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="toast-success"
      className="flex items-center w-full max-w-sm p-3 mb-4 overflow-hidden text-gray-500 bg-white rounded-lg shadow-xl dark:text-gray-400 dark:bg-gray-800 gap-1.5 relative"
      role="alert"
    >
      <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
        <CircleCheck size={16} color="#58fc1d" aria-hidden="true" />
        <span className="sr-only">Check icon</span>
      </div>
      <span className="ms-3 text-sm font-normal whitespace-nowrap">
        {message}
      </span>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        data-dismiss-target="#toast-success"
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X size={16} onClick={() => onRemove(id)} />
      </button>
      <div className={styles.progress} style={{ width: `${progress}%` }} />
    </motion.div>
  );
}
