# Jens Johnson • Developer Style Guide • Project Structure

How a repository is shaped. The doctrine:

> One canonical skeleton per project class, agent context as a first-class citizen, and a `package.json` that reads
> like a table of contents

Related:
- [modules-and-imports.md](modules-and-imports.md) (module internals)
- [vue-nuxt.md](vue-nuxt.md) (the Nuxt shape)
- [tooling.md](tooling.md) (the config files)
- [cli-and-scripts.md](cli-and-scripts.md) (scripts/bin)
- [shell-and-environment.md](shell-and-environment.md) (direnv, `.nvmrc`, wrappers)

## Generic TS/Node Skeleton

The default shape for libraries, CLIs, publishers, and services (anything not owned by a framework):

```text
.
├── bin/                    # Executable entry shims, any runtime (shell, node/tsx, ...); shebang + dispatch only
│   └── wrappers/           #   PATH-prepended command wrappers (see shell-and-environment.md)
├── src/                    # Library/application code; kind-first, then domain-grouped
│   ├── configs/            #   Shareable tool configs (when the repo exports them)
│   └── utils/<domain>/     #   Barrel modules grouped by domain (i.e. developer-tooling/)
│       └── <module>/       #     index / types / enums / constants / utils / utils.test.ts (unit tests in band)
├── scripts/                # Operational tooling (generators, publishers, one-offs)
│   ├── shell/              #   The shell environment scripts (init, validation, wrapper core)
│   └── utils/              #   Shared script utilities, barrel modules when non-trivial
├── test/
│   └── e2e/                # End-to-end tests only; unit tests live beside their subject file
├── docs/
│   ├── architecture/       # System/design docs (CI, data flow, ...)
│   ├── style-guide/        # Or a pointer to the canonical guide
│   └── .archive/           # Retired planning docs; never delete history, archive it
├── AGENTS.md               # Shared agent instructions (see below)
├── CLAUDE.md               # Claude entry point; directs readers to AGENTS.md
├── .claude/                # Optional Claude-specific tools and context
├── README.md
├── package.json
├── tsconfig.json
├── .nvmrc / .envrc         # Node pin + direnv entrypoint (see shell-and-environment.md)
└── <tooling dotfiles>      # .editorconfig, .prettierrc.json, eslint config, ...
```

- **`src/` vs `scripts/`**: `src/` is what the repo *ships*; `scripts/` is what *operates* the repo. A pure
  tooling repo may be `scripts/`-only.
- **`bin/`** holds thin executable shims of **any runtime**; the shebang selects the interpreter
  (`#!/usr/bin/env bash`, `#!/usr/bin/env -S npx tsx`, ...). All logic lives in an importable module
  (see [cli-and-scripts.md](cli-and-scripts.md)).
- **`docs/.archive/`**: superseded planning docs move here rather than being deleted; the repo's history stays
  browsable.
- Nuxt projects follow the framework's layout (`app/`, `server/`, `shared/`, `content/`); specifics in
  [vue-nuxt.md](vue-nuxt.md).

## Agent Context

Every repo an agent touches carries its context explicitly:

- **`AGENTS.md`** at the root: the shared source for repo-specific conventions, workflows, and documented overrides.
  It wins over this guide (see [precedence](../README.md#precedence)). Link the human developer docs, canonical guide
  location/revision policy, [task reading matrix](../agent-workflow.md#read-by-task), verification commands, and
  review-only requirements. An entry point in this guide repository does not automatically load in a consumer repo.
- **`CLAUDE.md`** at the root directs Claude readers to `AGENTS.md`. Keep shared instructions in one place; reserve
  runtime-specific behavior for the relevant entry point. Follow links explicitly when a harness does not load them.
- **`.claude/`** holds optional Claude-specific commands, skills, settings, and context. Instructions needed by all
  agents must remain discoverable from `AGENTS.md`, regardless of which runtime is doing the work.
- **Migrate existing repos without losing context**: preserve current product decisions and local instructions when
  consolidating them into `AGENTS.md`, then replace duplicated shared rules in `CLAUDE.md` with the pointer.
- When a convention in a repo diverges from this guide, the divergence is *documented there deliberately*, never
  implicit.

Minimal Claude entry point:

```markdown
# Agent Instructions

Read and follow [AGENTS.md](AGENTS.md) before planning or editing.
```

## `package.json`

```jsonc
{
  "name": "<kebab-repo-name>",
  "type": "module",
  "private": true,                       // unless actually published
  "packageManager": "pnpm@<pinned>",     // Corepack-pinned, exact version
  "engines": { "node": ">=<major>" },
  "scripts": { /* see naming below */ },
  "bin": { /* CLI exposure when applicable */ }
}
```

- **pnpm via Corepack, always**: the `packageManager` field pins the exact version; first install is
  `corepack enable && pnpm install`. `pnpm-lock.yaml` is the only lockfile.
- **`type: "module"`**; ESM everywhere, `.cjs` only under duress.

### Script naming

Scripts are **colon-namespaced verbs**: a base verb runs the aggregate, `verb:tool` runs one tool.

| Script                        | Meaning                                                 |
|-------------------------------|---------------------------------------------------------|
| `dev` / `build` / `preview`   | The framework lifecycle                                 |
| `lint` / `lint:<tool>`        | Check only; aggregate runs tools in parallel            |
| `lint:fix` or `fix:<tool>`    | Autofix variants                                        |
| `typecheck`                   | `tsc --noEmit` / `vue-tsc`                              |
| `test`                        | Vitest                                                  |
| `check`                       | The full local CI gate: lint → typecheck → test → build (when present) |
| `<domain>` / `<domain>:<sub>` | Repo tooling (`header`, `header:banner`, `gen:favicon`) |

**Every repo has a `check` script** replicating CI locally. A green local run verifies those checks in that
environment; CI and the [manual convention review](../agent-workflow.md#verify-enforcement) still need their own evidence.

## Root Config Files

All tooling configuration lives at the root, one file per tool, each opening with the standard
[file header](file-headers.md). The canonical set and their contents are specified in [tooling.md](tooling.md).

## Enforcement

| Rule                  | Tooling                                                 |
|-----------------------|---------------------------------------------------------|
| pnpm-only             | Corepack pin + absence of other lockfiles               |
| Layout conventions    | Convention + review; this document is the reference     |
| `check` gate          | Mirrored in CI (see [git-workflow.md](git-workflow.md)) |
