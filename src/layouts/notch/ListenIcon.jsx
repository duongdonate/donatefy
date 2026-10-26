// Icon nút "Đang phát" trên notch: có bài thì là đĩa than nhỏ (nhãn = bìa bài), xoay khi đang phát
import { Disc3 } from "lucide-react";
import { useSelector } from "react-redux";
import { getCurrentSong, getIsPlaying } from "../../app/selectors";
import { Vinyl } from "../../components";

const DISC_EXTRA = 6; // đĩa to hơn icon lucide một chút cho thấy bìa

export default function ListenIcon({ size }) {
  const song = useSelector(getCurrentSong);
  const isPlaying = useSelector(getIsPlaying);
  if (!song) return <Disc3 size={size} />;
  const disc = size + DISC_EXTRA;
  return (
    <Vinyl
      size={disc}
      label={song.thumbnail ? `url(${song.thumbnail}) center/cover` : undefined}
      spinning={isPlaying}
      duration={6}
      style={{ width: disc, height: disc }}
    />
  );
}
