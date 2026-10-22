// Cần đọc (visual-direction-v3.html): hạ lên đĩa khi phát, nhấc ra -18° khi dừng
export default function Tonearm({ down }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 220"
      className="pointer-events-none absolute left-[82%] top-[-9%] w-[32%] drop-shadow-[0.6vw_1vw_0.8vw_rgba(0,0,0,.3)] transition-transform duration-[800ms] ease-[cubic-bezier(.3,1.3,.5,1)] motion-reduce:transition-none"
      style={{ transformOrigin: "70% 10%", transform: down ? "none" : "rotate(-18deg)" }}
    >
      <circle cx="70" cy="22" r="18" fill="#3b4a2c" stroke="#26331b" strokeWidth="3" />
      <circle cx="70" cy="22" r="7" fill="#c9d8a0" />
      <path d="M70 30 L66 150 L40 190" stroke="#3b4a2c" strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="26" y="182" width="22" height="30" rx="4" fill="#26331b" transform="rotate(30 37 197)" />
    </svg>
  );
}
