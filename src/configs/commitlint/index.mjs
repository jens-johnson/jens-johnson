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
 * █████████████████████████████████████████ src/configs/commitlint/index.mjs ██████████████████████████████████████████
 *
 * Shareable commitlint config factory (Conventional Commits, kebab-case scopes, lowercase subjects); consumed as
 * @jens-johnson/style-guide/commitlint.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * Builds the shared commitlint config: Conventional Commits with kebab-case scopes and lowercase subjects, plus an
 * optional per-repo scope enum.
 * @public
 * @function
 * @param {object} [options] - The per-repo configuration
 * @param {string[]} [options.scopes] - The allowed commit scopes, i.e. the `scope` in `type(scope): subject`
 * (i.e. `['docs', 'ci', 'deps']`); when omitted, any scope is accepted
 * @returns {object} The commitlint configuration object
 * @see {@link https://github.com/jens-johnson/jens-johnson/blob/main/docs/style-guide/conventions/git-workflow.md}
 */
export function createCommitlintConfig(options = {}) {
  // Destructure the options with their defaults
  const { scopes = [] } = options;

  return {
    extends: ['@commitlint/config-conventional'],
    rules: {
      /* Restrict scopes to the repo's enum when one is provided */
      ...(scopes.length ? { 'scope-enum': [2, 'always', scopes] } : {}),

      /* Scopes are kebab-case */
      'scope-case': [2, 'always', 'kebab-case'],

      /* Subjects are lowercase; rewrite symbols into plain english */
      'subject-case': [2, 'always', 'lower-case'],

      /* Keep body lines readable */
      'body-max-line-length': [1, 'always', 100],
    },
  };
}

/**
 * The shared commitlint config with no scope enum (any scope accepted).
 * @public
 * @default
 * @constant
 */
export default createCommitlintConfig();
