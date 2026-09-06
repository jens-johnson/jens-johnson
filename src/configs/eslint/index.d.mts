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
 * ██████████████████████████████████████████ src/configs/eslint/index.d.mts ███████████████████████████████████████████
 *
 * Type declarations for the shared ESLint flat-config factory, so TypeScript consumers and the in-band tests import it
 * typed.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { Linter } from 'eslint';

/**
 * A `no-restricted-syntax` entry: an ESQuery selector and the message reported where it matches.
 * @public
 * @interface
 */
export interface IRestrictedSyntaxSelector {
  /* The message reported at each match */
  message: string;

  /* The ESQuery selector to match */
  selector: string;
}

/**
 * Selectors rejecting an arrow function assigned at module or `<script setup>` scope.
 * @public
 * @constant
 */
export const SCRIPT_SCOPE_ARROW_SELECTORS: readonly IRestrictedSyntaxSelector[];

/**
 * Selectors keeping type declarations and every inline type literal out of a single-file component.
 * @public
 * @constant
 */
export const SFC_MODULE_SELECTORS: readonly IRestrictedSyntaxSelector[];

/**
 * Builds the shared ESLint flat config with the ESLint and typescript-eslint recommended cores.
 * @public
 * @function
 * @param overrides - Additional flat-config blocks appended after the shared blocks
 * @returns The composed flat-config array
 */
export function createEslintConfig(...overrides: Linter.Config[]): Linter.Config[];

/**
 * Builds the style-guide blocks for framework consumers whose base already provides the cores and parser.
 * @public
 * @function
 * @param overrides - Additional flat-config blocks appended after the shared blocks
 * @returns The composed flat-config array, without the recommended cores
 */
export function createFrameworkEslintConfig(...overrides: Linter.Config[]): Linter.Config[];

/**
 * The shared ESLint flat config with no repo-specific overrides.
 * @public
 * @default
 * @constant
 */
declare const defaultConfig: Linter.Config[];

export default defaultConfig;
