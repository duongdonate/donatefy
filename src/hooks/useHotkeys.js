import { useEffect, useRef } from "react";
import { hotkeyAction } from "../features/player/playerMath";

// Phím tắt toàn cục của trình phát; handlers = { toggle, back5, fwd5, previous, next, mute, queue }
export default function useHotkeys(handlers) {
  const ref = useRef(handlers);
  ref.current = handlers; // luôn gọi bản mới nhất mà không gắn lại listener
  useEffect(() => {
    const onKey = (e) => {
      const fn = ref.current[hotkeyAction(e)];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
