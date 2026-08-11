import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "@/app/providers/theme-provider"
import { fadeIn } from "@/components/motion"
import { ProfileEngine } from "@/features/profiles"
import { mockProfile } from "@/features/profiles/mock/profile.mock"
import { getProfileTheme, profileThemeNames } from "@/features/profiles/theme"

/**
 * Dev-only theme preview. Not part of the real app — see AppRouter, which
 * only registers this route when `import.meta.env.DEV` is true.
 */
export function PlaygroundRoute() {
  const { theme, setTheme } = useTheme()
  const profileTheme = getProfileTheme(theme)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <header className="flex flex-wrap gap-2">
        {profileThemeNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTheme(name)}
            aria-pressed={theme === name}
            className="rounded-full border px-3 py-1 text-sm capitalize aria-pressed:border-foreground aria-pressed:font-medium"
          >
            {name}
          </button>
        ))}
      </header>

      <AnimatePresence mode="wait">
        <motion.div key={theme} initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
          <ProfileEngine profile={mockProfile} theme={profileTheme} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
