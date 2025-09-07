import { useEffect, useState } from "react";

export default function useSticky(ref, top = 0) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    // sentinel nằm ngay trên element cần theo dõi
    const sentinel = document.createElement("div");
    sentinel.style.position = "absolute";
    sentinel.style.top = `${top}px`;
    ref.current.parentNode.insertBefore(sentinel, ref.current);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.intersectionRatio < 1);
      },
      { threshold: [1] }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
    };
  }, [ref, top]);

  return isSticky;
}
