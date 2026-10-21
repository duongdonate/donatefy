// Khung v2: nền quán + header/rail tự ẩn khi đứng yên; `right` (thanh kính C) luôn hiện
import { useState } from "react";
import useIdle from "../hooks/useIdle";
import Header from "./Header";
import Rail from "./Rail";

const chrome = "transition duration-400 ease-matcha motion-reduce:transition-none";

export default function AppShell({ children, right }) {
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const idle = useIdle(2500, { hold: hover || focusIn });

  // Giữ header/rail khi chuột đang ở trên hoặc focus bàn phím đang ở bên trong
  // (bấm chuột cũng để lại focus trên nút, nếu tính thì header không bao giờ ẩn)
  const holdProps = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: (e) => setFocusIn(e.target.matches(":focus-visible")),
    onBlur: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setFocusIn(false);
    },
  };

  return (
    <div className="bg-cafe relative isolate h-screen w-screen overflow-hidden text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[27%] top-[10%] h-[46vw] w-[46vw] rounded-full bg-matcha-2 opacity-45 blur-[8vw]" />
        <div className="absolute -left-[4%] top-[4%] h-[24vw] w-[24vw] rounded-full bg-[#f2c9c9] opacity-40 blur-[8vw] dark:opacity-10" />
        <div className="absolute -right-[6%] top-[24%] h-[26vw] w-[26vw] rounded-full bg-matcha-1 opacity-60 blur-[8vw] dark:opacity-25" />
      </div>

      <div
        {...holdProps}
        className={`absolute inset-x-6 top-4 z-20 ${chrome} ${idle ? "-translate-y-[160%] opacity-0" : ""}`}
      >
        <Header />
      </div>
      <div
        {...holdProps}
        className={`absolute left-4 top-28 z-20 ${chrome} ${idle ? "-translate-x-[180%] opacity-0" : ""}`}
      >
        <Rail />
      </div>

      <main className="relative h-full w-full">{children}</main>
      {right && <div className="absolute right-4 top-28 z-20">{right}</div>}
    </div>
  );
}
