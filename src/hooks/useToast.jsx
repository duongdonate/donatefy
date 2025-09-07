// hooks/useToast.js
import { useContext } from "react";
import { ToastContext } from "../contexts/ToastContext.jsx";

export default function useToast() {
  return useContext(ToastContext);
}
