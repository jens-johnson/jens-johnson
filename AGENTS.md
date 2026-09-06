# Agent Instructions

This repository publishes the conventions and tooling used by other Jens Johnson projects. Read the
[repository overview](docs/developer/overview.md) and [style-guide hub](docs/style-guide/README.md) before editing.
Follow the [task reading matrix and review protocol](docs/style-guide/agent-workflow.md); the cheat sheet alone is
not sufficient for implementation.

## Scope And Sources

- Read applicable path-local instructions and the relevant convention documents before planning edits.
- Record the branch, base commit, working-tree changes, and guide revision used for an audit. Preserve other work.
- Keep conventions, examples, and existing enforcement consistent in the same change. State which requirements
  remain review-only; a passing lint command is not proof that those requirements were checked.
- Use this checkout's source as the implementation reference. For consumers, also inspect their locked and installed
  package revisions and effective configuration; editing this repository does not update an installed release.
- Resolve routine implementation details using the guide. Surface a conflict that changes the public contract or
  would require overriding explicit owner direction.

## Editing And Verification

- Follow [module structure](docs/style-guide/conventions/modules-and-imports.md),
  [TypeScript](docs/style-guide/conventions/typescript.md), and
  [comments](docs/style-guide/conventions/comments.md) for code changes.
- Generate file banners with `pnpm header`; use `--spec` for contract sections. Verify the result after formatting.
- The root profile `README.md` and `docs/style-guide/` are hand-typeset and ignored by Prettier. Preserve their
  formatting; verify changed Markdown links and examples manually.
- Run `pnpm check` for this package before shipping. For generator changes, also run `pnpm header --help` and a
  scratch-file `--write` round-trip, verifying both the result and that a second write leaves the file unchanged.
- Report the revision tested, full-suite result, relevant workflow evidence, and any remaining manual review items.

## Commits And Handoff

Use the [repository commit scopes and hooks](docs/developer/overview.md#git-hooks). Read effective Git identity and
any applicable attribution policy before committing; do not infer authorship from repository ownership or approval.
Do not change package versions or generated changelogs; Release Please owns releases. Include consumer adoption steps
when a tooling fix requires a new pin, install, or regeneration.
