// Mascot Matcappa (matcappa-smiski-v3.html), SVG 2D, không bóng đổ
import { useEffect, useId, useRef, useState } from "react";
import "./matcappa.css";

const INK = "#1f2e17", LIMB = "#c6dd8c", LIMB_D = "#b6cf7c";
const HOP_MS = 600, SPIN_MS = 1800;

function Eyes({ closed }) {
  if (closed)
    return [78, 122].map((x) => (
      <path key={x} d={`M${x - 5} 108 Q${x} 112 ${x + 5} 108`} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    ));
  return (
    <g className="mc-blink">
      {[78, 122].map((x) => (
        <ellipse key={x} cx={x} cy="108" rx="4.6" ry="5.4" fill={INK} />
      ))}
    </g>
  );
}

function Leaves() {
  return (
    <g className="mc-leaves">
      <path d="M100 26 Q82 10 56 17 Q77 35 100 26Z" fill="#7da447" />
      <path d="M100 26 Q118 10 144 17 Q123 35 100 26Z" fill="#5f8a2c" />
      <path d="M98 25 Q80 19 62 19 M102 25 Q120 19 138 19" fill="none" stroke="#b6d08a" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

// Đang quay: nhìn chéo từ trên nên là một elip mờ có vệt sáng chạy vòng
function Whirl({ grad }) {
  return (
    <g className="mc-whirl">
      <ellipse className="mc-flick" cx="100" cy="24" rx="46" ry="9" fill={`url(#${grad})`} />
      <ellipse className="mc-streak" pathLength="100" cx="100" cy="24" rx="40" ry="7.6" fill="none" stroke="#4f7a22" strokeOpacity=".45" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="22 28" />
      <ellipse className="mc-streak mc-streak2" pathLength="100" cx="100" cy="24" rx="27" ry="5.2" fill="none" stroke="#f0f9cf" strokeOpacity=".8" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="14 36" />
    </g>
  );
}

function Head({ ids, tilt = 0, dy = 0, closed = false, droop = false }) {
  return (
    <g transform={`translate(0 ${dy}) rotate(${tilt} 100 150)`}>
      <rect x="97.6" y="27" width="4.8" height="26" rx="2.4" fill="#7d8f4a" />
      {droop ? (
        <>
          <path d="M100 28 Q86 28 74 42 Q92 44 100 28Z" fill="#7da447" />
          <path d="M100 28 Q114 28 126 42 Q108 44 100 28Z" fill="#5f8a2c" />
        </>
      ) : (
        <>
          <Leaves />
          <Whirl grad={ids.whirl} />
        </>
      )}
      <circle cx="100" cy="26" r="3.4" fill="#6b7d3e" />
      <rect x="34" y="50" width="132" height="102" rx="48" fill={`url(#${ids.body})`} />
      <ellipse cx="66" cy="72" rx="16" ry="8" fill="#fff" opacity=".35" transform="rotate(-20 66 72)" />
      <Eyes closed={closed} />
      <ellipse cx="64" cy="120" rx="9" ry="4.5" fill="#f4a6a6" opacity=".45" />
      <ellipse cx="136" cy="120" rx="9" ry="4.5" fill="#f4a6a6" opacity=".45" />
      <path d="M93 119 Q100 114 107 119 Q100 125 93 119Z" fill="#f2c35b" stroke="#d29a34" strokeWidth="1" />
    </g>
  );
}

const Limb = ({ x, y, rx, ry, rot, c = LIMB }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c} transform={`rotate(${rot} ${x} ${y})`} />
);
const Body = ({ ids, y, h }) => <rect x="78" y={y} width="44" height={h} rx="15" fill={`url(#${ids.body})`} />;
const Legs = () => (
  <>
    <rect x="85" y="184" width="12" height="20" rx="6" fill={LIMB} />
    <rect x="103" y="184" width="12" height="20" rx="6" fill={LIMB} />
  </>
);
const Feet = () => (
  <>
    <ellipse cx="89" cy="200" rx="8" ry="5" fill={LIMB} />
    <ellipse cx="111" cy="200" rx="8" ry="5" fill={LIMB} />
  </>
);

function Pose({ pose, ids, droop }) {
  if (pose === "hug-knees")
    return (
      <>
        <Body ids={ids} y={150} h={40} />
        <circle cx="91" cy="180" r="10" fill={LIMB_D} />
        <circle cx="109" cy="180" r="10" fill={LIMB_D} />
        <Limb x={100} y={184} rx={22} ry={5.5} rot={0} />
        <Feet />
        <Head ids={ids} tilt={6} dy={8} droop={droop} />
      </>
    );
  if (pose === "hug-vinyl")
    return (
      <>
        <Legs />
        <Body ids={ids} y={144} h={46} />
        <g className="mc-disc">
          <circle cx="100" cy="172" r="18" fill="#1b1b1b" />
          <circle cx="100" cy="172" r="13.5" fill="none" stroke="#2e2e2e" strokeWidth="1" />
          <circle cx="100" cy="172" r="6.5" fill="#c9e39a" />
          <circle cx="100" cy="172" r="1.4" fill="#1b1b1b" />
        </g>
        <Limb x={82} y={168} rx={5.5} ry={11} rot={-38} />
        <Limb x={118} y={168} rx={5.5} ry={11} rot={38} />
        <Head ids={ids} droop={droop} />
      </>
    );
  if (pose === "doze")
    return (
      <>
        <Body ids={ids} y={150} h={40} />
        <Limb x={76} y={176} rx={5.5} ry={13} rot={26} />
        <Limb x={124} y={176} rx={5.5} ry={13} rot={-26} />
        <Feet />
        <Head ids={ids} tilt={12} dy={10} closed droop={droop} />
        <text x="160" y="70" fontSize="16" fontWeight="800" fill="#688e31">z</text>
        <text x="172" y="56" fontSize="12" fontWeight="800" fill="#688e31">z</text>
      </>
    );
  return (
    <>
      <Legs />
      <Body ids={ids} y={144} h={46} />
      <Limb x={74} y={168} rx={5.5} ry={15} rot={14} />
      <Limb x={126} y={168} rx={5.5} ry={15} rot={-14} />
      <Head ids={ids} tilt={-4} droop={droop} />
    </>
  );
}

export default function Matcappa({ pose = "stand", propeller, size = 160, label = "Matcappa", onClick, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const ids = { body: `${uid}b`, whirl: `${uid}w` };
  const prop = propeller ?? (pose === "doze" ? "droop" : "still");
  const [hop, setHop] = useState(0); // đổi key để chạy lại animation nhảy
  const [tapSpin, setTapSpin] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleClick = (e) => {
    setHop((n) => n + 1);
    setTapSpin(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setTapSpin(false), SPIN_MS);
    onClick?.(e);
  };
  const spinning = prop === "spin" || tapSpin;

  return (
    <svg
      key={hop}
      viewBox="0 0 200 216"
      role="img"
      aria-label={label}
      onClick={handleClick}
      className={`mc ${spinning ? "mc-spinning" : ""} ${hop ? "mc-hop" : ""} ${className}`}
      style={{ height: size, width: (size * 200) / 216, "--mc-hop": `${HOP_MS}ms` }}
    >
      <defs>
        <linearGradient id={ids.body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6f4bd" />
          <stop offset=".7" stopColor="#d8eca0" />
          <stop offset="1" stopColor="#c3da8a" />
        </linearGradient>
        <radialGradient id={ids.whirl}>
          <stop offset="0" stopColor="#5f8a2c" stopOpacity=".7" />
          <stop offset=".55" stopColor="#7da447" stopOpacity=".38" />
          <stop offset="1" stopColor="#9cbf63" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="mc-bob">
        <Pose pose={pose} ids={ids} droop={prop === "droop" && !tapSpin} />
      </g>
    </svg>
  );
}
