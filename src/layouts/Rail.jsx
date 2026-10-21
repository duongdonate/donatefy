import { Heart, Home, Library } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Glass } from "../design";
import { focusRing } from "../design/Button";

// shortcut: Thư viện và Bài đã thích tạm dẫn về giao diện v1 (/v1), đổi khi làm GĐ4
const LINKS = [
  { to: "/listen", label: "Trang chủ", Icon: Home },
  { to: "/v1", label: "Thư viện", Icon: Library },
  { to: "/v1#liked", label: "Bài đã thích", Icon: Heart },
];

export default function Rail({ className = "", ...props }) {
  return (
    <Glass as="nav" aria-label="Điều hướng" className={`flex w-16 flex-col items-center gap-3 rounded-full py-4 ${className}`} {...props}>
      {LINKS.map(({ to, label, Icon }) => (
        <NavLink
          key={label}
          to={to}
          end
          aria-label={label}
          title={label}
          className={({ isActive }) =>
            `grid h-11 w-11 place-items-center rounded-full transition duration-200 ease-matcha ${focusRing} ${
              isActive ? "bg-white/55 text-matcha-4 dark:bg-white/10 dark:text-matcha-1" : "text-ink hover:bg-white/40"
            }`
          }
        >
          <Icon size={20} />
        </NavLink>
      ))}
    </Glass>
  );
}
