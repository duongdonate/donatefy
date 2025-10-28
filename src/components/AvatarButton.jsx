import { useState } from "react";
import Avatar from "./Avatar";

function AvatarButton() {
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="relative w-max">
      <Avatar onClick={() => setDropdown((prev) => !prev)} />
      {dropdown && (
        <div className="absolute z-10 mt-1 px-4 py-2 w-max right-0 rounded-lg backdrop-blur-sm glass"></div>
      )}
    </div>
  );
}

export default AvatarButton;
