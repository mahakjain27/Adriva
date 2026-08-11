# Adriva Design System

Foundation layer for Adriva UI: tokens, motion, and the theme
architecture — plus the one shared profile template every theme renders
through (`frontend/src/features/profiles/sections/`).

## Foundations

### Colors

Owned by shadcn/ui in `frontend/src/index.css` (`:root` / `.dark`, neutral
base color, oklch values). Don't duplicate the color system elsewhere —
extend it there if new semantic colors (e.g. `--success`, `--warning`) are
needed.

### Typography

`frontend/src/styles/tokens.css`

- `--font-sans` → Inter Variable (body/UI text)
- `--font-heading` → Plus Jakarta Sans Variable (headings/display)
- Semantic type scale: `--text-display`, `--text-headline`, `--text-title`,
  `--text-body`, `--text-caption` (each paired with a `--line-height` and,
  where relevant, `--letter-spacing`), on top of Tailwind's default `text-*`
  scale.

Fonts are self-hosted via Fontsource (`@fontsource-variable/inter`,
`@fontsource-variable/plus-jakarta-sans`), imported in
`frontend/src/styles/fonts.css`. No Google Fonts network dependency.

### Shadows

`frontend/src/styles/tokens.css` — `--shadow-xs` through `--shadow-xl`, plus
`--shadow-glow`. Soft and diffused by design (low opacity, wide blur, no hard
edges), with darker/higher-opacity overrides under `.dark`.

### Radius

Inherited from shadcn/ui (`--radius` and its derived `--radius-sm` …
`--radius-4xl` in `frontend/src/index.css`). Not duplicated here.

### Spacing

Tailwind's default spacing scale, plus two semantic tokens in
`tokens.css`: `--spacing-gutter` (mobile content padding) and
`--spacing-section` (vertical rhythm between page sections).

### Z-index

`frontend/src/styles/tokens.css` — an ordered scale from `--z-dropdown`
(1000) up through `--z-tooltip` (1600). Always reach for the token; never a
raw number.

### Motion

Raw tokens live in `frontend/src/lib/motion-tokens.ts`:

- `duration.instant/fast/base/slow` (seconds) — interactions stay under
  300ms, entrances run 300–450ms.
- `easing.standard/entrance/exit` (cubic-bezier)
- `spring.soft/snappy` (Framer Motion spring transitions)

Composed presets live in `frontend/src/components/motion/presets.ts` and are
exported from `frontend/src/components/motion/index.ts`:

`fadeIn` · `slideUp` · `slideDown` · `scaleIn` · `staggerContainer` ·
`staggerItem` · `floating` · `hoverLift` · `buttonPress` · `pageTransition`

```tsx
import { motion } from "framer-motion"
import { slideUp } from "@/components/motion"

<motion.div initial="hidden" animate="visible" variants={slideUp}>
  ...
</motion.div>
```

### Icons

lucide-react is the only icon set. Sizing/stroke tokens in
`frontend/src/lib/icons.ts` (`ICON_SIZE.sm/md/lg/xl`, `ICON_STROKE_WIDTH`) —
use them instead of ad hoc `size`/`strokeWidth` props so icons stay
consistent across the app.

## Theme architecture

Every public profile — and every live preview in the admin (Theme Builder,
Themes gallery, company/employee Theme settings) — renders through **one**
structural component tree: `frontend/src/features/profiles/sections/`
(Header, Hero, QuickActions, About, Products, Scan-to-Chat, Location,
Working Hours, Enquiry, Footer), assembled by
`frontend/src/features/profiles/ProfileEngine.tsx`. The five themes —
Executive, Luxury, Modern, Minimal, Glass — are **token presets** consumed by
that same component tree, not separate components. A theme changing means
different CSS variable values and a few structural *flags* (hero layout,
card chrome, avatar shape) flow into those shared components — never a
different Hero/About/Products implementation per theme.

**Pieces:**

- `frontend/src/lib/theme/types.ts` — `ThemeName`, `ThemeDefinition`.
- `frontend/src/lib/theme/registry.ts` — `themeRegistry`, the single source
  of truth for every theme's label, description, CSS class, and `status`
  (all five are `"available"`).
- `frontend/src/styles/themes/*.css` — one file per theme
  (`executive.css`, `luxury.css`, `modern.css`, `minimal.css`, `glass.css`),
  each scoped under `.theme-<name>`, overriding the semantic tokens from
  `tokens.css` / `index.css`.
- `frontend/src/features/profiles/theme/*.ts` — the `ProfileTheme` object per
  theme (colors/typography/spacing/radius/shadows/motion, plus the
  structural flags: `hero.layout`, `hero.avatarShape`, `cards.variant`,
  `buttons.variant`/`shape`). `theme/registry.ts` here is `getProfileTheme()`,
  the lookup the profile route and every preview use.
- `frontend/src/features/profiles/sections/` — the shared components
  themselves, plus `Panel.tsx` (chrome per `cards.variant`) and
  `styleTokens.ts`/`animations.ts` (shared style/motion helpers). This is
  where a profile's actual DOM comes from — never from a per-theme folder.
- `frontend/src/app/providers/theme-provider.tsx` — `ThemeProvider` /
  `useTheme()` for the *app-wide* (non-profile) UI theme. Wraps the app
  (mounted in `main.tsx`), tracks the active `ThemeName` in React state, and
  applies the theme's class + `data-theme` attribute to a wrapper `div`.

**How switching works:** `getProfileTheme(name)` resolves a theme's token
object; `ProfileLayout.tsx` applies its CSS class (`theme-luxury`, etc.) plus
any per-company Theme Builder overrides as inline CSS custom properties on
the same wrapper — no reload, no remount. The five theme CSS files under
`styles/themes/` supply the base token values; Theme Builder layers
per-company overrides on top via `deriveProfileBranding()`.

**Adding a new theme, in order:**

1. Create `frontend/src/styles/themes/<name>.css` scoped under
   `.theme-<name>`, overriding whichever color/shadow/typography tokens the
   theme changes.
2. Import that file from `frontend/src/index.css`.
3. Add a `ProfileTheme` object in `frontend/src/features/profiles/theme/<name>.ts`
   and register it in `frontend/src/features/profiles/theme/registry.ts`.
4. Add the theme's label/description/CSS class to `frontend/src/lib/theme/registry.ts`
   with `status: "available"`.
5. Nothing else — the shared components in `features/profiles/sections/`
   pick up the new theme automatically; no new Hero/About/Products file
   needed.

## Folder map

```text
frontend/src/
├── styles/
│   ├── fonts.css          # Fontsource imports
│   ├── tokens.css         # typography, shadows, spacing, z-index
│   └── themes/            # executive.css, luxury.css, modern.css,
│                           # minimal.css, glass.css
├── lib/
│   ├── motion-tokens.ts   # duration / easing / spring
│   ├── icons.ts           # icon size/stroke tokens
│   └── theme/             # ThemeName, registry (app-wide, label/CSS class/status)
├── components/
│   ├── motion/             # Framer Motion variant presets
│   └── premium/Effects/    # GlassMaterial, CtaButtonExtras, PremiumActionButton
│                            # — used by the shared profile sections below.
│                            # Hero/, Cards/, Background/ are leftover from the
│                            # old per-theme components and are unused now
│                            # (candidates for removal, not yet done).
├── app/
│   └── providers/
│       └── theme-provider.tsx
└── features/profiles/
    ├── theme/              # ProfileTheme token presets (one file per theme)
    │                       # + getProfileTheme()
    ├── sections/           # the one shared template every theme renders:
    │                       # Header, Hero, QuickActions, About, Products,
    │                       # ScanToChat, Location, WorkingHours, EnquiryForm,
    │                       # Footer, Panel, SectionShell, styleTokens, animations
    ├── ProfileEngine.tsx    # assembles the sections above
    └── ProfileLayout.tsx    # applies theme CSS class + Theme Builder overrides
```
