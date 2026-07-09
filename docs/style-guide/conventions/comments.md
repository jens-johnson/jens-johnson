# Jens Johnson • Developer Style Guide • Comments

Code comments are a first-class part of the codebase: they carry the intent that types and names cannot. This
document specifies which comment syntax goes where, what it must contain, and how it is punctuated.

Related: 
- [file headers](file-headers.md) (the banner every file opens with)
- [docs & prose](docs-and-prose.md) (punctuation rules that apply to all prose, comments included)

## Comment Syntaxes

There are four comment syntaxes in the JS/TS ecosystem, and each has exactly one job:

### Starred Block / JSDoc

Documents declared symbols.

```typescript
/**
 * This is a
 * starred block comment
 */
```

### Single-line Block

Documents members of key/value shapes.

```typescript
/* This is a single-line block comment */
```

### Single-Line Slash Comment

Leads execution blocks.

```typescript
// This is a single-line comment
```

### Multi-line Slash Comment

Leads execution blocks when one line is not enough.

```typescript
// This is a multi-line
// comment
```

## Philosophy

Comments should be **thorough** and **explanative** but not **overly verbose**. The goal is code that is
self-documenting: a reader should understand the logic and execution of the software from the code plus its comments
alone, without archaeology.

- Explain **why** and **what for**; the code already says *what*.
- Never restate a function name or type signature in prose.
- Never leave stale implementation narration; comments are maintained with the same rigor as the code they describe.
- When a small function's JSDoc already tells the whole story, its body does not need inline comments; clarity over
  ceremony.

## Usage Matrix

| Context                                                | Syntax                           | Rule                               |
|--------------------------------------------------------|----------------------------------|------------------------------------|
| Symbol declarations (functions, constants, enums, ...) | `/** */` JSDoc                   | ✅ Always                           |
| Members of key/value shapes (interfaces, enums, maps)  | `/* */` (JSDoc when tags needed) | ✅ Always                           |
| Execution blocks inside functions/scripts              | Leading `//`                     | ✅ Default                          |
| Regular typed object literals (plain data)             | None                             | ❌ Don't                            |
| File headers                                           | Per file type                    | ✅ Always ([spec](file-headers.md)) |
| In-file section dividers                               | `/* ─── Name ─── */`             | As needed                          |

## JSDoc on Symbols

**Every declared symbol gets a JSDoc**: functions, exported constants, enums, interfaces, type aliases, and classes.


Plain variable declarations inside function bodies do not (they get [execution comments](#execution-comments)
instead).

### Structure and Tag Order

A JSDoc block reads top-down in this order:

1. **Summary**: one sentence, first line, ending with a period when a full sentence.
2. `@remarks` for deeper context (optional).
3. **Visibility tag**: `@public` or `@internal`.
4. `@default` when the symbol is the module's default export (sits between visibility and kind:
   `@public` → `@default` → `@constant`).
5. **Kind tag**: `@function`, `@constant`, `@interface`, `@enum`, `@typedef`.
6. `@param name - Description` (one per parameter, dash-separated; type braces only in plain JS, see below).
7. `@returns Description`.
8. `@throws Description` for expected thrown errors.
9. `@example` for public utilities/composables with non-obvious usage.
10. `@see` for cross-references and external links.
11. `@todo` for tracked, intentional debt.

> **Note:** The visibility (`@public`/`@internal`) and kind (`@function`/`@constant`/...) tags are a deliberate,
> accepted deviation from strict [TSDoc](https://tsdoc.org/), which has no kind tags; the rest of the syntax
> follows TSDoc.

### Rules

- **Never duplicate TypeScript types in JSDoc.** No `@param {string}`, no `@returns {Promise<User>}`; the signature
  owns the types. Enforced by `jsdoc/no-types`, scoped to TypeScript files.
- **In plain JavaScript (`.mjs`/`.js`) there is no signature to own the types, so JSDoc carries them**: typed
  braces are required (`@param {string[]} [options.scopes] - ...`, `@returns {object}`), with `[name]` marking
  optional parameters. This is the inverse of the TypeScript rule, for the same reason: exactly one place owns the
  type.
- Parameter descriptions use the dash form: `@param id - Stable user identifier from the auth provider.`
- Wrap identifiers, values, and code fragments in backticks; use `{@link Symbol}` for symbol references.

```typescript
// ❌ AVOID: types duplicated, no visibility/kind tags, summary restates the name
/**
 * fooThing function
 * @param id {string} User id.
 * @returns {Promise<User>}
 */

// ✅ DO: typed by the signature, documented by the JSDoc
/**
 * Fetches a user profile by id.
 * @public
 * @function
 * @param id - Stable user identifier from the auth provider
 * @returns The profile, or `null` when the user has not completed onboarding
 * @throws If the auth provider rejects the session token
 */
async function fetchUserProfile(id: string): Promise<IUserProfile | null> { /* ... */ }
```

```typescript
// ✅ DO: constants carry visibility + kind tags too
/**
 * The maximum number of characters rendered inside a header, excluding the surrounding border.
 * @internal
 * @constant
 */
const MAX_INNER_CONTENT_LENGTH: number = 117;

// ❌ AVOID: wrong syntax for a symbol declaration
/* My const! @constant */
const SOME_CONST: string = 'SOMETHING';

// ❌ AVOID: slash comments never document symbols
// The foo function
// @function
function fooThing(foo: IFoo): IModifiedFoo { /* ... */ }
```

## Member Comments

All key/value-shaped constructs (interfaces, enums, constant maps, and object-like types) get a comment on **every
member**, with a **blank line between members**.

- Use the single-line block form: `/* The field's identifier */`.
- Upgrade to a JSDoc block only when the member needs tags (`{@link}`, `@see`, `@deprecated`).
- Spill across lines only to respect the 120-character limit.
- **Plain typed object literals (instance data) are exempt**; they are values, not shapes.

- **Single-line member comments carry no trailing period**; full-sentence JSDoc summaries do.

```typescript
// ✅ DO

/**
 * The foo interface.
 * @public
 * @interface
 */
interface IFooInterface {
  /* A number key */
  numKey: number;

  /* An array of labels */
  arrayKey: string[];

  /**
   * Another key; this one carries a tag, so JSDoc style is warranted
   * @see {@link https://example.com/docs}
   */
  otherKey?: boolean;
}

/**
 * Maps attribute names to their storage keys.
 * @public
 * @constant
 */
const SOME_MAPPING_OBJ: Record<string, string> = {
  /* The foo attribute */
  foo: 'foo1',

  /* The bar attribute */
  bar: 'bar1',
};

/**
 * An enumeration of the supported things.
 * @public
 * @enum
 */
enum Things {
  /* The computer thing */
  computer = 'computer',

  /* The mouse thing */
  mouse = 'mouse',
}
```

```typescript
// ❌ AVOID

interface IFooInterface {
  // Slash comments never document members
  numKey: number;

  /**
   * A tag-less member doesn't need a starred block
   */
  arrayKey: string[];
}

// Plain instance data is a value, not a shape; don't annotate it
const ralph: IPerson = {
  /* Ralph's email */    // ← ❌ unnecessary
  email: 'ralph@example.com',

  /* Ralph's name */     // ← ❌ unnecessary
  name: 'ralph',
};
```

## Execution Comments

Logic inside functions and scripts is organized into **blocks**: a leading `//` comment describing the step, the
statements that perform it, and a blank line before the next block.

- Use single- or multi-line `//` comments; never block syntax inside function bodies.
- Comment the *step*, and add a second line for *why* when the reason is non-obvious.
- Small functions whose JSDoc already tells the whole story may omit inline comments entirely.

```typescript
// ✅ DO
function buildFooMappings(): string[] {
  // Get the foo source records
  const foo: string[] = getFoo();

  // Map over foo to build the foo mappings
  return foo.map((sub: string): string => {
    // Get the transverse and numerical parts
    // The transverse conversion is needed because the downstream API expects transverse-cased ids
    const transverse: string = toTransverse(sub);
    const numerical: number = Math.random() * 20 + 500;

    // Return the mapping
    return `${transverse}-${numerical}`;
  });
}
```

## Section Dividers

Files with logical groupings (constants, helpers, assembly, I/O, ...) separate them with a divider comment padded to
**exactly 120 characters**:

```typescript
/* ─── Section Name ────────────────────────────────────────────────────────────────────────────────────────────────── */
```

- Formula: `/* ─── NAME ` + `─` × (103 − length of NAME) + ` */` = 120 characters.
- Inside indented code, subtract the indent from the total (i.e. a 2-space indent yields 118 characters of content).
- Prefer the `/* */` form over `//` for dividers.

- **Three blank lines precede a section divider** (one blank line follows it); major sections get clear breathing
  room. See [`formatting.md`](formatting.md#blank-lines).

## Punctuation

- **No em dashes** anywhere in comments; use semicolons, colons, parentheses, or a rewrite. See
  [docs & prose](docs-and-prose.md).
- Lean toward whole sentences over fragments; sentence case throughout.
- JSDoc summaries are full sentences with periods; single-line member comments drop the trailing period.

## Enforcement

| Concern                            | Tooling                                                                                                                            |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| 120-char limit (comments included) | Prettier `printWidth: 120` + ESLint `max-len` when enabled                                                                         |
| JSDoc presence/shape               | `eslint-plugin-jsdoc`: `require-jsdoc`, `require-description`, `no-types` (adopted in new configs) |
| Type duplication in JSDoc          | `jsdoc/no-types` (TypeScript files only; plain JS requires types instead)                                                                                                                   |
| File headers                       | The [header generator](file-headers.md#tooling); never hand-formatted                                                              |
| Comment reflow                     | Prettier does not rewrap comment prose; authors own comment line breaks                                                            |

`eslint-plugin-jsdoc` is the standard enforcement vehicle: `jsdoc/require-jsdoc`, `jsdoc/require-description`, and
`jsdoc/no-types` are adopted in new configs (canonical block in [tooling.md](tooling.md)); existing repos migrate as
they next touch their lint setup.
