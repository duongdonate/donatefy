import { useState, useEffect, memo } from "react";
import { UserRoundCog } from "lucide-react";
import defaultAvatar from "../assets/image/Tanjiro.jpg";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import axiosClient from "../services/axiosClient";

const Avatar = ({ onClick }) => {
  const [avatar, setAvatar] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.avatar) {
      const urlAvatar = `${import.meta.env.VITE_API_URL}/avatars/${
        user?.username
      }`;
      setAvatar(urlAvatar);
    } else {
      setAvatar(defaultAvatar); // Fallback to default avatar if user is not defined
    }
  }, [user]);

  return (
    <div className="relative w-12 h-12" onClick={onClick}>
      <img
        src={avatar || defaultAvatar}
        alt="Avatar"
        className="w-full h-full object-cover rounded-full border-2 border-border"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition">
        <UserRoundCog className="text-white opacity-70 w-5 h-5" />
      </div>
    </div>
  );
};

export default memo(Avatar);
