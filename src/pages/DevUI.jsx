// Trang trưng bày component v2, chỉ có khi chạy dev (/dev/ui)
import { ListMusic, Moon, Shuffle, Sun, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button, Glass, IconButton } from "../design";
import { useTheme } from "../contexts/ThemeContext";
import { PageLoader } from "../components/Loader";
import Matcappa from "../mascot/Matcappa";

const POSES = ["stand", "hug-knees", "hug-vinyl", "doze"];
const PROPS = ["still", "spin", "droop"];

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-[.14em] text-ink-soft">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export default function DevUI() {
  const { isDark, toggleTheme } = useTheme();
  const [shuffle, setShuffle] = useState(true);

  return (
    <main className="bg-cafe relative min-h-screen space-y-10 overflow-hidden p-8 text-ink">
      <div className="pointer-events-none absolute -z-0 left-1/3 top-20 h-96 w-96 rounded-full bg-matcha-2/40 blur-3xl" />
      <header className="relative flex items-center justify-between">
        <h1 className="font-script text-5xl text-matcha-4 dark:text-matcha-1">Matcha Cha-Cha-Cha</h1>
        <IconButton label={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"} onClick={toggleTheme}>
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
      </header>

      <Section title="Màu">
        {["bg-matcha-1", "bg-matcha-2", "bg-matcha-3", "bg-matcha-4", "bg-matcha-4/50", "bg-cream", "bg-ink", "bg-ink-soft", "bg-mascot"].map((c) => (
          <div key={c} className="text-center text-xs">
            <div data-swatch={c} className={`${c} h-14 w-14 rounded-2xl border border-white/50`} />
            {c.replace("bg-", "")}
          </div>
        ))}
        <p className="font-hand text-2xl text-matcha-3">Thong thả thôi ~</p>
      </Section>

      <Section title="Kính">
        {[8, 18, 30].map((b) => (
          <Glass key={b} blur={b} className="grid h-24 w-40 place-items-center rounded-3xl">
            blur {b}px
          </Glass>
        ))}
      </Section>

      <Section title="Nút">
        {["primary", "secondary", "ghost"].map((v) =>
          ["md", "sm"].map((s) => (
            <Button key={v + s} variant={v} size={s}>
              {v} {s}
            </Button>
          ))
        )}
        <Button disabled>Đang khoá</Button>
      </Section>

      <Section title="Icon">
        <IconButton label="Trộn bài" pressed={shuffle} onClick={() => setShuffle((x) => !x)}>
          <Shuffle size={20} />
        </IconButton>
        <IconButton label="Hàng chờ">
          <ListMusic size={20} />
        </IconButton>
        <IconButton label="Âm lượng" size={48}>
          <Volume2 size={22} />
        </IconButton>
      </Section>

      <Section title="Loader">
        <PageLoader size={80} />
        <PageLoader size={160} />
      </Section>

      <Section title="Matcappa">
        <div className="text-center text-xs">
          <Matcappa size={240} label="Matcappa, bấm để nhảy" />
          bấm thử
        </div>
        <div className="grid grid-cols-4 gap-3">
          {PROPS.map((p) =>
            POSES.map((pose) => (
              <div key={pose + p} className="rounded-2xl bg-white/40 p-2 text-center text-xs dark:bg-white/5">
                <Matcappa pose={pose} propeller={p} size={110} />
                {pose} · {p}
              </div>
            ))
          )}
        </div>
      </Section>
    </main>
  );
}
