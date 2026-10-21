// /listen tạm, thay bằng Now Playing ở GĐ5
import { useNavigate } from "react-router-dom";
import { Button } from "../design";
import Matcappa from "../mascot/Matcappa";

export default function ListenPage() {
  const navigate = useNavigate();
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <Matcappa pose="hug-knees" size={180} />
        <p className="text-lg font-semibold">Đĩa đang được pha, đợi mình xíu nha ~</p>
        <Button variant="secondary" onClick={() => navigate("/v1")}>
          Mở chồng đĩa cũ
        </Button>
      </div>
    </div>
  );
}
