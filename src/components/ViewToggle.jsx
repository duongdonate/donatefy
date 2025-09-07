import { useState } from "react";
import { Grid3X3, List } from "lucide-react";
import { motion } from "framer-motion";

const ViewToggle = ({ viewMode, onToggle }) => {
  const [toggleView, setToggleView] = useState(() => {
    return viewMode === "grid" ? true : false;
  });

  const handleToggleView = () => {
    onToggle();
    setToggleView((prev) => !prev);
  };

  return (
    <button
      onClick={handleToggleView}
      className="w-16 h-10 bg-background-hover rounded-lg flex items-center px-1 transition-colors"
    >
      <motion.div
        layout
        animate={{ x: toggleView ? 0 : 24 }} // ← phần này tạo animation
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-8 h-8 bg-background rounded-lg flex items-center justify-center shadow"
      >
        {toggleView ? <Grid3X3 size={16} /> : <List size={16} />}
      </motion.div>
    </button>
  );
};

export default ViewToggle;
