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
 * █████████████████████████████████████████████████ eslint.config.js ██████████████████████████████████████████████████
 *
 * This repo's ESLint config; consumes the shared style-guide factory with repo-specific ignores.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { createEslintConfig } from './src/configs/eslint/index.mjs';

/**
 * This repo's ESLint config: the shared style-guide baseline plus repo-specific ignores.
 * @public
 * @default
 * @constant
 */
export default createEslintConfig(
  {
    name: 'style-guide-repo/ignores',
    ignores: ['docs/**', 'README.md'],
  },

  // The generator's CLI command layer (payload prints) lives in the module's utils.ts
  {
    name: 'style-guide-repo/cli-module-console',
    files: ['src/utils/developer-tooling/file-header-generator/utils.ts'],
    rules: { 'no-console': 'off' },
  },
);
