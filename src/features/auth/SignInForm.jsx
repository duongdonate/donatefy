// Form đăng nhập: Google → "hoặc" → tên, mật khẩu
import { useState } from "react";
import { Button } from "../../design";
import { useAuth } from "../../contexts/AuthContext";
import Field, { TextInput } from "./Field";
import GoogleButton from "./GoogleButton";
import OrDivider from "./OrDivider";
import PasswordInput from "./PasswordInput";
import AuthToggle from "./AuthToggle";
import useAuthSubmit from "./useAuthSubmit";

export default function SignInForm({ username, setUsername, busy, setBusy, onToggle }) {
  const { login } = useAuth();
  const { errors, formError, submit, google } = useAuthSubmit(setBusy);
  const [password, setPassword] = useState("");
  const [hasGoogle, setHasGoogle] = useState(true);

  return (
    <>
      <GoogleButton onCredential={google} onAvailable={setHasGoogle} disabled={busy} />
      {hasGoogle && <OrDivider />}
      <form
        noValidate
        onSubmit={(e) => submit(e, { mode: "login", username, password }, login)}
        className="flex flex-col items-center space-y-4"
      >
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
        <Field id="auth-password" label="Mật khẩu" error={errors.password}>
          <PasswordInput
            id="auth-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            disabled={busy}
            error={errors.password}
          />
        </Field>
        <p role="alert" className="min-h-5 text-[13.5px] font-semibold text-[#b3261e]">
          {formError}
        </p>
        <Button type="submit" disabled={busy} className="h-[52px] w-full">
          Đăng nhập
        </Button>
      </form>
      <AuthToggle ask="Chưa có tài khoản?" go="Đăng ký ngay" to="/register" busy={busy} onToggle={onToggle} />
    </>
  );
}
