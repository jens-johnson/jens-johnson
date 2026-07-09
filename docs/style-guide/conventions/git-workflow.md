# Jens Johnson • Developer Style Guide • Git Workflow

History is a product. The doctrine:

> Conventional commits against a scoped enum, environment-mapped permanent branches, automated promotion and
> release, and merge strategies chosen so the changelog writes itself correctly.

Related:
- [tooling.md](tooling.md) (commitlint, lefthook)
- [project-structure.md](project-structure.md) (the `check` gate CI mirrors)
- [docs-and-prose.md](docs-and-prose.md) (prose rules apply to commit bodies and PRs)

## Commits

**Conventional Commits, enforced by commitlint**: `type(scope): subject`.

- **Types**: `feat` `fix` `refactor` `style` `docs` `test` `chore` `ci` `perf`.
- **Scopes** come from a per-repo enum in `commitlint.config.js`; kebab-case.
- **Subjects are lowercase**, no PascalCase/camelCase words; rewrite symbols into plain English ("theme composable",
  not "useTheme").
- Bodies are prose ([no em dashes](docs-and-prose.md)); reference the work ticket (`Refs: JEN-94`) so trackers
  auto-link.
- One logical change per commit; a feature branch lands as a small number of well-shaped commits, not a diary.

```text
✅ refactor(server): restructure server/utils into barrel modules
✅ ci: stop release-please changelog duplication and clean past entries
❌ Fixed some stuff
❌ feat(Server): add useMetrics composable
```

## Branches

**Branch names are `type/descriptor` or `type/<ticket>-descriptor`**, kebab-case, matching the commit type of the
work: `feat/substrate-topology`, `refactor/jen-94-misc-updates`, `fix/jen-79-vertifix-barometer-elevation`.

Permanent branches map to environments where the project deploys:

| Branch    | Role                                       |
|-----------|----------------------------------------------|
| `main`    | Production; releases cut from here            |
| `staging` | Pre-production accumulation + UAT (when used) |
| `type/*`  | Short-lived work branches                     |

## Flow (Environment-Mapped Projects)

1. Branch `type/...` off the integration branch; open a PR into it (**`staging`** where it exists, else `main`).
2. Automation opens/updates a **promotion PR** (`staging` → `main`) whenever staging has real content changes,
   with a conventional-commit-grouped changelog body.
3. **Merge promotion and release PRs with a merge commit, never squash.** Squashing re-lists every constituent
   commit message in the squash body; Release Please re-parses them on each promotion and emits duplicate changelog
   entries. Merge commits land original SHAs, which dedupe naturally.
4. After a promotion merges, **sync back**: `git merge main` on `staging`.

Feature PRs into an integration branch may squash when the branch history is noise; the promotion path never does.

## Releases

**Release Please** owns versions and the changelog:

- On pushes to `main`, it maintains a standing Release PR (version bump + regenerated `CHANGELOG.md`); merging it
  tags and publishes the GitHub Release.
- `changelog-sections` maps commit types to emoji-titled headings; the scope enum keeps grouping clean.
- Tokens: automation uses a fine-grained PAT so auto-opened PRs still trigger required checks (GitHub suppresses
  downstream workflows for default-token actions).

## CI

- CI mirrors the local **`check` gate** (lint → typecheck → build) plus `vitest run`; a repo where `pnpm check`
  passes locally must go green in CI.
- Security scanning (CodeQL or equivalent) runs on pushes/PRs to `main` plus a weekly cron.
- Concurrency groups cancel superseded runs per ref.

## Hygiene

- **Commit or push only deliberately**; generated artifacts and secrets never land (`.env` is gitignored, no
  committed `.env.example` on public repos; env docs live in internal docs).
- Delete merged work branches; permanent branches stay pruned to the environment set.
- History is never rewritten on shared branches.

## Enforcement

| Rule                | Tooling                                             |
|---------------------|-------------------------------------------------------|
| Commit convention   | commitlint via lefthook `commit-msg`                  |
| Pre-push quality    | lefthook `pre-push`: `pnpm lint && pnpm typecheck`    |
| Changelog integrity | Release Please + merge-commit promotions              |
| Required checks     | Branch protection on `main` (+ `staging` where used)  |
