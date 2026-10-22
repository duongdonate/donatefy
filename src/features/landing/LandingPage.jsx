// Landing cuộn từng bước: mỗi lần lăn / phím / vuốt chỉ sang 1 bước, trang không cuộn
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Glass } from "../../design";
import { useAuth } from "../../contexts/AuthContext";
import { SCENES } from "./scenes";
import { LOCK_MS, MASCOT_SPOTS, accumulateWheel, clampStep, fitScale, stepFromKey, swipeDir } from "./stepper";
import FlyingMascot, { useMascotSize } from "../../mascot/FlyingMascot";
import { cornerXY } from "../../mascot/flight";
import { LANDING_LINES } from "../../mascot/lines";
import "./landing.css";

const pad2 = (n) => String(n).padStart(2, "0");

// Giữ cùng một object khi góc / kích thước không đổi để mascot không bay lại
function useMascotTarget(corner, pet, view) {
  const { x, y } = cornerXY(corner, pet, view);
  return useMemo(() => ({ x, y }), [x, y]);
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(-1);
  const stepRef = useRef(0);
  const locked = useRef(false);
  const boxes = useRef([]);
  const pet = useMascotSize();
  const [view, setView] = useState({ W: window.innerWidth, H: window.innerHeight });
  const spot = MASCOT_SPOTS[step];
  const target = useMascotTarget(spot.corner, pet, view);

  const go = useCallback((n) => {
    const to = clampStep(n);
    if (locked.current || to === stepRef.current) return;
    locked.current = true;
    setLeaving(stepRef.current);
    setTimeout(() => {
      locked.current = false;
      setLeaving(-1);
    }, LOCK_MS);
    stepRef.current = to;
    setStep(to);
  }, []);

  // Trang đứng yên, chỉ nội dung đổi
  useEffect(() => {
    const html = document.documentElement, prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = document.body.style.overflow = "hidden";
    return () => ([html.style.overflow, document.body.style.overflow] = prev);
  }, []);

  useEffect(() => {
    let acc = 0, spent = false, accTimer, startY = null;
    const onWheel = (e) => {
      e.preventDefault();
      clearTimeout(accTimer);
      // nghỉ 160ms mới tính là cú lăn mới
      accTimer = setTimeout(() => {
        acc = 0;
        spent = false;
      }, 160);
      const r = accumulateWheel(acc, e.deltaY, spent);
      acc = r.acc;
      spent = r.spent;
      if (r.dir) go(stepRef.current + r.dir);
    };
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable]")) return;
      const n = stepFromKey(e.key, stepRef.current);
      if (n === null) return;
      if (e.key === " " && e.target.closest?.("button, a")) return; // Space trên nút là bấm nút
      e.preventDefault();
      go(n);
    };
    const onTouchStart = (e) => (startY = e.touches[0].clientY);
    const onTouchEnd = (e) => {
      if (startY === null) return;
      const dir = swipeDir(startY, e.changedTouches[0].clientY);
      if (dir) go(stepRef.current + dir);
      startY = null;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      clearTimeout(accTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [go]);

  // Màn thấp / hẹp: thu nhỏ đều nội dung mỗi bước cho vừa một màn hình
  useEffect(() => {
    const fit = () =>
      boxes.current.forEach((box) => {
        if (!box) return;
        box.style.scale = "1";
        const sc = box.parentElement, cs = getComputedStyle(sc);
        const avail = {
          w: sc.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
          h: sc.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
        };
        box.style.scale = String(fitScale(avail, { w: box.offsetWidth, h: box.offsetHeight }));
      });
    const onResize = () => {
      fit();
      setView({ W: window.innerWidth, H: window.innerHeight });
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onStart = () => navigate(user ? "/listen" : "/login");

  return (
    <div className="ld text-ink" data-step={step}>
      <div className="ld-blob a -z-[2] h-[520px] w-[520px] bg-matcha-1 opacity-70" style={{ left: -160, top: -120 }} />
      <div className="ld-blob b -z-[2] h-[420px] w-[420px] bg-[#f2c9c9] opacity-45 dark:opacity-10" style={{ right: -140, top: 220 }} />
      {SCENES.map((s, i) => (
        <div key={s.ghost} aria-hidden="true" className={`ld-ghost -z-[1] ${i === step ? "on" : ""} ${i < step ? "gone" : ""}`}>
          {s.ghost}
        </div>
      ))}

      {SCENES.map(({ label, Body }, i) => (
        <section
          key={label}
          aria-label={label}
          aria-hidden={i !== step}
          inert={i !== step}
          className={`ld-scene ${i < step ? "prev" : i > step ? "next" : "current"} ${i === leaving ? "leaving" : ""}`}
        >
          <div ref={(el) => (boxes.current[i] = el)} className="flex flex-none flex-col items-center">
            <Body onStart={onStart} />
          </div>
        </section>
      ))}

      <Glass
        as="nav"
        aria-label="Chuyển nội dung"
        className="fixed right-3 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-3.5 rounded-full px-2.5 py-3.5 min-[821px]:right-7"
      >
        {SCENES.map(({ label }, i) => (
          <button
            key={label}
            aria-label={label}
            aria-current={i === step ? "step" : undefined}
            onClick={() => go(i)}
            className={`w-2.5 rounded-full transition-all duration-400 ease-matcha focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 focus-visible:ring-offset-2 ${
              i === step ? "h-[30px] bg-matcha-4" : "h-2.5 bg-ink/25"
            }`}
          />
        ))}
      </Glass>
      <div aria-hidden="true" className="fixed bottom-[22px] left-[18px] z-50 text-sm font-bold tracking-[.1em] text-ink-soft tabular-nums min-[821px]:bottom-[30px] min-[821px]:left-8">
        <b className="text-[22px] text-ink">{pad2(step + 1)}</b> / {pad2(SCENES.length)}
      </div>
      <div
        aria-hidden="true"
        className={`ld-hint fixed bottom-8 right-8 z-50 hidden items-center gap-2 text-xs font-bold tracking-[.22em] text-ink-soft transition-opacity min-[821px]:flex ${
          step === SCENES.length - 1 ? "opacity-0" : ""
        }`}
      >
        LĂN CHUỘT
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="1" y="1" width="12" height="18" rx="6" />
          <path d="M7 5v4" />
        </svg>
      </div>
      <FlyingMascot target={target} pose={spot.pose} lines={LANDING_LINES[step]} />
    </div>
  );
}
