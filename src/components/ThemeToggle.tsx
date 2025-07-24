'use client'

import { useStore } from '@/store/useStore'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useStore()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            className={`
        relative inline-flex h-10 w-18 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark
                    ? 'bg-gradient-to-r from-slate-700 to-slate-600 focus:ring-slate-500'
                    : 'bg-gradient-to-r from-slate-200 to-slate-300 focus:ring-indigo-500'
                }
        hover:shadow-lg transform hover:scale-105
      `}
            aria-label="Toggle theme"
        >
            <span className="sr-only">Toggle theme</span>

            {/* Toggle circle */}
            <span
                className={`
          inline-block h-8 w-8 transform rounded-full transition-all duration-300 ease-in-out
          ${isDark
                        ? 'translate-x-9 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg'
                        : 'translate-x-1 bg-gradient-to-br from-white to-slate-50 shadow-md'
                    }
          flex items-center justify-center
        `}
            >
                {/* Sun Icon */}
                <svg
                    className={`
            h-4 w-4 transition-all duration-300 transform
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
            text-amber-500
          `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>

                {/* Moon Icon */}
                <svg
                    className={`
            absolute h-4 w-4 transition-all duration-300 transform
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
            text-slate-300
          `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            </span>

            {/* Background icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
                <svg
                    className={`
            h-4 w-4 transition-all duration-300
            ${isDark ? 'opacity-30' : 'opacity-60'}
            text-amber-400
          `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>

                <svg
                    className={`
            h-4 w-4 transition-all duration-300
            ${isDark ? 'opacity-60' : 'opacity-30'}
            text-slate-400
          `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            </div>
        </button>
    )
} 