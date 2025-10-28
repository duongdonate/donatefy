import { Link, useLocation } from "react-router-dom";
import { memo, useEffect, useState } from "react";
import { HomeIcon } from "lucide-react";

function HomeButton() {
  const location = useLocation();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (location.pathname === "/") {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [location]);

  return (
    <Link to="/">
      <button
        className={`w-12 h-12 shrink-0 flex justify-center items-center space-x-3 p-2 rounded-full border-2 border-border hover:scale-110 transition-all
        ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-background text-foreground"
        }`}
      >
        <HomeIcon size={24} strokeWidth={2} />
      </button>
    </Link>
  );
}

export default memo(HomeButton);
