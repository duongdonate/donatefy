// Mascot bay tới một điểm ngẫu nhiên mỗi 5 giây, không đậu đè lên thẻ form
import { useEffect, useState } from "react";
import { useMascotSize } from "../../mascot/FlyingMascot";
import { cornerXY, pickWanderSpot } from "../../mascot/flight";

const WANDER_MS = 5000;
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function useWander(cardRef) {
  const pet = useMascotSize();
  const [view, setView] = useState({ W: window.innerWidth, H: window.innerHeight });
  const [spot, setSpot] = useState(() => cornerXY("bl", pet, view));

  useEffect(() => {
    const onResize = () => setView({ W: window.innerWidth, H: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { w, h } = pet, { W, H } = view;
  useEffect(() => {
    const size = { w, h }, screen = { W, H };
    if (reduced()) return setSpot(cornerXY("bl", size, screen));
    const hop = () => {
      if (document.hidden || !cardRef.current) return;
      const r = cardRef.current.getBoundingClientRect();
      setSpot((last) => pickWanderSpot(size, screen, { x: r.left, y: r.top, w: r.width, h: r.height }, last));
    };
    const t = setInterval(hop, WANDER_MS);
    return () => clearInterval(t);
  }, [cardRef, w, h, W, H]);

  return spot;
}
