// Matcappa nổi trên trang: bay tới `target` (chong chóng quay), nhìn theo chuột, nói khi chuột lại gần
import { useEffect, useRef, useState } from "react";
import Matcappa from "./Matcappa";
import MascotSpeech from "./MascotSpeech";
import { pickLine } from "./lines";

const FLY_MS = 1300, LIFT_MS = 250, LAND_MS = 200, TALK_MS = 900;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useMascotSize() {
  const [wide, setWide] = useState(() => window.innerWidth >= 820);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 820);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return wide ? { w: 110, h: 119 } : { w: 76, h: 82 };
}

export default function FlyingMascot({ target, pose = "stand", lines = [] }) {
  const size = useMascotSize();
  const el = useRef(null);
  const at = useRef(null); // vị trí đang đậu
  const want = useRef({ target, pose }); // đích mới nhất
  const flying = useRef(false);
  const alive = useRef(true);
  const [shownPose, setShownPose] = useState(pose);
  const [spin, setSpin] = useState(false);
  const [look, setLook] = useState(null);
  const [talking, setTalking] = useState(false);
  const [say, setSay] = useState({ i: -1, show: false, pos: null });
  const near = useRef(false);
  const lastLine = useRef(-1);

  const place = (p) => {
    if (el.current) el.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
  };
  const quiet = () => setSay((s) => ({ ...s, show: false }));

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    want.current = { target, pose };
    if (!at.current) {
      at.current = target;
      place(target);
      setShownPose(pose);
      return;
    }
    if (flying.current) return; // bay xong sẽ tự bay tiếp tới đích mới nhất
    const same = (a, b) => a.x === b.x && a.y === b.y;
    if (same(at.current, target)) {
      setShownPose(pose);
      return;
    }
    (async () => {
      flying.current = true;
      while (alive.current && !same(at.current, want.current.target)) {
        const a = at.current, b = want.current.target;
        quiet();
        if (reduced()) {
          place(b);
          at.current = b;
          break;
        }
        setSpin(true);
        await wait(LIFT_MS);
        const tilt = b.x > a.x ? 10 : b.x < a.x ? -10 : 0;
        const peak = Math.max(10, Math.min(a.y, b.y) - 90);
        const anim = el.current?.animate(
          [
            { transform: `translate(${a.x}px, ${a.y}px) rotate(0deg)` },
            { transform: `translate(${a.x}px, ${a.y - 40}px) rotate(${tilt}deg)`, offset: 0.18 },
            { transform: `translate(${(a.x + b.x) / 2}px, ${peak}px) rotate(${tilt}deg)`, offset: 0.55 },
            { transform: `translate(${b.x}px, ${b.y}px) rotate(0deg)` },
          ],
          { duration: FLY_MS, easing: "ease-in-out" }
        );
        // tab ẩn thì trình duyệt dừng vẽ, animation không xong: hẹn giờ dự phòng
        if (anim) await Promise.race([anim.finished.catch(() => {}), wait(FLY_MS + 150).then(() => anim.finish())]);
        place(b);
        at.current = b;
        await wait(LAND_MS);
      }
      if (alive.current) {
        setSpin(false);
        setShownPose(want.current.pose);
      }
      flying.current = false;
    })();
  }, [target, pose]);

  // Nhìn theo chuột; chuột vào gần thì nói một câu, phải ra xa rồi vào lại mới nói tiếp
  useEffect(() => {
    let talkTimer;
    const onMove = (e) => {
      if (!el.current) return;
      const r = el.current.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
      const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy) || 1;
      setLook({ x: (dx / d) * 3, y: (dy / d) * 2.5 });
      if (d < r.width * 1.1) {
        if (!near.current && !flying.current && lines.length) {
          lastLine.current = pickLine(lines, lastLine.current);
          const right = r.left < window.innerWidth / 2;
          const top = Math.min(Math.max(12, r.top + r.height * 0.2 - 24), window.innerHeight - 90);
          setSay({
            i: lastLine.current,
            show: true,
            pos: right ? { left: r.right + 6, top, side: "right" } : { right: window.innerWidth - r.left + 6, top, side: "left" },
          });
          setTalking(true);
          clearTimeout(talkTimer);
          talkTimer = setTimeout(() => setTalking(false), TALK_MS);
        }
        near.current = true;
      } else if (d > r.width * 1.8) near.current = false;
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      clearTimeout(talkTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, [lines]);

  useEffect(() => {
    if (at.current) place(at.current);
  }, [size.w]);

  const { side, ...pos } = say.pos ?? {};
  return (
    <>
      <div
        ref={el}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 will-change-transform"
        style={{ width: size.w, height: size.h }}
      >
        <Matcappa
          pose={shownPose}
          propeller={spin || shownPose === "hug-vinyl" ? "spin" : undefined}
          size={size.h}
          bob={!spin}
          look={look}
          talking={talking}
        />
      </div>
      <MascotSpeech
        text={lines[say.i]}
        show={say.show}
        side={side}
        onHide={quiet}
        className="fixed z-[45]"
        style={pos}
      />
    </>
  );
}
