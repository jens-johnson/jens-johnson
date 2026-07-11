# Jens Johnson • Developer Style Guide • Vue & Nuxt

The framework owns its conventions; these are the overlays that make a Nuxt codebase mine. The doctrine:

> Atomic components in named folders, composables as barrel modules, a canonical SFC anatomy, and a deliberate
> auto-import surface.

Related:
- [modules-and-imports.md](modules-and-imports.md) (barrel modules, auto-import mechanics)
- [naming.md](naming.md) (the `Props` exemption)
- [css-and-styling.md](css-and-styling.md) (Tailwind, tokens, theming)
- [file-headers.md](file-headers.md) (headers inside `<script setup>`)

## SFC Anatomy

**Block order is `<script setup lang="ts">` → `<template>` → `<style>`** (style only when utilities genuinely
cannot express it; see [css-and-styling.md](css-and-styling.md)).

Inside `<script setup>`, sections follow a **canonical order**, each under a `───` divider once the script is
non-trivial:

1. **File header** (always first; the [banner](file-headers.md) lives inside the script block)
2. **Imports** (grouped per [modules-and-imports.md](modules-and-imports.md))
3. **Props / Emits / Model** (`defineProps`, `defineEmits`, `defineModel`)
4. **State** (`ref`/`reactive`/`useState`, composable calls)
5. **Computed**
6. **Functions / Handlers** (`on`-prefixed event handlers)
7. **Lifecycle** (`onMounted`, watchers)
8. **Expose** (`defineExpose`, when needed)

```vue
<script setup lang="ts">
/**
 * ██████ ... file header banner ... ██████
 */

/* ─── Imports ─────────────────────────────────────────────────────────────────────────────────────────────────── */

import type { ICardProps } from './types';

/* ─── Props ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the root element tag and the inner padding preset
 * @internal
 * @constant
 */
const props: TPropsWithDefaults<ICardProps, 'as' | 'pad'> = withDefaults(defineProps<ICardProps>(), {
  as: 'div',
  pad: 'md',
});

/* ─── State ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Whether the pointer is currently over the card
 * @internal
 * @constant
 */
const isActive: Ref<boolean> = ref(false);

/* ─── Handlers ────────────────────────────────────────────────────────────────────────────────────────────────── */

function onMouseEnter(): void {
  isActive.value = true;
}
</script>

<template>
  <!-- Surface wrapper -->
  <component :is="props.as" class="rounded-lg border" @mouseenter="onMouseEnter">
    <slot />
  </component>
</template>
```

- **Every script-scope declaration carries a JSDoc block** (`@internal` + `@constant`), including composable
  destructures, computeds, and local constants; mechanized by the SFC-scoped `jsdoc/require-jsdoc` context.
- **A component is a folder module**: `index.vue` plus co-located `types.ts` (the `I<Component>Props` interface,
  enums, derived unions), `constants.ts` (named, typed magic values), and `utils.ts` + `utils.test.ts` when the
  component owns pure logic (i.e. the spark-line geometry builder). The SFC imports them via `./types`,
  `./constants`, `./utils`. The inline `interface Props` idiom is retired; props interfaces are named
  `I<Component>Props`.
- **Props members are commented** like any shape, blank line between members, defaults via `withDefaults`.
- **The `props` const is annotated** with `TPropsWithDefaults<TProps, TDefaulted>` (from
  `@jens-johnson/style-guide/types/vue`): the raw props interface with the defaulted keys promoted to required,
  wrapped readonly. Maximal annotations do not stop at component boundaries.
- **The component's [file header](file-headers.md) documents its contract**: populated PROPS / MODEL / EMITS /
  SLOTS / EXPOSED sections, regenerated via the generator's `--spec` whenever the contract changes.
- Emits and models are **typed**: `defineEmits<{ select: [id: string] }>()`, `defineModel<string>()`.
- Template comments are HTML comments labeling structural regions (`<!-- Bento grid -->`).
- Template attributes use double quotes ([formatting.md](formatting.md#quotes)).

## Components

**Atomic-design hierarchy; every component is an `index.vue` inside its own kebab-case folder** under a category
directory:

```text
app/components/
├── brand/          # identity: logo-mark, wordmark
├── containment/    # surfaces: card, bento-card
├── data/           # display: status-badge, spark-line
├── feedback/       # indicators: scroll-progress
├── layout/         # shell: app-nav, app-footer
├── primitives/     # base behaviours: base-hero, base-parallax
├── widgets/        # page sections that compose primitives (per-page subdirs)
└── content/        # framework exception: PascalCase.vue prose/MDC components
```

- Auto-import names derive from the full path: `layout/app-nav/index.vue` → `<LayoutAppNav>`.
- **`content/` is the framework exception**: registered with `pathPrefix: false` so `ProseH2.vue`, `GoalsCarousel.vue`
  can override Nuxt Content prose components and serve as MDC blocks; filenames are `PascalCase` by necessity.
- Primitives are scoped-slot composition bases: widgets wrap them and destructure slot props rather than duplicating
  tracking/measurement logic.

## Templates

- **One attribute per line** on multi-attribute elements; Prettier's `singleAttributePerLine` owns this.
- **A blank line separates sibling tags** (`vue/padding-line-between-tags`, autofixed); comments attach to the tag
  they describe.

## Composables

**Composables are barrel modules** (`use-card-tilt/` with `index` / `composable` / `types`), named `useX`:

- **`useState` is called inside the composable function, never at module level** (it needs the Nuxt instance).
- Shared reactive state is keyed `useState<T>('key', () => initial)` so all callers converge on one source.
- Return a plain object of refs/computeds/functions; consumers destructure what they need.

## Auto-Imports

Nested barrels require explicit scan configuration, and the export surface is the global namespace:

```typescript
// nuxt.config.ts
imports: {
  dirs: ['composables/**', 'utils/**'],
},
```

- Barrel `index.ts` files use `export *` (unimport ignores it; each symbol registers once from its defining file).
- **Every exported symbol under scanned trees becomes a global**: keep internal helpers unexported
  ([modules-and-imports.md](modules-and-imports.md#export-surface)).

## Server (Nitro)

- **`server/api`, `server/routes`, `server/plugins` keep flat filenames**; routing/registration depends on them.
  Method suffixes name the handler: `metrics.get.ts`, `ingest.post.ts`.
- **`server/utils/**` uses barrel modules** (Nitro scans recursively on its own).
- Errors are H3 `createError` with status semantics ([error-handling.md](error-handling.md#3-translate-at-boundaries)).
- **Secrets live in `runtimeConfig`** (server-only keys), read from `process.env` at request time when build-time
  baking would break per-environment resolution; nothing secret reaches the client bundle.
- Untrusted payloads go through [result-union validators](error-handling.md#1-result-unions-for-expected-outcomes)
  that rebuild from known fields.

## Data Fetching

- **`useFetch` with an explicit `key`** for component data; `server: false` for live/client-only feeds on
  prerendered pages (no stale snapshot baked into the markup).
- **`$fetch` inside actions/handlers**; `useFetch` at setup level only.
- Polling: `setInterval` in `onMounted` with `onScopeDispose` cleanup.

## Content

**Nuxt Content collections are Zod-typed** in `content.config.ts` (`defineCollection` + schemas); frontmatter is the
contract, and app-side mirrors of those shapes live in `app/types/` barrels so components never import generated
internals.

## Enforcement

| Rule                | Tooling                                                             |
|---------------------|----------------------------------------------------------------------|
| Vue/Nuxt lint base  | `@nuxt/eslint` module (flat config), extended per [tooling.md](tooling.md) |
| Template formatting | Prettier (`vueIndentScriptAndStyle: false`)                          |
| SFC anatomy         | Convention + review; this document is the reference                  |
