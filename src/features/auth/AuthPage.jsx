// Đăng nhập / đăng ký: bố cục giữ như v1 (một thẻ giữa màn hình), giao diện matcha, Matcappa bay lượn
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Glass, IconButton } from "../../design";
import { PageLoader } from "../../components/Loader";
import { useAuth } from "../../contexts/AuthContext";
import FlyingMascot, { useMascotSize } from "../../mascot/FlyingMascot";
import { cornerXY, pickWanderSpot } from "../../mascot/flight";
import { AUTH_LINES } from "../../mascot/lines";
import AvatarPicker from "./AvatarPicker";
import { mapAuthError, validateAuth, validateAvatar } from "./authForm";

const WANDER_MS = 5000;
const TEXT = {
  login: { title: "Đăng nhập", submit: "Đăng nhập", busy: "Đang đánh matcha…", ask: "Chưa có tài khoản?", go: "Đăng ký ngay", to: "/register" },
  register: { title: "Tạo tài khoản", submit: "Tạo tài khoản", busy: "Đang pha chén đầu tiên…", ask: "Đã có tài khoản?", go: "Đăng nhập", to: "/login" },
};
const inputCls = (bad) =>
  `h-[50px] w-full rounded-[14px] border bg-white/55 px-4 text-[15px] text-[#1f2e17] placeholder:text-[#55624c]/70 outline-none transition duration-200 focus:bg-white/80 ${
    bad
      ? "border-[#b3261e] shadow-[0_0_0_4px_rgba(179,38,30,.12)]"
      : "border-white/70 focus:border-matcha-3 focus:shadow-[0_0_0_4px_rgba(104,142,49,.18)]"
  }`;
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Field({ id, label, error, children }) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-semibold text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

// Mascot bay tới một điểm ngẫu nhiên mỗi 5 giây, không đậu đè lên thẻ form
function useWander(cardRef) {
  const pet = useMascotSize();
  const [view, setView] = useState({ W: window.innerWidth, H: window.innerHeight });
  const [spot, setSpot] = useState(() => cornerXY("bl", pet, view));

  useEffect(() => {
    const onResize = () => setView({ W: window.innerWidth, H: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { w, h } = pet, { W, H } = view;
  useEffect(() => {
    const size = { w, h }, screen = { W, H };
    if (reduced()) return setSpot(cornerXY("bl", size, screen));
    const hop = () => {
      if (document.hidden || !cardRef.current) return;
      const r = cardRef.current.getBoundingClientRect();
      setSpot((last) => pickWanderSpot(size, screen, { x: r.left, y: r.top, w: r.width, h: r.height }, last));
    };
    const t = setInterval(hop, WANDER_MS);
    return () => clearInterval(t);
  }, [cardRef, w, h, W, H]);

  return spot;
}

export default function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = TEXT[mode];
  const card = useRef(null);
  const spot = useWander(card);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const sending = useRef(false);

  // Đổi chế độ: xoá lỗi, giữ tên đăng nhập
  useEffect(() => {
    setErrors({});
    setFormError("");
    setPassword("");
    setAvatar(null);
  }, [mode]);

  // Ảnh sai định dạng / quá nặng: báo lỗi, không nhận
  const pickAvatar = (file) => {
    const error = validateAvatar(file);
    setAvatar(error ? null : file);
    setErrors((e) => ({ ...e, avatar: error ?? undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending.current) return;
    const found = validateAuth({ mode, username, password });
    setErrors(found);
    setFormError("");
    const first = ["username", "password"].find((k) => found[k]);
    if (first) return document.getElementById(`auth-${first}`)?.focus();

    sending.current = true;
    setBusy(true);
    const name = username.trim();
    const res = mode === "login" ? await login(name, password) : await register(name, password, avatar);
    // Thành công: giữ lớp chờ, GuestOnly tự chuyển trang khi đã có user
    if (res.success) return;
    const { field, text } = mapAuthError(res.message);
    if (field) setErrors({ [field]: text });
    else setFormError(text);
    sending.current = false;
    setBusy(false);
    if (field) document.getElementById(`auth-${field}`)?.focus();
  };

  return (
    <main className="bg-cafe relative grid min-h-screen place-items-center overflow-hidden px-4 py-16 text-ink">
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
        <form noValidate onSubmit={onSubmit} className="flex flex-col items-center space-y-4">
          {mode === "register" && <AvatarPicker file={avatar} onChange={pickAvatar} error={errors.avatar} disabled={busy} />}
          <Field id="auth-username" label="Tên đăng nhập" error={errors.username}>
            <input
              id="auth-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              autoComplete="username"
              disabled={busy}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "auth-username-error" : undefined}
              className={inputCls(errors.username)}
            />
          </Field>
          <Field id="auth-password" label="Mật khẩu" error={errors.password}>
            <div className="relative">
              <input
                id="auth-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                disabled={busy}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "auth-password-error" : mode === "register" ? "auth-password-hint" : undefined}
                className={`${inputCls(errors.password)} pr-12`}
              />
              <IconButton
                label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                pressed={showPass}
                size={38}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-1.5 top-1.5 !rounded-[10px] text-ink-soft"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </div>
            {mode === "register" && !errors.password && (
              <p id="auth-password-hint" className="mt-1.5 text-xs text-ink-soft">
                Ít nhất 6 ký tự.
              </p>
            )}
          </Field>
          <p role="alert" className="min-h-5 text-[13.5px] font-semibold text-[#b3261e]">
            {formError}
          </p>
          <Button type="submit" disabled={busy} className="h-[52px] w-full">
            {t.submit}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-ink-soft">
          {t.ask}{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() => navigate(t.to, { replace: true, state: location.state })}
            className="font-bold text-matcha-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 dark:text-matcha-1"
          >
            {t.go}
          </button>
        </p>

        {busy && (
          <div className="absolute inset-0 z-10 grid place-items-center content-center gap-1 bg-[rgba(244,241,223,.6)] text-center backdrop-blur-[10px] dark:bg-[rgba(24,32,20,.6)]">
            <PageLoader decorative size={160} />
            <b role="status" className="text-[13px] uppercase tracking-[.2em] text-matcha-4 dark:text-matcha-1">
              {t.busy}
            </b>
          </div>
        )}
      </Glass>

      <FlyingMascot target={spot} pose={busy ? "hug-vinyl" : "stand"} lines={AUTH_LINES} />
    </main>
  );
}
