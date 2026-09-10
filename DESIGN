# NODI — The NoukaHishab Design System

**নদী (nodi)** — river. This system takes its name from the thing the whole
product orbits: sand-laden boats moving down a river, being counted, priced,
and settled at a ghat. Every visual decision below should trace back to that
world — a boat's hull curve, a ledger's dashed rule, a river's gloss under
light — not to generic SaaS defaults.

This document is the single source of truth for building the NoukaHishab
marketing site and app UI in **Next.js + TypeScript + Tailwind CSS +
shadcn/ui**. Paste this file into Claude Code, Cursor, or Antigravity as
project context before scaffolding — every token, class name, and component
rule below is meant to be followed literally, not reinterpreted.

---

## 1. Design principles

1. **River, not flag.** Green and red come from Bangladesh's palette, but the
   system reads as *riverine and premium*, not nationalistic. Sand, ink, and
   gold carry as much visual weight as green and red do.
2. **Gloss is structural, not decorative.** Sheen, gradient, and soft shadow
   are reserved for surfaces that represent value or action — buttons,
   the featured price tier, ledger cards, the hero hull graphic. Informational
   surfaces (body text, plain cards) stay flat and quiet.
3. **The wave is the signature motif.** Every major section boundary uses a
   wave divider, not a hard line. Waves always flow left-to-right and never
   repeat the exact same curve twice on one page.
4. **Ledger language over SaaS language.** Copy and component names use the
   business's real vocabulary — ghat, mahajan, manifest, cubic feet,
   settlement — never generic terms like "dashboard widget" or "user record."
5. **One accent action per view.** Red is the only color allowed on a
   primary call-to-action. Green is reserved for brand marks, ledger
   positives, and success states. Never both as competing CTAs on one screen.

---

## 2. Color tokens

### 2.1 Brand palette (source hexes)

| Token          | Hex       | Use                                                    |
| -------------- | --------- | ------------------------------------------------------- |
| `river-50`     | `#EAF3EC` | Faint tints, hover backgrounds on light surfaces         |
| `river-100`    | `#CFE6D7` | Subtle badges, chip backgrounds                          |
| `river-300`    | `#4E9A73` | Mid-tone accents, chart lines                            |
| `river-500`    | `#0B5D3B` | **Primary brand green** — logo, links, success            |
| `river-600`    | `#0A5335` | Hover state of primary green elements                    |
| `river-700`    | `#084229` | Deep green — gradients, dark-panel accents                |
| `river-900`    | `#062F1D` | Darkest green, used only in gradients                     |
| `sindoor-50`   | `#FBEAE8` | Faint red tints                                          |
| `sindoor-100`  | `#F3CBC7` | Badges, soft warning-adjacent chips                       |
| `sindoor-300`  | `#DE6459` | Lighter red for gradient highlights                        |
| `sindoor-500`  | `#C23B32` | **Primary action red** — main CTA, alerts                  |
| `sindoor-600`  | `#AB332B` | Hover state of red CTAs                                  |
| `sindoor-700`  | `#9C2E27` | Deep red — gradients                                     |
| `sindoor-900`  | `#6E1F1A` | Darkest red, gradients only                              |
| `sand-50`      | `#FBF8F2` | **Paper** — card and surface background                  |
| `sand-100`     | `#F4EDE0` | **Sand** — page background (light mode)                  |
| `sand-200`     | `#E9DFC9` | Section band background (e.g. logo strip)                |
| `sand-300`     | `#DBCDA9` | Borders on sand surfaces                                 |
| `ink-500`      | `#1B3229` | Secondary text on light backgrounds (`ink-soft`)          |
| `ink-700`      | `#10201B` | **Ink** — primary text, dark section background           |
| `ink-900`      | `#0A1712` | Deepest ink, gradient ends on dark panels                  |
| `gold-300`     | `#E4C179` | Gold highlight on dark backgrounds                        |
| `gold-500`     | `#C9932E` | **Ledger gold** — highlights, small accents, never CTAs    |
| `gold-700`     | `#8A6417` | Text-on-gold-tint (icon color on gold chip backgrounds)     |

Rule of thumb: **50/100 = tint backgrounds, 500 = the token you reach for by
default, 700/900 = gradient ends and dark-mode text-on-tint.**

### 2.2 Tailwind config (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic tokens — see section 2.3 for the CSS variables
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

        // NODI brand ramp — use these directly for anything brand-specific
        // that shadcn's generic tokens don't cover (hero gradients, waves,
        // manifest ledger cards, gold accents).
        river: {
          50: "#EAF3EC",
          100: "#CFE6D7",
          300: "#4E9A73",
          500: "#0B5D3B",
          600: "#0A5335",
          700: "#084229",
          900: "#062F1D",
        },
        sindoor: {
          50: "#FBEAE8",
          100: "#F3CBC7",
          300: "#DE6459",
          500: "#C23B32",
          600: "#AB332B",
          700: "#9C2E27",
          900: "#6E1F1A",
        },
        sand: {
          50: "#FBF8F2",
          100: "#F4EDE0",
          200: "#E9DFC9",
          300: "#DBCDA9",
        },
        ink: {
          500: "#1B3229",
          700: "#10201B",
          900: "#0A1712",
        },
        gold: {
          300: "#E4C179",
          500: "#C9932E",
          700: "#8A6417",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        // Gloss shadow scale — use in place of default shadow-* utilities
        // wherever a surface should feel lacquered rather than flat.
        "gloss-sm": "0 6px 16px -10px rgb(16 32 27 / 0.35), inset 0 1px 0 rgb(255 255 255 / 0.5)",
        "gloss-md": "0 14px 30px -18px rgb(16 32 27 / 0.35), inset 0 1px 0 rgb(255 255 255 / 0.8)",
        "gloss-lg": "0 32px 60px -20px rgb(16 32 27 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.3)",
        "gloss-red": "0 14px 28px -10px rgb(194 59 50 / 0.7), inset 0 1px 0 rgb(255 255 255 / 0.4)",
        "gloss-green": "0 14px 28px -10px rgb(11 93 59 / 0.65), inset 0 1px 0 rgb(255 255 255 / 0.35)",
      },
      backgroundImage: {
        "gloss-red": "linear-gradient(155deg, #DE4B3F 0%, #C23B32 45%, #9C2E27 100%)",
        "gloss-green": "linear-gradient(155deg, #12784B 0%, #0B5D3B 45%, #084229 100%)",
        "gloss-ink": "linear-gradient(165deg, #16302A 0%, #10201B 60%, #0A1712 100%)",
        sheen: "linear-gradient(180deg, rgb(255 255 255 / 0.35) 0%, rgb(255 255 255 / 0) 55%)",
      },
      keyframes: {
        "wave-drift": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-2%)" },
        },
      },
      animation: {
        "wave-drift": "wave-drift 10s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 2.3 shadcn/ui CSS variables (`app/globals.css`)

shadcn/ui expects HSL triplets (no `hsl()` wrapper) on `:root` and `.dark`.
These map the NODI palette onto shadcn's semantic slots so every shadcn
primitive (`Button`, `Card`, `Dialog`, `Input`, etc.) inherits brand color
automatically.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 42 45% 97%;        /* sand-50  #FBF8F2 */
    --foreground: 160 24% 10%;       /* ink-700  #10201B */

    --card: 42 45% 97%;              /* sand-50 */
    --card-foreground: 160 24% 10%;  /* ink-700 */

    --popover: 42 45% 97%;
    --popover-foreground: 160 24% 10%;

    --primary: 152 79% 20%;          /* river-500 #0B5D3B */
    --primary-foreground: 42 45% 97%;/* sand-50 */

    --secondary: 6 55% 47%;          /* sindoor-500 #C23B32 */
    --secondary-foreground: 42 45% 97%;

    --muted: 41 33% 87%;             /* sand-200 #E9DFC9 */
    --muted-foreground: 160 21% 17%; /* ink-500 #1B3229 */

    --accent: 39 61% 47%;            /* gold-500 #C9932E */
    --accent-foreground: 160 24% 10%;

    --destructive: 6 55% 47%;        /* sindoor-500, reused for form errors */
    --destructive-foreground: 42 45% 97%;

    --border: 160 24% 10% / 0.10;
    --input: 160 24% 10% / 0.14;
    --ring: 152 79% 20%;             /* river-500 */

    --radius: 0.75rem;
  }

  .dark {
    --background: 160 26% 8%;        /* ink-900 #0A1712 */
    --foreground: 42 45% 95%;        /* sand tone on dark */

    --card: 165 22% 12%;             /* between ink-700/900 */
    --card-foreground: 42 45% 95%;

    --popover: 165 22% 12%;
    --popover-foreground: 42 45% 95%;

    --primary: 150 55% 30%;          /* lighter river for dark bg contrast */
    --primary-foreground: 42 45% 97%;

    --secondary: 6 62% 55%;          /* lighter sindoor for dark bg contrast */
    --secondary-foreground: 42 45% 97%;

    --muted: 165 18% 18%;
    --muted-foreground: 42 20% 72%;

    --accent: 40 65% 60%;            /* gold-300 on dark */
    --accent-foreground: 160 26% 8%;

    --destructive: 6 62% 55%;
    --destructive-foreground: 42 45% 97%;

    --border: 42 45% 95% / 0.10;
    --input: 42 45% 95% / 0.14;
    --ring: 150 55% 30%;

    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}
```

> **Note on shadcn's default `secondary`:** out of the box, shadcn's
> `secondary` slot is a quiet neutral button. NODI repurposes it to carry
> `sindoor` (red) because red is this brand's action color, not a muted
> option. Keep that repurposing intentional: `variant="secondary"` in this
> project always means "the red action," and plain neutral buttons should
> use `variant="outline"` or `variant="ghost"` instead.

---

## 3. Typography

| Role                          | Font       | Weight(s) used         |
| ------------------------------ | ---------- | ----------------------- |
| Display / headlines / logo     | **Fraunces** | 500, 600, 700         |
| Body copy, UI, nav, buttons    | **Manrope**  | 400, 500, 600, 700, 800 |

Both are on Google Fonts. Fraunces gives the ink-brush, ledger-plate
character; Manrope stays clean and modern for anything functional. Never
introduce a third typeface.

### 3.1 Next.js font loading (`app/layout.tsx`)

Use `next/font/google` rather than a `<link>` tag — it self-hosts and avoids
layout shift.

```tsx
import { Fraunces, Manrope } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  style: ["normal"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

This wires into the `fontFamily.display` / `fontFamily.sans` Tailwind tokens
from section 2.2 — use `font-display` for headlines and let body text fall
back to the default `font-sans`.

### 3.2 Type scale

| Class            | Size / line-height | Weight | Use                             |
| ---------------- | ------------------- | ------ | -------------------------------- |
| `text-display-xl` | 54px / 1.08          | 600    | Hero H1                          |
| `text-display-lg` | 36px / 1.2           | 600    | Section H2                       |
| `text-display-md` | 28px / 1.25          | 600    | Card group headline, dark panels |
| `text-display-sm` | 19px / 1.3           | 600    | Feature card title               |
| `text-body-lg`    | 18px / 1.65          | 400    | Hero lead paragraph              |
| `text-body`       | 15.5px / 1.6         | 400    | Standard paragraph               |
| `text-body-sm`    | 13.5px / 1.55        | 400    | Card description, footnotes      |
| `text-label`      | 13px / 1.4           | 700–800| Eyebrows, badges, nav links      |

Add the display sizes as Tailwind utilities via `fontSize` extension if you
want the exact numbers as named classes:

```ts
// inside theme.extend in tailwind.config.ts
fontSize: {
  "display-xl": ["3.375rem", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
  "display-lg": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
  "display-md": ["1.75rem", { lineHeight: "1.25" }],
  "display-sm": ["1.1875rem", { lineHeight: "1.3" }],
},
```

**Typography rules:**
- Sentence case everywhere — headlines, buttons, nav, badges. Never Title
  Case, never all-caps (labels use letter-spacing + weight instead of caps).
- Line length under 80 characters for body copy; hero lead paragraphs get a
  hard `max-width` (`max-w-md` or similar) rather than running full width.
- Never italicize or color a single word inside a headline for emphasis —
  if a headline needs a highlighted word, use the brand gradient text-clip
  treatment (see `.text-gradient-brand` below) on a short phrase, not a
  single token, and only once per page.

```css
.text-gradient-brand {
  background: linear-gradient(100deg, theme('colors.river.500') 15%, theme('colors.sindoor.500') 85%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### 3.3 Bilingual typography (English / বাংলা)

Fraunces and Manrope have **no Bengali glyph coverage** — when the site is
switched to Bangla, both fall back to the browser default and every display
headline silently loses its brand character. Pick the Bangla pairing now
rather than patching it in later.

| Role                       | English font | Bangla font        | Notes                                                                 |
| --------------------------- | ------------ | -------------------- | ----------------------------------------------------------------------- |
| Display / headlines / logo* | Fraunces     | **Tiro Bangla**       | Serif with a similar inked, editorial weight to Fraunces at display sizes |
| Body / UI / buttons         | Manrope      | **Hind Siliguri**     | Clean, humanist Bangla sans that pairs neutrally with Manrope's proportions |

\* The **logo itself never changes or re-renders in Bangla** — "NoukaHishab"
stays as the fixed wordmark/lockup image or SVG in both languages (see
section 10). Only surrounding display type (page headlines that aren't the
logo) switches font per locale.

Both additions are on Google Fonts. Load all four families up front through
`next/font/google` and switch which CSS variable `font-display` /
`font-sans` resolves to based on the active locale — don't lazy-load fonts
per navigation, since that causes a flash of unstyled text on every
language switch.

```tsx
// app/layout.tsx
import { Fraunces, Manrope, Tiro_Bangla, Hind_Siliguri } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const tiroBangla = Tiro_Bangla({
  subsets: ["bengali"],
  variable: "--font-tiro-bangla",
  weight: ["400"],
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  variable: "--font-hind-siliguri",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: "en" | "bn" };
}) {
  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${manrope.variable} ${tiroBangla.variable} ${hindSiliguri.variable}`}
      data-locale={locale}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

```css
/* globals.css — resolve the semantic font tokens per locale */
:root {
  --font-display: var(--font-fraunces);
  --font-body: var(--font-manrope);
}
[data-locale="bn"] {
  --font-display: var(--font-tiro-bangla);
  --font-body: var(--font-hind-siliguri);
}
```

```ts
// tailwind.config.ts — point the existing tokens at the CSS variables above
fontFamily: {
  display: ["var(--font-display)", "serif"],
  sans: ["var(--font-body)", "sans-serif"],
},
```

Because `font-display` / `font-sans` already resolve through these
variables, **no component needs locale-aware className logic** — a
`FeatureCard` or hero headline written once with `font-display` picks up
Tiro Bangla automatically the moment `data-locale="bn"` is set on `<html>`.

**Bangla type-scale adjustments:** Bengali conjuncts and matras render
visually taller than Latin glyphs at the same font-size. Bump line-height
(not font-size) by roughly 8–10% for Bangla body text to avoid clipped
descenders:

```css
[data-locale="bn"] {
  --leading-body-adjust: 1.1;
}
[data-locale="bn"] .text-body,
[data-locale="bn"] .text-body-lg,
[data-locale="bn"] .text-body-sm {
  line-height: calc(1em * var(--leading-body-adjust) * 1.5);
}
```

---

## 4. Spacing, radius, elevation

- **Spacing scale:** stick to Tailwind's default rem scale. Section vertical
  rhythm: `py-24` (mobile: `py-16`) between major sections; `gap-6`
  (`24px`) inside grids; `gap-3` (`12px`) inside tight clusters like a
  ledger row or badge group.
- **Radius scale:**
  - `rounded-lg` (`--radius`, 12px) — buttons, inputs, form controls, badges
  - `rounded-xl` / `rounded-2xl` — cards, feature tiles
  - `rounded-3xl` (28px) — hero visual frame, dark split panel, CTA band
  - `rounded-full` — pills, avatars, floating chips
  - Never mix more than two radius sizes in one component group.
- **Elevation:** use the `shadow-gloss-*` scale from section 2.2 instead of
  Tailwind's default `shadow-*` utilities for anything brand-facing (hero
  card, CTA band, featured pricing tier, primary buttons). Reserve default
  `shadow-sm` / `shadow-md` for plain UI chrome (dropdowns, popovers) where
  shadcn's defaults are already correct.

---

## 5. Signature motifs

### 5.1 Wave divider

Every section boundary that changes background color uses this component
instead of a hard edge. Vary the control points slightly per instance so no
two waves on the same page are identical.

```tsx
// components/marketing/wave-divider.tsx
type WaveDividerProps = {
  fill: string;        // tailwind color token resolved to a CSS color, e.g. "hsl(var(--background))"
  flip?: boolean;
  className?: string;
};

export function WaveDivider({ fill, flip, className }: WaveDividerProps) {
  return (
    <div className={cn("w-full leading-[0]", flip && "-scale-y-100", className)}>
      <svg viewBox="0 0 1440 80" width="100%" height="64" preserveAspectRatio="none">
        <path
          d="M0,32 C240,80 480,0 720,24 C960,48 1200,72 1440,24 L1440,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
```

### 5.2 Gloss surface utility

For any card or button that should feel lacquered, layer a sheen pseudo
element rather than hand-rolling gradients per component:

```css
@layer utilities {
  .gloss-sheen {
    @apply relative overflow-hidden;
  }
  .gloss-sheen::after {
    content: "";
    @apply pointer-events-none absolute inset-0 bg-sheen;
  }
}
```

Apply `gloss-sheen` alongside `bg-gloss-red` / `bg-gloss-green` /
`bg-gloss-ink` (from the `backgroundImage` tokens) and a `shadow-gloss-*`
class. This trio — gradient fill, sheen overlay, gloss shadow — is the whole
"premium glossy" look; don't introduce a fourth technique (blur, glow,
neon) on top of it.

### 5.3 Ledger card pattern

The floating "manifest" card used in the hero is a reusable pattern for any
place you show a worked calculation (pricing preview, a demo calculator, a
sample settlement). Structure:

```
┌─────────────────────────────┐
│ Title            [ghat tag] │  <- dashed rule below
│ Line item ............ value│
│ Line item ............ value│
│ ───────────────────────────│  <- solid rule
│ Total label         TOTAL   │  <- Fraunces, larger, sindoor-700
└─────────────────────────────┘
```

Build this as a `LedgerCard` component (section 7) so it's reused instead of
re-implemented per page.

---

## 6. Iconography & imagery

- **Icon set:** [lucide-react](https://lucide.dev) — this is also shadcn's
  default icon set, so no second icon library is needed. Standard sizes:
  `16` inline with text, `20` in buttons, `22–24` in feature-card icon
  tiles, `28+` only in empty states.
- **Icon tiles:** icon sits inside a `rounded-xl` tile with a soft tinted
  gradient background (`bg-gradient-to-br from-river-50 to-river-100` etc.)
  and `shadow-gloss-sm` — never a bare icon floating with no container in
  marketing contexts.
- **Illustration style:** flat SVG wave/hull shapes in brand gradients, no
  stock photography, no 3D renders, no AI-generated people. If a human
  presence is needed (testimonial avatar), use a simple initials avatar in
  the brand gradient, matching the existing `nh-quote-avatar` pattern.

---

## 7. Component architecture (Next.js + shadcn/ui)

### 7.1 Folder structure

```
app/
  layout.tsx              — minimal root layout (fonts only, see 3.3)
  [locale]/
    layout.tsx             — locale-aware layout, sets data-locale (section 3.3)
    page.tsx               — marketing landing page composition
  globals.css              — Tailwind + shadcn CSS variables (section 2.3)
messages/
  en.json
  bn.json
i18n/
  routing.ts
  request.ts
middleware.ts
components/
  ui/                      — shadcn/ui primitives (button, card, badge, ...)
  marketing/
    logo.tsx                — locale-invariant, never wrapped in t() (10.4)
    language-switcher.tsx   — section 10.6
    site-nav.tsx
    hero.tsx
    hero-visual.tsx         — hull graphic + ledger card
    wave-divider.tsx
    logo-belt.tsx
    feature-grid.tsx
    feature-card.tsx
    how-it-works.tsx
    testimonial.tsx
    pricing.tsx
    price-card.tsx
    cta-band.tsx
    site-footer.tsx
  shared/
    ledger-card.tsx        — reusable manifest/ledger pattern (5.3)
    gloss-button.tsx        — thin wrapper adding gloss classes to <Button>
lib/
  utils.ts                 — cn() helper (from shadcn init)
```

### 7.2 Which pieces are shadcn, which are custom

| Element                          | Approach                                                                 |
| --------------------------------- | -------------------------------------------------------------------------|
| Buttons                           | shadcn `Button`, extended with `bg-gloss-red` / `bg-gloss-green` + `gloss-sheen` classes via `className`, not a new component |
| Nav bar                           | Custom (`site-nav.tsx`) — shadcn has no nav primitive; use shadcn `Sheet` for the mobile drawer |
| Badges / eyebrow pills            | shadcn `Badge`, custom `variant` added for the pill-with-icon eyebrow style |
| Feature cards                     | Custom `feature-card.tsx` built on shadcn `Card` for the base surface, with the gloss/icon-tile treatment layered on |
| Pricing cards                     | Custom `price-card.tsx` built on shadcn `Card`; featured tier adds `bg-gloss-green gloss-sheen shadow-gloss-lg` |
| Ledger / manifest card            | Fully custom (`shared/ledger-card.tsx`) — no shadcn equivalent |
| Testimonial                       | Custom, using shadcn `Avatar` for the initials circle |
| Forms (signup, contact, waitlist) | shadcn `Input`, `Label`, `Textarea`, `Select`, `Form` (with `react-hook-form` + `zod`, shadcn's standard pattern) |
| Toasts / confirmations            | shadcn `Sonner` (or `Toast`) |
| Mobile nav drawer                 | shadcn `Sheet` |
| Dialogs (e.g. "watch demo")       | shadcn `Dialog` |

**Rule:** reach for a shadcn primitive as the structural/behavioral base
first (it already handles accessibility, focus states, keyboard nav), then
apply NODI's gloss/color classes on top via `className`. Only build fully
custom (no shadcn base) when the pattern has no shadcn equivalent at all,
like the ledger card or the wave divider.

### 7.3 Example: gloss-extended shadcn Button

```tsx
// components/shared/gloss-button.tsx
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GlossButtonProps = ButtonProps & {
  tone?: "red" | "green";
};

export function GlossButton({ tone = "red", className, ...props }: GlossButtonProps) {
  return (
    <Button
      className={cn(
        "gloss-sheen border-0 text-sand-50",
        tone === "red" && "bg-gloss-red shadow-gloss-red hover:brightness-105",
        tone === "green" && "bg-gloss-green shadow-gloss-green hover:brightness-105",
        className
      )}
      {...props}
    />
  );
}
```

### 7.4 Example: LedgerCard

```tsx
// components/shared/ledger-card.tsx
import { cn } from "@/lib/utils";

type LedgerLine = { label: string; value: string; positive?: boolean };

type LedgerCardProps = {
  title: string;
  tag?: string;
  lines: LedgerLine[];
  totalLabel: string;
  totalValue: string;
  className?: string;
};

export function LedgerCard({ title, tag, lines, totalLabel, totalValue, className }: LedgerCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-700/10 bg-gradient-to-br from-white to-sand-50 p-5",
        "shadow-gloss-md",
        className
      )}
    >
      <div className="mb-3.5 flex items-center justify-between border-b border-dashed border-ink-700/15 pb-3.5">
        <span className="font-display text-base font-semibold text-ink-700">{title}</span>
        {tag && (
          <span className="rounded-full bg-river-500/10 px-2.5 py-1 text-xs font-extrabold text-river-700">
            {tag}
          </span>
        )}
      </div>
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between py-2 text-[13.5px]">
          <span className="text-ink-500/75">{line.label}</span>
          <span className={cn("font-bold", line.positive && "text-river-700")}>{line.value}</span>
        </div>
      ))}
      <div className="mt-2.5 flex items-baseline justify-between border-t border-ink-700/10 pt-3">
        <span className="text-[13.5px] font-bold">{totalLabel}</span>
        <span className="font-display text-xl font-semibold text-sindoor-700">{totalValue}</span>
      </div>
    </div>
  );
}
```

---

## 8. Motion

- One orchestrated moment per page load at most (e.g. hero content fading
  up), using Tailwind's `animate-in` utilities (via `tailwindcss-animate`,
  already required in the config above) or Framer Motion if the project
  needs richer sequencing.
- Hover transitions: `transition-transform duration-200` with
  `hover:-translate-y-1` on cards, `hover:-translate-y-0.5` on buttons.
  Nothing larger — this is a premium fintech-adjacent tool, not a playful
  consumer app.
- Respect `prefers-reduced-motion`: wrap any non-essential animation in
  `motion-safe:` variants.
- The `animate-wave-drift` keyframe (section 2.2) is available for a very
  subtle background wave drift behind the hero — use at low opacity
  (`opacity-40` or lower) and only in the hero, never on every section.

---

## 9. Accessibility & quality floor

- Color contrast: `ink-700` on `sand-50`/`sand-100` and `sand-50` on
  `river-700`/`sindoor-700` both clear WCAG AA for body text. Double check
  any new gradient combination with a contrast checker before shipping —
  gradients are the most common place contrast quietly breaks.
- All interactive elements keep visible focus rings — shadcn's default
  `focus-visible:ring-ring` covers this; don't remove it when adding gloss
  classes.
- Wave dividers and decorative SVGs get `aria-hidden="true"`.
- Dark mode isn't optional set-dressing here — the "how it works" split
  panel and the CTA band already live in dark/ink tones, so verify the
  full page in `.dark` as you build, not just the light hero.

---

## 10. Internationalization (English ⇄ বাংলা)

### 10.1 Scope

- The site ships in **English (`en`)** and **Bangla (`bn`)**, switchable
  from a persistent toggle in the nav.
- **Everything translates except the logo.** The "NoukaHishab" wordmark
  (image, SVG, or styled lockup) is locale-invariant — render it identically
  in both locales. Every other string — nav links, hero copy, feature
  titles/descriptions, pricing, testimonial, footer, form labels, toasts,
  error messages — must come from the translation layer, with zero
  hardcoded English left in components.
- Numbers and currency (৳ / Tk) follow the active locale's formatting
  conventions (see 10.5), independent of which script the surrounding copy
  uses.

### 10.2 Library and routing

Use **[`next-intl`](https://next-intl.dev)** — the standard choice for the
Next.js App Router, with first-class support for locale-prefixed routing,
`next/font` integration, and server components.

```
app/
  [locale]/
    layout.tsx
    page.tsx
  layout.tsx            — root layout, minimal, delegates to [locale]
messages/
  en.json
  bn.json
i18n/
  routing.ts
  request.ts
middleware.ts
```

```ts
// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "bn"],
  defaultLocale: "en",
  localePrefix: "as-needed", // "/" = English, "/bn" = Bangla
});
```

```ts
// middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### 10.3 Message files

Keep keys grouped by the same section names used throughout this document,
so a translator (or an LLM asked to translate) can work file-by-file
against a component:

```json
// messages/en.json
{
  "nav": {
    "product": "Product",
    "howItWorks": "How it works",
    "pricing": "Pricing",
    "stories": "Stories",
    "signIn": "Sign in",
    "startTrial": "Start free trial"
  },
  "hero": {
    "eyebrow": "Built for river sand-trade businesses",
    "headline": "Every boatload, hishab done before it reaches the ghat.",
    "lead": "NoukaHishab turns cubic-feet counts, mahajan commissions, and boat-owner dues into a clean digital ledger — so your fleet's accounts settle in minutes, not at the end of a long night with a notebook.",
    "ctaPrimary": "Start free trial",
    "ctaSecondary": "See a live calculation"
  }
}
```

```json
// messages/bn.json
{
  "nav": {
    "product": "প্রোডাক্ট",
    "howItWorks": "যেভাবে কাজ করে",
    "pricing": "মূল্য",
    "stories": "অভিজ্ঞতা",
    "signIn": "সাইন ইন",
    "startTrial": "ফ্রি ট্রায়াল শুরু করুন"
  },
  "hero": {
    "eyebrow": "নদীর বালু ব্যবসার জন্য তৈরি",
    "headline": "প্রতিটি নৌকার হিসাব, ঘাটে পৌঁছানোর আগেই শেষ।",
    "lead": "কিউবিক ফিট হিসাব, মহাজনের কমিশন আর মাঝির পাওনা—সব কিছু নৌকাহিসাব একটি পরিষ্কার ডিজিটাল খাতায় নিয়ে আসে। রাতভর খাতা-কলম নিয়ে বসার দরকার নেই, হিসাব মিলে যায় মিনিটেই।",
    "ctaPrimary": "ফ্রি ট্রায়াল শুরু করুন",
    "ctaSecondary": "লাইভ হিসাব দেখুন"
  }
}
```

> Treat these as starting samples, not final copy — have a fluent Bangla
> speaker (ideally someone from the actual sand-trade side of the business)
> review tone and terminology before shipping, especially trade-specific
> words like ঘাট (ghat), মহাজন (mahajan), and মণ/কিউবিক ফিট measures, which
> vary by region.

### 10.4 Using translations in components

```tsx
// components/marketing/hero.tsx
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("hero");
  return (
    <section className="nh-hero">
      <span className="badge">{t("eyebrow")}</span>
      <h1 className="font-display text-display-xl">{t("headline")}</h1>
      <p className="text-body-lg">{t("lead")}</p>
      <Button>{t("ctaPrimary")}</Button>
    </section>
  );
}
```

The **logo component takes no translation prop at all** — it's excluded
from the i18n pass entirely:

```tsx
// components/marketing/logo.tsx
// Intentionally locale-invariant — do not wrap any part of this in t().
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="logo-mark gloss-sheen bg-gloss-green shadow-gloss-green" />
      <span className="font-display text-xl font-semibold">
        <span className="text-river-500">Nouka</span>
        <span className="text-sindoor-500">Hishab</span>
      </span>
    </div>
  );
}
```

### 10.5 Numbers, currency, and direction

- Format currency and counts with `Intl.NumberFormat`, driven by locale, not
  hardcoded strings:

```ts
const formatTaka = (value: number, locale: "en" | "bn") =>
  new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
```

  `bn-BD` renders digits in Bengali numerals (১,২৩০) where the OS/browser
  supports it; confirm with stakeholders whether the product wants Bengali
  numerals or Western digits with Bangla labels — sand-trade ledgers in
  practice often keep Western digits even in Bangla text, so this is a
  content decision, not just a technical default.
- Both `en` and `bn` are left-to-right — no `dir="rtl"` handling needed.
- Dates: use `Intl.DateTimeFormat(locale, ...)` rather than a hardcoded
  format string, for the same reason as currency.

### 10.6 Language switcher component

Lives in the nav, next to the primary CTA, not buried in a footer or
settings menu — this is a core, frequently-used control for this audience.

```tsx
// components/marketing/language-switcher.tsx
"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = locale === "en" ? "bn" : "en";

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 rounded-full"
      onClick={() => router.replace(pathname, { locale: next })}
    >
      {locale === "en" ? "বাংলা" : "English"}
    </Button>
  );
}
```

Label the button in the language you're *switching to*, not the current
language — "বাংলা" while browsing in English, "English" while browsing in
Bangla — so it always reads as an action, not a status indicator.

### 10.7 Layout stability across locales

- Bangla strings frequently run 15–25% longer than their English
  equivalents. Test every fixed-width element (nav links, pricing card
  buttons, badges) in both locales — don't let Bangla text wrap awkwardly
  or overflow a pill/badge that was sized for English.
  - Nav links: allow wrapping to disable rather than `truncate`, so no
    Bangla label silently loses characters.
  - Buttons: use `whitespace-nowrap` only where you've confirmed the Bangla
    string fits; otherwise allow a second line.
- Persist the chosen locale (`next-intl`'s routing handles the URL prefix;
  additionally set a cookie so a returning visitor's last choice is
  remembered on `/` without needing the prefix in the URL again).

---

## 11. Quick-start prompt block

When starting a fresh Claude Code / Cursor / Antigravity session, paste this
at the top of your first message along with this file:

> Build this Next.js + TypeScript + Tailwind CSS + shadcn/ui project
> following `DESIGN.md` exactly: use the NODI color tokens and CSS
> variables in section 2, load Fraunces/Manrope for English and Tiro
> Bangla/Hind Siliguri for Bangla as specified in section 3, implement the
> wave divider and gloss-surface utilities from section 5, follow the
> component architecture and shadcn-vs-custom split in section 7, and wire
> up English/Bangla switching with next-intl exactly as described in
> section 10 — the logo must never be translated or re-rendered per
> locale, everything else must be. Do not substitute different fonts,
> colors, icon set, or i18n library.
