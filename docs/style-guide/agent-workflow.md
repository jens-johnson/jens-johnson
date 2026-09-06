# Jens Johnson • Developer Style Guide • Agent Workflow

Use this protocol when implementing or auditing a project that adopts this guide.

> Read the applicable rules, verify the tooling that actually runs, and review what the tooling cannot enforce.

Related:

- [Guide hub](README.md) (defaults and precedence)
- [Project structure](conventions/project-structure.md#agent-context) (agent entry points)
- [Repository overview](../developer/overview.md) (commands for maintaining this package)

## Establish The Working Context

Read the target repository's root and applicable path-local agent instructions, product constraints, and architecture
before planning a non-trivial change. Record the branch, base commit, existing changes, and audit scope. An audit of
one route is not a repository-wide compliance claim.

For a repository-wide audit, inventory all authored SFCs and relevant source modules, including framework entry
files. Record generated/vendor exclusions. Mark each applicable check as verified, needing work, or exempt with a
reason; inspect representative files first to learn the patterns, then complete the inventory before claiming coverage.

Prefer an available local guide checkout; record its commit. In a consuming project, separately inspect the
`package.json` requirement, lockfile resolution, installed package, and repository overrides. The current guide and
an older installed release can differ. An installed file edited by hand is not a reproducible dependency fix.

Use the owner's requested guide revision or the repository's documented policy revision. If neither is specified,
use the current guide and record the selected commit. A newer rule does not authorize an unrelated whole-repository
refactor. Apply it to the requested scope and identify any follow-up work.

## Read By Task

Always read the [cheat sheet](README.md#cheat-sheet), [precedence](README.md#precedence), and local instructions.
Then load the applicable rows; overlapping tasks require the union of their reading lists.

| Task | Required Convention Documents |
|------|-------------------------------|
| TypeScript or JavaScript | [TypeScript](conventions/typescript.md), [naming](conventions/naming.md), [functions](conventions/functions.md), [comments](conventions/comments.md), [formatting](conventions/formatting.md), [modules/imports](conventions/modules-and-imports.md), [file headers](conventions/file-headers.md) |
| Vue SFC, page, layout, or composable | All code documents above, plus [Vue/Nuxt](conventions/vue-nuxt.md), [project structure](conventions/project-structure.md), and [CSS/styling](conventions/css-and-styling.md) when styling changes |
| Async, iteration, or error paths | [Async/promises](conventions/async-and-promises.md), [control flow](conventions/control-flow-and-iteration.md), [error handling](conventions/error-handling.md) |
| Tests | [Testing](conventions/testing.md), plus the conventions for the subject code |
| Tooling, scripts, or repository setup | [Tooling](conventions/tooling.md), [project structure](conventions/project-structure.md), [CLI/scripts](conventions/cli-and-scripts.md), [shell/environment](conventions/shell-and-environment.md), plus code conventions when code changes |
| Documentation or agent instructions | [Docs/prose](conventions/docs-and-prose.md), [project structure](conventions/project-structure.md#agent-context), and every convention whose rule or example changes |
| Commit, PR, or release | [Git workflow](conventions/git-workflow.md), local commit scopes, attribution policy, and release instructions |

## Verify Enforcement

Inspect effective configuration on representative real files. In an ESLint project, use
`pnpm exec eslint --print-config <path>` on an SFC and a TypeScript module as applicable. Check parser assignment,
ignored paths, rule severity, and overrides. A rule's presence in shared source does not establish that it is active
in the consuming repository.

| Requirement | Evidence To Collect |
|-------------|---------------------|
| Formatting and template spacing | Effective Prettier/Vue rules and formatted output |
| JSDoc presence | Effective `jsdoc/require-jsdoc` contexts and severity; review tags and accuracy separately |
| Header placement and spacing | Generated output after formatting and after a second generator write |
| Header contract sections | Compare usage, props, model, emits, slots, and exposed members against the component |
| SFC section order and dividers | Manual review against [SFC anatomy](conventions/vue-nuxt.md#sfc-anatomy) |
| Atomic categories and module boundaries | Component inventory, folder layout, imports, and generated framework registration |
| Type placement, member documentation, public exports | Review SFCs and siblings against the Vue, TypeScript, and module conventions |

Label a rule as automated only when the installed configuration covers it. When changing an enforced rule, update
its implementation and regression coverage alongside the prose. When no check exists, identify the manual review
step explicitly instead of claiming the rule is enforced.

## Review Vue Changes

Apply these checks to every changed SFC and its sibling modules, including pages, layouts, and the app root.
Framework-owned entry filenames remain governed by the [Vue convention](conventions/vue-nuxt.md).

- Verify script/template/style order, generated header placement, and one blank line after the header before code
  or a section divider. Regeneration must preserve that spacing.
- Check populated script sections against the canonical order and divider rules; omit empty sections.
- Verify each reusable component's category and `index.vue` folder. After moves, check imports, auto-import names,
  call sites, tests, and header paths. Do not create empty companion files.
- Move named interfaces and type aliases into the appropriate co-located `types.ts`; enums belong in `enums.ts`.
  Review props, emits, models, slots, and exposed API types, not only `defineProps`.
- Compare header sections with the actual public contract and meaningful usage. Omit inapplicable sections; do not
  fill them with placeholders.
- Check script-scope JSDoc, function documentation, member comments, annotations, and exported symbols. A file
  banner does not document each symbol, and JSDoc presence does not establish that its content is correct.
- Run the repository's complete check command and package test suite. For structural changes, build the application
  and exercise affected routes and interactions; compilation alone does not prove auto-imported components render.

## Report And Adopt

Keep the report proportional to the change. For an audit, include the source revisions, inventory scope, findings
with file references, changes made, checks run against the tested state, and unresolved items. Distinguish automated
results from manual review. Do not infer full compliance from a green CI run.

When changing this shared guide, give consumers a concrete adoption sequence: select the reviewed guide revision,
update agent pointers, adopt a released tooling version or documented immutable commit when needed, reinstall from
the lockfile, regenerate affected files, and rerun the scoped audit plus the complete package gates. Do not silently
patch `node_modules`. Keep product behavior and in-progress owner edits intact during style work.

## Enforcement

| Rule | Verification |
|------|--------------|
| Agent discovery | Root `AGENTS.md`, with `CLAUDE.md` pointing to it; follow referenced documents explicitly |
| Required reading | Task matrix plus paths/revision recorded in the work report |
| Tooling coverage | Effective configuration and representative output from the installed version |
| Review-only conventions | File-referenced review against the applicable spoke |
| Consumer adoption | Reproducible dependency resolution, regeneration, and application verification |
