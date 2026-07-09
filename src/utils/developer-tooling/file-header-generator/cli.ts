/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * █████████████████████████████ src/utils/developer-tooling/file-header-generator/cli.ts ██████████████████████████████
 *
 * Executable CLI entry for the file-header generator; parses flags and dispatches the generate/banner commands.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * pnpm header --file "#components/data/chip.vue" --description "..." [--spec chip.spec.json] [--write]
 * pnpm header:banner --project "JJ" --font "ANSI Shadow" [--save]
 * file-header-generator --help
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • docs/style-guide/conventions/file-headers.md
 *   • docs/style-guide/conventions/cli-and-scripts.md
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { exitWithError, runCli } from './utils';

// Primary output; run the CLI
runCli().catch((error: unknown): never => exitWithError(error instanceof Error ? error.message : String(error)));
