# Jens Johnson • Developer Style Guide • Shell & Environment

The development environment is provisioned, not assumed. The doctrine:

> Entering a repo activates its pinned toolchain automatically, guard rails re-validate before every consequential
> command, and shell entry stays instant (no network calls, no prompts)

Related:
- [project-structure.md](project-structure.md) (where these files live)
- [cli-and-scripts.md](cli-and-scripts.md) (the thin-shim pattern these scripts follow)
- [tooling.md](tooling.md) (Corepack, lefthook, the `check` gate)
- [file-headers.md](file-headers.md) (headers on shell files)

## The Layers

| Layer             | File(s)                             | Owns                                                              |
|-------------------|--------------------------------------|--------------------------------------------------------------------|
| Node pin          | `.nvmrc`                             | The repo's Node major version                                      |
| pnpm pin          | `package.json` (`packageManager`)    | The exact pnpm version, activated by Corepack                      |
| direnv entrypoint | `.envrc`                             | On-entry activation: nvm switch, parent env, init, wrapper PATH    |
| Init script       | `scripts/shell/init.sh`              | Banner, Node validation, dependency freshness, status readout      |
| Logic scripts     | `scripts/shell/*.sh`                 | The real behavior behind the entrypoint and the wrappers           |
| Command wrappers  | `bin/wrappers/*`                     | Re-validation before `pnpm`/`git` runs; `npm`/`npx` rejection      |

Each layer catches what the previous one missed: direnv provisions the shell on entry, and the wrappers re-check at
the moment a command actually runs (a shell without direnv, a version switched mid-session).

## Node Version Pinning

- **`.nvmrc` pins the Node major** (`24`); `engines.node` in `package.json` states the floor, and CI's `setup-node`
  uses the same major. One number, three enforcement points.
- **Prefix-match semantics**: a bare major (or `major.minor`) pin accepts any current version beneath it, so
  validation needs **no nvm and no network**; `v24.14.1` satisfies a pin of `24` by string prefix alone.
- nvm performs the *switching* (via direnv on entry); validation never depends on it.
- **Staleness is watched in CI, not the shell**: the scheduled `node-lts-watch` workflow compares the pin against the
  newest Node LTS weekly (`scripts/shell/check-node-lts.sh`) and opens a labeled bump issue when a newer LTS major
  ships, closing it automatically once the pin catches up. The shell entrypoint never pays for that network call.

## The direnv Entrypoint

`.envrc` is the activation point; `direnv allow` once after cloning turns it on. The canonical shape:

```bash
# Switch to the pinned Node version (repo-root .nvmrc) via nvm; a missing nvm or version warns rather than blocking
# shell entry, and the command wrappers below hard-enforce it before anything consequential runs
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
  if ! nvm use --silent; then
    log_error "nvm could not activate the pinned Node version; run: nvm install $(cat .nvmrc)"
  fi
else
  log_error "nvm not found; install it (https://github.com/nvm-sh/nvm) to auto-switch Node versions"
fi

# Inherit any parent .envrc (machine-level exports) before repo-specific setup
source_up_if_exists

# Run the shell init: banner, Node validation, dependency freshness, and a status readout
bash "$(dirname "$(expand_path .envrc)")/scripts/shell/init.sh"

# Put the command wrappers first on PATH so pnpm/git invocations re-validate the environment (and npm/npx are rejected)
PATH_add bin/wrappers
```

The rules it encodes:

- **Shell entry warns, wrappers block.** A broken environment must never lock you out of the shell itself;
  `log_error` narrates the problem, and the hard failure waits until a command that actually needs Node runs.
- **`source_up_if_exists` before repo setup**, so machine-level exports are in place first.
- **No network on shell entry.** Anything remote (an "is there a newer LTS?" check, a registry ping) makes every
  `cd` pay for it; freshness checks belong in CI or on demand, never in the entrypoint.
- **Idempotent and fast**: re-entering an already-provisioned repo does nothing but print status.

## The Init Script

`scripts/shell/init.sh` is the human-facing half: it prints the project banner, validates the Node version (capturing
the resolved version for the status readout), delegates to `update-dependencies.sh`, and closes with a status block
(Node version, project version, git branch).

- **`PROJECT_LABEL` is the only line to edit** when copying the script into another repo; everything else derives
  from `package.json` and git at runtime.
- Dependency freshness piggybacks on the package manager's own marker: pnpm rewrites `node_modules/.modules.yaml` on
  every install, so `pnpm install` runs only when that marker is missing or older than `pnpm-lock.yaml`.

## Command Wrappers

`bin/wrappers/` holds executables named after the commands they wrap (`pnpm`, `git`, `npm`, `npx`), PATH-prepended by
direnv. Each is a one-line shim over the shared core, per the [thin-shim doctrine](cli-and-scripts.md):

```bash
#!/usr/bin/env bash
exec "$(cd "$(dirname "$0")/../.." && pwd)/scripts/shell/run-wrapped-command.sh" pnpm "$@"
```

`scripts/shell/run-wrapped-command.sh` owns the behavior:

- **`npm`/`npx` are rejected outright** (exit 1 with guidance); a stray `npm install` in a pnpm repo litters it with
  a `package-lock.json` and an unpinned tree, so the guard rail turns the mistake into a message.
- **`pnpm` and `git` re-validate the Node version** before dispatch; `git` is wrapped because its hooks (lefthook,
  commitlint) run Node tooling.
- **Dispatch execs the first PATH match outside the wrapper directory.** Skipping by directory identity (rather than
  stripping a PATH entry) cannot recurse back into the shim regardless of what else prepended itself to PATH.
- Wrappers are transparent: same arguments, same streams, same exit code as the real command.

## Shell Script Conventions

The general-purpose rules ([naming](naming.md), [comments](comments.md), [file headers](file-headers.md)) apply to
shell like everything else; the shell-specific defaults:

- **`#!/usr/bin/env bash`** and **`set -euo pipefail`** open every script (after the header).
- **File names are kebab-case, verb-first** (`validate-node-version.sh`, `update-dependencies.sh`), mirroring the
  verb-first function vocabulary.
- **Script-level constants are `SCREAMING_SNAKE_CASE`** (`REPO_ROOT`, `NVMRC_PATH`); loop/local throwaways are
  lowercase (`candidate`).
- **Resolve `REPO_ROOT` relative to the script**, never the working directory:
  `REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"`.
- **Section dividers** use the hash form padded to 120 characters, three blank lines before, one after (the
  [comments.md](comments.md#section-dividers) geometry in `#` syntax):
  `# ─── Setup ─────────...─────`
- **stdout is payload, stderr is narration**, exactly as in [cli-and-scripts.md](cli-and-scripts.md#output-streams):
  `validate-node-version.sh` prints the resolved version on stdout and its color-coded diagnostics on stderr, so
  `$(...)` capture stays clean.
- **Logic lives in `scripts/shell/`; `bin/` holds shims.** A wrapper or entry point is shebang + one `exec`; anything
  with behavior is a script other tooling can call directly.

## Adoption

`.nvmrc`, `.envrc`, `scripts/shell/`, and `bin/wrappers/` cannot ship through an npm package (direnv and PATH shims
must live at the consumer's repo root), so like `.editorconfig` and `lefthook.yml` they are **copied canon**: take
this repo's files verbatim, then change `PROJECT_LABEL` (and the banner art, if desired). New repos start with all
four layers; existing repos converge when their environment tooling is next touched.

## Enforcement

| Rule                  | Tooling                                                                          |
|-----------------------|-----------------------------------------------------------------------------------|
| Node pin honored      | `.envrc` on entry + wrappers at command time; CI pins the same major in `ci.yml` |
| pnpm-only             | Corepack pin + the `npm`/`npx` wrapper rejection                                 |
| Script quality        | Convention + review (candidate: `shellcheck` folded into the lint aggregate)     |
| Headers on shell files | The [file-header generator](file-headers.md#tooling) (`hash` comment style)      |
