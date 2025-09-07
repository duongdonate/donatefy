import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// 👉 import SVG theo dạng ReactComponent (nếu ông dùng CRA/Vite với svgr)
import Cup from "../../assets/cup.svg?react";
import Chasen from "../../assets/chasen.svg?react";

export default function MatchaLoader({ size = 64 }) {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      {/* Cup */}
      <div className="z-5 w-20 h-20">
        <Cup className="w-full h-full" />
      </div>

      {/* Chasen đánh whisk */}
      <motion.div
        className="absolute z-10 w-20 h-20"
        animate={{
          x: [
            10, 12, 8, 4, 0, -6, -12, -18, -24, -28, -26, -20, -14, -8, -2, 0,
            4, 8, 10,
          ],
          y: [
            -10, -2, 8, 18, 26, 30, 32, 32, 30, 28, 22, 12, 4, -4, -10, -12,
            -12, -11, -10,
          ],
          rotateZ: [
            0, 1, 2, 3, 5, 7, 9, 10, 8, 6, 3, 1, -1, -3, -4, -2, -2, -1, 0,
          ],
        }}
        style={{
          transformOrigin: "50% 50%", // đặt gốc xoay tại tâm
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        }}
      >
        <Chasen className="w-full h-full" />
      </motion.div>
    </div>
  );
}

// x: [10, 12, 0, -10, -20, -28, -28, -10, 0, 10], // mô phỏng cos
// y: [-10, 8, 28, 32, 32, 28, 0, -15, -10, -10], // mô phỏng sin
// rotateZ: [0, 0, 2, 5, 10, 2, -5, 0, 2, 0], // mô phỏng xoay
