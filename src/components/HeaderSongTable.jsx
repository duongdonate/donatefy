import { Clock8 } from "lucide-react";
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSticky from "../hooks/useSticky";

const HeaderSongTable = () => {
  const ref = useRef(null);
  const isSticky = useSticky(ref, 0);

  return (
    <div className="sticky top-0 z-10 transition-all" ref={ref}>
      <div className="flex items-center px-3 pt-2 space-x-4 cursor-pointer bg-card">
        {/* Index & Controll Play Pause*/}
        <div className="flex items-center justify-center p-4 relative">
          <strong className="text-card-foreground text-md">{"#"}</strong>
        </div>

        {/* Image Song */}
        <div className="flex-shrink-0 w-12 h-12 flex justify-center items-center">
          {"Title"}
        </div>

        {/* Info Song */}
        <div className="flex-shrink-0 w-2/5 overflow-hidden"></div>

        {/* Bonus Info */}
        <div className="flex-1 min-w-0 truncate">{"Created At"}</div>

        <div className="flex-1 flex min-w-0 justify-end items-center"></div>

        <div className="flex justify-start items-center space-x-3 w-16">
          <Clock8 size={24} className="text-card-foreground" />
        </div>
      </div>
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-16 left-0 right-0 h-20 w-full
              mask-to-t bg-card pointer-events-none"
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderSongTable;
