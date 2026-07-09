# Jens Johnson • Developer Style Guide • Modules & Imports

Modules are the unit of architecture. The doctrine:

> Barrel directories split by concern, a deliberate export surface, and deterministic import order.

Related:
- [project-structure.md](project-structure.md) (where modules live)
- [naming.md](naming.md) (kebab-case)
- [cli-and-scripts.md](cli-and-scripts.md) (entry-point shims)
- [vue-nuxt.md](vue-nuxt.md) (auto-import nuances)

## The Barrel-Directory Pattern

**Every non-trivial module is a kebab-case directory** whose `index.ts` re-exports the public surface, with the
implementation split into files by concern:

```text
file-header-generator/
├── index.ts        # Barrel: `export *` re-exports only; zero logic
├── enums.ts        # Enumerations (canonical value sets)
├── types.ts        # Interfaces + type aliases
├── constants.ts    # Shared constants, lookup maps, patterns
└── utils.ts        # Implementation (pure helpers + edge I/O)
```

Additional concern files appear as needed: `composable.ts` (Vue composables), `client.ts`, `validators.ts`. Apply
the pattern **uniformly, down to trivial single-function modules**; consistency beats economizing on files.

### File roles

| File           | Contains                                                | May import from    |
|----------------|---------------------------------------------------------|--------------------|
| `index.ts`     | `export * from './x';` lines only                       | Sibling files      |
| `enums.ts`     | Enums + their member comments                           | Nothing internal   |
| `types.ts`     | Interfaces, type aliases (incl. `` `${Enum}` `` unions) | `enums`            |
| `constants.ts` | Constants, `Record` lookups, regex patterns, help text  | `enums`, `types`   |
| `utils.ts`     | Functions (pure core + I/O edges)                       | All siblings       |

```typescript
// ✅ DO: index.ts is a pure barrel
export * from './constants';
export * from './enums';
export * from './types';
export * from './utils';
```

## Export Surface

- **Named exports only**; `export default` is permitted solely where a framework contract requires it
  (`nuxt.config.ts`, `eslint.config.js`, `commitlint.config.js`, Vue SFCs implicitly).
- **Internal helpers stay unexported.** The export boundary *is* the API contract; a symbol is exported because
  callers are meant to use it, and it carries `@public`/`@internal` JSDoc accordingly.
- In Nuxt auto-import trees this is load-bearing: every exported symbol becomes a global; unexported helpers keep
  the global namespace clean (see [vue-nuxt.md](vue-nuxt.md)).
- **Barrels use `export *`**: TypeScript resolves it for explicit imports, and Nuxt's unimport ignores `export *`,
  so each symbol registers exactly once from its defining file.

## Import Order

Imports are sorted into groups, blank-line separated, alphabetized within each group (enforced by
`simple-import-sort`):

1. Node builtins (`node:fs`, `node:path`, `node:util`)
2. External packages (`figlet`, `exifr`)
3. Internal aliases (`~/types/services`, `#shared/vertifix`)
4. Relative imports (`./constants`, `./types`)

**Type-only imports use dedicated `import type` statements** placed with their group (see
[typescript.md](typescript.md#type-only-imports)). **Import bindings are descriptive, role-suffixed names**
(`eslintPluginJs`, not `js`; see [naming.md](naming.md#import-bindings)).

```typescript
// ✅ DO
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import figlet from 'figlet';

import { CommentStyle, FileType } from './enums';
import type { IField, IHeaderConfig, IHeaderSpec } from './types';
```

## Paths & Aliases

- **Prefer framework/workspace aliases over deep relative paths**: `~/composables/use-card-tilt`,
  `#shared/vertifix`; relative imports are for siblings within a module.
- Never reach into another module's internals: import from the barrel (`./file-header-generator/index`), not
  `./file-header-generator/utils`.

## When to Split

A flat file becomes a barrel directory as soon as it accumulates a second concern (types + logic, constants +
logic). Framework-routed files are the exception and **stay flat**: `server/api/**`, `server/routes/**`,
`server/plugins/**` (Nitro routing depends on filenames), and root config files.

## Enforcement

| Rule               | Tooling                                                                                  |
|--------------------|------------------------------------------------------------------------------------------|
| Import order       | `simple-import-sort/imports` + `simple-import-sort/exports` (error)                      |
| Duplicate imports  | `import-x/no-duplicates` (error)                                                         |
| Self-imports       | `import-x/no-self-import` (error)                                                        |
| Default-export ban | Convention + review (candidate: `import-x/no-default-export` with config-file overrides) |
