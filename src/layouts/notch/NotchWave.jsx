// Sóng nhạc giữa hàng icon notch (thay vạch ngăn khi có bài): 4 vạch nhảy lệch nhịp; tạm dừng thì nằm thấp đứng yên
import { useSelector } from "react-redux";
import { getIsPlaying } from "../../app/selectors";

// nhịp lệch nhau để trông như sóng thật
const BARS = [
  { duration: "0.9s", delay: "0s" },
  { duration: "0.8s", delay: "-0.3s" },
  { duration: "1s", delay: "-0.6s" },
  { duration: "0.7s", delay: "-0.15s" },
];

export default function NotchWave() {
  const isPlaying = useSelector(getIsPlaying);
  return (
    <span aria-hidden="true" className="mx-10 flex h-4 items-end gap-0.5">
      {BARS.map((b, i) => (
        <span
          key={i}
          className={`h-4 w-[3px] origin-bottom rounded-full bg-matcha-4 ${isPlaying ? "animate-wave motion-reduce:animate-none" : ""}`}
          style={{
            transform: isPlaying ? undefined : "scaleY(.25)",
            animationDuration: b.duration,
            animationDelay: b.delay,
          }}
        />
      ))}
    </span>
  );
}
