// { showToast(message, { action?: { label, onClick }, duration? }) → id, dismiss(id) }
import { useContext } from "react";
import { ToastContext } from "../contexts/ToastContext";

export default function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải nằm trong ToastProvider");
  return ctx;
}
