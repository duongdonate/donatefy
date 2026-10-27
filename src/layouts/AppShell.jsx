// Khung v2: nền quán + notch điều hướng dính mép trên, luôn hiện
import { useState } from "react";
import { useDevice } from "../contexts/DeviceContext";
import useTyping from "../hooks/useTyping";
import { DEVICE } from "../utils/device";
import Notch from "./Notch";

const chrome = "transition duration-400 ease-matcha motion-reduce:transition-none";

export default function AppShell({ children }) {
  const device = useDevice();
  const [notchOpen, setNotchOpen] = useState(false);
  // Mobile đang gõ: ẩn notch nhường chỗ cho bàn phím
  const hidden = useTyping();

  return (
    <div className="bg-cafe relative isolate h-dvh w-screen overflow-hidden text-ink">
      {device !== DEVICE.MOBILE && <Blobs />}

      <div className={`pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center ${chrome} ${hidden ? "-translate-y-[120%] opacity-0" : ""}`}>
        {/* không bắt chuột: notch chỉ bật bắt chuột ở phần đang thấy (khung mở rộng to hơn phần thu gọn) */}
        <Notch open={notchOpen} onOpenChange={setNotchOpen} />
      </div>

      <main className="relative h-full w-full">{children}</main>
    </div>
  );
}

// Đốm màu mờ trang trí (ẩn ở mobile cho gọn)
function Blobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute left-[27%] top-[10%] h-[46vw] w-[46vw] rounded-full bg-matcha-2 opacity-45 blur-[8vw]" />
      <div className="absolute -left-[4%] top-[4%] h-[24vw] w-[24vw] rounded-full bg-[#f2c9c9] opacity-40 blur-[8vw] dark:opacity-10" />
      <div className="absolute -right-[6%] top-[24%] h-[26vw] w-[26vw] rounded-full bg-matcha-1 opacity-60 blur-[8vw] dark:opacity-25" />
    </div>
  );
}
