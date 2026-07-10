# Jens Johnson • Developer Style Guide • Naming

Names are the first layer of documentation. The doctrine:

> Fully descriptive, never abbreviated, cased by role

Related:
- [typescript.md](typescript.md) (the I/T/enum type system)
- [modules-and-imports.md](modules-and-imports.md) (module/file layout)
- [vue-nuxt.md](vue-nuxt.md) (component/composable specifics)

## Casing by Role

| Thing                    | Convention                | Example                                      |
|--------------------------|---------------------------|----------------------------------------------|
| Files & directories      | `kebab-case`              | `file-header-generator/`, `use-card-tilt/`   |
| Variables                | `camelCase`               | `fileNameLength`, `centeredBanner`           |
| Functions                | `camelCase`, verb-first   | `renderHeader`, `detectFileType`             |
| Constants (module-level) | `SCREAMING_SNAKE_CASE`    | `MAX_INNER_CONTENT_LENGTH`                   |
| Interfaces               | `I` + `PascalCase`        | `IHeaderSpec`                                |
| Type aliases             | `T` + `PascalCase`        | `TCommentStyle`                              |
| Enums                    | `PascalCase` name         | `CommentStyle`, `FileType`                   |
| Enum members             | Domain-cased (see below)  | `block = 'block'` or `Computer = 'Computer'` |
| Classes                  | `PascalCase`              | `HeaderRenderer`                             |
| Environment variables    | `SCREAMING_SNAKE_CASE`    | `STRAVA_CLIENT_ID`                           |
| Composables              | `use` + `PascalCase` body | `useCardTilt` (in `use-card-tilt/`)          |
| Test files               | `<file>.test.ts`, in band | `utils.test.ts` (beside `utils.ts`)          |

**Framework exceptions** override this table where a contract demands exact names (i.e. Nuxt Content prose
components like `ProseH2.vue` must be `PascalCase` filenames; Vue's `interface Props`; module augmentations).

## Type Prefixes

- **Interfaces are `I`-prefixed**, **type aliases are `T`-prefixed**; the prefix telegraphs what kind of symbol
  you're holding at every use site.
- **Exemptions** (deliberate): Vue component `interface Props` (the Vue idiom), and interfaces augmenting an external
  module's declaration, whose names must match the library's to merge.
- Enum **names** are plain `PascalCase` (no `E` prefix); enum **members** follow the domain: lowercase when they
  mirror lowercase wire values (`block = 'block'`), `PascalCase` when they are code-facing labels
  (`Computer = 'Computer'`). Member and value should mirror each other; see
  [typescript.md](typescript.md#enums-and-derived-unions).

## Functions Are Verb-First

Every function name starts with a verb that accurately classifies its behavior. The working vocabulary:

| Verb                    | Meaning                                                            | Example                  |
|-------------------------|--------------------------------------------------------------------|--------------------------|
| `get`                   | Synchronous accessor/lookup                                        | `getActivity`            |
| `fetch`                 | Asynchronous/remote retrieval                                      | `fetchUserProfile`       |
| `load`                  | Read + parse from disk/storage                                     | `loadHeaderConfig`       |
| `read` / `write`        | Raw I/O                                                            | `readLatestMetrics`      |
| `build` / `create`      | Construct and return a value                                       | `buildHeaderContent`     |
| `render`                | Produce output text/markup from inputs                             | `renderHeader`           |
| `detect`                | Infer a value from evidence                                        | `detectFileType`         |
| `resolve`               | Look up with fallback semantics                                    | `resolveNumPath`         |
| `normalize`             | Coerce to a canonical form                                         | `normalizeStringLength`  |
| `validate`              | Check untrusted input; returns a [result union](error-handling.md) | `validateMetricsPayload` |
| `apply`                 | Transform by imposing something onto the input                     | `applyCommentStyle`      |
| `remove` / `strip`      | Delete a part and return the remainder                             | `removeExistingHeader`   |
| `run`                   | Execute a command/process                                          | `runGenerateCommand`     |
| `exit`                  | Terminate the process                                              | `exitWithError`          |
| `is` / `has` / `should` | Boolean predicate                                                  | `isAdminEmail`           |

Boolean *variables* also take `is`/`has`/`should` prefixes (`isHashDotfile`, `hasChanged`).

## Constants

Beyond `SCREAMING_SNAKE_CASE`, constant names follow structural patterns:

| Pattern            | Shape                         | Example                        |
|--------------------|-------------------------------|--------------------------------|
| `MAX_` / `MIN_`    | Bounds                        | `MAX_INNER_CONTENT_LENGTH`     |
| `DEFAULT_`         | Fallback values               | `DEFAULT_BANNER_FONT`          |
| `<VALUE>_BY_<KEY>` | Lookup maps (`Record`)        | `FILE_TYPE_BY_EXTENSION`       |
| `<X>_PATTERN`      | Regular expressions           | `HASH_COMMENT_DOTFILE_PATTERN` |
| Plural nouns       | Sets/lists                    | `HASH_COMMENT_EXTENSIONS`      |
| `<X>_KEYS`         | Ordered key/label collections | `PROP_KEYS`                    |

## No Abbreviations

**Spell it out.** Ad-hoc abbreviations are banned; a name must be readable without decoding.

```typescript
// ❌ AVOID
const w = (s: string): number => [...s].length;
const HERE: string = dirname(fileURLToPath(import.meta.url));
function die(msg: string): never { /* ... */ }

// ✅ DO
function normalizeStringLength(str: string): number { /* ... */ }
const MODULE_DIRECTORY: string = dirname(fileURLToPath(import.meta.url));
function exitWithError(message: string): never { /* ... */ }
```

**Industry-standard abbreviations are exempt**: `config`, `spec`, `args`, `env`, `id`, `url`, `min`/`max`, `src`,
`dev`/`prod`, and similar terms that are more recognizable abbreviated than expanded.

## Import Bindings

The no-abbreviation rule applies to **import bindings** too: a default-import name says what the package *is*,
role-suffixed (`...Plugin`, `...Config`), and never echoes a terse package path segment.

```typescript
// ❌ AVOID: the binding is a package-path echo, not a name
import js from '@eslint/js';

// ✅ DO: descriptive, role-suffixed bindings
import eslintPluginJs from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
```

Named imports keep their exported names; when an exported name is itself too terse for the call site, alias it
descriptively (`import { importX as importXPlugin } from 'eslint-plugin-import-x';`).

## Miscellaneous

- **Event handlers** are `on`-prefixed: `onMouseMove`, `onMouseEnter` (see [vue-nuxt.md](vue-nuxt.md)).
- **Generic type parameters**: single letters (`T`, `K`, `V`) for simple generics; descriptive `T`-prefixed names
  (`TItem`, `TResult`) once a signature has multiple parameters.
- **Internal helpers stay unexported** and need no special prefix; visibility is expressed by the export boundary
  plus the `@internal` JSDoc tag, not by underscores.

## Enforcement

| Rule             | Tooling                                                                                  |
|------------------|------------------------------------------------------------------------------------------|
| I/T prefixes     | `@typescript-eslint/naming-convention` with prefix selectors + scoped exemptions (below) |
| kebab-case files | Convention + review (candidate: `unicorn/filename-case` with framework overrides)        |
| Unused vars      | `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'`                       |

The I/T prefixes **are auto-enforced**; the known exemptions pass through explicitly rather than disabling the rule:

```javascript
// Enforce I/T prefixes; the Vue `Props` idiom is exempted via filter
{
  name: 'style-guide/type-naming',
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
        filter: { regex: '^Props$', match: false },
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
        prefix: ['T'],
      },
    ],
  },
},

// Module-augmentation declaration files must match external library names; drop the rule there
{
  name: 'style-guide/type-naming-augmentation-exemption',
  files: ['**/*.d.ts'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
  },
},
```

Rare in-file augmentations (a `declare module` block inside a `.ts` file) take a scoped
`eslint-disable-next-line @typescript-eslint/naming-convention` with a comment naming the library being merged.
