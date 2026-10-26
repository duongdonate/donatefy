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
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const device = deviceFromWidth(screen.width);
  return <DeviceContext.Provider value={{ device, screen }}>{children}</DeviceContext.Provider>;
}

export const useDevice = () => useContext(DeviceContext).device;
// Dùng khi cần tính kích thước bằng JS (vd. cỡ đĩa)
export const useScreen = () => useContext(DeviceContext).screen;
