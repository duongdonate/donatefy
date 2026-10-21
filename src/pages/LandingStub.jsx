// Landing tạm, thay bằng landing 3 bước ở GĐ2
import { useNavigate } from "react-router-dom";
import { Button } from "../design";
import Matcappa from "../mascot/Matcappa";
import { useAuth } from "../contexts/AuthContext";

export default function LandingStub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <main className="bg-cafe grid min-h-screen place-items-center p-6 text-ink">
      <div className="flex flex-col items-center gap-4 text-center">
        <Matcappa size={200} />
        <h1 className="font-script text-6xl text-matcha-4 dark:text-matcha-1">Matcha Cha-Cha-Cha</h1>
        <p className="text-lg text-ink-soft">Pha một chén nhạc, thả lên chiếc đĩa matcha.</p>
        <Button onClick={() => navigate(user ? "/listen" : "/login")}>Bắt đầu nghe</Button>
      </div>
    </main>
  );
}
