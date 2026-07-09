# Jens Johnson • Developer Style Guide • Functions

The unit of design. The doctrine:

> Named declarations, single purposes, guarded entries, pure cores.

Related:
- [naming.md](naming.md) (verb-first names)
- [comments.md](comments.md) (JSDoc)
- [control-flow-and-iteration.md](control-flow-and-iteration.md) (callback shape)
- [error-handling.md](error-handling.md) (what functions throw vs. return)

## Declarations vs. Arrows

**Top-level and exported functions are `function` declarations. Arrow functions are for callbacks and closures.**

- **Why**: declarations hoist, name their own stack frames, and give JSDoc a natural anchor; arrows shine inline where
  brevity and lexical scope matter.

```typescript
// ✅ DO
/**
 * Renders a complete file header.
 * @public
 * @function
 * @param spec - The header spec describing the file
 * @param config - The shared project header configuration
 * @returns The rendered header text
 */
export function renderHeader(spec: IHeaderSpec, config: IHeaderConfig): string {
  return applyCommentStyle(buildHeaderContent(spec, config), detectCommentStyle(spec.file));
}

// ✅ DO: arrows as callbacks
const centeredLines: string[] = lines.map((line: string): string => padding + line);

// ❌ AVOID: arrow consts as top-level API
export const renderHeader = (spec: IHeaderSpec, config: IHeaderConfig): string => { /* ... */ };
```

## Signatures

- **Return types are always explicit**, including `: void`, `: never`, and `: Promise<T>`.
- **Parameters with defaults are still annotated**: `attempts: number = 20`, never `attempts = 20`.
- **3+ parameters break to one per line** (see [formatting.md](formatting.md#multiline-thresholds)).

When a signature reaches ~4 parameters or grows boolean flags, collapse it into a single typed options object
(`options: IRenderOptions`) with destructuring + defaults in the body.

```typescript
// ✅ DO: options-object pattern for wide signatures
export function useCardTilt(options: ICardTiltOptions = {}) {
  // Destructure the options with their defaults
  const { intensity = 10, scale = 1.025, shineOpacity = 0.12 }: ICardTiltOptions = options;
  /* ... */
}
```

## Bodies

- **Every conditional body is braced, with the body on its own line**; single-line `if (x) return;` forms are
  banned.

```typescript
// ✅ DO
if (!email) {
  return false;
}

// ❌ AVOID
if (!email) return false;
if (!email) { return false; }
```

- **Guard clauses first**: validate, bail, then run the happy path unindented (see
  [control-flow-and-iteration.md](control-flow-and-iteration.md#guard-clauses--early-returns)).
- **Execution blocks** are separated by blank lines and led by `//` comments (see
  [comments.md](comments.md#execution-comments)).

## Design

- **Single purpose**: a function does one thing its verb-first name fully describes; when a block inside a body
  wants its own comment *and* its own name, extract it as an unexported helper.
- **Pure core, impure edges**: computation (formatting, math, transformation) lives in pure functions with no I/O;
  filesystem/network/process effects are pushed to thin, clearly-named edge functions (`writeHeaderToFile`,
  `loadHeaderConfig`). Pure cores are what get unit-tested (see [testing.md](testing.md)).
- **Size**: no hard line limit; the ceiling is cognitive, enforced via `sonarjs/cognitive-complexity` (warn at 15).
  A function that needs a scroll wheel needs a refactor.
- **Internal helpers stay unexported** and are tagged `@internal`; the module's export surface is its API contract
  (see [modules-and-imports.md](modules-and-imports.md)).

## Enforcement

| Rule                       | Tooling                                                                             |
|----------------------------|-------------------------------------------------------------------------------------|
| Braced bodies, new line    | ESLint `curly: ['error', 'all']` + Prettier                                         |
| Complexity ceiling         | `sonarjs/cognitive-complexity: ['warn', 15]`                                        |
| Identical functions        | `sonarjs/no-identical-functions`                                                    |
| Explicit return types      | Convention + review (candidate: `@typescript-eslint/explicit-function-return-type`) |
