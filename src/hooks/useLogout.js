import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetPlayer } from "../app/slices/playerSlice";
import { useAuth } from "../contexts/AuthContext";

// Đăng xuất: dừng nhạc, xoá phiên, về landing
export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useAuth();
  return () => {
    dispatch(resetPlayer());
    logout();
    navigate("/", { replace: true });
  };
}
