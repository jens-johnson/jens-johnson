# Jens Johnson • Developer Style Guide • Formatting

Whitespace, punctuation, and layout. Everything in this document is mechanically enforceable; Prettier is the
executor and the [canonical config](#enforcement) at the bottom encodes it. If code disagrees with this document,
run the formatter; if the formatter disagrees with this document, the config is wrong.

## Line Length

**Lines are at most 120 characters.**

- Why: 80 is an artifact of terminals; 120 fits modern splits while still forcing decomposition.
- Overflow exceptions: URLs, file-header banner separators (a fixed-width design element), and other unbreakable
  strings.
- Applies to comments and prose in code, not just statements.

## Indentation

**2 spaces, never tabs.** Vue SFC `<script>`/`<style>` content is *not* indented an extra level inside its block
(`vueIndentScriptAndStyle: false`).

## Quotes

- **Single quotes** for all JS/TS strings; backticks only when interpolating or for multiline template literals.
- **Double quotes** in HTML/Vue template attributes (`<div :style="tiltStyle">`), matching HTML convention.
- Don't use backticks for plain strings with no interpolation.

## Semicolons (EOL)

**Every statement ends with a semicolon.** No ASI reliance, ever.

## End of File

**Every file ends with exactly one newline.**

## Line Endings

**`LF` only**, enforced via Prettier (`endOfLine: 'lf'`) and `.gitattributes`/`.editorconfig` where relevant.

## Trailing Commas

**Always, on every multiline construct** (`trailingComma: 'all'`): arrays, objects, imports, function parameters.

- **Why**: single-line diffs when appending; no churn on the previous line.

## Braces & Spacing

- **1TBS brace style**: opening brace on the same line; `} else {` cuddled.
- **Spaces inside braces**: `{ foo }` for imports, exports, destructuring, and object literals
  (`bracketSpacing: true`).
- **Arrow parens always**: `(x) => ...`, never `x => ...`.

## Multiline Thresholds

Break constructs onto one-member-per-line when they grow:

| Construct                       | Threshold                                        | Owner            |
|---------------------------------|--------------------------------------------------|------------------|
| Object literal members          | 3 or more properties: always multiline           | ESLint (hardened) |
| Enums, interfaces, type members | Always multiline                                 | Convention        |
| Imports / exports               | Multiline when the line exceeds 120 characters   | Prettier          |
| Function parameters / arguments | Multiline when the line exceeds 120 characters   | Prettier          |

```typescript
// ✅ DO: 3+ object properties always break
const options: IRenderOptions = {
  intensity: 10,
  scale: 1.025,
  shineOpacity: 0.12,
};

// ✅ DO: imports and params break when width forces them (Prettier decides)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import {
  ARG_KEYS,
  BAR_CHARACTER,
  EMIT_KEYS,
  FILE_TYPE_BY_EXTENSION,
  HASH_COMMENT_DOTFILE_PATTERN,
  HELP_TEXT,
} from './constants';
```

The **object threshold is hardened** with `@stylistic` layout rules layered *after* `eslint-config-prettier`:
`object-curly-newline` (`ObjectExpression: { multiline: true, consistent: true, minProperties: 3 }`) plus
`object-property-newline`. This works because Prettier *preserves* existing line breaks inside object braces.

**Imports and function params are deliberately not ESLint-hardened**: Prettier always collapses import specifiers
and call/signature arguments that fit the print width (verified empirically), so a member-count rule there would
fight the formatter on every run. Prettier's 120-column behavior is the rule. The canonical config block lives in
[tooling.md](tooling.md).

## Blank Lines

- **One blank line** between top-level declarations (functions, constants, etc.).
- **One blank line** between members of interfaces, enums, and constant maps (see
  [comments.md](comments.md#member-comments)); those members are also sorted, per
  [typescript.md](typescript.md#member-ordering).
- **One blank line** between execution blocks inside a function body.
- **No consecutive blank lines** inside function bodies.
- **One blank line before a module-scope section divider in Prettier-owned files** (TS/JS/Vue), one after it;
  Prettier hard-collapses consecutive blank lines, so one is the maximum air available. **Shell and other
  hash-comment files, which Prettier does not format, use three blank lines** before dividers (see
  [comments.md](comments.md#section-dividers) and [shell-and-environment.md](shell-and-environment.md)).

> **Note:** The three-line variant exists only where Prettier has no jurisdiction; inside Prettier-owned files,
> every divider follows the one-blank-line rhythm.

## Numeric Literals

**Use numeric separators for numbers of 5+ digits**: `86_400`, `30_000`, `1_000_000_000`.

## Section Dividers

In-file logical sections are separated by `─` dividers padded to exactly 120 characters; full geometry and usage in
[comments.md](comments.md#section-dividers).

## Enforcement

The canonical Prettier configuration (`.prettierrc.json`):

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false
}
```

The canonical `.editorconfig` baseline:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
max_line_length = 120
trim_trailing_whitespace = true
```

- **Prettier owns formatting**; never add stylistic ESLint rules that fight it, and load `eslint-config-prettier`
  last to neutralize conflicts.
- In Tailwind projects, add `prettier-plugin-tailwindcss` for class ordering (see
  [css-and-styling.md](css-and-styling.md)).
