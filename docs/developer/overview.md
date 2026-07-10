# Jens Johnson • Developer Docs • Repository Overview

How this repository is managed and maintained. This is the operator's manual; the _conventions_ the repo implements
live in the [style guide](../style-guide/README.md).

## What This Repository Is

`jens-johnson/jens-johnson` is a personal monorepo serving four roles:

1. **The GitHub profile `README`** (root [`README.md`](../../README.md); hand-crafted, tooling-exempt).
2. **The developer style guide** ([`docs/style-guide/`](../style-guide)): the hub-and-spoke conventions docs.
3. **The `@jens-johnson/style-guide` package**: shareable tooling configs + developer utilities, consumed by other
   repos (see [Consumption](#consumption)).
4. **The reference implementation of its own guide**: every root config re-exports the shared configs, so the repo
   enforces the conventions on itself.

## Getting Started

```bash
corepack enable      # activates the pinned pnpm (see the packageManager field)
pnpm install         # installs deps AND git hooks (lefthook, via the prepare script)
```

Node `>= 20` and `pnpm 10.10.0` (Corepack-pinned) are the only prerequisites; TypeScript runs through `tsx`, so
there is no build step.

## Repository Map

```text
.
├── bin/                                  # Executable shims (shebang + import only)
│   └── file-header-generator.ts
├── src/                                  # What the package ships; kind-first layout
│   ├── configs/                          #   Shareable tool configs (prettier/eslint/stylelint/commitlint/tsconfig)
│   └── utils/developer-tooling/          #   Utility barrel modules, grouped by domain
│       └── file-header-generator/        #     cli / index / enums / types / constants / utils
├── docs/
│   ├── developer/                        # This manual
│   └── style-guide/                      # The conventions hub + spokes
├── file-header.config.json               # The ASCII banner source of truth (validated by file-header.schema.json)
├── file-header.schema.json               # JSON Schema for the header config
├── eslint.config.js                      # Root configs: thin re-exports of src/configs (dogfooding)
├── commitlint.config.js
├── lefthook.yml                          # Git hooks (commented per hook)
├── .editorconfig / .prettierignore
└── package.json                          # @jens-johnson/style-guide: exports map, bin, scripts
```

## Package Scripts

| Script               | What it does                                                            |
| -------------------- | ----------------------------------------------------------------------- |
| `pnpm lint`          | ESLint + Prettier check across the repo                                 |
| `pnpm lint:fix`      | Autofix both (ESLint `--fix`, then Prettier `--write`)                  |
| `pnpm typecheck`     | `tsc --noEmit` against the strict base tsconfig                         |
| `pnpm check`         | The full local CI gate: lint, then typecheck; green = pushable          |
| `pnpm header`        | Generate a file header (`--file`, `--description`, `--spec`, `--write`) |
| `pnpm header:banner` | Render/save a figlet project banner                                     |
| `pnpm prepare`       | (Automatic on install) installs the lefthook git hooks                  |

## Git Hooks

Hooks are managed by [lefthook](../../lefthook.yml) and install automatically on `pnpm install`:

| Hook         | Behavior                                                                       |
| ------------ | ------------------------------------------------------------------------------ |
| `pre-commit` | Prettier + ESLint `--fix` on staged files; fixes are re-staged (`stage_fixed`) |
| `commit-msg` | commitlint validates the message (Conventional Commits + the repo scope enum)  |
| `pre-push`   | `pnpm lint && pnpm typecheck`; a red gate blocks the push                      |

Escape hatches (emergencies only): `LEFTHOOK_EXCLUDE=<hook> git commit` skips one hook; `LEFTHOOK=0 git commit`
skips all of them.

Commit scopes for this repo (from [`commitlint.config.js`](../../commitlint.config.js)): `style-guide`,
`file-header`, `configs`, `docs`, `deps`, `ci`, `repo`.

## The File-Header Generator

The repo's flagship utility (spec: [file-headers.md](../style-guide/conventions/file-headers.md)):

- **Run it**: `pnpm header ...` locally, or `file-header-generator` as an installed bin in consumer repos.
- **Regenerate a header after moving/renaming a file**: `pnpm header -f <new-path> -d "<description>" --write`;
  the filename bar re-centers automatically. Rich headers (usage, arguments, see) use `--spec <json>`.
- **Change the banner**: `pnpm header:banner -p "<text>" --font "<figlet font>" --save` writes into
  [`file-header.config.json`](../../file-header.config.json); hand-made art can be pasted into the config's
  `banner` array directly. The config is validated by [`file-header.schema.json`](../../file-header.schema.json).
- **Programmatic use**: import from `@jens-johnson/style-guide/utils/developer-tooling/file-header-generator`
  (side-effect-free barrel; call the exported `runCli` deliberately, or use `renderHeader`/`writeHeaderToFile`).

## Making Changes

### Adding a new utility module

1. Create `src/utils/<domain>/<module>/` as a barrel directory (`index` / `types` / `enums` / `constants` /
   `utils`; a side-effectful `cli.ts` stays out of the barrel).
2. Generate headers for every file (`pnpm header ... --write`).
3. Add an exports-map entry mirroring the path: `"./utils/<domain>/<module>": "./src/utils/<domain>/<module>/index.ts"`.
4. If it has a CLI: add a `bin/<module>.ts` shim (shebang + header + side-effect import of `cli.ts`) and a `bin`
   entry named after the module.
5. `pnpm check` before pushing; new pure cores land with tests.

### Adding or changing a shared config

1. Edit the config under `src/configs/<tool>/`.
2. The root config re-exports it, so this repo picks the change up immediately; run `pnpm check` to see the effect.
3. Update the matching style-guide spoke ([tooling.md](../style-guide/conventions/tooling.md) and the relevant
   convention doc) **in the same change**; a config/guide mismatch is a bug.

### Changing the style guide

Follow [docs-and-prose.md](../style-guide/conventions/docs-and-prose.md) (doc anatomy, no em dashes, `i.e.` never
`e.g.`). The guide's markdown is hand-typeset and deliberately listed in
[`.prettierignore`](../../.prettierignore); do not run Prettier over it. When a rule changes, its enforcement
(config) changes in the same commit.

## Consumption

Everything ships from the single `@jens-johnson/style-guide` package:

| Export                                                                    | Use                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------- |
| `@jens-johnson/style-guide/prettier`                                      | `"prettier"` field in a consumer's `package.json` |
| `@jens-johnson/style-guide/eslint`                                        | `createEslintConfig(...overrides)`                |
| `@jens-johnson/style-guide/stylelint`                                     | `extends` in a stylelint config                   |
| `@jens-johnson/style-guide/commitlint`                                    | `createCommitlintConfig({ scopes })`              |
| `@jens-johnson/style-guide/tsconfig`                                      | `"extends"` in a consumer's `tsconfig.json`       |
| `@jens-johnson/style-guide/utils/developer-tooling/file-header-generator` | Programmatic header generation                    |
| `file-header-generator` (bin)                                             | The CLI, on any consumer's PATH after install     |

Install pinned to a release tag: `pnpm add -D github:jens-johnson/jens-johnson#v0.1.0` (or a range via
`#semver:^0.1.0`); Release Please cuts the `vX.Y.Z` tags. No registry or auth is involved anywhere (the repo is
public); publishing to npm remains a future flip of the `private` field. `.editorconfig` and `lefthook.yml` cannot be
consumed via npm; copy this repo's root files as the canonical templates.

## GitHub & Releases

| Mechanism      | Behavior                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| CI (`ci.yml`)  | Mirrors `pnpm check` on pushes/PRs to `main`; validates PR commit messages via commitlint                                    |
| Release Please | Maintains a Release PR from conventional commits; merging tags `vX.Y.Z` + GitHub Release                                     |
| CodeQL         | JS/TS security scanning on pushes, PRs, and a weekly cron                                                                    |
| Dependabot     | Weekly npm updates (minor/patch grouped) + GitHub Actions bumps                                                              |
| Branch ruleset | `main` blocks force-pushes/deletions and requires the `check` status on PRs; the repo admin holds a bypass for direct pushes |

The release flow: conventional commits land on `main`, Release Please accumulates them into a Release PR, and
merging that PR creates the tag consumers pin (see [Consumption](#consumption)). Merge Release PRs normally (this
repo has no squash-duplication hazard; single-branch flow).

## Verification

`pnpm check` is the single gate: if it is green locally, the push hooks and CI will be green. When
touching the generator, also smoke the CLI (`pnpm header --help`, a `--write` round-trip on a scratch file) since
pure-core tests do not cover the I/O edge.
