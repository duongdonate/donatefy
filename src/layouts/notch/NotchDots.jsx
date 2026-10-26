// Hàng chấm chuyển thẻ ở đáy notch (giống bộ chấm bước ở landing, nằm ngang)
import { CARD } from "../notchCards";

const LABEL = { [CARD.NOW]: "Thẻ đang phát", [CARD.ACCOUNT]: "Thẻ tài khoản" };

export default function NotchDots({ cards, current, onPick }) {
  if (cards.length < 2) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      {cards.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={LABEL[c]}
          aria-current={c === current || undefined}
          onClick={() => onPick(c)}
          // vùng bấm 24px, chấm nhìn thấy nhỏ hơn
          className="grid h-6 place-items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 rounded-full"
        >
          <span className={`block h-2 rounded-full transition-all duration-300 ease-matcha ${c === current ? "w-6 bg-matcha-4" : "w-2 bg-white/30"}`} />
        </button>
      ))}
    </div>
  );
}
