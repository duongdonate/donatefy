// Notch: khối tối dính mép trên, giữa màn hình (theo mẫu notch app desktop người dùng gửi).
// Thu gọn: Trang chủ, Thư viện | theme, avatar. Mở rộng: thẻ tài khoản có Đăng xuất.
// Đợt sau sẽ thêm thẻ "bài đang phát" vào phần mở rộng.
import { motion } from "framer-motion";
import { Library, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { getCurrentSong } from "../app/selectors";
import { swipeDir } from "../features/landing/stepper";
import { IconButton } from "../components";
import Avatar from "../components/Avatar";
import { focusRing } from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { useDevice, useScreen } from "../contexts/DeviceContext";
import { useTheme } from "../contexts/ThemeContext";
import useLogout from "../hooks/useLogout";
import { DEVICE } from "../utils/device";
import ListenIcon from "./notch/ListenIcon";
import MiniPlayer from "./notch/MiniPlayer";
import NotchDots from "./notch/NotchDots";
import NowPlayingCard from "./notch/NowPlayingCard";
import { CARD, cardsFor, fallbackCard, openCard, restingCard, stepCard } from "./notchCards";

// also: tiền tố đường dẫn con cũng làm mục này sáng
const LINKS = [
  { to: "/listen", label: "Đang phát", Icon: ListenIcon },
  { to: "/playlists", label: "Thư viện", Icon: Library, also: "/playlists/" },
];

// Số liệu notch theo thiết bị: cỡ nút, bề ngang khung mở (cũng là bề ngang viên thu gọn ở điện thoại), mở bằng rê chuột không
const NOTCH = {
  [DEVICE.MOBILE]: { button: 44, openWidth: (w) => Math.min(w - 32, 384), fullPill: true, hoverOpen: false },
  [DEVICE.TABLET]: { button: 40, openWidth: () => 440, fullPill: false, hoverOpen: true },
  [DEVICE.DESKTOP]: { button: 40, openWidth: () => 460, fullPill: false, hoverOpen: true },
};

// Kiểu "giọt chất lỏng" (mẫu D): nền là viên nhỏ + giọt lớn qua bộ lọc goo (làm nhoè rồi cắt ngưỡng → hai mép dính liền khi giãn).
// Nội dung nằm lớp riêng phía trên nên chữ không bị nhoè.
const GOO_ID = "notch-goo";
const BG = "rgb(10,14,8)"; // phải đục hẳn: bộ lọc goo cắt theo độ trong suốt
const OVERHANG = 30; // nền nhô lên quá mép trên để bộ lọc không bo mất cạnh trên
const DROP = {
  open: { y: "0%", scaleX: 1, scaleY: 1, transition: { type: "spring", stiffness: 220, damping: 22 } },
  closed: { y: "-80%", scaleX: 0.5, scaleY: 0.6, transition: { duration: 0.46, ease: [0.65, 0, 0.35, 1], delay: 0.04 } },
};
const PANEL_FX = {
  open: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 } },
  closed: { opacity: 0, scale: 0.9, transition: { duration: 0.12, ease: "easeIn" } },
};
const SLIDE = 24; // px thẻ trượt khi chuyển
const SWITCH = { type: "spring", stiffness: 300, damping: 32 };

const canHover = () => window.matchMedia?.("(hover: hover)").matches;
const onDark = "!text-[#eef3e6] hover:!bg-white/10";

export default function Notch({ open, onOpenChange }) {
  const device = useDevice();
  const { width: screenWidth } = useScreen();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const logout = useLogout();
  const hasSong = !!useSelector(getCurrentSong);
  const onListen = useLocation().pathname === "/listen";
  const root = useRef(null);
  const head = useRef(null);
  const avatarBtn = useRef(null);
  const openedByHover = useRef(false);
  const swipeStart = useRef(null);
  const cardEls = useRef({});
  const [pill, setPill] = useState({ width: 0, height: 0 });
  const [cardHeights, setCardHeights] = useState({});
  const [card, setCard] = useState(CARD.ACCOUNT); // giữ thẻ cuối cả khi đóng để lúc thu lại không bị trống

  const layout = NOTCH[device];
  const hoverOpen = layout.hoverOpen && canHover();
  const width = layout.openWidth(screenWidth);
  const cards = cardsFor({ hasSong, onListen, loggedIn: !!user });
  const resting = restingCard({ device, hasSong, onListen });
  // Điện thoại: thẻ đang phát chính là thẻ nhạc mỏng ở viên, khung mở không vẽ lại
  const panelCards = cards.filter((c) => c !== resting);
  const expanded = open && panelCards.includes(card);
  const cardsKey = cards.join();

  // Viên nền thu gọn ôm đúng hàng icon (+ thẻ nhạc mỏng ở điện thoại)
  useLayoutEffect(() => {
    const el = head.current;
    const measure = () => setPill({ width: el.offsetWidth, height: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Chiều cao từng thẻ để khung mở co giãn theo thẻ đang chọn (giọt nền bám theo khung)
  useLayoutEffect(() => {
    const els = Object.entries(cardEls.current).filter(([, el]) => el);
    const measure = () => setCardHeights(Object.fromEntries(els.map(([k, el]) => [k, el.offsetHeight])));
    measure();
    const ro = new ResizeObserver(measure);
    els.forEach(([, el]) => ro.observe(el));
    return () => ro.disconnect();
  }, [cardsKey, resting]);

  const setOpen = (next, byHover = false) => {
    openedByHover.current = next && byHover;
    onOpenChange(next);
  };

  // Chọn thẻ qua chấm / lướt; điện thoại chọn "đang phát" = về viên có thẻ nhạc mỏng
  const pick = (c) => {
    if (c === resting) return setOpen(false);
    setCard(c);
  };

  // Thẻ đang chọn biến mất (hết bài, vào /listen): về thẻ còn lại; đang mở bằng rê chuột thì đóng luôn
  useEffect(() => {
    if (cards.includes(card)) return;
    if (open && openedByHover.current) setOpen(false);
    const next = fallbackCard(cards, card);
    if (next) setCard(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsKey]);

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

  const onHoverEnter = () => {
    if (!hoverOpen || open) return;
    const c = openCard(panelCards, "hover");
    if (!c) return;
    setCard(c);
    setOpen(true, true);
  };
  const onAvatar = () => {
    if (open && card === CARD.ACCOUNT) return setOpen(false);
    setCard(CARD.ACCOUNT);
    if (!open) setOpen(true);
  };

  // Lướt ngang trên khung thẻ; bỏ qua khi bắt đầu trên thanh tiến trình (đang tua)
  const onSwipeDown = (e) => {
    swipeStart.current = e.target.closest('[role="slider"]') ? null : e.clientX;
  };
  const onSwipeUp = (e) => {
    if (swipeStart.current === null) return;
    const dir = swipeDir(swipeStart.current, e.clientX);
    swipeStart.current = null;
    if (dir) pick(stepCard(cards, card, dir));
  };

  const selIndex = panelCards.indexOf(card);

  return (
    <div
      ref={root}
      className="pointer-events-none relative text-[#eef3e6]"
      style={{ width }}
      // đang giữ chuột (kéo thanh tiến trình ra ngoài) thì chưa đóng
      onMouseLeave={(e) => openedByHover.current && e.buttons === 0 && setOpen(false)}
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={GOO_ID}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>

      {/* Lớp nền goo: viên thu gọn + giọt mở rộng */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0"
        style={{ top: -OVERHANG, filter: `url(#${GOO_ID}) drop-shadow(0 18px 28px rgba(0,0,0,${expanded ? 0.6 : 0.4}))` }}
      >
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-[22px]"
          style={{ width: layout.fullPill ? width : pill.width, height: pill.height + OVERHANG, background: BG }}
        />
        <motion.div
          className="absolute inset-0 rounded-b-[30px]"
          style={{ background: BG }}
          initial={false}
          animate={expanded ? "open" : "closed"}
          variants={DROP}
        />
      </div>

      {/* Lớp nội dung; "dark" để thanh tiến trình và chữ phụ lấy màu cho nền tối */}
      <div className="dark relative flex flex-col items-center px-3 pb-3">
        <div ref={head} className="pointer-events-auto" style={{ width: layout.fullPill ? "100%" : undefined }}>
          <nav aria-label="Điều hướng" className="flex items-center justify-between gap-1 px-3 py-2" onMouseEnter={onHoverEnter}>
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
                  aria-expanded={expanded && card === CARD.ACCOUNT}
                  onClick={onAvatar}
                  className={`grid place-items-center rounded-full ${focusRing}`}
                  style={{ width: layout.button, height: layout.button }}
                >
                  <Avatar size={layout.button - 10} />
                </button>
              )}
            </div>
          </nav>
          {resting && (
            <div className="px-1 pb-1">
              <MiniPlayer />
            </div>
          )}
        </div>

        {panelCards.length > 0 && (
          // luôn có trong DOM để giọt nền biết chiều cao khung mở; khi đóng thì ẩn và không bấm / tab tới được
          <motion.div
            className={`w-full ${expanded ? "pointer-events-auto" : ""}`}
            inert={!expanded}
            initial={false}
            animate={expanded ? "open" : "closed"}
            variants={PANEL_FX}
            onPointerDown={onSwipeDown}
            onPointerUp={onSwipeUp}
            style={{ touchAction: "pan-y" }}
          >
            <motion.div className="relative overflow-hidden" initial={false} animate={{ height: cardHeights[card] ?? "auto" }} transition={SWITCH}>
              {panelCards.map((c, i) => (
                <motion.div
                  key={c}
                  ref={(el) => {
                    cardEls.current[c] = el;
                  }}
                  className="absolute inset-x-0 top-0"
                  inert={c !== card}
                  initial={false}
                  animate={{ opacity: c === card ? 1 : 0, x: c === card ? 0 : i < selIndex ? -SLIDE : SLIDE }}
                  transition={SWITCH}
                >
                  {c === CARD.NOW ? <NowPlayingCard /> : <AccountCard user={user} onLogout={logout} />}
                </motion.div>
              ))}
            </motion.div>
            <NotchDots cards={cards} current={card} onPick={pick} />
          </motion.div>
        )}
      </div>
    </div>
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
          isActive || (also && pathname.startsWith(also))
            ? "bg-white/15 text-matcha-1"
            : "text-[#eef3e6] hover:bg-white/10"
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
    <div className="flex items-center gap-3 rounded-[22px] bg-white/[.06] p-3">
      <Avatar size={52} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">
          {user.displayName || user.username}
        </div>
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
