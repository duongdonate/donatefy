import { Home, Library } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Glass } from "../design";
import { focusRing } from "../design/Button";

// also: tiền tố đường dẫn con cũng làm mục này sáng
const LINKS = [
  { to: "/listen", label: "Trang chủ", Icon: Home },
  { to: "/library", label: "Thư viện", Icon: Library, also: "/playlist/" },
];

export default function Rail({ className = "", ...props }) {
  const { pathname } = useLocation();
  return (
    <Glass as="nav" aria-label="Điều hướng" className={`flex w-16 flex-col items-center gap-3 rounded-full py-4 ${className}`} {...props}>
      {LINKS.map(({ to, label, Icon, also }) => (
        <NavLink
          key={label}
          to={to}
          end
          aria-label={label}
          title={label}
          className={({ isActive }) =>
            `grid h-11 w-11 place-items-center rounded-full transition duration-200 ease-matcha ${focusRing} ${
              isActive || (also && pathname.startsWith(also)) ? "bg-white/55 text-matcha-4 dark:bg-white/10 dark:text-matcha-1" : "text-ink hover:bg-white/40"
            }`
          }
        >
          <Icon size={20} />
        </NavLink>
      ))}
    </Glass>
  );
}
