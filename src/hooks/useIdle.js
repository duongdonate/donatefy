import { useEffect, useState } from "react";

const EVENTS = ["mousemove", "pointerdown", "keydown", "touchstart", "wheel", "focusin"];

// true khi người dùng đứng yên `timeout` ms; `hold` giữ trạng thái "đang dùng"
export default function useIdle(timeout = 2500, { hold = false } = {}) {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer;
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      if (!hold) timer = setTimeout(() => setIdle(true), timeout);
    };
    wake();
    EVENTS.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => {
      clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [timeout, hold]);

  return idle;
}
