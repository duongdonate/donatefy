import { useState, useRef, forwardRef, useImperativeHandle, memo } from "react";
import { Camera } from "lucide-react";
import defaultAvatar from "../assets/image/Tanjiro.jpg";

const AvatarUploader = forwardRef(({ childrens }, ref) => {
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  useImperativeHandle(ref, () => ({
    getFile: () => fileInputRef.current.files[0] || null,
    reset: () => {
      setAvatar(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  }));

  return (
    <div className="relative w-36 h-36">
      <img
        src={avatar || defaultAvatar}
        alt="Avatar"
        className="w-full h-full object-cover rounded-full"
      />
      <div
        onClick={handleClick}
        className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition"
      >
        <Camera className="text-white opacity-70 w-8 h-8" />
      </div>
      <input
        type="file"
        accept="image/jpeg, image/png, image/jpg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
});

export default memo(AvatarUploader);
