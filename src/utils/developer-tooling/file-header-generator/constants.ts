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
 * ██████████████████████████ src/utils/developer-tooling/file-header-generator/constants.ts ███████████████████████████
 *
 * Shared constants for the file-header generator: geometry, drawing characters, field key-label maps, extension
 * lookups, and CLI option definitions.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ParseArgsConfig } from 'node:util';

import { FileType } from './enums';
import type { TFieldKeyLabels } from './types';

/**
 * The maximum number of characters rendered inside a header, excluding the surrounding border.
 * @internal
 * @constant
 */
export const MAX_INNER_CONTENT_LENGTH: number = 117;

/**
 * The solid block character used to draw header bars and separators.
 * @internal
 * @constant
 */
export const BAR_CHARACTER: string = '█';

/**
 * The horizontal rule character used to draw thin dividers within a header.
 * @internal
 * @constant
 */
export const RULE_CHARACTER: string = '─';

/**
 * A full-width separator line built by repeating {@link BAR_CHARACTER} across {@link MAX_INNER_CONTENT_LENGTH}.
 * @internal
 * @constant
 */
export const SEPARATOR_CHARACTER_BLOCK: string = BAR_CHARACTER.repeat(MAX_INNER_CONTENT_LENGTH);

/**
 * The default figlet font used to render a project banner when none is specified.
 * @internal
 * @constant
 */
export const DEFAULT_BANNER_FONT: string = 'ANSI Shadow';

/**
 * The ordered `[attribute, label]` pairs rendered for a component prop or a `v-model` binding.
 * @internal
 * @constant
 */
export const PROP_KEYS: TFieldKeyLabels = [
  ['description', 'Description'],
  ['type', 'Type'],
  ['required', 'Required'],
  ['default', 'Default'],
];

/**
 * The ordered `[attribute, label]` pairs rendered for an emitted event.
 * @internal
 * @constant
 */
export const EMIT_KEYS: TFieldKeyLabels = [
  ['description', 'Description'],
  ['payload', 'Payload'],
];

/**
 * The ordered `[attribute, label]` pairs rendered for a named slot.
 * @internal
 * @constant
 */
export const SLOT_KEYS: TFieldKeyLabels = [
  ['description', 'Description'],
  ['props', 'Slot props'],
];

/**
 * The ordered `[attribute, label]` pairs rendered for a command-line argument, option, or environment variable.
 * @internal
 * @constant
 */
export const ARG_KEYS: TFieldKeyLabels = [
  ['description', 'Description'],
  ['type', 'Type'],
  ['required', 'Required'],
  ['default', 'Default'],
];

/**
 * The {@link FileType} inferred from a file's extension. Extensions absent from this map fall back to
 * {@link FileType.generic}.
 * @internal
 * @constant
 */
export const FILE_TYPE_BY_EXTENSION: Record<string, FileType> = {
  '.vue': FileType.vue,
  '.sh': FileType.script,
  '.bash': FileType.script,
  '.zsh': FileType.script,
  '.mjs': FileType.module,
  '.cjs': FileType.module,
  '.js': FileType.module,
  '.ts': FileType.module,
  '.mts': FileType.module,
  '.cts': FileType.module,
  '.yml': FileType.config,
  '.yaml': FileType.config,
  '.toml': FileType.config,
  '.env': FileType.config,
  '.css': FileType.generic,
  '.scss': FileType.generic,
  '.html': FileType.markup,
  '.htm': FileType.markup,
  '.svg': FileType.markup,
  '.xml': FileType.markup,
  '.md': FileType.doc,
  '.mdx': FileType.doc,
};

/**
 * File extensions whose files take hash (`#`) comments.
 * @internal
 * @constant
 */
export const HASH_COMMENT_EXTENSIONS: ReadonlySet<string> = new Set([
  '.sh',
  '.bash',
  '.zsh',
  '.yml',
  '.yaml',
  '.toml',
  '.env',
]);

/**
 * File extensions whose files take HTML (`<!-- -->`) comments.
 * @internal
 * @constant
 */
export const HTML_COMMENT_EXTENSIONS: ReadonlySet<string> = new Set(['.html', '.htm', '.svg', '.xml', '.md', '.mdx']);

/**
 * Matches extensionless dotfiles that still take hash (`#`) comments (`.envrc`, `.editorconfig`, `.gitignore`,
 * `.prettierignore`), tested against a path prefixed with `/`.
 * @internal
 * @constant
 */
export const HASH_COMMENT_DOTFILE_PATTERN: RegExp = /(^|\/)\.(envrc|editorconfig|gitignore|prettierignore)$/;

/**
 * The absolute path of the directory this generator module lives in, used as a last-resort location to find the
 * project header config.
 * @internal
 * @constant
 */
export const MODULE_DIRECTORY: string = dirname(fileURLToPath(import.meta.url));

/**
 * Help text to display on the generator CLI
 * @internal
 * @constant
 */
export const HELP_TEXT: string = `file-header-generator: generate a centered ASCII file-header banner.

Usage:
  file-header-generator [generate] --file <path> --description <text> [options]
  file-header-generator banner --project <text> --font <figlet-font> [--save]

Generate options:
  --file, -f <path>          Banner filename, i.e. "#components/data/chip.vue" or "bin/deploy.sh"  (required)
  --description, -d <text>   One-line description                                                  (required)
  --kind <kind>              vue | script | module | config | markup | doc | generic  (default: by ext)
  --comment <style>          block | hash | html                                            (default: by ext)
  --usage <text>             USAGE section body (use \\n for line breaks)
  --see <url>                SEE link (repeatable)
  --spec <path|json>         JSON spec for structured sections (props/emits/slots/arguments/env/...); merged with flags
  --write                    Write the header into --file instead of printing (strips an existing header first)
  --config <path>            Path to file-header.config.json

Banner options:
  --project, -p <text>       Text to render as the project banner
  --font <name>              figlet font name (default: "${DEFAULT_BANNER_FONT}")
  --list-fonts               List available figlet fonts
  --save                     Save the rendered banner into the config (banner + bannerFont)
`;

/**
 * The `parseArgs` option definitions for the generator CLI; the parsed values shape is {@link ICliValues}.
 * @internal
 * @constant
 */
export const CLI_OPTIONS: ParseArgsConfig['options'] = {
  /* The banner filename to document */
  file: { type: 'string', short: 'f' },

  /* The one-line file description */
  description: { type: 'string', short: 'd' },

  /* Override for the detected file type */
  kind: { type: 'string' },

  /* Override for the detected comment style */
  comment: { type: 'string' },

  /* The USAGE section body */
  usage: { type: 'string' },

  /* Cross-reference links (repeatable) */
  see: { type: 'string', multiple: true },

  /* A JSON spec path or inline JSON supplying the structured sections */
  spec: { type: 'string' },

  /* Write the header into the file instead of printing it */
  write: { type: 'boolean' },

  /* An explicit path to the header config */
  config: { type: 'string' },

  /* The text to render as a banner (banner command) */
  project: { type: 'string', short: 'p' },

  /* The figlet font used to render the banner (banner command) */
  font: { type: 'string' },

  /* List the available figlet fonts (banner command) */
  'list-fonts': { type: 'boolean' },

  /* Save the rendered banner into the config (banner command) */
  save: { type: 'boolean' },

  /* Print usage and exit */
  help: { type: 'boolean', short: 'h' },
};
