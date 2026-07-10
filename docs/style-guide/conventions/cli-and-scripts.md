# Jens Johnson • Developer Style Guide • CLIs & Scripts

Tooling is **software, not glue**. The doctrine: 

> A thin entry point over a real module, machine output on stdout, human output on stderr, and specs over flags for 
> anything structured

Related: 
- [modules-and-imports.md](modules-and-imports.md) (the module behind the CLI)
- [error-handling.md](error-handling.md) (exits)
- [project-structure.md](project-structure.md) (`scripts/`/`bin/`)
- [shell-and-environment.md](shell-and-environment.md) (the same doctrine in shell form)

## The Thin-CLI Pattern

**A CLI is an executable shim in front of a barrel module.** Everything reusable (command functions, parsing
options, help text, types) lives in the module; the module's `cli.ts` is the executing entry; `bin/` holds a
shebang-only shim.

```text
bin/
└── file-header.ts                   # Shim: shebang + header + a side-effect import of the module's cli.ts
src/utils/developer-tooling/
└── file-header-generator/           # The module: all real logic, domain-grouped under src/utils/
    ├── cli.ts                       # Executing entry: runCli().catch(exitWithError); NOT exported from the barrel
    ├── index.ts                     # Barrel (constants/enums/types/utils only; never the side-effectful cli.ts)
    └── enums.ts / types.ts / constants.ts / utils.ts
```

- **The shim** is exactly: shebang (`#!/usr/bin/env -S npx tsx`), the [file header](file-headers.md) (headers go
  *after* the shebang; the generator preserves this), and one side-effect import of the module's `cli.ts`.
- **`cli.ts`** is one line of behavior: `runCli().catch((error: unknown) => exitWithError(...));`
- **The command layer** (`runCli` dispatcher, `run<X>Command` functions, `CLI_OPTIONS`, `HELP_TEXT`) lives in the
  module's `utils.ts`/`constants.ts` like any other implementation.
- **`cli.ts` is never re-exported from the barrel**: importing the barrel must not execute the CLI. Programmatic
  invocation goes through the barrel-exported `runCli` function, which consumers call deliberately.

## Argument Parsing

- **Parser tiering**: `parseArgs` from `node:util` for zero-dependency internal scripts (a handful of flags, one or
  two subcommands); **`yargs`** is the approved third-party parser once a CLI outgrows that (nested command trees,
  middleware, completions, rich validation). No other arg parsers.
- Flag values are typed by a dedicated **`ICliValues` interface** living in the module's `types.ts`, with a
  member comment per flag.
- Common flags get **short aliases** (`--file, -f`); booleans are plain switches.
- Subcommands dispatch on `positionals[0]`; the default command is the primary action.
- `--help`/`-h` prints **`HELP_TEXT`** (a constant in `constants.ts`) and returns before any work.

```typescript
// ✅ DO: dispatch stays legible at the entry point
async function runCli(): Promise<void> {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: CLI_OPTIONS });

  if (values.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (positionals[0] === 'banner') {
    runBannerCommand(values);
    return;
  }

  runGenerateCommand(values);
}
```

## Output Streams

**`stdout` is for payload; `stderr` is for humans.**

- The tool's *product* (generated text, JSON, file lists) goes to `stdout`, so it pipes and redirects cleanly.
- Status narration (`wrote header into ...`, `saved banner to ...`) goes to `stderr` via `console.error`.
- **Why** (and yes, this is standard POSIX practice): pipes and redirection capture `stdout` only, so
  `header --spec x.json > header.txt` yields a clean artifact while narration still reaches the terminal, and
  `2>/dev/null` silences chatter without touching the payload. `git`, `curl`, and most well-behaved Unix tools
  split their streams exactly this way.
- Errors exit through `exitWithError(message)`: `error: <message>` on stderr, exit code `1`
  (see [error-handling.md](error-handling.md#the-layered-doctrine)).

## Structured Input: Specs Over Flag Soup

When a tool's input is structured (nested fields, lists), take a **JSON spec** (`--spec <path|inline-json>`) that
mirrors a typed interface, and let flags override individual spec fields. Flags for scalars, specs for shapes.

- Config files are JSON with a `$schema` reference where a schema exists, discovered by searching up from the
  working directory with an explicit `--config` escape hatch.

## Behavior

- **Idempotent writes**: a `--write` mode replaces its own previous output (i.e. strip the existing header before
  inserting the new one); running twice yields the same file.
- **Print by default, mutate on opt-in**: destructive/file-writing behavior sits behind an explicit flag.
- Long help text follows the observed shape: usage lines first, then grouped, aligned option tables.

## Exposure

- Repo-facing entry points get **`package.json` scripts** (colon-namespaced: `header`, `header:banner`).
- Installable CLIs also declare a **`bin`** entry pointing at the entry shim.
- Runtime is **`tsx`** for TS execution; no build step for internal tooling.

## Enforcement

| Rule               | Tooling                                                                                                                                         |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Console usage      | `no-console` allows `warn`/`error`; CLI payload prints are the deliberate exception (per-file override or `console.log` limited to entry files) |
| Structure          | Convention + review; this document is the reference                                                                                             |
