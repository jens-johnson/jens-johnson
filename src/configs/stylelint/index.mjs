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
 * ██████████████████████████████████████████ src/configs/stylelint/index.mjs ██████████████████████████████████████████
 *
 * Shareable Stylelint config (standard + Vue bases + the Tailwind v4 directive whitelist); consumed as
 * `@jens-johnson/style-guide/stylelint`
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The shared Stylelint config: standard + Vue bases with the Tailwind v4 directive whitelist.
 * @public
 * @default
 * @constant
 * @see {@link https://github.com/jens-johnson/jens-johnson/blob/main/docs/style-guide/conventions/css-and-styling.md}
 */
export default {
  /* Extend the standard stylelint config + recommended vue rules */
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],

  /* Stylelint rules */
  rules: {
    /* Tailwind v4 directives are not unknown at-rules */
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'screen',
          'variants',
          'responsive',
          'theme',
          'utility',
          'custom-variant',
          'reference',
        ],
      },
    ],
  },

  /* Ignore Nuxt/build output by default */
  ignoreFiles: ['.nuxt/**', '.output/**', 'node_modules/**', 'dist/**', 'coverage/**'],
};
