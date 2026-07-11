# Jens Johnson • Developer Style Guide • Testing

Tests earn their keep by guarding logic, not by inflating a percentage. The doctrine:

> Pure cores first: unit-test computation thoroughly, skip wiring unless it carries logic, and let risk (not
> coverage targets) drive investment.

Related:
- [functions.md](functions.md) (pure core / impure edges; the architecture that makes testing cheap)
- [project-structure.md](project-structure.md) (test layout)
- [tooling.md](tooling.md) (Vitest wiring)

## What Gets Tested

| Code                                                      | Tested?                                  |
|-----------------------------------------------------------|------------------------------------------|
| Pure computation cores (builders, validators, transforms) | ✅ Thoroughly; every branch and edge case |
| Logic-bearing glue (normalizers, mappers with fallbacks)  | ✅ When behavior is non-obvious           |
| I/O wrappers, framework wiring, thin components           | ❌ Not unless they grow logic             |
| Generated/config files                                    | ❌ Never                                  |

- **No coverage percentage targets.** Coverage follows risk and logic density; a meaningless 80% is worse than a
  meaningful 40%.
- The [pure-core / impure-edge](functions.md#design) architecture is what makes this cheap: cores take values and
  return values, so tests need no mocks.

## Layout & Naming

- **Vitest** is the runner; `pnpm test` runs it (`vitest run` in CI).
- **Unit tests live in band**: `<file>.test.ts` sits beside the file it exercises, inside the module folder
  (`src/utils/foo/utils.ts` → `src/utils/foo/utils.test.ts`). The test is part of the module, not a parallel tree
  to keep in sync.
- **Test files never enter the barrel**: a module's `index.ts` re-exports its public files, and `*.test.ts` is not
  one of them. Tests import their subject from the sibling file directly (`./utils`), never through the barrel.
- **E2E tests are the exception**: they exercise the system, not a module, so they live standalone in `test/e2e/`.
- Test files take the standard [file header](file-headers.md) describing what they assert.

## Test Shape

Suites nest two `describe` levels so the tree mirrors the module layout: **the outer block names the source file, the
inner block names the symbol under test.** Both titles are derived, not hand-typed, from the
[`@jens-johnson/style-guide/test-utils`](#the-test-utils-helpers) helpers:

- **Outer: `describe(getTestFileName(import.meta.url))`** resolves the co-located test's URL to the source file's
  [file-header](file-headers.md) banner label (`#composables/use-x/utils.ts` in an aliased app, `src/foo/utils.ts` in a
  plain library). One outer block per file.
- **Inner: `describe(symbolName(subject))`** titles by the exported symbol itself. `symbolName` returns the readable
  name a source file registers via [`defineSymbol`](#the-test-utils-helpers) (i.e. `"Build Jenscraft Live Metrics"`),
  falling back to the symbol's intrinsic `.name`. Pass the imported symbol, never a string literal.
- **`it('...')` titles are behavior sentences** that read as specifications:
  `it('ramps altitude linearly from zero to the target gain in meters', ...)`.
- **Every `describe` / `it` / hook callback carries an explicit return type** (`(): void`, or
  `async (): Promise<void>`). Test callbacks are contextually typed, so the annotation is redundant to the compiler; it
  is required for parity with production's [maximal-annotation](typescript.md) rule, not inference.
- **Fixtures are typed constants** declared at the top under a `─── Fixtures ───` divider, each carrying a full JSDoc
  block (`@internal` + `@constant`) like any script-scope declaration; drop them into a `─── Metadata ───`-style
  section only when a helper needs one.
- Extraction helpers used by assertions get JSDoc like any function.
- Assertions favor **exact values over shape-matching**: computed expectations (`expect(altitudes).toEqual([0, 15.24, 30.48])`)
  document the math they verify.

```typescript
/* ─── Fixtures ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A three-trackpoint activity with a known distance ramp; the altitude assertions are hand-checkable against it
 * @internal
 * @constant
 */
const activity: ITcxSourceActivity = {
  start_date: '2026-03-10T02:11:09.000Z',
  elapsed_time: 100,
  distance: 1000,
};

/* ─── Tests ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(buildTcx), (): void => {
    it('ramps altitude linearly from zero to the target gain in meters', (): void => {
      // Build a TCX with a 100ft target gain over three trackpoints
      const streams: TTcxStreams = { time: { data: [0, 50, 100] }, distance: { data: [0, 500, 1000] } };
      const tcx: string = buildTcx(activity, streams, 100);

      // The altitude samples ramp 0% -> 50% -> 100% of the gain
      expect(extractNumbers(tcx, 'AltitudeMeters')).toEqual([0, 15.24, 30.48]);
    });
  });
});
```

The source file registers its readable name at the bottom, under a `─── Metadata ───` divider, so the suite titles stay
in sync with the symbol:

```typescript
/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register a readable name/description so the unit suites can title their describe blocks from the source symbol
defineSymbol(buildTcx, {
  name: 'Build TCX Document',
  description: 'Renders an activity and its streams into a Garmin TCX XML document.',
});
```

- Test bodies follow the same [execution-comment](comments.md#execution-comments) style as production code; arrange
  and assert blocks are commented, not labeled with bare `// Arrange` boilerplate.

### The test-utils helpers

[`@jens-johnson/style-guide/test-utils`](../../../src/test-utils) ships the three helpers the shape above depends on, so
every consumer titles suites identically instead of re-deriving file names by hand:

| Helper                              | Role                                                                                              |
|-------------------------------------|---------------------------------------------------------------------------------------------------|
| `getTestFileName(import.meta.url)`  | The co-located test's URL → its source file's banner label (alias-prefixed app path, or `src/…`).  |
| `defineSymbol(fn, { name, description })` | Registers a readable name/description on a source symbol; returns it unchanged. Called in the source file's `─── Metadata ───` block. |
| `symbolName(fn)` / `symbolDescription(fn)` | Read the registered metadata back (name falls back to `fn.name`, then `"anonymous"`).         |

**Bundling caveat.** `getTestFileName` is only ever imported by `*.test.ts` files, so it never enters a production
bundle; importing it from this package is always safe. The symbol registry is different: `defineSymbol` runs in
production **source** (the `─── Metadata ───` block), so importing it pulls this package's raw TypeScript into the
consumer's build graph. That is fine for a plain-Node consumer, but a bundler that will not transpile a dependency's
`.ts` in every pass (i.e. the Nuxt/Nitro **prerenderer**) chokes on it. In those apps, keep a small **co-located** copy
of `defineSymbol` / `symbolName` in the app (it compiles with the app's own source in every pass) and import only
`getTestFileName` from this package. `symbolName` and `defineSymbol` must resolve to the **same** module instance to
share the registry, so pick one home per app and use it on both sides.

## Failure-Path Coverage

Result-union validators and error paths are first-class test subjects: the `{ ok: false }` branches, boundary
values, and malicious-extra-field stripping deserve the same rigor as the happy path
(see [error-handling.md](error-handling.md#1-result-unions-for-expected-outcomes)).

## Enforcement

| Rule            | Tooling                                                        |
|-----------------|------------------------------------------------------------------|
| Runner          | Vitest; `pnpm test` locally, `vitest run` in CI                  |
| Test presence   | Convention + review; new pure cores land with their tests        |
| Lint parity     | Test files pass the same ESLint/Prettier gates as production code |
