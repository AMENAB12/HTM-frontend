export const themes = {
  light: {
    // Background colors
    bg: {
      primary: "bg-slate-50",
      secondary: "bg-white",
      card: "bg-white/80 backdrop-blur-sm",
      hover: "hover:bg-slate-100",
    },
    // Text colors
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      muted: "text-slate-500",
      accent: "text-slate-700",
    },
    // Border colors
    border: {
      primary: "border-slate-200/60",
      secondary: "border-slate-300/40",
      hover: "hover:border-slate-300",
    },
    // Accent colors with smooth gradients
    accents: {
      primary: {
        bg: "bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600",
        text: "text-indigo-600",
        border: "border-indigo-200",
        light: "bg-indigo-50/50",
      },
      success: {
        bg: "bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600",
        text: "text-emerald-600",
        border: "border-emerald-200",
        light: "bg-emerald-50/50",
      },
      warning: {
        bg: "bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600",
        text: "text-amber-600",
        border: "border-amber-200",
        light: "bg-amber-50/50",
      },
      danger: {
        bg: "bg-gradient-to-br from-red-400 via-rose-500 to-red-600",
        text: "text-red-600",
        border: "border-red-200",
        light: "bg-red-50/50",
      },
      info: {
        bg: "bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600",
        text: "text-blue-600",
        border: "border-blue-200",
        light: "bg-blue-50/50",
      },
      purple: {
        bg: "bg-gradient-to-br from-violet-400 via-purple-500 to-violet-600",
        text: "text-purple-600",
        border: "border-purple-200",
        light: "bg-purple-50/50",
      },
    },
  },
  dark: {
    // Background colors
    bg: {
      primary: "bg-slate-900",
      secondary: "bg-slate-800/90",
      card: "bg-slate-800/60 backdrop-blur-sm",
      hover: "hover:bg-slate-700/50",
    },
    // Text colors
    text: {
      primary: "text-slate-100",
      secondary: "text-slate-300",
      muted: "text-slate-400",
      accent: "text-slate-200",
    },
    // Border colors
    border: {
      primary: "border-slate-700/60",
      secondary: "border-slate-600/40",
      hover: "hover:border-slate-600",
    },
    // Accent colors with smooth gradients
    accents: {
      primary: {
        bg: "bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-500",
        text: "text-indigo-400",
        border: "border-indigo-500/30",
        light: "bg-indigo-900/20",
      },
      success: {
        bg: "bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        light: "bg-emerald-900/20",
      },
      warning: {
        bg: "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500",
        text: "text-amber-400",
        border: "border-amber-500/30",
        light: "bg-amber-900/20",
      },
      danger: {
        bg: "bg-gradient-to-br from-red-400 via-rose-400 to-red-500",
        text: "text-red-400",
        border: "border-red-500/30",
        light: "bg-red-900/20",
      },
      info: {
        bg: "bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500",
        text: "text-blue-400",
        border: "border-blue-500/30",
        light: "bg-blue-900/20",
      },
      purple: {
        bg: "bg-gradient-to-br from-violet-400 via-purple-400 to-violet-500",
        text: "text-purple-400",
        border: "border-purple-500/30",
        light: "bg-purple-900/20",
      },
    },
  },
};

export type Theme = keyof typeof themes;
export type ThemeConfig = typeof themes.light;

export const getTheme = (theme: Theme): ThemeConfig => themes[theme];
