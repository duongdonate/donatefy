// src/components/ThemeToggle.jsx
import { useTheme } from "../../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { memo } from "react";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-14 h-8 bg-background-hover rounded-full flex items-center px-1 transition-colors"
    >
      <motion.div
        layout
        animate={{ x: isDark ? 24 : 0 }} // ← phần này tạo animation
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-6 h-6 bg-background rounded-full flex items-center justify-center shadow"
      >
        {!isDark ? (
          <Sun size={16} className="text-yellow-500" />
        ) : (
          <Moon size={16} className="text-blue-600" />
        )}
      </motion.div>
    </button>
  );
};

export default memo(ThemeToggle);
