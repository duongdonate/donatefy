// Gửi form đăng nhập / đăng ký hoặc Google: chặn gửi hai lần, bật lớp chờ, đổi lỗi server thành lỗi ô hoặc lỗi chung
import { useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { mapAuthError, validateAuth } from "./authForm";

const focus = (field) => document.getElementById(`auth-${field}`)?.focus();

export default function useAuthSubmit(setBusy) {
  const { loginWithGoogle } = useAuth();
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const sending = useRef(false);

  // null khi đang có một lần gửi khác; thành công thì giữ lớp chờ, GuestOnly tự chuyển trang
  const send = async (fn) => {
    if (sending.current) return null;
    sending.current = true;
    setBusy(true);
    setFormError("");
    const res = await fn();
    if (res.success) return res;
    sending.current = false;
    setBusy(false);
    return res;
  };

  const submit = async (e, { mode, username, password }, action) => {
    e.preventDefault();
    if (sending.current) return;
    const found = validateAuth({ mode, username, password });
    setErrors(found);
    setFormError("");
    const first = ["username", "password"].find((k) => found[k]);
    if (first) return focus(first);

    const res = await send(() => action(username.trim(), password));
    if (!res || res.success) return;
    const { field, text } = mapAuthError(res.message);
    if (field) setErrors({ [field]: text });
    else setFormError(text);
    if (field) focus(field);
  };

  const google = async (credential) => {
    const res = await send(() => loginWithGoogle(credential));
    if (res && !res.success) setFormError(res.message);
  };

  return { errors, setErrors, formError, submit, google };
}
