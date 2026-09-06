# Jens Johnson • Developer Docs • Repository Overview

How this repository is managed and maintained. This is the operator's manual; the _conventions_ the repo implements
live in the [style guide](../style-guide/README.md).

Agents enter through root [AGENTS.md](../../AGENTS.md); [CLAUDE.md](../../CLAUDE.md) points to the same instructions.
The [agent workflow](../style-guide/agent-workflow.md) defines required reading and review beyond the automated gate.

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
direnv allow         # one-time: activates the shell environment (nvm switch, auto-install, wrappers)
corepack enable      # activates the pinned pnpm (see the packageManager field)
pnpm install         # installs deps AND git hooks (lefthook, via the prepare script)
```

Node `24` (pinned in `.nvmrc`) and `pnpm 10.10.0` (Corepack-pinned) are the only prerequisites; TypeScript runs
through `tsx`, so there is no build step. With [direnv](https://direnv.net/) installed, entering the repo handles
Node switching and dependency freshness automatically, and puts command wrappers on PATH that re-validate the Node
version before `pnpm`/`git` runs (and reject `npm`/`npx`); see
[shell-and-environment.md](../style-guide/conventions/shell-and-environment.md).

## Repository Map

```text
.
├── bin/                                  # Executable shims (shebang + dispatch only)
│   ├── file-header-generator.ts
│   └── wrappers/                         #   PATH-prepended command wrappers (pnpm/git validate; npm/npx reject)
├── src/                                  # What the package ships; kind-first layout
│   ├── configs/                          #   Shareable tool configs (prettier/eslint/stylelint/commitlint/tsconfig)
│   └── utils/developer-tooling/          #   Utility barrel modules, grouped by domain
│       └── file-header-generator/        #     cli / index / enums / types / constants / utils (+ utils.test.ts)
├── scripts/
│   └── shell/                            # Shell environment: init, Node validation, deps freshness, wrapper core
├── test/                                 # E2E tests only (unit tests live beside their subject files)
├── docs/
│   ├── developer/                        # This manual
│   └── style-guide/                      # The conventions hub + spokes
├── file-header.config.json               # The ASCII banner source of truth (validated by file-header.schema.json)
├── file-header.schema.json               # JSON Schema for the header config
├── eslint.config.js                      # Root configs: thin re-exports of src/configs (dogfooding)
├── commitlint.config.js
├── vitest.config.ts                      # Test runner config (in-band *.test.ts)
├── lefthook.yml                          # Git hooks (commented per hook)
├── .nvmrc / .envrc                       # Node pin + direnv entrypoint
├── .editorconfig / .prettierignore
└── package.json                          # @jens-johnson/style-guide: exports map, bin, scripts
```

## Package Scripts

| Script               | What it does                                                                           |
| -------------------- | -------------------------------------------------------------------------------------- |
| `pnpm lint`          | ESLint + Prettier check across the repo                                                |
| `pnpm lint:fix`      | Autofix both (ESLint `--fix`, then Prettier `--write`)                                 |
| `pnpm typecheck`     | `tsc --noEmit` against the strict base tsconfig                                        |
| `pnpm test`          | Vitest, single run (`pnpm test:watch` for watch mode)                                  |
| `pnpm check`         | The automated local gate: lint → typecheck → test; also complete the convention review |
| `pnpm header`        | Generate a file header (`--file`, `--description`, `--spec`, `--write`)                |
| `pnpm header:banner` | Render/save a figlet project banner                                                    |
| `pnpm prepare`       | (Automatic on install) installs the lefthook git hooks                                 |

## Git Hooks

Hooks are managed by [lefthook](../../lefthook.yml) and install automatically on `pnpm install`:

| Hook         | Behavior                                                                       |
| ------------ | ------------------------------------------------------------------------------ |
| `pre-commit` | Prettier + ESLint `--fix` on staged files; fixes are re-staged (`stage_fixed`) |
| `commit-msg` | commitlint validates the message (Conventional Commits + the repo scope enum)  |
| `pre-push`   | `pnpm check` (lint + typecheck + test); a red gate blocks the push             |

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
[`.prettierignore`](../../.prettierignore); do not run Prettier over it. When a rule changes, update its examples and
existing enforcement in the same commit. Document manual review for rules without automation, verify changed links,
and include consumer adoption steps when a new package pin or regeneration is required.

## Consumption

Everything ships from the single `@jens-johnson/style-guide` package:

| Export                                                                    | Use                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------- |
| `@jens-johnson/style-guide/prettier`                                      | `"prettier"` field in a consumer's `package.json` |
| `@jens-johnson/style-guide/eslint`                                        | `createEslintConfig(...overrides)`                |
| `@jens-johnson/style-guide/stylelint`                                     | `extends` in a stylelint config                   |
| `@jens-johnson/style-guide/commitlint`                                    | `createCommitlintConfig({ scopes })`              |
| `@jens-johnson/style-guide/tsconfig`                                      | `"extends"` in a consumer's `tsconfig.json`       |
| `@jens-johnson/style-guide/types/vue`                                     | Shared Vue utility types (`TPropsWithDefaults`)   |
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
| Node LTS watch | Weekly cron compares `.nvmrc` to the newest Node LTS; opens a `node-lts` bump issue when stale, closes it when current       |
| Branch ruleset | `main` blocks force-pushes/deletions and requires the `check` status on PRs; the repo admin holds a bypass for direct pushes |

The release flow: conventional commits land on `main`, Release Please accumulates them into a Release PR, and
merging that PR creates the tag consumers pin (see [Consumption](#consumption)). Merge Release PRs normally (this
repo has no squash-duplication hazard; single-branch flow).

## Verification

`pnpm check` runs the automated package gate. Also complete the applicable
[convention review](../style-guide/agent-workflow.md#verify-enforcement); folder architecture, header contracts,
and documentation accuracy are not established by a green command. Record the commit and working-tree state tested;
CI must verify its own environment. The in-band unit tests (`*.test.ts` beside their subjects) cover the generator's
pure cores and its write-mode header replacement; when touching the generator,
also smoke the CLI (`pnpm header --help`, a `--write` round-trip on a scratch file) to exercise the argv-to-command
edge the tests skip. When touching the shell environment, run `bash scripts/shell/init.sh` and a wrapped command
(`PATH="$PWD/bin/wrappers:$PATH" pnpm --version`) as the equivalent smoke.
