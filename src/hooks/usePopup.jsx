// hooks/usePopup.js
import { useContext } from "react";
import { PopupContext } from "../contexts/PopupContext";

export default function usePopup() {
  return useContext(PopupContext);
}
