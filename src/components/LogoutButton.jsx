import { Link, useLocation } from "react-router-dom";
import { memo, useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function LogoutButton() {
  const { logout } = useAuth();
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
