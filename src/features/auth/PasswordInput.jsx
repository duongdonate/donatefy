// Ô mật khẩu có nút mắt ẩn / hiện
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { IconButton } from "../../design";
import { TextInput } from "./Field";

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <TextInput type={show ? "text" : "password"} {...props} className="pr-12" />
      <IconButton
        label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        pressed={show}
        size={38}
        onClick={() => setShow((v) => !v)}
        className="absolute right-1.5 top-1.5 !rounded-[10px] text-ink-soft"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </IconButton>
    </div>
  );
}
