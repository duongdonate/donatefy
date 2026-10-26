import { useNavigate } from "react-router-dom";
import { Button } from "../components";
import Matcappa from "../mascot/Matcappa";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="bg-cafe grid min-h-screen place-items-center p-6 text-ink">
      <div className="flex flex-col items-center gap-4 text-center">
        <Matcappa pose="hug-knees" size={180} />
        <h1 className="text-2xl font-bold">Ơ, bàn này chưa có ai đặt…</h1>
        <p className="text-ink-soft">Trang bạn tìm không có trong quán.</p>
        <Button onClick={() => navigate("/")}>Về quán</Button>
      </div>
    </main>
  );
}
