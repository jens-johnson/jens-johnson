# Jens Johnson • Developer Style Guide • CSS & Styling

Styling is a token system with utilities on top. The doctrine:

> Tailwind-first with CSS-first configuration; semantic tokens are the API, raw palette values are implementation
> detail, and themes are token overrides.

Related:
- [vue-nuxt.md](vue-nuxt.md) (where styles live in SFCs)
- [formatting.md](formatting.md) (dividers, line length)
- [tooling.md](tooling.md) (stylelint, prettier-plugin-tailwindcss)

## Tailwind, CSS-First

**Tailwind v4 with CSS-first configuration**: the design system lives in an `@theme` block in `main.css`, not in a
JS config file.

```css
/* ─── Design Tokens (@theme) ─────────────────────────────────────────────────────────────────────────────────────── */
@theme {
  /* ── Semantic color tokens ─────────────────────────────────────────────────────────────────────────────────────── */
  --color-bg: #f8f4ee;
  --color-surface: #f0ebe3;
  --color-ink: #1c140a;
  --color-accent: #8b6534;

  /* ── Raw palette (reference only; do not use in components) ────────────────────────────────────────────────────── */
  --color-stone-50: #f8f4ee;
  --color-earth-500: #8b6534;
}
```

## The Token Contract

- **Components consume semantic tokens only** (`bg-surface`, `text-ink`, `border-accent`); the raw palette exists
  as reference and feeds the semantic layer.
- The token vocabulary covers the full system: colors, font families, type scale (with per-size line height and
  letter spacing), spacing extensions, container widths, radii, shadows, and transition durations.
- New design values enter as tokens first; a hardcoded hex/px in a component is a smell.

## Theming

**Themes are token overrides keyed by a `data-theme` attribute on `<html>`**; components never know which theme is
active.

```css
/* ─── Day (default) ──────────────────────────────────────────────────────────────────────────────────────────────── */
:root,
[data-theme='day'] {
  --color-bg: #f8f4ee;
  --color-ink: #1c140a;
}

/* ─── Night ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
[data-theme='night'] {
  --color-bg: #080c12;
  --color-ink: #d0e8f0;
}
```

- The active theme persists to `localStorage` and applies via a composable (`useTheme`); theme names are an
  enum-derived union ([typescript.md](typescript.md#enums-and-derived-unions)).
- Theme transitions animate the token consumers (`background-color`, `color`) with a shared duration token.

## Utilities vs. `<style>` Blocks

- **Utilities first**: layout, spacing, color, and typography belong in template classes.
- A scoped `<style>` block is the escape hatch for what utilities genuinely cannot express (keyframes, complex
  selectors, `@layer base` resets); it should be rare and small.
- Class lists are **auto-sorted by `prettier-plugin-tailwindcss`**; never hand-curate class order.

## CSS File Conventions

- CSS files take the standard [file header](file-headers.md) (block-comment form) and `───` section dividers at the
  [120-char geometry](formatting.md#section-dividers).
- Sub-sections inside a block use the shorter `/* ── Name ── */` variant, still width-padded.
- Comments in CSS follow the same prose rules as everywhere: semicolons, no em dashes
  ([comments.md](comments.md#punctuation)).

## Enforcement

| Rule            | Tooling                                                                                     |
|-----------------|----------------------------------------------------------------------------------------------|
| CSS quality     | Stylelint: `stylelint-config-standard` + `stylelint-config-recommended-vue`                   |
| Tailwind syntax | `at-rule-no-unknown` with the Tailwind directive whitelist (`theme`, `apply`, `layer`, ...)   |
| Class ordering  | `prettier-plugin-tailwindcss`                                                                 |
| Scope           | Stylelint covers `main.css` + `<style>` blocks in `.vue` files                                |

Canonical stylelint baseline in [tooling.md](tooling.md).
