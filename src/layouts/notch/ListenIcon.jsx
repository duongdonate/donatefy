// Icon nút "Đang phát" trên notch: có bài thì là đĩa than nhỏ đứng yên (nhãn = bìa bài); sóng nhạc ở giữa notch báo đang phát
import { Disc3 } from "lucide-react";
import { useSelector } from "react-redux";
import { getCurrentSong } from "../../app/selectors";
import { Vinyl } from "../../components";

const DISC_EXTRA = 6; // đĩa to hơn icon lucide một chút cho thấy bìa

export default function ListenIcon({ size }) {
  const song = useSelector(getCurrentSong);
  if (!song) return <Disc3 size={size} />;
  const disc = size + DISC_EXTRA;
  return (
    <Vinyl
      size={disc}
      label={song.thumbnail ? `url(${song.thumbnail}) center/cover` : undefined}
      spinning={false}
      style={{ width: disc, height: disc }}
    />
  );
}
