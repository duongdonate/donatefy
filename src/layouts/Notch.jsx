// Notch: khối tối dính mép trên, giữa màn hình (theo mẫu notch app desktop người dùng gửi).
// Thu gọn: Trang chủ, Thư viện | theme, avatar. Mở rộng: thẻ tài khoản có Đăng xuất.
// Đợt sau sẽ thêm thẻ "bài đang phát" vào phần mở rộng.
import { AnimatePresence, motion } from "framer-motion";
import { Home, Library, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { IconButton } from "../components";
import Avatar from "../components/Avatar";
import { focusRing } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { useDevice, useScreen } from "../contexts/DeviceContext";
import { useTheme } from "../contexts/ThemeContext";
import useLogout from "../hooks/useLogout";
import { DEVICE } from "../utils/device";

// also: tiền tố đường dẫn con cũng làm mục này sáng
const LINKS = [
  { to: "/listen", label: "Trang chủ", Icon: Home },
  { to: "/playlists", label: "Thư viện", Icon: Library, also: "/playlists/" },
];

// Số liệu notch theo thiết bị: cỡ nút, bề ngang (null = vừa nội dung), bề ngang khi mở, mở bằng rê chuột không
const NOTCH = {
  [DEVICE.MOBILE]: { button: 44, width: (w) => Math.min(w - 32, 384), openWidth: (w) => Math.min(w - 32, 384), hoverOpen: false },
  [DEVICE.TABLET]: { button: 40, width: () => null, openWidth: () => 320, hoverOpen: true },
  [DEVICE.DESKTOP]: { button: 40, width: () => null, openWidth: () => 320, hoverOpen: true },
};

const canHover = () => window.matchMedia?.("(hover: hover)").matches;
const onDark = "!text-[#eef3e6] hover:!bg-white/10";

export default function Notch({ open, onOpenChange }) {
  const device = useDevice();
  const { width: screenWidth } = useScreen();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const logout = useLogout();
  const root = useRef(null);
  const avatarBtn = useRef(null);
  const openedByHover = useRef(false);

  const layout = NOTCH[device];
  const hoverOpen = layout.hoverOpen && canHover();
  const width = open ? layout.openWidth(screenWidth) : layout.width(screenWidth);

  const setOpen = (next, byHover = false) => {
    openedByHover.current = next && byHover;
    onOpenChange(next);
  };

  // Đóng bằng Esc (trả focus về avatar) hoặc bấm ra ngoài
  useEffect(() => {
    if (!open) return;
    const close = () => {
      openedByHover.current = false;
      onOpenChange(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      close();
      avatarBtn.current?.focus();
    };
    const onDown = (e) => !root.current?.contains(e.target) && close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, onOpenChange]);

  return (
    <motion.div
      ref={root}
      layout
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseEnter={() => hoverOpen && !open && setOpen(true, true)}
      onMouseLeave={() => openedByHover.current && setOpen(false)}
      className="overflow-hidden rounded-b-[22px] bg-[rgba(10,14,8,.92)] px-3 pb-2 pt-2 text-[#eef3e6] shadow-[0_12px_30px_-12px_rgba(0,0,0,.6)]"
      style={{ width: width ?? "auto" }}
    >
      <nav aria-label="Điều hướng" className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {LINKS.map((link) => (
            <NotchLink key={link.to} {...link} size={layout.button} />
          ))}
        </div>
        <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/15" />
        <div className="flex items-center gap-1">
          <IconButton size={layout.button} label={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"} onClick={toggleTheme} className={onDark}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          {user && (
            <button
              ref={avatarBtn}
              type="button"
              aria-label="Tài khoản"
              aria-haspopup="true"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className={`grid place-items-center rounded-full ${focusRing}`}
              style={{ width: layout.button, height: layout.button }}
            >
              <Avatar size={layout.button - 10} />
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open && user && (
          <motion.div
            key="account"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <AccountCard user={user} onLogout={logout} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NotchLink({ to, label, Icon, also, size }) {
  const { pathname } = useLocation();
  return (
    <NavLink
      to={to}
      end
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className={({ isActive }) =>
        `grid place-items-center rounded-full transition duration-200 ease-matcha ${focusRing} ${
          isActive || (also && pathname.startsWith(also)) ? "bg-white/15 text-matcha-1" : "text-[#eef3e6] hover:bg-white/10"
        }`
      }
    >
      <Icon size={20} />
    </NavLink>
  );
}

// Thẻ tài khoản (giống thẻ mascot trong mẫu): avatar lớn, tên, @username, Đăng xuất
function AccountCard({ user, onLogout }) {
  return (
    <div className="mt-2 flex items-center gap-3 rounded-[16px] bg-white/[.06] p-3">
      <Avatar size={52} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">{user.displayName || user.username}</div>
        <div className="truncate text-xs text-white/60">@{user.username}</div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm font-semibold hover:bg-white/20 ${focusRing}`}
      >
        <LogOut size={16} /> Đăng xuất
      </button>
    </div>
  );
}
