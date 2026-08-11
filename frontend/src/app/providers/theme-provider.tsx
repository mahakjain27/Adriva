import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { defaultTheme, themeRegistry, type ThemeName } from "@/lib/theme"

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Wraps the app in the active theme scope. Switching `theme` only changes
 * visuals once a theme has real CSS under `.theme-<name>` — see
 * docs/design-system.md. Until then every theme renders as `default`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme)

  const value = useMemo(() => ({ theme, setTheme }), [theme])
  const className = themeRegistry[theme].className

  return (
    <ThemeContext.Provider value={value}>
      <div className={className || undefined} data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
