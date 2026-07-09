# Jens Johnson • Developer Style Guide

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vue](https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxt&logoColor=white)](https://nuxt.com/)
[![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

## Introduction

The following is a living document that contains my opinionated developer style guide. This is used as a central
"source of truth" for how I structure development, code syntax, and more, in order to drive design decisions for
projects, maintain consistent parity and individual "brand identity", and integrate with agentic workflows. While
the style and design decisions documented here are broadly reflective across different languages and technologies, they
are, as the reader will notice, primarily oriented around my core stack (TS/JS/Nuxt/AWS/etc.).

The goal of this guide is total reproducibility: a human or an AI agent who has read it should generate code that is
indistinguishable from code I wrote myself, down to module structure, comment style, and tooling configuration.

## How This Guide Is Organized

This guide is a **hub and spoke** system:

- **This `README`** is the hub: philosophy, precedence rules, a cheat sheet of every default, and an index into the
  detailed conventions.
- **[`conventions/`](conventions)** holds the spokes: one focused document per domain (formatting, naming,
  TypeScript, Vue/Nuxt, tooling, and so on).

Every rule in the spokes follows the same shape:

> **Rule** (imperative) → **Why** (rationale) → **Examples** (`✅ DO` / `❌ AVOID`) → **Enforcement** (the
> ESLint/Prettier/tooling configuration that locks the rule in, when one exists)

## How To Use This Guide

### As a Human

Skim the [cheat sheet](#cheat-sheet) for the defaults, then deep-dive into the relevant
[convention docs](#conventions-index) when working in a specific domain. When contributing to one of my projects,
treat this guide as the review bar.

### As an AI Agent

If you are an agent generating or modifying code for me, follow this protocol:

1. **Read the [cheat sheet](#cheat-sheet) in full** before generating any code; it resolves ~80% of style decisions.
2. **Load the spoke documents** for whatever domain you are touching (i.e. writing a Vue component means loading
   [`vue-nuxt.md`](conventions/vue-nuxt.md), [`comments.md`](conventions/comments.md), and
   [`file-headers.md`](conventions/file-headers.md)).
3. **Respect precedence** (see [below](#precedence)); a repository's local configuration always wins over this guide.
4. **When the guide is silent**, mimic the surrounding code in the repository; when both are silent, ask rather than
   invent, and propose an addition to this guide so the gap gets closed.
5. **Generated code must pass the repository's lint/typecheck gates unmodified**; if it doesn't, the code is wrong,
   not the gate.

## Precedence

When sources of truth conflict, resolve in this order:

1. **Repository-local configuration**: `.prettierrc`, ESLint config, `tsconfig`, `CLAUDE.md`/`AGENTS.md`, and any
   repo-specific docs. Local context always wins.
2. **This style guide**: intent, conventions, and everything tooling cannot mechanically encode.
3. **Ecosystem defaults**: framework and community conventions fill any remaining gaps.

A useful mental model: **Prettier owns formatting, ESLint owns quality, this guide owns intent.** A conflict between
a tool's configuration and this guide is a bug in one of them; fix the config or amend the guide, never silently fork.

## Cheat Sheet

The one-glance defaults. Each links to its spoke for rationale and examples.

### Formatting

| Rule                 | Default                                                       |
|----------------------|---------------------------------------------------------------|
| Line length          | `120` characters (links/banners may overflow)                 |
| Indentation          | 2 spaces, never tabs                                          |
| Quotes               | Single (`'`); backticks only when interpolating               |
| Semicolons           | Always                                                        |
| Trailing commas      | Always on multiline constructs                                |
| Brace spacing        | Spaces inside braces: `{ foo }`                               |
| Arrow parens         | Always: `(x) => ...`                                          |
| Brace style          | 1TBS (opening brace on the same line)                         |
| Conditional bodies   | Always braced, body on its own line (`curly: all`)            |
| Line endings         | `LF`; every file ends with a newline                          |
| Multiline thresholds | Objects with 3+ properties always break (ESLint-enforced); imports/params break at 120 (Prettier) |
| Section dividers     | `/* ─── Name ─── */` padded to 120 chars; 3 blank lines before |

### Naming

| Thing                 | Convention                                                           |
|-----------------------|----------------------------------------------------------------------|
| Files & directories   | `kebab-case`                                                         |
| Variables & functions | `camelCase`; functions verb-first (`renderHeader`, `detectFileType`) |
| Constants             | `SCREAMING_SNAKE_CASE`                                               |
| Interfaces            | `I` prefix (`IHeaderSpec`)                                           |
| Type aliases          | `T` prefix (`TCommentStyle`)                                         |
| Enums                 | `PascalCase` name; member casing follows the domain                  |
| Abbreviations         | Avoid; `normalizeStringLength`, never `normStrLen`                   |

### TypeScript

| Rule          | Default                                                                    |
|---------------|----------------------------------------------------------------------------|
| Strictness    | `strict: true`, always                                                     |
| Annotations   | Maximal: annotate everything, including locals and callback params/returns |
| `any`         | Banned; use `unknown` and narrow                                           |
| Unions        | Derive from enums: `enum Foo { ... }` + `type TFoo =` `` `${Foo}` ``       |
| Type imports  | `import type { ... }` for type-only imports                                |
| Result shapes | Discriminated unions: `{ ok: true; value: T } \| { ok: false }`            |

### Code Shape

| Rule         | Default                                                                            |
|--------------|------------------------------------------------------------------------------------|
| Functions    | `function` declarations at top level; arrows only for callbacks/closures           |
| Iteration    | `.map()`/`.filter()`/`.reduce()`/`.flatMap()` over `for` loops                     |
| Async        | `async`/`await` over `.then()`; `Promise.all()` for parallel work                  |
| Equality     | `===` always                                                                       |
| Modules      | Kebab-case barrel directories: `index` / `utils` / `types` / `constants` / `enums` |
| Internals    | Helpers stay unexported; only the intended public API is exported                  |
| Comments     | JSDoc on symbols; `/* */` on members; leading `//` on execution blocks             |
| File headers | Every comment-supporting file opens with the ASCII banner header                   |

### Workflow

| Rule             | Default                                                    |
|------------------|------------------------------------------------------------|
| Commits          | Conventional Commits; lowercase subjects; repo scope enums |
| Package manager  | `pnpm`, pinned via Corepack (`packageManager` field)       |
| Formatting owner | Prettier owns formatting; ESLint owns quality              |
| Prose            | No em dashes; semicolons or a rewrite; whole sentences; `i.e.` never `e.g.` |

## Conventions Index

| Document                                                                     | Covers                                                                | Status |
|------------------------------------------------------------------------------|-----------------------------------------------------------------------|--------|
| [`formatting.md`](conventions/formatting.md)                                 | Line length, indentation, punctuation, blank lines, multiline rules   | ✅      |
| [`naming.md`](conventions/naming.md)                                         | Casing, prefixes, verb-first functions, abbreviation policy           | ✅      |
| [`comments.md`](conventions/comments.md)                                     | Comment syntaxes, JSDoc, member comments, execution comments          | ✅      |
| [`file-headers.md`](conventions/file-headers.md)                             | The ASCII banner file-header spec + generator                         | ✅      |
| [`typescript.md`](conventions/typescript.md)                                 | Strictness, annotations, enums/unions, guards, result shapes          | ✅      |
| [`functions.md`](conventions/functions.md)                                   | Declarations vs arrows, parameters, guards, size                      | ✅      |
| [`control-flow-and-iteration.md`](conventions/control-flow-and-iteration.md) | Loops vs array methods, conditionals, ternaries, switch               | ✅      |
| [`async-and-promises.md`](conventions/async-and-promises.md)                 | async/await, parallelism, floating promises                           | ✅      |
| [`error-handling.md`](conventions/error-handling.md)                         | Throw vs result unions, error types, CLI exits, message style         | ✅      |
| [`modules-and-imports.md`](conventions/modules-and-imports.md)               | Barrel directories, exports, import ordering, aliases                 | ✅      |
| [`project-structure.md`](conventions/project-structure.md)                   | Repo layout, package.json, scripts, pnpm/Corepack                     | ✅      |
| [`vue-nuxt.md`](conventions/vue-nuxt.md)                                     | SFC structure, props/emits, components, composables, server           | ✅     |
| [`css-and-styling.md`](conventions/css-and-styling.md)                       | Tailwind CSS-first, tokens, theming, stylelint                        | ✅     |
| [`testing.md`](conventions/testing.md)                                       | Vitest conventions, layout, naming, fixtures                          | ✅     |
| [`tooling.md`](conventions/tooling.md)                                       | Prettier/ESLint/stylelint/commitlint/lefthook/editorconfig baselines  | ✅     |
| [`cli-and-scripts.md`](conventions/cli-and-scripts.md)                       | Thin-CLI + module pattern, parseArgs, help text, exits                | ✅      |
| [`git-workflow.md`](conventions/git-workflow.md)                             | Commits, branches, promotions, Release Please                         | ✅     |
| [`docs-and-prose.md`](conventions/docs-and-prose.md)                         | Markdown style, README anatomy, badges, prose punctuation             | ✅     |

## Evolution

This is a living document. Amendments land via PR with conventional commits; agents encountering an uncovered case
should propose the new rule rather than deciding silently. When a rule changes, its tooling enforcement (Prettier,
ESLint, etc.) changes in the same commit.
