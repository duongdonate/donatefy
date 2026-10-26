// Đăng nhập / đăng ký: bố cục giữ như v1 (một thẻ giữa màn hình), giao diện matcha, Matcappa bay lượn.
// Như AuthFlow v1: trang chọn SignInForm hoặc SignUpForm theo mode, nút dưới form chuyển qua lại.
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Glass } from "../../components";
import { PageLoader } from "../../components/Loader";
import { useDevice } from "../../contexts/DeviceContext";
import { DEVICE } from "../../utils/device";
import FlyingMascot from "../../mascot/FlyingMascot";
import { AUTH_LINES } from "../../mascot/lines";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import useWander from "./useWander";

const TEXT = {
  login: { title: "Đăng nhập", busy: "Đang đánh matcha…" },
  register: { title: "Tạo tài khoản", busy: "Đang pha chén đầu tiên…" },
};

// Mobile bỏ mascot bay (dễ che form khi bàn phím hiện)
const SHOW_MASCOT = { [DEVICE.MOBILE]: false, [DEVICE.TABLET]: true, [DEVICE.DESKTOP]: true };

export default function AuthPage({ mode }) {
  const device = useDevice();
  const navigate = useNavigate();
  const location = useLocation();
  const t = TEXT[mode];
  const card = useRef(null);
  const spot = useWander(card);

  // Đổi chế độ thì form cũ unmount (xoá lỗi, mật khẩu); tên đăng nhập giữ ở đây nên còn nguyên
  const [username, setUsername] = useState("");
  // Google có tải được hay không giữ ở đây: đổi form không phải dò lại, đường "hoặc" không nháy
  const [hasGoogle, setHasGoogle] = useState(true);
  const [busy, setBusy] = useState(false);
  const onToggle = (to) => navigate(to, { replace: true, state: location.state });
  const Form = mode === "login" ? SignInForm : SignUpForm;

  return (
    <main className="bg-cafe relative grid min-h-dvh place-items-center overflow-hidden px-4 py-16 text-ink">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-matcha-1 opacity-70 blur-[90px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-36 h-[420px] w-[420px] rounded-full bg-[#f2c9c9] opacity-45 blur-[90px] dark:opacity-10" />

      <Link
        to="/"
        className="glass fixed left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-ink-soft backdrop-blur-[18px] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4"
      >
        <ArrowLeft size={16} /> Về quán
      </Link>

      <Glass ref={card} aria-busy={busy || undefined} className="relative w-full max-w-md overflow-hidden rounded-[32px] p-8">
        <h1 className="mb-6 text-center text-3xl font-extrabold tracking-[-.03em]">{t.title}</h1>
        <Form username={username} setUsername={setUsername} hasGoogle={hasGoogle} setHasGoogle={setHasGoogle} busy={busy} setBusy={setBusy} onToggle={onToggle} />

        {busy && (
          <div className="absolute inset-0 z-10 grid place-items-center content-center gap-1 bg-[rgba(244,241,223,.6)] text-center backdrop-blur-[10px] dark:bg-[rgba(24,32,20,.6)]">
            <PageLoader decorative size={160} />
            <b role="status" className="text-[13px] uppercase tracking-[.2em] text-matcha-4 dark:text-matcha-1">
              {t.busy}
            </b>
          </div>
        )}
      </Glass>

      {SHOW_MASCOT[device] && <FlyingMascot target={spot} pose={busy ? "hug-vinyl" : "stand"} lines={AUTH_LINES} />}
    </main>
  );
}
