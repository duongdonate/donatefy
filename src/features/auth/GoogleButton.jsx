// Nút "Tiếp tục với Google": nút của mình theo chuẩn thương hiệu Google (không iframe nên không giật),
// bấm thì mở popup OAuth và trả access token. Script Google lỗi / thiếu client id → không render gì, cha ẩn luôn đường "hoặc".
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { focusRing } from "../../design/Button";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Logo "G" chuẩn của Google
const GoogleLogo = ({ size = 20 }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

function Inner({ onCredential, disabled }) {
  const login = useGoogleLogin({
    onSuccess: (r) => onCredential(r.access_token),
  });
  return (
    // Màu, viền, chữ theo hướng dẫn nút Google (sáng: nền trắng viền #747775; tối: nền #131314 viền #8E918F)
    <button
      type="button"
      disabled={disabled}
      onClick={() => login()}
      className={`inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white px-4 font-['Roboto',system-ui,sans-serif] text-[15px] font-medium text-[#1F1F1F] transition duration-200 hover:bg-[#F2F2F2] active:scale-[.98] disabled:pointer-events-none disabled:opacity-40 ${focusRing}`}
    >
      <GoogleLogo /> Tiếp tục với Google
    </button>
  );
}

export default function GoogleButton({ onCredential, onAvailable, disabled }) {
  const [ok, setOk] = useState(!!CLIENT_ID);

  useEffect(() => {
    onAvailable?.(ok);
  }, [ok, onAvailable]);

  if (!ok) return null;
  return (
    <GoogleOAuthProvider
      clientId={CLIENT_ID}
      onScriptLoadError={() => setOk(false)}
    >
      <Inner onCredential={onCredential} disabled={disabled} />
    </GoogleOAuthProvider>
  );
}
