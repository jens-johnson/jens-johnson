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
 * ████████████████████████████ src/utils/developer-tooling/file-header-generator/utils.ts █████████████████████████████
 *
 * Implementation of the file-header generator: width/banner math, section rendering, detection, assembly, file I/O, and
 * the CLI command layer.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import type { FontName } from 'figlet';
import figlet from 'figlet';

import {
  ARG_KEYS,
  BAR_CHARACTER,
  CLI_OPTIONS,
  DEFAULT_BANNER_FONT,
  EMIT_KEYS,
  FILE_TYPE_BY_EXTENSION,
  HASH_COMMENT_DOTFILE_PATTERN,
  HASH_COMMENT_EXTENSIONS,
  HELP_TEXT,
  HTML_COMMENT_EXTENSIONS,
  MAX_INNER_CONTENT_LENGTH,
  MODULE_DIRECTORY,
  PROP_KEYS,
  RULE_CHARACTER,
  SEPARATOR_CHARACTER_BLOCK,
  SLOT_KEYS,
} from './constants';
import { CommentStyle, FileType } from './enums';
import type {
  ICliValues,
  IField,
  IHeaderConfig,
  IHeaderSpec,
  ISection,
  TCommentStyle,
  TFieldKeyLabels,
  TFileType,
} from './types';

/* ─── Width helpers ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Measure the visible width of a string in Unicode code points rather than UTF-16 code units, so astral characters
 * (i.e. emoji) count as a single glyph.
 * @internal
 * @function
 * @param str - The string to measure
 * @returns The number of code points in `str`
 */
export function normalizeStringLength(str: string): number {
  return [...str].length;
}

/**
 * Word-wrap text to a maximum width, preserving newlines and any line that already fits (so pre-formatted lines such
 * as code samples keep their original layout).
 * @internal
 * @function
 * @param text - The text to wrap; existing newlines are treated as hard breaks
 * @param width - The maximum visible width per line, defaulting to {@link MAX_INNER_CONTENT_LENGTH}
 * @returns The wrapped text as an array of lines
 * @public
 */
export function wrap(text: string, width: number = MAX_INNER_CONTENT_LENGTH): string[] {
  return text.split('\n').reduce((result: string[], paragraph: string): string[] => {
    // Blank lines and lines already within the width pass through unchanged
    if (paragraph === '' || normalizeStringLength(paragraph) <= width) {
      result.push(paragraph);
      return result;
    }

    // Greedily accumulate words, flushing the current line before it exceeds the width; the paragraph's leading
    // indent is preserved on every wrapped line so indented content (i.e. bullets) keeps its alignment
    const indent: string = paragraph.slice(0, paragraph.length - paragraph.trimStart().length);
    const leftover: string = paragraph
      .trimStart()
      .split(' ')
      .reduce((current: string, word: string): string => {
        if (current !== indent && normalizeStringLength(`${current} ${word}`) > width) {
          result.push(current);
          return `${indent}${word}`;
        }
        return current === indent ? `${indent}${word}` : `${current} ${word}`;
      }, indent);
    if (leftover !== indent) {
      result.push(leftover);
    }

    // Return the accumulated result
    return result;
  }, []);
}

/* ─── Banner + separators ────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Remove the smallest shared leading-whitespace indent from a block of lines, so it can be re-centered cleanly.
 * @internal
 * @function
 * @param lines - The lines to de-indent
 * @returns The lines with their common leading indent removed
 */
export function stripCommonIndent(lines: string[]): string[] {
  // Measure the leading-whitespace width of every non-blank line and take the smallest
  const indents: number[] = lines
    .filter((line: string): boolean => line.trim() !== '')
    .map((line: string): number => line.length - line.trimStart().length);
  const min: number = indents.length ? Math.min(...indents) : 0;

  // Slice that shared indent off the front of every line
  return lines.map((line: string): string => line.slice(min));
}

/**
 * Center a banner block within {@link MAX_INNER_CONTENT_LENGTH} by padding every line with one shared left offset,
 * preserving the banner's internal shape.
 * @internal
 * @function
 * @param rawLines - The raw banner lines to center
 * @returns The centered banner lines
 * @throws If the widest line exceeds {@link MAX_INNER_CONTENT_LENGTH}
 */
export function centerBanner(rawLines: string[]): string[] {
  // Trim trailing whitespace and drop any shared indent so the block starts flush-left
  const lines: string[] = stripCommonIndent(rawLines.map((line: string): string => line.replace(/\s+$/, '')));

  // Measure the widest line and guard against a banner that can't fit
  const maxWidth: number = Math.max(...lines.map(normalizeStringLength));
  if (maxWidth > MAX_INNER_CONTENT_LENGTH) {
    throw new Error(
      `Banner is ${maxWidth} chars wide but the limit is ${MAX_INNER_CONTENT_LENGTH}. Use a narrower font or shorter text.`,
    );
  }

  // Pad every line with the same left offset so the block is centered as a whole
  const padding: string = ' '.repeat(Math.floor((MAX_INNER_CONTENT_LENGTH - maxWidth) / 2));
  return lines.map((line: string): string => padding + line);
}

/**
 * Center a file name inside a full-width bar: `████ path ████`, totalling {@link MAX_INNER_CONTENT_LENGTH} characters.
 * @internal
 * @function
 * @param fileName - The file name or path to center
 * @throws If the file name is too long to fit alongside the bars and padding
 * @returns The rendered bar line
 */
export function fileNameBar(fileName: string): string {
  // Measure the file name and guard against overflow (6 chars reserved for the two spaces and minimal bars)
  const fileNameLength: number = normalizeStringLength(fileName);
  if (fileNameLength > MAX_INNER_CONTENT_LENGTH - 6) {
    throw new Error(`File path "${fileName}" is too long for the banner (max ${MAX_INNER_CONTENT_LENGTH - 6} chars).`);
  }

  // Split the leftover space (minus the two padding spaces) into left and right bar widths
  const left: number = Math.floor((MAX_INNER_CONTENT_LENGTH - 2 - fileNameLength) / 2);
  const right: number = MAX_INNER_CONTENT_LENGTH - 2 - fileNameLength - left;

  // Assemble the bar with the name centered between the two runs of block characters
  return BAR_CHARACTER.repeat(left) + ' ' + fileName + ' ' + BAR_CHARACTER.repeat(right);
}

/**
 * Build a section divider of the form `─── TITLE ` padded with rule characters to {@link MAX_INNER_CONTENT_LENGTH}.
 * @internal
 * @function
 * @param title - The section title to embed in the divider
 * @returns The rendered divider line
 */
export function createSectionDivider(title: string): string {
  const head: string = `${RULE_CHARACTER.repeat(3)} ${title} `;
  return head + RULE_CHARACTER.repeat(Math.max(0, MAX_INNER_CONTENT_LENGTH - normalizeStringLength(head)));
}

/* ─── Section model ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Render a bulleted list of fields, emitting each field's name followed by its populated `key`-labelled attributes,
 * with wrapped continuation lines hang-indented under their entry.
 * @internal
 * @function
 * @param fields - The fields to render
 * @param keys - Ordered `[attribute, label]` pairs selecting which field attributes to render and how to label them
 * @returns The rendered lines
 */
export function renderEntries(fields: IField[], keys: TFieldKeyLabels): string[] {
  return fields.flatMap((field: IField): string[] => [
    `  • ${field.name}`,
    ...keys.flatMap(([key, label]: readonly [keyof IField, string]): string[] => {
      const value: string | boolean | undefined = field[key];
      if (value === undefined || value === '') {
        return [];
      }
      const wrapped: string[] = wrap(`    - ${label}: ${String(value)}`, MAX_INNER_CONTENT_LENGTH);
      return [wrapped[0]!, ...wrapped.slice(1).map((cont: string): string => `        ${cont.trimStart()}`)];
    }),
  ]);
}

/**
 * Render a bulleted list of strings, wrapping each item to the content width with hang-indented continuation lines.
 * @internal
 * @function
 * @param items - The items to render
 * @returns The rendered lines
 */
export function renderList(items: string[]): string[] {
  return items.flatMap((item: string): string[] => {
    const wrapped: string[] = wrap(`  • ${item}`, MAX_INNER_CONTENT_LENGTH);
    return [wrapped[0]!, ...wrapped.slice(1).map((cont: string): string => `    ${cont.trimStart()}`)];
  });
}

/**
 * Render a bulleted list of named fields, appending each field's description after its name when present.
 * @internal
 * @function
 * @param fields - The fields to render
 * @returns The rendered lines
 */
export function renderNamed(fields: IField[]): string[] {
  return renderList(
    fields.map((field: IField): string => (field.description ? `${field.name}: ${field.description}` : field.name)),
  );
}

/* ─── Section definitions ────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The `USAGE` section: a usage snippet wrapped to the content width.
 * @internal
 * @constant
 */
const USAGE_SECTION: ISection = {
  title: 'USAGE',
  getLines: (spec: IHeaderSpec): string[] | undefined => (spec.usage ? wrap(spec.usage) : undefined),
};

/**
 * The `SEE` section: a bulleted list of cross-references.
 * @internal
 * @constant
 */
const SEE_SECTION: ISection = {
  title: 'SEE',
  getLines: (spec: IHeaderSpec): string[] | undefined => (spec.see?.length ? renderList(spec.see) : undefined),
};

/**
 * The ordered sections rendered for each {@link FileType}. A section whose `getLines` returns `undefined` is omitted,
 * so a file only documents what it actually has.
 * @internal
 * @constant
 */
export const SECTIONS_BY_FILE_TYPE: Record<FileType, ISection[]> = {
  [FileType.vue]: [
    USAGE_SECTION,
    {
      title: 'PROPS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.props?.length ? renderEntries(spec.props, PROP_KEYS) : undefined,
    },
    {
      title: 'MODEL',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.model?.length ? renderEntries(spec.model, PROP_KEYS) : undefined,
    },
    {
      title: 'EMITS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.emits?.length ? renderEntries(spec.emits, EMIT_KEYS) : undefined,
    },
    {
      title: 'SLOTS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.slots?.length ? renderEntries(spec.slots, SLOT_KEYS) : undefined,
    },
    {
      title: 'EXPOSED',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.exposed?.length ? renderNamed(spec.exposed) : undefined,
    },
    SEE_SECTION,
  ],
  [FileType.script]: [
    USAGE_SECTION,
    {
      title: 'ARGUMENTS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.arguments?.length ? renderEntries(spec.arguments, ARG_KEYS) : undefined,
    },
    {
      title: 'OPTIONS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.options?.length ? renderEntries(spec.options, ARG_KEYS) : undefined,
    },
    {
      title: 'ENV',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.env?.length ? renderEntries(spec.env, ARG_KEYS) : undefined,
    },
    {
      title: 'RETURNS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.returns?.length ? renderList(spec.returns) : undefined,
    },
    {
      title: 'SIDE EFFECTS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.sideEffects?.length ? renderList(spec.sideEffects) : undefined,
    },
    {
      title: 'EXAMPLES',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.examples?.length ? wrap(spec.examples.join('\n')) : undefined,
    },
    SEE_SECTION,
  ],
  [FileType.api]: [
    USAGE_SECTION,
    {
      title: 'AUTH',
      getLines: (spec: IHeaderSpec): string[] | undefined => (spec.auth?.length ? renderList(spec.auth) : undefined),
    },
    {
      title: 'PARAMS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.params?.length ? renderEntries(spec.params, ARG_KEYS) : undefined,
    },
    {
      title: 'QUERY',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.query?.length ? renderEntries(spec.query, ARG_KEYS) : undefined,
    },
    {
      title: 'BODY',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.body?.length ? renderEntries(spec.body, ARG_KEYS) : undefined,
    },
    {
      title: 'RETURNS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.returns?.length ? renderList(spec.returns) : undefined,
    },
    {
      title: 'THROWS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.throws?.length ? renderList(spec.throws) : undefined,
    },
    {
      title: 'SIDE EFFECTS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.sideEffects?.length ? renderList(spec.sideEffects) : undefined,
    },
    SEE_SECTION,
  ],
  [FileType.module]: [
    USAGE_SECTION,
    {
      title: 'EXPORTS',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.exports?.length ? renderNamed(spec.exports) : undefined,
    },
    SEE_SECTION,
  ],
  [FileType.config]: [
    USAGE_SECTION,
    {
      title: 'ENV',
      getLines: (spec: IHeaderSpec): string[] | undefined =>
        spec.env?.length ? renderEntries(spec.env, ARG_KEYS) : undefined,
    },
    SEE_SECTION,
  ],
  [FileType.markup]: [USAGE_SECTION, SEE_SECTION],
  [FileType.doc]: [USAGE_SECTION, SEE_SECTION],
  [FileType.generic]: [USAGE_SECTION, SEE_SECTION],
};

/* ─── Detection ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Infer a file's {@link FileType} from its extension and path, so the correct sections are documented.
 * @internal
 * @function
 * @param fileName - The file name or path; a leading alias segment (i.e. `#components/...`) is tolerated
 * @returns The detected file type, defaulting to {@link FileType.generic}
 */
export function detectFileType(fileName: string): FileType {
  // Drop a leading alias segment (i.e. `#components`) before reading the extension
  const extension: string = extname(fileName.replace(/^#[^/]+/, ''));
  const fileType: FileType | undefined = FILE_TYPE_BY_EXTENSION[(extension || fileName).toLowerCase()];
  if (!fileType) {
    return FileType.generic;
  }

  // A .ts/.js under a server/api or server/routes path reads as an HTTP handler with a request/response contract
  if (fileType === FileType.module && /(^|\/)server\/(api|routes)\//.test(fileName)) {
    return FileType.api;
  }

  // A .ts/.js under a bin/ or scripts/ path reads as an executable script, not a library module
  if (fileType === FileType.module && /(^|\/)(bin|scripts)\//.test(fileName)) {
    return FileType.script;
  }
  return fileType;
}

/**
 * Choose the {@link CommentStyle} a file's header should be written in, based on its extension.
 * @internal
 * @function
 * @param fileName - The file name or path
 * @returns The comment style to use, defaulting to {@link CommentStyle.block}
 */
export function detectCommentStyle(fileName: string): CommentStyle {
  // Extract the extension from the file name
  const extension: string = extname(fileName).toLowerCase();

  // Return the appropriate comment style based on the file type
  if (HASH_COMMENT_EXTENSIONS.has(extension) || HASH_COMMENT_DOTFILE_PATTERN.test(`/${fileName}`)) {
    return CommentStyle.hash;
  }
  return HTML_COMMENT_EXTENSIONS.has(extension) ? CommentStyle.html : CommentStyle.block;
}

/* ─── Assembly ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Build the inner content lines of a header (banner, filename bar, description, then populated sections), without the
 * surrounding comment syntax.
 * @internal
 * @function
 * @param spec - The header spec describing the file
 * @param config - The shared project header configuration
 * @param fileType - The file type deciding which sections apply
 * @returns The header's inner content lines
 */
export function buildHeaderContent(spec: IHeaderSpec, config: IHeaderConfig, fileType: FileType): string[] {
  // The banner, filename bar, and wrapped description that open every header
  const openingLines: string[] = [
    SEPARATOR_CHARACTER_BLOCK,
    '',
    ...centerBanner(config.banner),
    '',
    SEPARATOR_CHARACTER_BLOCK,
    fileNameBar(spec.file),
    '',
    ...wrap(spec.description),
  ];

  // Each populated section expanded to its divider + body; a section with no content contributes nothing
  const sectionLines: string[] = SECTIONS_BY_FILE_TYPE[fileType].flatMap((section: ISection): string[] => {
    const body: string[] | undefined = section.getLines(spec);
    return body && body.length ? ['', createSectionDivider(section.title), '', ...body] : [];
  });

  // Compose the opening, the sections, and a closing separator
  return [...openingLines, ...sectionLines, '', SEPARATOR_CHARACTER_BLOCK];
}

/**
 * Wrap header content lines in the requested comment syntax.
 * @internal
 * @function
 * @param lines - The inner content lines to wrap
 * @param commentStyle - The comment style to apply
 * @returns The comment-wrapped header text, terminated by a newline
 */
export function applyCommentStyle(lines: string[], commentStyle: CommentStyle): string {
  if (commentStyle === CommentStyle.hash) {
    return lines.map((line: string): string => (line === '' ? '#' : `# ${line}`)).join('\n') + '\n';
  }
  if (commentStyle === CommentStyle.html) {
    return ['<!--', ...lines, '-->'].join('\n') + '\n';
  }
  const inner: string = lines.map((line: string): string => (line === '' ? ' *' : ` * ${line}`)).join('\n');
  return `/**\n${inner}\n */\n`;
}

/**
 * Render a complete file header, detecting the file type and comment style from the spec when they are not set.
 * @public
 * @function
 * @param spec - The header spec describing the file
 * @param config - The shared project header configuration
 * @returns The rendered header text
 */
export function renderHeader(spec: IHeaderSpec, config: IHeaderConfig): string {
  const fileType: FileType = (spec.kind as FileType | undefined) ?? detectFileType(spec.file);
  const commentStyle: CommentStyle = (spec.comment as CommentStyle | undefined) ?? detectCommentStyle(spec.file);
  return applyCommentStyle(buildHeaderContent(spec, config, fileType), commentStyle);
}

/* ─── Write mode ─────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Remove an existing header block (a leading comment containing a long run of {@link BAR_CHARACTER}) from a file body.
 * @internal
 * @function
 * @param fileBody - The file contents to strip
 * @returns The file contents with any leading header removed
 */
export function removeExistingHeader(fileBody: string): string {
  // Only treat the leading comment as a header if it actually contains a banner run
  const bannerRun: string = BAR_CHARACTER.repeat(20);
  const leadingLines: string[] = fileBody.split('\n', 60);
  if (!leadingLines.some((line: string): boolean => line.includes(bannerRun))) {
    return fileBody;
  }

  // Block and HTML headers are a single leading comment; drop it wholesale
  if (fileBody.startsWith('/**')) {
    return fileBody.replace(/^\/\*\*[\s\S]*?\*\/\n?/, '').replace(/^\n+/, '');
  }
  if (fileBody.startsWith('<!--')) {
    return fileBody.replace(/^<!--[\s\S]*?-->\n?/, '').replace(/^\n+/, '');
  }

  // Hash headers are a run of leading `#` lines; drop them one by one
  const lines: string[] = fileBody.split('\n');
  let index: number = 0;
  while (index < lines.length && /^#/.test(lines[index] ?? '')) {
    index += 1;
  }
  return lines.slice(index).join('\n').replace(/^\n+/, '');
}

/**
 * Write a rendered header into a file, replacing any existing header. For Vue files the header is placed inside the
 * `<script setup>` block; for scripts a shebang line is preserved at the very top.
 * @internal
 * @function
 * @param targetPath - The path of the file to write, resolved against the current working directory
 * @param header - The rendered header text to insert
 * @param fileType - The file type, used to decide where the header goes
 * @throws If the file cannot be read or written
 */
export function writeHeaderToFile(targetPath: string, header: string, fileType: FileType): void {
  // Resolve the provided file path and read it, treating a missing file as empty; reading directly (instead of an
  // existsSync check first) avoids a check-then-use race on the file system
  const absolutePath: string = resolve(process.cwd(), targetPath);
  let existing: string;
  try {
    existing = readFileSync(absolutePath, 'utf8');
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
    existing = '';
  }

  // Vue: insert the header just inside the (existing or created) <script setup> block, replacing any existing
  // header at the top of the block so a re-run stays idempotent
  if (fileType === FileType.vue) {
    const scriptOpen: RegExpMatchArray | null = existing.match(/<script[^>]*>\n?/);
    if (scriptOpen && scriptOpen.index !== undefined) {
      const insertAt: number = scriptOpen.index + scriptOpen[0].length;
      const scriptBody: string = removeExistingHeader(existing.slice(insertAt));
      writeFileSync(absolutePath, existing.slice(0, insertAt) + header + scriptBody);
    } else {
      writeFileSync(absolutePath, `<script setup lang="ts">\n${header}</script>\n\n${existing}`);
    }
    return;
  }

  // Set any shebang aside BEFORE stripping; the hash-strip branch of removeExistingHeader would otherwise consume
  // the `#!` line and then leave a block header sitting behind it untouched
  const shebangMatch: RegExpMatchArray | null = existing.match(/^#!.*\n/);
  const shebang: string = shebangMatch ? shebangMatch[0] : '';

  // Replace any existing header in the remainder, then reassemble (shebang first when present) with one blank line
  // separating the header from the body
  const body: string = removeExistingHeader(existing.slice(shebang.length));
  const separatedBody: string = body ? `\n${body.replace(/^\n+/, '')}` : '';
  writeFileSync(absolutePath, shebang + header + separatedBody);
}

/* ─── Config loading ─────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Locate and parse the project's `file-header.config.json`, searching an explicit path, the working directory, and the
 * repository root relative to the generator module.
 * @public
 * @function
 * @param explicitPath - An explicit config path to try first, if provided
 * @throws If no config file can be found
 * @returns The resolved config path and its parsed contents
 */
export function loadHeaderConfig(explicitPath?: string): { path: string; config: IHeaderConfig } {
  // Search order: an explicit --config path, the working directory, then the repo root (four levels up from
  // src/utils/developer-tooling/file-header-generator/)
  const candidates: string[] = [
    explicitPath,
    resolve(process.cwd(), 'file-header.config.json'),
    resolve(MODULE_DIRECTORY, '../../../../file-header.config.json'),
  ].filter((candidate: string | undefined): candidate is string => Boolean(candidate));

  // Use the first candidate that exists on disk
  const path: string | undefined = candidates.find((candidate: string): boolean => existsSync(candidate));
  if (!path) {
    throw new Error('No file-header.config.json found. Pass --config <path> or create one next to the generator.');
  }

  // Parse and return the resolved config
  return { path, config: JSON.parse(readFileSync(path, 'utf8')) as IHeaderConfig };
}

/* ─── CLI ────────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Print an error message and exit the process with a failure code.
 * @internal
 * @function
 * @param message - The message to print to stderr
 * @returns Never; the process exits
 */
export function exitWithError(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

/**
 * Render a project banner from text in a figlet font, optionally saving it into the header config.
 * @internal
 * @function
 * @param project - The text to render as the banner
 * @param requestedFont - The figlet font to render with
 * @param save - Whether to persist the banner into the config
 * @param configPath - An explicit config path, when saving
 */
export function runBannerCommand(project: string, requestedFont: string, save: boolean, configPath?: string): void {
  // Render the banner art, failing loudly on an unknown font
  const font: FontName = requestedFont as FontName;
  let art: string;
  try {
    art = figlet.textSync(project, { font });
  } catch {
    exitWithError(`unknown figlet font "${font}". Try --list-fonts.`);
  }

  // Center the art within the header content width and print it as the command's payload
  const centered: string[] = centerBanner(art.split('\n'));
  console.log(centered.join('\n'));

  // Optionally persist the banner (de-indented) into the header config for reuse
  if (save) {
    const { path, config }: { path: string; config: IHeaderConfig } = loadHeaderConfig(configPath);
    config.banner = stripCommonIndent(centered);
    config.bannerFont = font;
    config.projectName = project;
    writeFileSync(path, JSON.stringify(config, null, 2) + '\n');

    // Narration goes to stderr (not console.info, which writes to stdout and would pollute the pipeable payload)
    console.error(`saved banner (font "${font}") to ${path}`);
  }
}

/**
 * Build a header spec from CLI flags and an optional JSON spec, then print or write the rendered header.
 * @internal
 * @function
 * @param values - The parsed CLI flag values
 */
export function runGenerateCommand(values: ICliValues): void {
  // Load the shared project header configuration
  const { config }: { config: IHeaderConfig } = loadHeaderConfig(values.config);

  // Start from a --spec file/inline JSON, then let individual flags override
  let spec: Partial<IHeaderSpec> = {};
  if (typeof values.spec === 'string') {
    const raw: string = values.spec.trim().startsWith('{')
      ? values.spec
      : readFileSync(resolve(process.cwd(), values.spec), 'utf8');
    spec = JSON.parse(raw) as Partial<IHeaderSpec>;
  }

  // Overlay the scalar flags onto the spec
  if (typeof values.file === 'string') {
    spec.file = values.file;
  }
  if (typeof values.description === 'string') {
    spec.description = values.description;
  }
  if (typeof values.kind === 'string') {
    spec.kind = values.kind as TFileType;
  }
  if (typeof values.comment === 'string') {
    spec.comment = values.comment as TCommentStyle;
  }
  if (typeof values.usage === 'string') {
    spec.usage = values.usage;
  }
  if (Array.isArray(values.see)) {
    spec.see = values.see;
  }

  // Guard the required fields
  if (!spec.file) {
    exitWithError('--file is required (or provide "file" in --spec)');
  }
  if (!spec.description) {
    exitWithError('--description is required (or provide "description" in --spec)');
  }

  // Render the header, then either write it into the target file or print it as the command's payload
  const header: string = renderHeader(spec as IHeaderSpec, config);
  if (values.write) {
    const fileType: FileType = (spec.kind as FileType | undefined) ?? detectFileType(spec.file);
    writeHeaderToFile(spec.file, header, fileType);

    // Narration goes to stderr so the payload stream stays clean
    console.error(`wrote header into ${spec.file}`);
  } else {
    process.stdout.write(header);
  }
}

/**
 * Parse arguments and dispatch to the `banner` or `generate` command.
 * @internal
 * @function
 */
export async function runCli(): Promise<void> {
  // Parse the raw argv into typed flag values plus positional subcommand tokens
  const parsed: { values: ICliValues; positionals: string[] } = parseArgs({
    allowPositionals: true,
    options: CLI_OPTIONS,
  }) as { values: ICliValues; positionals: string[] };
  const { values, positionals }: { values: ICliValues; positionals: string[] } = parsed;

  // Print usage and stop before doing any work
  if (values.help) {
    console.log(HELP_TEXT);
    return;
  }

  // Dispatch the banner subcommand
  if (positionals[0] === 'banner') {
    // List the available figlet fonts as the command's payload
    if (values['list-fonts']) {
      const fonts: string[] = await new Promise<string[]>((res, rej) =>
        figlet.fonts((error: Error | null, list?: string[]): void => (error ? rej(error) : res(list ?? []))),
      );
      console.log(fonts.sort().join('\n'));
      return;
    }

    // Render (and optionally save) the requested banner
    const project: string | undefined = values.project ?? positionals[1];
    if (!project) {
      exitWithError('banner requires --project <text>');
    }
    runBannerCommand(project, values.font ?? DEFAULT_BANNER_FONT, Boolean(values.save), values.config);
    return;
  }

  // Default command: generate a header
  runGenerateCommand(values);
}
