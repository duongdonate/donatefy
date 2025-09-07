import { useState, useEffect } from "react";

export default function useLocalStorage(key, initialValue) {
  // Tạo state khởi tạo từ localStorage nếu có, nếu không thì dùng initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.error("useLocalStorage get error:", err);
      return initialValue;
    }
  });

  // Cập nhật localStorage mỗi khi storedValue thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (err) {
      console.error("useLocalStorage set error:", err);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
