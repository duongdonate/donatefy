import { useState, useEffect, memo } from "react";
import { UserRoundCog } from "lucide-react";
import defaultAvatar from "../assets/image/Tanjiro.jpg";
import { useAuth } from "../contexts/AuthContext";

const Avatar = ({ onClick }) => {
  const [avatar, setAvatar] = useState(null);
  const { user } = useAuth();

  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      console.error("Error checking image URL:", error);
      return false;
    }
  };

  useEffect(() => {
    const loadAvatar = async () => {
      if (typeof user?.avatar === "string" && user.avatar.startsWith("http")) {
        setAvatar(user.avatar); // ảnh Google
      } else if (user?.username) {
        const baseUrl = `${import.meta.env.VITE_API_URL}/uploads/avatars/${
          user.username
        }`;
        const pngUrl = `${baseUrl}.png`;
        const jpgUrl = `${baseUrl}.jpg`;

        // Kiểm tra lần lượt cả hai URL
        if (await checkImageExists(pngUrl)) {
          setAvatar(pngUrl);
        } else if (await checkImageExists(jpgUrl)) {
          setAvatar(jpgUrl);
        } else {
          setAvatar(defaultAvatar); // Fallback nếu không tìm thấy ảnh
        }
      } else {
        setAvatar(defaultAvatar); // Fallback nếu user không có username
      }
    };

    loadAvatar();
  }, [user]);

  return (
    <div className="relative w-12 h-12" onClick={onClick}>
      <img
        src={avatar || defaultAvatar}
        alt="Avatar"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover rounded-full border-2 border-border"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition">
        <UserRoundCog className="text-white opacity-70 w-5 h-5" />
      </div>
    </div>
  );
};

export default memo(Avatar);
