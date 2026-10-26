// Form đăng ký: avatar, tên, mật khẩu → "hoặc" → Google
import { useState } from "react";
import { Button } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import AuthToggle from "./AuthToggle";
import AvatarPicker from "./AvatarPicker";
import Field, { TextInput } from "./Field";
import GoogleButton from "./GoogleButton";
import OrDivider from "./OrDivider";
import PasswordInput from "./PasswordInput";
import { validateAvatar } from "./authForm";
import useAuthSubmit from "./useAuthSubmit";

export default function SignUpForm({ username, setUsername, hasGoogle, setHasGoogle, busy, setBusy, onToggle }) {
  const { register } = useAuth();
  const { errors, setErrors, formError, submit, google } = useAuthSubmit(setBusy);
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);

  // Ảnh sai định dạng / quá nặng: báo lỗi, không nhận
  const pickAvatar = (file) => {
    const error = validateAvatar(file);
    setAvatar(error ? null : file);
    setErrors((e) => ({ ...e, avatar: error ?? undefined }));
  };

  return (
    <>
      <form
        noValidate
        onSubmit={(e) => submit(e, { mode: "register", username, password }, (name, pass) => register(name, pass, avatar))}
        className="flex flex-col items-center space-y-4"
      >
        <AvatarPicker file={avatar} onChange={pickAvatar} error={errors.avatar} disabled={busy} />
        <Field id="auth-username" label="Tên đăng nhập" error={errors.username}>
          <TextInput
            id="auth-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tên đăng nhập"
            autoComplete="username"
            disabled={busy}
            error={errors.username}
          />
        </Field>
        <Field id="auth-password" label="Mật khẩu" error={errors.password} hint="Ít nhất 6 ký tự.">
          <PasswordInput
            id="auth-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            autoComplete="new-password"
            disabled={busy}
            error={errors.password}
            hint="Ít nhất 6 ký tự."
          />
        </Field>
        <p role="alert" className="min-h-5 text-[13.5px] font-semibold text-[#b3261e]">
          {formError}
        </p>
        <Button type="submit" disabled={busy} className="h-[52px] w-full">
          Tạo tài khoản
        </Button>
      </form>
      {hasGoogle && <OrDivider />}
      <GoogleButton onCredential={google} onAvailable={setHasGoogle} disabled={busy} />
      {hasGoogle && (
        <p className="mt-2 text-center text-xs text-ink-soft">
          Đăng ký bằng Google sẽ dùng luôn tên và ảnh Google của bạn, một chạm là xong.
        </p>
      )}
      <AuthToggle ask="Đã có tài khoản?" go="Đăng nhập" to="/login" busy={busy} onToggle={onToggle} />
    </>
  );
}
