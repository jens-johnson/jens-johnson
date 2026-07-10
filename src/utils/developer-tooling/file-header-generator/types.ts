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
 * ████████████████████████████ src/utils/developer-tooling/file-header-generator/types.ts █████████████████████████████
 *
 * Type definitions for the file-header generator: config, spec, fields, sections, and CLI value shapes.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { CommentStyle, FileType } from './enums';

/**
 * A type of comment style for ASCII code comment banners; one of {@link CommentStyle}.
 * @internal
 */
export type TCommentStyle = `${CommentStyle}`;

/**
 * A type of file for ASCII code comment banners; one of {@link FileType}.
 * @internal
 */
export type TFileType = `${FileType}`;

/**
 * Global configuration shared across every generated header.
 * @internal
 * @interface
 */
export interface IHeaderConfig {
  /* Human-readable project name shown in the header */
  projectName: string;

  /* Total character width of the rendered header */
  width: number;

  /* ASCII banner lines rendered at the top of the header */
  banner: string[];

  /* Optional figlet-style font used to render the banner */
  bannerFont?: string;
}

/**
 * A named field with optional description / type / requirement / default (props, args, env vars, ...).
 * @internal
 */
export interface IField {
  /* The field's identifier (prop name, argument name, env var key, ...) */
  name: string;

  /* Human-readable explanation of the field's purpose */
  description?: string;

  /* The field's data type (i.e. `string`, `number`, `boolean`) */
  type?: string;

  /* Whether the field must be provided */
  required?: boolean;

  /* The value used when the field is omitted */
  default?: string;

  /* For emitted events: the shape of the event payload */
  payload?: string;

  /* For slots: the props exposed to the slot's scope */
  props?: string;
}

/**
 * The full input describing one file header. Only the sections that are populated are rendered.
 * @internal
 */
export interface IHeaderSpec {
  /* Path or name of the file the header describes */
  file: string;

  /* Short summary of what the file does */
  description: string;

  /* The kind of file, used to decide which sections apply; one of {@link TFileType} */
  kind?: TFileType;

  /* The comment style to render the header in; one of {@link TCommentStyle} */
  comment?: TCommentStyle;

  /* Usage snippet demonstrating how to invoke or import the file */
  usage?: string;

  /* Related files or symbols worth cross-referencing */
  see?: string[];

  /* Component props exposed by the file */
  props?: IField[];

  /* `v-model` bindings exposed by the component */
  model?: IField[];

  /* Events emitted by the component */
  emits?: IField[];

  /* Named slots exposed by the component */
  slots?: IField[];

  /* Members exposed via `defineExpose` / a component instance */
  exposed?: IField[];

  /* Positional command-line arguments accepted by the script */
  arguments?: IField[];

  /* Named command-line options/flags accepted by the script */
  options?: IField[];

  /* Environment variables the file reads */
  env?: IField[];

  /* For API handlers: the authentication/authorization requirements */
  auth?: string[];

  /* For API handlers: the route parameters */
  params?: IField[];

  /* For API handlers: the query-string parameters */
  query?: IField[];

  /* For API handlers: the request-body fields */
  body?: IField[];

  /* For API handlers: the error responses (status code plus the condition that produces it) */
  throws?: string[];

  /* Description of the file's return value(s) */
  returns?: string[];

  /* Notable side effects the file performs (I/O, mutations, ...) */
  sideEffects?: string[];

  /* Illustrative usage examples */
  examples?: string[];

  /* Public exports provided by the module */
  exports?: IField[];
}

/**
 * An ordered list of `[attribute, label]` pairs selecting which {@link IField} attributes to render, and the label to
 * print for each.
 * @internal
 */
export type TFieldKeyLabels = ReadonlyArray<readonly [keyof IField, string]>;

/**
 * A single header section: a title plus a resolver that produces the section's lines from a spec, or `undefined` when
 * the spec has nothing to render for it (in which case the section is omitted).
 * @internal
 */
export interface ISection {
  /* The section title, shown in its divider (i.e. `USAGE`, `PROPS`) */
  title: string;

  /* Resolve the section's rendered lines for a spec, or `undefined` to omit the section */
  getLines: (spec: IHeaderSpec) => string[] | undefined;
}

/**
 * The parsed command-line flag values produced by `parseArgs` for the generator CLI.
 * @public
 * @interface
 */
export interface ICliValues {
  /* `--file` / `-f`: the banner filename to document */
  file?: string;

  /* `--description` / `-d`: the one-line file description */
  description?: string;

  /* `--kind`: override for the file type that decides which sections apply */
  kind?: string;

  /* `--comment`: override for the comment style to render the header in */
  comment?: string;

  /* `--usage`: the USAGE section body */
  usage?: string;

  /* `--see`: cross-reference links (repeatable) */
  see?: string[];

  /* `--spec`: a JSON spec path or inline JSON supplying the structured sections */
  spec?: string;

  /* `--write`: write the header into the file instead of printing it */
  write?: boolean;

  /* `--config`: an explicit path to the header config */
  config?: string;

  /* `--project` / `-p`: the text to render as a banner (banner command) */
  project?: string;

  /* `--font`: the figlet font used to render the banner (banner command) */
  font?: string;

  /* `--list-fonts`: list the available figlet fonts (banner command) */
  'list-fonts'?: boolean;

  /* `--save`: save the rendered banner into the config (banner command) */
  save?: boolean;

  /* `--help` / `-h`: print usage and exit */
  help?: boolean;
}
