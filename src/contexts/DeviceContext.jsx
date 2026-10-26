// Cả app biết đang ở máy nào (DEVICE) và cỡ cửa sổ; đổi cỡ cửa sổ thì cập nhật
import { createContext, useContext, useEffect, useState } from "react";
import { deviceFromWidth, keyboardInset } from "../utils/device";

const DeviceContext = createContext(null);

// keyboard: phần đáy bị bàn phím che (iOS không co innerHeight, chỉ visualViewport nhỏ lại)
const readScreen = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  keyboard: keyboardInset(window.innerHeight, window.visualViewport),
});

export function DeviceProvider({ children }) {
  // Lấy ngay lúc đầu để khỏi nháy sai bố cục
  const [screen, setScreen] = useState(readScreen);

  useEffect(() => {
    // Giữ object cũ khi số đo không đổi để các component khỏi render lại vô ích
    const onResize = () =>
      setScreen((prev) => {
        const next = readScreen();
        const same = prev.width === next.width && prev.height === next.height && prev.keyboard === next.keyboard;
        return same ? prev : next;
      });
    // Nghe thêm 2 mốc thiết bị: vài trình duyệt (giả lập máy, xoay màn) đổi cỡ mà không bắn "resize"
    const queries = ["(min-width: 768px)", "(min-width: 1280px)"].map((q) => window.matchMedia(q));
    const vv = window.visualViewport;
    window.addEventListener("resize", onResize);
    queries.forEach((q) => q.addEventListener("change", onResize));
    vv?.addEventListener("resize", onResize);
    vv?.addEventListener("scroll", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      queries.forEach((q) => q.removeEventListener("change", onResize));
      vv?.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", onResize);
    };
  }, []);

  const device = deviceFromWidth(screen.width);
  return <DeviceContext.Provider value={{ device, screen }}>{children}</DeviceContext.Provider>;
}

export const useDevice = () => useContext(DeviceContext).device;
// Dùng khi cần tính kích thước bằng JS (vd. cỡ đĩa)
export const useScreen = () => useContext(DeviceContext).screen;
