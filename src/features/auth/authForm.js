// Kiểm tra form đăng nhập / đăng ký và đổi lỗi server thành câu thân thiện
const USERNAME = /^[A-Za-z0-9_.]{3,30}$/;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif"];
const AVATAR_MAX = 2 * 1024 * 1024;

export function validateAuth({ mode, username = "", password = "" }) {
  const errors = {};
  const name = username.trim();
  if (!name) errors.username = "Bạn chưa nhập tên đăng nhập.";
  else if (mode === "register" && !USERNAME.test(name)) errors.username = "Tên 3–30 ký tự, chỉ gồm chữ, số, _ và .";
  if (!password) errors.password = "Bạn chưa nhập mật khẩu.";
  else if (mode === "register" && password.length < 6) errors.password = "Mật khẩu cần ít nhất 6 ký tự.";
  return errors;
}

export function mapAuthError(message) {
  if (!message || message === "Network Error")
    return { field: null, text: "Quán đang mất sóng một chút, bạn thử lại sau nhé." };
  if (message.includes("đã tồn tại")) return { field: "username", text: "Tên tài khoản đã tồn tại." };
  if (message.includes("không chính xác"))
    return { field: null, text: "Tên tài khoản hoặc mật khẩu không chính xác." };
  return { field: null, text: "Có gì đó chưa ổn, bạn thử lại nhé." };
}

export function validateAvatar(file) {
  if (!file) return null;
  if (!AVATAR_TYPES.includes(file.type)) return "Ảnh cần là jpg, png hoặc gif.";
  if (file.size > AVATAR_MAX) return "Ảnh tối đa 2MB.";
  return null;
}
