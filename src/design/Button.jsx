export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-4 focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

const VARIANTS = {
  primary: "bg-matcha-4 text-white hover:bg-matcha-3",
  secondary: "glass text-ink hover:bg-white/50",
  ghost: "text-ink hover:bg-white/40",
};
const SIZES = { md: "h-11 px-6 text-base", sm: "h-9 px-4 text-sm" };

export default function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 ease-matcha active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${focusRing} ${className}`}
      {...props}
    />
  );
}
