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
- Tests live in **`test/unit/`**, mirroring the source tree; files are **`<subject>.test.ts`** (`tcx.test.ts`).
- Test files take the standard [file header](file-headers.md) describing what they assert.

## Test Shape

- **`describe(subject)`** blocks group by function/unit; **`it('...')` titles are behavior sentences** that read as
  specifications: `it('ramps altitude linearly from zero to the target gain in metres', ...)`.
- **Fixtures are typed constants** declared at the top under a `─── Fixtures ───` divider, with member comments
  where shapes are non-obvious.
- Extraction helpers used by assertions get JSDoc like any function.
- Assertions favor **exact values over shape-matching**: computed expectations (`expect(altitudes).toEqual([0, 15.24, 30.48])`)
  document the math they verify.

```typescript
/* ─── Fixtures ───────────────────────────────────────────────────────────────────────────────────────────────────── */

const activity: ITcxSourceActivity = {
  start_date: '2026-03-10T02:11:09.000Z',
  elapsed_time: 100,
  distance: 1000,
};

/* ─── Tests ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe('buildTcx', () => {
  it('ramps altitude linearly from zero to the target gain in metres', () => {
    // Build a TCX with a 100ft target gain over three trackpoints
    const streams: TTcxStreams = { time: { data: [0, 50, 100] }, distance: { data: [0, 500, 1000] } };
    const tcx: string = buildTcx(activity, streams, 100);

    // The altitude samples ramp 0% -> 50% -> 100% of the gain
    expect(extractNumbers(tcx, 'AltitudeMeters')).toEqual([0, 15.24, 30.48]);
  });
});
```

- Test bodies follow the same [execution-comment](comments.md#execution-comments) style as production code; arrange
  and assert blocks are commented, not labeled with bare `// Arrange` boilerplate.

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
