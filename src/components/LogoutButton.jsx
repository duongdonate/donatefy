import { memo } from "react";
import { LogOutIcon } from "lucide-react";
import useLogout from "../hooks/useLogout";

function LogoutButton() {
  const logout = useLogout();
  return (
    <button
      onClick={logout}
      className={`w-12 h-12 shrink-0 flex justify-center items-center space-x-3 p-2 rounded-full border-2 border-border bg-destructive text-destructive-foreground opacity-50 hover:opacity-100 transition-opacity`}
    >
      <LogOutIcon size={24} strokeWidth={2} />
    </button>
  );
}

export default memo(LogoutButton);
