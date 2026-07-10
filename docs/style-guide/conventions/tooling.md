# Jens Johnson • Developer Style Guide • Tooling

Tooling is the style guide's executable form. The doctrine:

> Prettier owns formatting, ESLint owns quality, this guide owns intent; every rule that can be mechanized is, and
> the configs are copied forward as a canonical baseline.

Related:
- [formatting.md](formatting.md) (what Prettier encodes)
- [project-structure.md](project-structure.md) (where configs live, the `check` gate)
- [git-workflow.md](git-workflow.md) (hooks, CI)

## The Stack

| Tool           | Owns                                          | Config                     |
|----------------|------------------------------------------------|-----------------------------|
| EditorConfig   | Editor-level defaults                          | `.editorconfig`             |
| Prettier       | All formatting                                 | `.prettierrc.json`          |
| ESLint (flat)  | Code quality, layout hardening, naming         | `eslint.config.js`          |
| Stylelint      | CSS + `<style>` block quality                  | `stylelint.config.mjs`      |
| commitlint     | Commit message convention                      | `commitlint.config.js`      |
| lefthook       | Git hooks (staged lint, commit-msg, pre-push)  | `lefthook.yml`              |
| tsc / vue-tsc  | Typechecking (`pnpm typecheck`)                | `tsconfig.json`             |
| Vitest         | Tests (`pnpm test`)                            | `vitest.config.ts` (as needed) |
| direnv + nvm   | Shell activation, Node pinning, wrappers       | `.envrc` / `.nvmrc` (see [shell-and-environment.md](shell-and-environment.md)) |

Every config file opens with the standard [file header](file-headers.md). Canonical Prettier + EditorConfig blocks
live in [formatting.md](formatting.md#enforcement); the TypeScript baseline lives in
[typescript.md](typescript.md#strictness).

## ESLint

**Flat config, composed of named blocks** (`name: '<repo>/<concern>'`) so `--print-config` debugging stays legible.
The block order matters: framework base first, plugins, custom rules, then `eslint-config-prettier` **last**, then
any `@stylistic` layout rules deliberately re-enabled after it.

```javascript
export default withNuxt(          // or a plain array outside Nuxt
  { name: 'repo/ignores', ignores: ['.nuxt/**', 'dist/**', 'coverage/**'] },

  /* ─── Quality plugins ───────────────────────────────────────────────────────────────────────────────────────── */
  // sonarjs: complexity ceiling + duplication detection
  {
    name: 'repo/sonarjs',
    plugins: { sonarjs: sonarjsPlugin },
    rules: {
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
    },
  },

  // Import hygiene: deterministic order + no duplicates
  {
    name: 'repo/imports',
    plugins: { 'import-x': importXPlugin, 'simple-import-sort': simpleImportSortPlugin },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-self-import': 'error',
    },
  },

  // Type naming: I/T prefixes with the documented exemptions (full block in naming.md)
  { name: 'repo/type-naming', rules: { '@typescript-eslint/naming-convention': [/* see naming.md */] } },

  // JSDoc presence + shape (see comments.md)
  {
    name: 'repo/jsdoc',
    plugins: { jsdoc: jsdocPlugin },
    rules: {
      'jsdoc/require-jsdoc': 'warn',
      'jsdoc/require-description': 'warn',
    },
  },

  // JSDoc type braces are banned in TS (the signature owns types) but REQUIRED in plain JS (see comments.md)
  {
    name: 'repo/jsdoc-no-types-ts-only',
    files: ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx', '**/*.vue'],
    plugins: { jsdoc: jsdocPlugin },
    rules: { 'jsdoc/no-types': 'error' },
  },

  /* ─── General rules ─────────────────────────────────────────────────────────────────────────────────────────── */
  {
    name: 'repo/general',
    rules: {
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Neutralize anything that fights Prettier; MUST come before the layout block
  prettierConfig,

  /* ─── Layout hardening (deliberately after prettierConfig; objects-only, see formatting.md) ─────────────────── */
  {
    name: 'repo/layout',
    plugins: { '@stylistic': stylisticPlugin },
    rules: {
      '@stylistic/object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            multiline: true,
            consistent: true,
            minProperties: 3,
          },
        },
      ],
      '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    },
  },
);
```

- **`eslint-config-prettier` loads before the layout block and after everything else**: it neutralizes stylistic
  conflicts, then the layout block re-enables the three member-count rules the guide hardens.
- Root config files outside a framework's tsconfig project get a `project: false` parser override so they still
  lint in editors.

## Stylelint

```javascript
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  rules: {
    // Tailwind directives are not unknown at-rules
    'at-rule-no-unknown': [true, { ignoreAtRules: ['theme', 'apply', 'layer', 'utility', 'custom-variant', 'reference'] }],
  },
  ignoreFiles: ['.nuxt/**', '.output/**', 'node_modules/**', 'dist/**', 'coverage/**'],
};
```

Scope: `main.css` + `<style>` blocks in `.vue` files ([css-and-styling.md](css-and-styling.md#enforcement)).

## commitlint + lefthook

- **commitlint** extends `@commitlint/config-conventional` with a repo-specific **scope enum**, kebab-case scopes,
  and **lowercase subjects** ([git-workflow.md](git-workflow.md#commits)).
- **lefthook** installs via the `prepare` script and runs:

| Hook         | Runs                                   |
|--------------|------------------------------------------|
| `pre-commit` | lint-staged (Prettier + ESLint on staged) |
| `commit-msg` | commitlint                                |
| `pre-push`   | `pnpm lint && pnpm typecheck`             |

Escape hatches: `LEFTHOOK_EXCLUDE=<hook>` for one hook, `LEFTHOOK=0` for all; both are for emergencies, not habits.

## The `check` Gate

Every repo exposes **`pnpm check`** (lint → typecheck → test → build when present, sequential) as the local CI mirror
([project-structure.md](project-structure.md#script-naming)); CI runs the same steps, so green `check` means a green
pipeline.

## Consuming the Shared Configs

Every baseline in this document ships as an export of the
[`@jens-johnson/style-guide`](https://github.com/jens-johnson/jens-johnson) package, so a consumer repo's configs
reduce to one-line re-exports (install via npm once published, or
`pnpm add -D github:jens-johnson/jens-johnson` today):

| Tool       | Consumption                                                                        |
|------------|--------------------------------------------------------------------------------------|
| Prettier   | `"prettier": "@jens-johnson/style-guide/prettier"` in `package.json`                  |
| ESLint     | `createEslintConfig(...overrides)` from `@jens-johnson/style-guide/eslint`            |
| Stylelint  | `extends: ['@jens-johnson/style-guide/stylelint']`                                    |
| commitlint | `createCommitlintConfig({ scopes })` from `@jens-johnson/style-guide/commitlint`      |
| tsconfig   | `"extends": "@jens-johnson/style-guide/tsconfig"`                                     |

```javascript
// eslint.config.js in a consumer repo
import { createEslintConfig } from '@jens-johnson/style-guide/eslint';

export default createEslintConfig({
  name: 'my-repo/ignores',
  ignores: ['generated/**'],
});
```

The ESLint/stylelint/commitlint plugins ship as the package's `dependencies`, so consumers install one thing plus
the peer runners (`eslint`, `prettier`, `typescript`). Some templates cannot be consumed via npm and are copied
instead: `.editorconfig`, `lefthook.yml`, and the shell environment files (`.nvmrc`, `.envrc`, `scripts/shell/`,
`bin/wrappers/`; see [shell-and-environment.md](shell-and-environment.md#adoption)); this repo's copies are the
canon. The [file-header generator](file-headers.md#tooling) rides along as the `file-header-generator` bin.

## Adoption

New repos start from these baselines verbatim (or by consuming the shared package). Existing repos converge
opportunistically: when a lint config is touched for any reason, it gets pulled up to this document's standard in
the same change.
