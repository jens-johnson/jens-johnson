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
 * ████████████████████████████ src/utils/developer-tooling/file-header-generator/enums.ts █████████████████████████████
 *
 * Enumerations (comment styles and file types) for the file-header generator.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of comment styles for ascii header comments
 * @public
 * @enum
 */
export enum CommentStyle {
  /* TS/JS Starred block comment style (/** ... *\/) */
  block = 'block',

  /* YAML/Python/etc. hash comment style (# ...) */
  hash = 'hash',

  /* HTML comment style (<!-- ... -->) */
  html = 'html',
}

/**
 * An enumeration of file types for ascii header comments
 * @public
 * @enum
 */
export enum FileType {
  /* Configuration files (JSON/YAML/TOML/.env, tsconfig, etc.) */
  config = 'config',

  /* Documentation files (Markdown, plain text, etc.) */
  doc = 'doc',

  /* Fallback for files that don't match a more specific type */
  generic = 'generic',

  /* Markup files (HTML, XML, SVG, etc.) */
  markup = 'markup',

  /* Reusable library/module source with exports */
  module = 'module',

  /* Executable scripts and entry points */
  script = 'script',

  /* Vue single-file components (.vue) */
  vue = 'vue',
}
