# Jens Johnson • Developer Style Guide • Control Flow & Iteration

How data moves and decisions branch. The unifying doctrine:

> **declarative over imperative**; express *what* the transformation is, not *how* to walk it.

Related:
- [functions.md](functions.md) (callback shape)
- [async-and-promises.md](async-and-promises.md) (async iteration)
- [typescript.md](typescript.md) (annotations referenced throughout)

## Iteration

### Prefer Array Methods Over Loops

> Use `.map()` / `.filter()` / `.reduce()` / `.flatMap()` / `.find()` / `.some()` / `.every()` instead of `for`,
> `for...in`, and `for...of`

- **Why**: no mutable accumulators, no index bookkeeping, the operation's intent is named, and results stay `const`.

```typescript
// ❌ AVOID: imperative accumulation into a mutable binding
let results: string[] = [];
for (const item in bar) {
  results.push(transform(item));
}

// ✅ DO: the operation names itself
const results: string[] = bar.map((item: IBarItem): string => transform(item));
```

Imperative loops (`for...of`, `while`, indexed `for`) are tolerated only where early termination, streaming, or a
performance-critical hot path (i.e. a per-frame canvas render loop, where allocating intermediate arrays each frame is
too costly) makes the functional form genuinely awkward or wasteful; when one survives, it gets an execution comment
justifying it.

### Choosing the Method

| Goal                                  | Method                                                                   |
|---------------------------------------|--------------------------------------------------------------------------|
| Transform every element               | `.map()`                                                                 |
| Transform + drop elements             | `.filter()` **first**, then `.map()`                                     |
| Expand each element into 0..n results | `.flatMap()`                                                             |
| Accumulate into a single value        | `.reduce()` (typed accumulator)                                          |
| Side effects only, no captured output | `.forEach()`                                                             |
| First match                           | `.find()` / `.findIndex()`                                               |
| Boolean over the collection           | `.some()` / `.every()`                                                   |
| Async work per element, in parallel   | `Promise.all(items.map(async ...))` (see [async](async-and-promises.md)) |

```typescript
// ✅ DO: filter before map; never map-then-discard
const activeNames: string[] = users
  .filter((user: IUser): boolean => user.isActive)
  .map((user: IUser): string => user.displayName);

// ✅ DO: forEach only when nothing is captured
items.forEach((item: IItem): void => URL.revokeObjectURL(item.previewUrl));

// ❌ AVOID: forEach with a meaningful return value; that's a map
items.forEach((item: IItem): string => `${item.id}-modified`);
```

### Callback shape

- **Fully annotate callbacks**: parameter types *and* return type; `(sub: IFoo): string => ...`, never
  `sub => ...`. See [typescript.md](typescript.md) for the maximal-annotation doctrine.
- **Use expression bodies** (closures) when the output is a simple expression; reach for a block body only when
  intermediate steps are needed.

```typescript
// ✅ DO: expression body for simple outputs
const mappedFoos: number[] = foos.map((sub: IFoo): number => sub.fooify() + Math.random());

// ✅ DO: block body when steps warrant execution comments
const convertedBars: string[] = bars.map((sub: IBar): string => {
  // Fetch the translation and addition
  const translation: string = translatorLib.translate(sub);
  const addition: number = Math.random() * 10 + 100;

  // Return the modified string
  return `${translation}-${addition}`;
});
```

## Conditionals

### Braces

- Every conditional body is braced, with the body on its own line.
- Single-line forms (`if (x) return;` and `if (x) { return; }`) are banned.
  - see [functions.md](functions.md#bodies) for examples.
- Enforced via ESLint `curly: ['error', 'all']`.

### Guard Clauses & Early Returns

**Handle edge cases first and return early**; the happy path stays unindented at the bottom.

```typescript
// ✅ DO
function detectFileType(fileName: string): FileType {
  // Fall back when the extension is unmapped
  const fileType: FileType | undefined = FILE_TYPE_BY_EXTENSION[extname(fileName).toLowerCase()];
  if (!fileType) {
    return FileType.generic;
  }

  return fileType;
}

// ❌ AVOID: nesting the happy path inside validation
function detectFileType(fileName: string): FileType {
  const fileType: FileType | undefined = FILE_TYPE_BY_EXTENSION[extname(fileName).toLowerCase()];
  if (fileType) {
    return fileType;
  } else {
    return FileType.generic;
  }
}
```

- **No `else` after a returning `if`**; the guard already branched.

### Ternaries

**Ternaries are for value selection, not control flow.**

- Simple two-way selection: always fine inline.
- Chained ternaries: acceptable for flat, ordered range/tier selection; break to one condition per line when they
  exceed the line limit.
- Never nest ternaries in a way that requires parentheses to parse.

```typescript
// ✅ DO: flat tier selection
const state: TSubstrateMetricsState =
  ageSec <= LIVE_MAX_AGE_S ? 'live' : ageSec <= STALE_MAX_AGE_S ? 'stale' : 'offline';
```

### Lookup Objects Over `switch`

**Prefer a typed `Record` lookup (with a fallback) over `switch` for value-to-value mapping.**

- **Why**: lookups are data (testable, spreadable, exhaustiveness-checkable via `Record<UnionType, V>`), while `switch`
  is control flow pretending to be data.

```typescript
// ✅ DO
const KIND_ICON: Record<string, string> = {
  media: 'lucide:clapperboard',
  network: 'lucide:network',
  storage: 'lucide:database',
};

/**
 * Resolves the icon for a kind.
 * @internal
 * @function
 * @param kind - The kind key
 * @returns The matching icon, or the fallback icon when unknown
 */
function kindIcon(kind: string): string {
  return KIND_ICON[kind] ?? DEFAULT_ICON;
}

// ❌ AVOID
function kindIcon(kind: string): string {
  switch (kind) {
    case 'media':
      return 'lucide:clapperboard';
    // ...
  }
}
```

`switch` is reserved for genuine control-flow branching with fall-through semantics or non-trivial per-case logic;
when used, every case gets a `break`/`return` and `default` is mandatory.

## Operators

- **`===` / `!==` always**; `==` only as `== null` never (use explicit checks or `??`).
- **Nullish coalescing (`??`) over `||`** for defaulting; `||` only when falsy coalescing is genuinely intended.
- **Optional chaining (`?.`)** over manual null guards.

```typescript
// ✅ DO
const label: string = candidate?.label ?? DEFAULT_LABEL;

// ❌ AVOID: || swallows '' and 0
const label: string = (candidate && candidate.label) || DEFAULT_LABEL;
```

## Enforcement

| Rule                         | Tooling                                                                                                      |
|------------------------------|--------------------------------------------------------------------------------------------------------------|
| `===` always                 | ESLint `eqeqeq: ['error', 'always']`                                                                         |
| No `var`, prefer `const`     | ESLint `no-var`, `prefer-const`                                                                              |
| Cognitive complexity ceiling | `sonarjs/cognitive-complexity` (warn at 15)                                                                  |
| Duplicate branches/functions | `sonarjs/no-identical-functions`                                                                             |
| Loop style                   | Convention + review (candidate: `unicorn/no-array-for-each` inverse rules are *not* used; array methods win) |
