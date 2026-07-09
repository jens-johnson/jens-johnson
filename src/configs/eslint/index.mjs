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
 * ███████████████████████████████████████████ src/configs/eslint/index.mjs ████████████████████████████████████████████
 *
 * Shareable ESLint flat-config factory implementing the style guide; consumed as `@jens-johnson/style-guide/eslint`
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • https://eslint.org/docs/latest/use/configure/configuration-files
 *   • https://typescript-eslint.io/packages/typescript-eslint#config
 *   • docs/style-guide/conventions/tooling.md
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import eslintPluginJs from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import { importX as importXPlugin } from 'eslint-plugin-import-x';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Builds the shared ESLint flat config: framework-agnostic base rules implementing the style guide, with
 * `eslint-config-prettier` neutralizing formatting conflicts and the layout-hardening block re-enabled after it.
 * @public
 * @function
 * @param {...object} overrides - Additional flat-config blocks appended after the shared blocks (repo-specific
 *   rules/ignores); each is a standard ESLint flat-config object (`{ name, files, ignores, rules, ... }`)
 * @returns {object[]} The composed flat-config array
 * @see {@link https://github.com/jens-johnson/jens-johnson/blob/main/docs/style-guide/conventions/tooling.md}
 */
export function createEslintConfig(...overrides) {
  // noinspection JSCheckFunctionSignatures
  return tseslint.config(
    /**
     * ═══ Baseline Ignores ════════════════════════════════════════════════════════════════════════════════════════════
     *
     * Automatically ignore node modules, compiled typescript, test coverage, and standard build output
     */
    {
      name: '@jens-johnson/style-guide/ignores',
      ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.nuxt/**', '.output/**'],
    },

    /**
     * ═══ Recommended Cores ═══════════════════════════════════════════════════════════════════════════════════════════
     *
     * ESLint + typescript-eslint (non-type aware for light consumption)
     */
    eslintPluginJs.configs.recommended,
    ...tseslint.configs.recommended,

    /**
     * ═══ Global Language Options ═════════════════════════════════════════════════════════════════════════════════════
     *
     * Bundle Node + ES 2022 globals by default
     */
    {
      name: '@jens-johnson/style-guide/globals',
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.es2022,
        },
      },
    },

    /**
     * ═══ Import Hygiene ══════════════════════════════════════════════════════════════════════════════════════════════
     *
     * Use deterministic group ordering, disallow duplicates, no self-imports
     */
    {
      name: '@jens-johnson/style-guide/imports',
      plugins: {
        'import-x': importXPlugin,
        'simple-import-sort': simpleImportSortPlugin,
      },
      rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import-x/no-duplicates': 'error',
        'import-x/no-self-import': 'error',
      },
    },

    /**
     * ═══ Type Naming ═════════════════════════════════════════════════════════════════════════════════════════════════
     *
     * Enforce the pattern of I<Interface> and T<Type> naming where applicable
     */
    {
      name: '@jens-johnson/style-guide/type-naming',
      files: ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx', '**/*.vue'],
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'interface',
            format: ['PascalCase'],
            prefix: ['I'],
            filter: { regex: '^Props$', match: false },
          },
          {
            selector: 'typeAlias',
            format: ['PascalCase'],
            prefix: ['T'],
          },
        ],
      },
    },

    /**
     * ═══ Type Naming Module Augmentation Exemption ═══════════════════════════════════════════════════════════════════
     *
     * A "module augmentation" is a `declare module 'some-lib'` block that merges additional typings into an external
     * library. TypeScript merges declarations by NAME, so an augmenting interface must exactly match the library's
     * own interface name (i.e. `User` / `UserSession` when augmenting `#auth-utils`); prefixing it `IUser` would
     * declare a new type instead of merging. Augmentations live in `.d.ts` declaration files, so the I/T naming rule
     * is dropped for those files wholesale.
     */
    {
      name: '@jens-johnson/style-guide/type-naming-augmentation-exemption',
      files: ['**/*.d.ts'],
      rules: { '@typescript-eslint/naming-convention': 'off' },
    },

    /**
     * ═══ JSDoc ═══════════════════════════════════════════════════════════════════════════════════════════════════════
     *
     * JSDoc settings and configurations
     */
    {
      name: '@jens-johnson/style-guide/jsdoc',
      plugins: { jsdoc: jsdocPlugin },
      rules: {
        'jsdoc/require-jsdoc': [
          'warn',
          {
            require: {
              FunctionDeclaration: true,
              ClassDeclaration: true,
            },
            contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration'],
          },
        ],
        'jsdoc/require-description': 'warn',
      },
    },

    /**
     * ═══ JSDoc • No Types (TS-Only) ══════════════════════════════════════════════════════════════════════════════════
     *
     * TS signatures own the types, so this configuration disables JSDoc type braces for those files
     */
    {
      name: '@jens-johnson/style-guide/jsdoc-no-types-ts-only',
      files: ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx', '**/*.vue'],
      plugins: { jsdoc: jsdocPlugin },
      rules: {
        'jsdoc/no-types': 'error',
      },
    },

    /**
     * ═══ SonarJS ═════════════════════════════════════════════════════════════════════════════════════════════════════
     *
     * Code correctness and quality; mirrors SonarQube quality checks
     */
    {
      name: '@jens-johnson/style-guide/sonarjs',
      plugins: { sonarjs: sonarjsPlugin },
      rules: {
        'sonarjs/cognitive-complexity': ['warn', 15],
        'sonarjs/no-identical-functions': 'warn',
        'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
      },
    },

    /**
     * ═══ General ═════════════════════════════════════════════════════════════════════════════════════════════════════
     *
     * General best-practice rules
     */
    {
      name: '@jens-johnson/style-guide/general',
      rules: {
        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
        'no-var': 'error',
        'prefer-const': 'error',
        'object-shorthand': 'error',
        'no-debugger': 'error',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },

    /**
     * ═══ CLI • Console Exemption ═════════════════════════════════════════════════════════════════════════════════════
     *
     * Allow CLIs to print payload to stdout
     */
    {
      name: '@jens-johnson/style-guide/cli-console-exemption',
      files: ['bin/**', '**/cli.ts', '**/cli.mjs'],
      rules: { 'no-console': 'off' },
    },

    /**
     * ═══ Constants • Duplication Exemption ═══════════════════════════════════════════════════════════════════════════
     *
     * Constants modules are declarative registries where literal repetition is the point, not duplication
     */
    {
      name: '@jens-johnson/style-guide/constants-duplication-exemption',
      files: ['**/constants.ts', '**/constants.mjs'],
      rules: { 'sonarjs/no-duplicate-string': 'off' },
    },

    /**
     * ═══ Prettier ════════════════════════════════════════════════════════════════════════════════════════════════════
     *
     * Bake in the prettier config; MUST precede the layout-hardening block below
     */
    prettierConfig,

    /**
     * ═══ Layout Hardening ════════════════════════════════════════════════════════════════════════════════════════════
     *
     * The object member-count threshold, re-enabled after prettierConfig. Deliberately objects-only: Prettier preserves
     * multiline breaks inside object braces but always collapses imports and function params/args that fit the print
     * width, so enforcing those would fight the formatter. `consistent: true` lets sub-threshold objects that Prettier
     * width-breaks keep their newlines.
     */
    {
      name: '@jens-johnson/style-guide/layout',
      plugins: { '@stylistic': stylisticPlugin },
      rules: {
        '@stylistic/object-curly-newline': [
          'error',
          {
            ObjectExpression: {
              multiline: true,
              consistent: true,
              minProperties: 3,
            },
          },
        ],
        '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      },
    },

    /**
     * ═══ Overrides ═══════════════════════════════════════════════════════════════════════════════════════════════════
     *
     * Pass repo-specific overrides last so they win
     */
    ...overrides,
  );
}

/**
 * The shared ESLint flat config with no repo-specific overrides.
 * @public
 * @default
 * @constant
 */
export default createEslintConfig();
