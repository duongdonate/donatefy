// true khi đang gõ trên mobile (focus nằm trong ô nhập): để ẩn tạm notch nhường chỗ cho bàn phím.
// Khi vừa focus vào ô thì cuộn ô đó ra giữa vùng còn thấy, đợi bàn phím mở xong.
import { useEffect, useState } from "react";
import { useDevice } from "../contexts/DeviceContext";
import { DEVICE } from "../utils/device";

const NOT_TEXT = ["checkbox", "radio", "range", "file", "button", "submit", "color"];
const KEYBOARD_OPEN_MS = 300;

function isTextField(el) {
  if (!el) return false;
  if (el.isContentEditable || el.tagName === "TEXTAREA") return true;
  return el.tagName === "INPUT" && !NOT_TEXT.includes(el.type);
}

export default function useTyping() {
  const mobile = useDevice() === DEVICE.MOBILE;
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!mobile) return setTyping(false);
    let timer;
    const onIn = (e) => {
      if (!isTextField(e.target)) return;
      setTyping(true);
      clearTimeout(timer);
      timer = setTimeout(() => e.target.scrollIntoView?.({ block: "center" }), KEYBOARD_OPEN_MS);
    };
    // focusout rồi focusin sang ô khác ngay: kiểm lại phần tử đang focus thay vì tắt luôn
    const onOut = () => setTimeout(() => setTyping(isTextField(document.activeElement)), 0);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    setTyping(isTextField(document.activeElement));
    return () => {
      clearTimeout(timer);
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, [mobile]);

  return typing;
}
