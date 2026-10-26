// Cả app biết đang ở máy nào (DEVICE) và cỡ cửa sổ; đổi cỡ cửa sổ thì cập nhật
import { createContext, useContext, useEffect, useState } from "react";
import { deviceFromWidth } from "../utils/device";

const DeviceContext = createContext(null);

const readScreen = () => ({ width: window.innerWidth, height: window.innerHeight });

export function DeviceProvider({ children }) {
  // Lấy ngay lúc đầu để khỏi nháy sai bố cục
  const [screen, setScreen] = useState(readScreen);

  useEffect(() => {
    const onResize = () => setScreen(readScreen());
    // Nghe thêm 2 mốc thiết bị: vài trình duyệt (giả lập máy, xoay màn) đổi cỡ mà không bắn "resize"
    const queries = ["(min-width: 768px)", "(min-width: 1280px)"].map((q) => window.matchMedia(q));
    window.addEventListener("resize", onResize);
    queries.forEach((q) => q.addEventListener("change", onResize));
    return () => {
      window.removeEventListener("resize", onResize);
      queries.forEach((q) => q.removeEventListener("change", onResize));
    };
  }, []);

  const device = deviceFromWidth(screen.width);
  return <DeviceContext.Provider value={{ device, screen }}>{children}</DeviceContext.Provider>;
}

export const useDevice = () => useContext(DeviceContext).device;
// Dùng khi cần tính kích thước bằng JS (vd. cỡ đĩa)
export const useScreen = () => useContext(DeviceContext).screen;
