import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 青花配色 - 浅色霁风 主色系列
        "porcelain": {
          deep: "#183b90",      // 珠明料 - 最深强调
          dark: "#425691",      // 元子 - 深色强调
          DEFAULT: "#4074b1",   // 平等青 - 主色调
          light: "#5A8FC9",     // 浅平等青 - hover状态
          pale: "#A8C4E0",      // 霁蓝 - 装饰色
          muted: "#D4E4F0",     // 极浅蓝 - 背景装饰
        },
        // 青花配色 - 浅色霁风 背景系列
        "porcelain-white": {
          DEFAULT: "#f2f0e9",   // 高白泥 - 主背景 (米白色)
          ivory: "#E8E6DF",     // 浅白泥 - 次要背景
          cream: "#DEDCD5",     // 奶油白 - 边框装饰
          pure: "#FFFFFF",      // 纯白 - 卡片背景
        },
        // 文字颜色
        "ink": {
          black: "#1A2332",     // 墨黑 - 主标题
          gray: "#3A4A5C",      // 灰黑 - 次要文字
          light: "#6A7A8C",     // 浅灰 - 提示文字
          muted: "#9AA8B8",     // 更浅灰 - 禁用状态
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: [
          "Noto Sans SC",
          "Source Han Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "Hiragino Sans GB",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        // 青花配色渐变
        "porcelain-gradient": "linear-gradient(135deg, #183b90 0%, #425691 25%, #4074b1 100%)",
        "porcelain-soft": "linear-gradient(135deg, #4074b1 0%, #A8C4E0 100%)",
        "porcelain-white-gradient": "linear-gradient(180deg, #FFFFFF 0%, #f2f0e9 50%, #E8E6DF 100%)",
        "porcelain-mist": "linear-gradient(180deg, rgba(64,116,177,0.08) 0%, transparent 100%)",
        "porcelain-gloss": "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)",
      },
      boxShadow: {
        // 青花主题阴影 - 柔和淡雅
        "porcelain": "0 4px 20px rgba(64, 116, 177, 0.10)",
        "porcelain-lg": "0 8px 40px rgba(64, 116, 177, 0.14)",
        "porcelain-xl": "0 12px 60px rgba(64, 116, 177, 0.18)",
        "porcelain-inner": "inset 0 2px 8px rgba(64, 116, 177, 0.06)",
      },
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
