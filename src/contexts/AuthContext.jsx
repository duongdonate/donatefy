import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient, { refreshAccessToken } from "../services/axiosClient";
import axiosUpload from "../services/axiosUpload";
import { setAccessToken, onSessionExpired } from "../services/authSession";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khoá cũ từ bản lưu token trong localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    let cancelled = false; // StrictMode chạy effect 2 lần; refreshAccessToken dùng chung một lượt
    (async () => {
      try {
        await refreshAccessToken();
        const { user } = await axiosClient.get("/api/auth/me");
        if (!cancelled) setUser(user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const unsubscribe = onSessionExpired(() => setUser(null));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const uploadAvatar = async (avatarFile) => {
    try {
      // Backend lấy người dùng từ token
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      await axiosUpload.post("/upload/avatars", formData);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const startSession = async (access_token) => {
    setAccessToken(access_token);
    try {
      const { user } = await axiosClient.get("/api/auth/me");
      setUser(user);
    } catch (err) {
      setAccessToken(null); // không để lại trạng thái nửa đăng nhập
      throw err;
    }
  };

  const login = async (username, password) => {
    try {
      const { access_token } = await axiosClient.post("/api/auth/login", {
        username,
        password,
      });
      await startSession(access_token);
      return { success: true, message: "Đăng nhập thành công" };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error?.message || "Đăng nhập thất bại",
      };
    }
  };

  const register = async (username, password, avatar) => {
    try {
      const { access_token } = await axiosClient.post("/api/auth/register", {
        username,
        password,
        avatar: avatar ? true : false,
      });
      setAccessToken(access_token);
      if (avatar) {
        await uploadAvatar(avatar);
      }
      await startSession(access_token);
      return { success: true, message: "Đăng ký thành công" };
    } catch (error) {
      console.error("Registration failed:", error?.message);
      return {
        success: false,
        message: error?.message || "Đăng ký thất bại",
      };
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post("/api/auth/logout");
    } catch {
      // vẫn đăng xuất cục bộ
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthFlow = () => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <SignInForm onToggle={() => setIsLogin(false)} />
  ) : (
    <SignUpForm onToggle={() => setIsLogin(true)} />
  );
};
