import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../services/axiosClient";
import axiosUpload from "../services/axiosUpload";
import useLocalStorage from "../hooks/useLocalStorage";
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
  const [user, setUser] = useLocalStorage("user", null);
  const [token, setToken] = useLocalStorage("token", null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const uploadAvatar = async (username, avatarFile) => {
    try {
      // Tạo FormData và thêm file
      const formData = new FormData();
      formData.append("username", username);
      formData.append("avatar", avatarFile);

      // Upload file avatar
      await axiosUpload.post("/upload/avatars", formData);
      console.log("File uploaded successfully");
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { user } = await axiosClient.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await axiosClient.post("/api/auth/login", {
        username,
        password,
      });
      const { access_token } = res;
      setToken(access_token);
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
      const res = await axiosClient.post("/api/auth/register", {
        username,
        password,
        avatar: avatar ? true : false,
      });
      if (avatar) {
        await uploadAvatar(username, avatar);
        console.log("Avatar uploaded successfully");
      }

      const { access_token } = res;
      setToken(access_token);
      return { success: true, message: "Đăng ký thành công" };
    } catch (error) {
      console.error("Registration failed:", error?.message);
      return {
        success: false,
        message: error?.message || "Đăng ký thất bại",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
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
