# Jens Johnson • Developer Style Guide • TypeScript

The type system is the spec. The doctrine:

> **Maximal explicitness**; types are written down everywhere they can be, so the code self-documents and drift is
> impossible.

Related:
- [naming.md](naming.md) (I/T prefixes)
- [error-handling.md](error-handling.md) (result unions)
- [functions.md](functions.md) (signatures)

## Strictness

**`strict: true`, always**, plus the extended checks. The canonical compiler baseline:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true
  }
}
```

Typechecking runs as its own gate (`pnpm typecheck` via `tsc --noEmit` / `vue-tsc`), separate from the build.

## Enums and Derived Unions (Mandate)

**A string-literal union that names an enumerable domain is always derived from an enum**; hand-written unions are
reserved for genuinely open shapes (template-literal patterns, external contracts you don't own):

```typescript
// ✅ DO: the enum is the domain, the union is derived
export enum PadPreset {
  lg = 'lg',
  md = 'md',
  none = 'none',
  sm = 'sm',
}
export type TPadPreset = `${PadPreset}`;

// ❌ AVOID: a free-floating literal union invites drift
type TPadPreset = 'sm' | 'md' | 'lg' | 'none';
```

## Maximal Annotations

**Annotate everything**: local variables, function parameters, return types, and callback parameters *and* returns,
even where TypeScript could infer.

- **Why**: the reader never runs inference in their head; reviews read top-to-bottom; refactors that silently change an
  inferred type become loud compile errors instead.

```typescript
// ✅ DO
const indents: number[] = lines
  .filter((line: string): boolean => line.trim() !== '')
  .map((line: string): number => line.length - line.trimStart().length);
const minimumIndent: number = indents.length ? Math.min(...indents) : 0;

// ❌ AVOID: inference does the documenting
const indents = lines.filter((line) => line.trim() !== '').map((line) => line.length - line.trimStart().length);
const minimumIndent = indents.length ? Math.min(...indents) : 0;
```

**Object destructures are annotated too**, with the source's named type when one exists or a short inline shape
otherwise; a destructure is a declaration like any other:

```typescript
// ✅ DO: the named type documents what is being unwrapped
const { activityId, tcx, elevationFeet }: IVertifixCommitRequest = parsed.request;
const { theme, setTheme }: IUseThemeReturn = useTheme();
const { values, positionals }: { values: ICliValues; positionals: string[] } = parsed;

// ❌ AVOID: the unwrapped names carry no visible types
const { activityId, tcx, elevationFeet } = parsed.request;
```

**Primitive constants annotate the wide type and skip `as const`**; the assertion is reserved for genuine literal
narrowing:

```typescript
// ✅ DO
const MAX_INNER_CONTENT_LENGTH: number = 117;

// ✅ DO: as const where literal narrowing is the point
const THEME_NAMES = ['day', 'sunset', 'night'] as const;
type TThemeName = (typeof THEME_NAMES)[number];

// ❌ AVOID: the annotation widens the type right back; the assertion is inert
const MAX_INNER_CONTENT_LENGTH: number = 117 as const;
```

## Interface vs. Type Alias

- **Interfaces** (`I`-prefixed) for object shapes: specs, configs, entities, props-like structures.
- **Type aliases** (`T`-prefixed) for everything else: unions, template-literal types, mapped/derived types,
  function types, tuples.

```typescript
/**
 * The full input describing one file header.
 * @public
 * @interface
 */
interface IHeaderSpec {
  /* Path or name of the file the header describes */
  file: string;
}

/**
 * An ordered list of `[attribute, label]` pairs.
 * @public
 */
type TFieldKeyLabels = ReadonlyArray<readonly [keyof IField, string]>;
```

## Enums and Derived Unions

**Enums are the canonical value sets; unions are derived from them.** The signature pattern:

```typescript
/**
 * An enumeration of comment styles for ASCII header comments.
 * @public
 * @enum
 */
enum CommentStyle {
  /* TS/JS starred block comment style */
  block = 'block',

  /* YAML/shell hash comment style */
  hash = 'hash',

  /* HTML comment style */
  html = 'html',
}

/**
 * A comment style; one of {@link CommentStyle}.
 * @public
 */
type TCommentStyle = `${CommentStyle}`;
```

- The **enum** is the single source of truth for values and gets member-level comments.
- The **template-literal type** (`` `${CommentStyle}` ``) produces the equivalent string union, so external inputs
  (JSON specs, CLI flags, API payloads) can pass raw strings without importing the enum.
- Internal code branches on the enum (`CommentStyle.hash`); boundary-facing types accept the `T` union.
- Member casing follows the domain (see [naming.md](naming.md#type-prefixes)); member and value mirror each other.

## `any`, `unknown`, and Narrowing

- **`any` is banned** (`@typescript-eslint/no-explicit-any`); use `unknown` and narrow.
- Narrow with type guards and **typed predicates**:

```typescript
// ✅ DO: predicate-based narrowing survives .filter()
const candidates: string[] = rawCandidates.filter(
  (candidate: string | undefined): candidate is string => Boolean(candidate),
);

// ✅ DO: unknown at the catch/boundary, narrowed before use
runCli().catch((error: unknown) => exitWithError(error instanceof Error ? error.message : String(error)));
```

- **Untrusted input is validated, not asserted**: parse through a [result-union validator](error-handling.md) or a
  schema (Zod in Nuxt Content contexts) rather than casting.
- **`as` is a last resort**, acceptable at trust boundaries where the shape is externally guaranteed (i.e.
  `JSON.parse(raw) as IHeaderConfig` for a self-owned config file); every such cast is a conscious trust decision.
- **`satisfies`** for literal conformance without widening:

```typescript
// ✅ DO: value checked against the contract, literal type preserved
await store.setItem(KEY, { ...payload, receivedAt } satisfies IStoredSubstrateMetrics);
```

## Readonly & Immutability

- Module-level collection constants are **readonly**: `ReadonlySet<string>`, `ReadonlyArray<T>`, `readonly` tuple
  members.
- `const` everywhere; `let` only for genuine reassignment; `var` never.

## `null` vs. `undefined`

**`undefined` means "not provided"** (optional parameters, optional members, missing lookups); **`null` means
"explicitly absent"** (a queried value that does not exist, a cleared state field, wire-format absence). Functions
that look something up and may miss return `T | null` (`readLatestMetrics(): Promise<IStoredMetrics | null>`);
optional inputs are `?`/`undefined`.

## Non-Null Assertions

`!` is allowed only when the invariant is **locally provable** and `noUncheckedIndexedAccess` is being conservative
(i.e. `wrapped[0]!` immediately after constructing `wrapped` with at least one element). Prefer restructuring when
it costs nothing; never use `!` to silence a genuinely unknown case.

## Type-Only Imports

**Use dedicated `import type` statements**, separated from value imports:

```typescript
// ✅ DO
import { CommentStyle, FileType } from './enums';
import type { IField, IHeaderConfig, IHeaderSpec } from './types';

// ❌ AVOID: inline type modifiers mixed into value imports
import { CommentStyle, type IField } from './somewhere';
```

## Utility Types

Reach for the built-ins before redeclaring shapes: `Pick`, `Omit`, `Partial`, `Record`, `Parameters`, `ReturnType`.

```typescript
// ✅ DO: derive, don't duplicate
type TUploadActivity = Pick<IStravaActivity, 'id' | 'name' | 'description'>;
```

## Enforcement

| Rule                     | Tooling                                                                                          |
|--------------------------|--------------------------------------------------------------------------------------------------|
| No `any`                 | `@typescript-eslint/no-explicit-any` (error)                                                     |
| Strict + extended checks | `tsconfig` baseline above; `pnpm typecheck` in the check gate                                    |
| Type-only imports        | `verbatimModuleSyntax: true` makes them load-bearing                                             |
| Return types             | `@typescript-eslint/explicit-function-return-type` (error); contextually-typed callbacks exempt  |
| Maximal annotations      | Locals/params: convention + review (no ESLint rule enforces annotating inferable locals sanely)  |
