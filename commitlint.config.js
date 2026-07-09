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
 * ███████████████████████████████████████████████ commitlint.config.js ████████████████████████████████████████████████
 *
 * This repo's commitlint config; the shared factory plus the repo scope enum.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { createCommitlintConfig } from './src/configs/commitlint/index.mjs';

/**
 * This repo's commitlint config: the shared baseline with the repo scope enum.
 * @public
 * @default
 * @constant
 */
export default createCommitlintConfig({
  scopes: ['style-guide', 'file-header', 'configs', 'docs', 'deps', 'ci', 'release', 'repo'],
});
