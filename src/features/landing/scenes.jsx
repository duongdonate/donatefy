// Nội dung 3 bước của landing (landing-mascot.html)
import { Play } from "lucide-react";
import { Button, Glass, Vinyl } from "../../design";
import { PageLoader } from "../../components/Loader";

const d = (s) => ({ "--d": `${s}s` });
const Eyebrow = ({ children, delay }) => (
  <div className="ld-m text-[13px] font-bold uppercase tracking-[.22em] text-matcha-4 dark:text-matcha-1" style={d(delay)}>
    {children}
  </div>
);
const Start = ({ onStart, delay, className = "" }) => (
  <div className={`ld-m mt-6 flex flex-wrap gap-2.5 ${className}`} style={d(delay)}>
    <Button onClick={onStart} className="h-[52px] px-[26px] shadow-[0_14px_30px_-12px_rgba(73,115,0,.75)] hover:-translate-y-0.5">
      <Play size={16} fill="currentColor" /> Bắt đầu nghe
    </Button>
  </div>
);
const Lead = ({ children, delay, className = "" }) => (
  <p className={`ld-m mt-4 text-[17px] leading-relaxed text-ink-soft ${className}`} style={d(delay)}>
    {children}
  </p>
);

function Hero({ onStart }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="ld-m relative h-[300px] w-[420px]" style={d(0.05)}>
        <div className="ld-disc">
          <Vinyl size={236} />
        </div>
        <div className="ld-sleeve">
          <svg className="absolute right-[22px] top-[22px] h-[62px] w-[62px]" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(244,241,223,.7)" strokeWidth="2" />
            <path d="M50 18c18 14 22 40 0 64-22-24-18-50 0-64z" fill="rgba(244,241,223,.85)" />
            <path d="M50 26v50" stroke="#3f6b1c" strokeWidth="2" />
          </svg>
          <div className="absolute bottom-[46px] left-5 text-left font-script text-[38px] leading-[.95] text-[#f4f1df]">
            Cha-Cha
            <br />
            -Cha
          </div>
          <div className="absolute bottom-[22px] left-[22px] text-[10px] font-bold tracking-[.22em] text-[rgba(244,241,223,.7)]">
            DONATEFY · VOL. 01
          </div>
        </div>
      </div>
      <Eyebrow delay={0.15}>Nhạc của bạn · đĩa của bạn</Eyebrow>
      <h1 className="ld-m mt-3 text-[clamp(32px,4.8vw,54px)] font-extrabold leading-[1.08] tracking-[-.035em]" style={d(0.22)}>
        Pha một chén nhạc,
        <br />
        thả lên chiếc đĩa matcha.
      </h1>
      <Lead delay={0.3} className="mx-auto max-w-[540px]">
        Dán link YouTube, gom thành playlist, rồi nghe trên một chiếc đĩa than quay chậm. Không quảng cáo, không rối mắt,
        chỉ có bạn và bài hát.
      </Lead>
      <Start onStart={onStart} delay={0.38} className="justify-center" />
    </div>
  );
}

const DOCK = [
  { bg: "#c8b6a6", t: "rotateY(40deg)", f: "saturate(.45)" },
  { bg: "#8fa7b3", t: "rotateY(40deg)", f: "saturate(.45)" },
  { bg: "#e3b6c4", now: true },
  { bg: "#5f6f52", t: "rotateY(-40deg)" },
  { bg: "linear-gradient(135deg,#c7a17a,#6b4a2e)", t: "rotateY(-40deg)" },
];

function Experience({ onStart }) {
  return (
    <div className="grid w-[min(1060px,100%)] items-center gap-5 text-center min-[821px]:grid-cols-[1.2fr_.8fr] min-[821px]:gap-14 min-[821px]:text-left">
      <div className="ld-m ld-device" style={d(0.08)}>
        <div className="ld-device-inner">
          <div className="ld-screen bg-cafe relative aspect-[4/3] overflow-hidden rounded-2xl text-ink">
            <div className="absolute inset-x-0 top-[4cqw] text-center text-[3.6cqw] font-extrabold">
              ái
              <small className="block text-[1.5cqw] font-medium opacity-70">tlinh</small>
            </div>
            <div className="absolute left-[33cqw] top-[15cqw] w-[34cqw]">
              <Vinyl size={200} label="#e3b6c4" style={{ width: "100%", height: "auto", aspectRatio: "1" }} />
            </div>
            <Glass blur={10} className="absolute right-[2cqw] top-[14cqw] h-[34cqw] w-[6cqw] rounded-[3cqw]" />
            <Glass
              blur={10}
              className="absolute bottom-[2.2cqw] left-[12cqw] right-[12cqw] flex h-[15cqw] items-center justify-center gap-[1.4cqw] rounded-[2.6cqw] [perspective:50cqw]"
            >
              {DOCK.map((c, i) => (
                <span
                  key={i}
                  className="aspect-square rounded-[.9cqw] shadow-[0_1.4cqw_2cqw_-1cqw_rgba(0,0,0,.5)]"
                  style={{
                    background: c.bg,
                    width: c.now ? "9.5cqw" : "8cqw",
                    transform: c.t,
                    filter: c.f,
                    boxShadow: c.now ? "0 0 0 .3cqw #497300, 0 1.4cqw 2cqw -1cqw rgba(0,0,0,.5)" : undefined,
                  }}
                />
              ))}
            </Glass>
          </div>
        </div>
      </div>
      <div>
        <Eyebrow delay={0.18}>Trải nghiệm</Eyebrow>
        <h2 className="ld-m mt-3 text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.12] tracking-[-.03em]" style={d(0.26)}>
          Một màn hình.
          <br />
          Một chiếc đĩa.
        </h2>
        <Lead delay={0.34} className="mx-auto max-w-[380px] min-[821px]:mx-0">
          Đĩa quay theo nhạc, dải bìa ở đáy để lướt bài, mọi nút khác tự ẩn cho tới khi bạn cần.
        </Lead>
        <Start onStart={onStart} delay={0.42} className="justify-center min-[821px]:justify-start" />
      </div>
    </div>
  );
}

function About({ onStart }) {
  return (
    <div className="grid w-[min(1040px,100%)] items-center gap-5 text-center min-[821px]:grid-cols-[.9fr_1.1fr] min-[821px]:gap-12 min-[821px]:text-left">
      <div className="ld-m grid place-items-center" style={d(0.1)}>
        <div className="min-[821px]:hidden">
          <PageLoader decorative size={240} />
        </div>
        <div className="hidden min-[821px]:block">
          <PageLoader decorative size={348} />
        </div>
      </div>
      <div>
        <Eyebrow delay={0.2}>Về Matcha Cha-Cha-Cha</Eyebrow>
        <h2 className="ld-m mt-3 text-[clamp(30px,3.8vw,46px)] font-extrabold leading-[1.12] tracking-[-.03em]" style={d(0.28)}>
          Nghe nhạc chậm lại,
          <br />
          như pha một chén trà.
        </h2>
        <Lead delay={0.36}>
          Donatefy là một dự án cá nhân dành cho những ai thích nghe nhạc theo kiểu cũ: chọn từng bài, xếp từng chồng đĩa,
          rồi để nó quay. Màu matcha, kính mờ và chiếc chasen nhỏ này là cách chúng tôi nói &ldquo;thong thả thôi&rdquo;.
        </Lead>
        <div className="ld-m mt-4 font-hand text-[34px] text-matcha-3 dark:text-matcha-1" style={d(0.44)}>
          Thong thả thôi ~
        </div>
        <Start onStart={onStart} delay={0.5} className="justify-center min-[821px]:justify-start" />
      </div>
    </div>
  );
}

export const SCENES = [
  { label: "Giới thiệu", ghost: "Matcha", Body: Hero },
  { label: "Trải nghiệm", ghost: "Vinyl", Body: Experience },
  { label: "Về Matcha Cha-Cha-Cha", ghost: "Cha-Cha", Body: About },
];
