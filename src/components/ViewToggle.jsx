import { Grid3X3, List } from "lucide-react";
import { motion } from "framer-motion";

const ViewToggle = ({ viewMode, onToggle }) => {
  const isGrid = viewMode === "grid";

  return (
    <button
      onClick={onToggle}
      aria-label={isGrid ? "Xem dạng danh sách" : "Xem dạng lưới"}
      className="w-16 h-10 bg-background-hover rounded-lg flex items-center px-1 transition-colors"
    >
      <motion.div
        layout
        animate={{ x: isGrid ? 0 : 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-8 h-8 bg-background rounded-lg flex items-center justify-center shadow"
      >
        {isGrid ? <Grid3X3 size={16} /> : <List size={16} />}
      </motion.div>
    </button>
  );
};

export default ViewToggle;
