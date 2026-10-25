// Nút "Tiếp tục với Google" (Google Identity Services). Script lỗi / thiếu client id → không render gì.
import { useEffect, useRef, useState } from "react";

const SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let loading;
const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.querySelector(`script[src="${SRC}"]`) ?? Object.assign(document.createElement("script"), { src: SRC, async: true });
    s.addEventListener("load", resolve);
    s.addEventListener("error", () => {
      loading = null;
      s.remove(); // thẻ hỏng không được dùng lại
      reject(new Error("gsi"));
    });
    if (!s.isConnected) document.head.appendChild(s);
  });
  return loading;
};

export default function GoogleButton({ onCredential, onAvailable }) {
  const box = useRef(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const [ok, setOk] = useState(!!CLIENT_ID);

  useEffect(() => {
    onAvailable?.(ok);
  }, [ok, onAvailable]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let dead = false;
    loadGsi().then(
      () => {
        if (dead || !box.current) return;
        window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r) => cb.current(r.credential) });
        window.google.accounts.id.renderButton(box.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          locale: "vi",
          width: box.current.offsetWidth || 320,
        });
      },
      () => !dead && setOk(false)
    );
    return () => {
      dead = true;
    };
  }, []);

  return ok ? <div ref={box} className="flex min-h-[44px] w-full justify-center" /> : null;
}
