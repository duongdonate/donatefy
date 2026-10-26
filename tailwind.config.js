/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
        script: ["Yellowtail", "cursive"],
        hand: ['"Dancing Script"', "cursive"],
      },
      transitionDuration: { 400: "400ms", 900: "900ms" },
      transitionTimingFunction: { matcha: "cubic-bezier(.2,.8,.2,1)" },
      colors: {
        matcha: {
          1: "rgb(var(--matcha-1) / <alpha-value>)",
          2: "rgb(var(--matcha-2) / <alpha-value>)",
          3: "rgb(var(--matcha-3) / <alpha-value>)",
          4: "rgb(var(--matcha-4) / <alpha-value>)",
        },
        cream: "rgb(var(--cream) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        mascot: "rgb(var(--mascot) / <alpha-value>)",
        background: "var(--background)",
        "background-hover": "var(--background-hover)",
        foreground: "var(--foreground)",
        "foreground-hover": "var(--foreground-hover)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      keyframes: {
        // sóng nhạc notch: co giãn theo trục dọc (transform, nhẹ hơn đổi height)
        wave: {
          "0%, 100%": { transform: "scaleY(.25)" },
          "50%": { transform: "scaleY(1)" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        wave: "wave 0.9s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
