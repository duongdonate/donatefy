import { LogOut, Moon, Sun } from "lucide-react";
import { Glass, IconButton } from "../design";
import Matcappa from "../mascot/Matcappa";
import Avatar from "../components/Avatar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import useLogout from "../hooks/useLogout";

export default function Header({ className = "", ...props }) {
  const { user } = useAuth();
  const logout = useLogout();
  const { isDark, toggleTheme } = useTheme();

  return (
    <Glass as="header" className={`flex h-16 items-center gap-3 rounded-full px-4 ${className}`} {...props}>
      <Matcappa size={36} label="Matcappa" />
      <span className="font-script text-2xl text-matcha-4 dark:text-matcha-1">Matcha Cha-Cha-Cha</span>
      <div className="flex-1" />
      <IconButton label={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"} onClick={toggleTheme}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
      {user && (
        <>
          <div className="scale-75">
            <Avatar />
          </div>
          <IconButton label="Đăng xuất" onClick={logout}>
            <LogOut size={20} />
          </IconButton>
        </>
      )}
    </Glass>
  );
}
