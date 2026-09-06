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

Inside `<script setup>`, sections follow a **canonical order**, each under a `───` divider:

1. **File header** (always first; the [banner](file-headers.md) lives inside the script block, and one blank line
   follows it)
2. **Imports** (grouped per [modules-and-imports.md](modules-and-imports.md))
3. **Props / Emits / Model / Slots** (`defineProps`, `defineEmits`, `defineModel`, `defineSlots`)
4. **State** (`ref`/`reactive`/`useState`, composable calls)
5. **Computed**
6. **Handlers** (`on`-prefixed event handlers and any other script-scope function)
7. **Lifecycle** (`onMounted`, watchers)
8. **Expose** (`defineExpose`, when needed)

```vue
<script setup lang="ts">
/**
 * ██████ ... file header banner ... ██████
 */

/* ─── Imports ────────────────────────────────────────────────────────────────────────────────────────────────────── */

import type { TPropsWithDefaults } from '@jens-johnson/style-guide/types/vue';
import type { ComputedRef, Ref } from 'vue';

import type { ICardEmits, ICardProps } from './types';

/* ─── Props ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the root element tag and the inner padding preset.
 * @internal
 * @constant
 */
const props: TPropsWithDefaults<ICardProps, 'as' | 'pad'> = withDefaults(defineProps<ICardProps>(), {
  as: 'div',
  pad: 'md',
});

/* ─── Emits ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The events the card raises; `select` carries the card's id.
 * @internal
 * @constant
 */
const emit = defineEmits<ICardEmits>();

/* ─── State ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Whether the pointer is currently over the card.
 * @internal
 * @constant
 */
const isActive: Ref<boolean> = ref(false);

/* ─── Computed ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The surface classes for the current pointer state.
 * @internal
 * @constant
 */
const surfaceClass: ComputedRef<string> = computed((): string => (isActive.value ? 'shadow-lg' : 'shadow'));

/* ─── Handlers ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Marks the card active while the pointer is over it.
 * @internal
 * @function
 */
function onMouseEnter(): void {
  isActive.value = true;
}
</script>

<template>
  <!-- Surface wrapper -->
  <component
    :is="props.as"
    :class="surfaceClass"
    class="rounded-lg border"
    @mouseenter="onMouseEnter"
    @click="emit('select', props.id)"
  >
    <slot />
  </component>
</template>
```

### Section Dividers

- **Dividers are mandatory once the script holds two or more populated sections, excluding the file header.**
  Count each named section separately, including imports and the individual contract sections. Imports plus props
  require dividers; a page with only one `useHead` call and no imports may omit them. Omit empty sections. The test
  is the section count, not a judgment about whether the script is "non-trivial".
- **The divider vocabulary is fixed**: `Imports`, `Props`, `Emits`, `Model`, `Slots`, `State`, `Computed`, `Handlers`,
  `Lifecycle`, `Expose`. `Types` and `Constants` dividers never appear in an SFC, because those declarations live in
  the component's `types.ts` and `constants.ts` (see [Component Modules](#component-modules)).
- Geometry is the standard 120-column divider from [comments.md](comments.md#section-dividers), one blank line on
  each side.

### Declarations

- **Every script-scope declaration carries a JSDoc block with a summary sentence, `@internal`, and its kind tag**
  (`@constant` for variables, including composable destructures, computeds, and local constants; `@function` for
  functions). Presence is mechanized by the SFC-scoped `jsdoc/require-jsdoc` context and the summary by
  `jsdoc/require-description`; the tags are review-checked. A bare `/** The slide on show. */` one-liner is not the
  form.
- **Reactive state annotates the declaration, not the call**: `const isActive: Ref<boolean> = ref(false)` and
  `const total: ComputedRef<number> = computed((): number => ...)`. The generic argument on `ref<T>()` is reserved
  for cases where inference from the initial value would produce the wrong type: no initial value (a template ref,
  `const root: Ref<HTMLElement | undefined> = ref<HTMLElement>()`), a `null` seed for a later object, or a literal
  that must stay a member of its union. The generic never substitutes for the declaration annotation. The computed
  getter keeps its explicit return type even though the ESLint rule exempts contextually typed callbacks, for the
  same parity reason as [test callbacks](testing.md#test-shape). The `emit` binding is the one declaration left to
  inference: `defineEmits<T>()` returns Vue's internal `ShortEmits<T>`, and there is no stable public name to write.
- **Script-scope functions are `function` declarations**, `on`-prefixed when they handle events
  (`function onMouseEnter(): void`). `const onSelect = (): void => {}` at script scope is rejected by the
  script-scope arrow selectors ([functions.md](functions.md#declarations-vs-arrows)); arrows remain the form for
  callbacks and closures inside a body.
- **Props members are commented** like any shape, blank line between members, defaults via `withDefaults`.
- **The `props` const is annotated** with `TPropsWithDefaults<TProps, TDefaulted>` (from
  `@jens-johnson/style-guide/types/vue`): the raw props interface with the defaulted keys promoted to required,
  wrapped readonly. Maximal annotations do not stop at component boundaries.
- Template comments are HTML comments labeling structural regions (`<!-- Bento grid -->`).
- Template attributes use double quotes ([formatting.md](formatting.md#quotes)).

### Component Modules

- **A component is a folder module**: `index.vue` plus co-located `types.ts` (the `I<Component>Props` interface,
  `I<Component>Emits` and `I<Component>Slots` when the component has them, derived unions), `enums.ts` (enums),
  `constants.ts` (named, typed magic values), and `utils.ts` + `utils.test.ts` when the component owns pure logic
  (i.e. the spark-line geometry builder). The SFC imports them via `./types`, `./enums`, `./constants`, `./utils`.
  The inline `interface Props` idiom is retired.
- **Framework-owned files keep their filenames.** Pages, layouts, `app.vue`, and `error.vue` are routed by name and
  are not folder modules; every script rule above (anatomy, declarations, no inline types) still applies to them,
  and the types they need live in the `app/types/<domain>/` barrels.
- **No type definitions inside the SFC.** `interface`, `type`, and `enum` declarations are rejected in `.vue` files,
  and so is every inline type literal: as the type argument of `defineProps`, `defineEmits`, `defineSlots`, or
  `defineModel`, nested inside a utility type (`Readonly<{ ... }>`), or annotating a variable. This deliberately
  overrides the short-inline-shape allowance in [typescript.md](typescript.md#maximal-annotations) for `.vue`
  files: a component's shapes are its contract, and the contract lives in `./types`. Primitive and named types
  (`defineModel<string>()`, `const label: ICardLabel = ...`) are not literals and pass. Mechanized by the
  `vue-sfc-modules` block.
- **Constant-extraction threshold**: semantic magnitudes (pixel distances, durations, thresholds, SSR fallbacks like
  a hero height) get named constants once there are two or more related values, or a co-located `constants.ts`.
  **Single-use easing/animation coefficients inside one decorative formula stay inline** (`0.02 + progress * 0.22`
  reads clearer than `MARK_OPACITY_BASE + progress * MARK_OPACITY_GAIN`); the point of naming is clarity, not literal
  zero-magic-numbers.
- **The component's [file header](file-headers.md) documents its contract**: populated PROPS / MODEL / EMITS /
  SLOTS / EXPOSED sections, regenerated via the generator's `--spec` whenever the contract changes, plus a USAGE
  line showing a real call site. Only applicable sections appear (a component without props has no PROPS section);
  the one-line `-f` / `-d` form is complete only for a component with no contract at all.

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

| Rule                                   | Tooling                                                                                                        |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------|
| Vue/Nuxt lint base                     | `@nuxt/eslint` module (flat config), extended per [tooling.md](tooling.md)                                     |
| Template formatting                    | Prettier (`vueIndentScriptAndStyle: false`)                                                                    |
| Script-scope JSDoc                     | `jsdoc/require-jsdoc` (`Program > VariableDeclaration` context) + `jsdoc/require-description` (`contexts: any`) |
| Type definitions inside an SFC         | `no-restricted-syntax` in the `vue-sfc-modules` block: declarations and define-macro literals rejected in `.vue` |
| Script-scope arrow functions           | `no-restricted-syntax` in `script-scope-functions`, restated in `vue-sfc-modules` (ESLint replaces rule options) |
| Blank line after the header            | The [header generator](file-headers.md#tooling) writes it                                                      |
| Folder layout, divider presence and names, `@internal` + `@constant` tags, `Ref<T>` annotation form, header `--spec` sections | Convention + review; the SFC checklist in [agent-workflow.md](../agent-workflow.md) is the gate |
