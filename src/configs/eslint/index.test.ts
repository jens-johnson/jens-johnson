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
 * █████████████████████████████████████████ src/configs/eslint/index.test.ts ██████████████████████████████████████████
 *
 * Unit tests for the shared ESLint config: the JSDoc description requirement, the script-scope arrow ban, and the
 * single-file component module blocks under a real Vue parser.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { fileURLToPath } from 'node:url';

import type { Linter } from 'eslint';
import { ESLint } from 'eslint';
import eslintPluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import vueParser from 'vue-eslint-parser';

import { createEslintConfig, createFrameworkEslintConfig } from './index.mjs';

/* ─── Fixtures ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The repository root, used as the linter's working directory so the config's `files` globs resolve as they would
 * in a consumer.
 * @internal
 * @constant
 */
const REPOSITORY_ROOT: string = fileURLToPath(new URL('../../..', import.meta.url));

/**
 * The shared config with the recommended cores, as a plain-TypeScript consumer receives it.
 * @internal
 * @constant
 */
const baseConfig: Linter.Config[] = createEslintConfig();

/**
 * The framework config under a minimal Vue base: the parser and the plugin registrations that `@nuxt/eslint` would
 * otherwise supply, so the `.vue` blocks run against a real single-file component parse.
 * @internal
 * @constant
 */
const frameworkConfig: Linter.Config[] = [
  {
    files: ['**/*.vue'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      vue: eslintPluginVue,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  ...createFrameworkEslintConfig(),
];

/**
 * A documented interface followed by the same interface with an empty JSDoc block.
 * @internal
 * @constant
 */
const interfaceFixture: string = `/**
 * A described example.
 * @public
 * @interface
 */
export interface IDescribed {
  /* The identifier */
  id: string;
}

/**
 * @public
 * @interface
 */
export interface IUndescribed {
  /* The identifier */
  id: string;
}
`;

/**
 * Arrow functions at module scope, both exported and local, which the guide requires as declarations.
 * @internal
 * @constant
 */
const scriptScopeArrowFixture: string = `export const renderExported = (): string => 'exported';
const renderLocal = (): string => 'local';
`;

/**
 * Arrows in their permitted positions: a closure inside a function body and a callback argument.
 * @internal
 * @constant
 */
const permittedArrowFixture: string = `/**
 * Upper-cases every item.
 * @public
 * @function
 * @param items - The items to transform
 * @returns The transformed items
 */
export function shoutAll(items: string[]): string[] {
  const shout = (item: string): string => item.toUpperCase();
  return items.map((item: string): string => shout(item));
}
`;

/**
 * A component declaring its types inline: declarations, define-macro literals, a literal nested in a utility type,
 * and a literal annotating a variable.
 * @internal
 * @constant
 */
const inlineTypesComponentFixture: string = `<script setup lang="ts">
interface IInline {
  id: string;
}
type TInline = 'a' | 'b';
enum Inline {
  a = 'a',
}
const props = defineProps<{ id: string }>();
const emit = defineEmits<{ select: [id: string] }>();
const slots = defineSlots<{ default(): unknown }>();
const model = defineModel<Readonly<{ value: string }>>();
const label: { text: string } = { text: props.id };
</script>

<template>
  <div>{{ props.id }}</div>
</template>
`;

/**
 * A component importing its contract from the co-located module, using a primitive model generic and a named type
 * on a local annotation.
 * @internal
 * @constant
 */
const moduleTypesComponentFixture: string = `<script setup lang="ts">
import type { ICardEmits, ICardLabel, ICardProps } from './types';

const props = defineProps<ICardProps>();
const emit = defineEmits<ICardEmits>();
const model = defineModel<string>();
const label: ICardLabel = { text: props.id };
</script>

<template>
  <div>{{ label.text }}</div>
</template>
`;

/**
 * A component assigning an arrow at script scope, which the SFC block must still reject.
 * @internal
 * @constant
 */
const scriptScopeArrowComponentFixture: string = `<script setup lang="ts">
const onSelect = (): void => {};
</script>

<template>
  <button @click="onSelect">Select</button>
</template>
`;

/**
 * The rule id both restriction blocks report under.
 * @internal
 * @constant
 */
const RESTRICTED_SYNTAX_RULE: string = 'no-restricted-syntax';

/* ─── Helpers ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Lints one source string under a config and returns the messages reported for a single rule.
 * @internal
 * @function
 * @param config - The flat config to lint with
 * @param code - The source text to lint
 * @param filePath - The path the source is linted as, relative to the repository root
 * @param ruleId - The rule whose messages are returned
 * @returns The messages for `ruleId`, in source order
 * @throws If the source fails to parse under the config
 */
async function lintForRule(
  config: Linter.Config[],
  code: string,
  filePath: string,
  ruleId: string,
): Promise<Linter.LintMessage[]> {
  // Lint the text as if it were a file in the repository, ignoring any config file on disk
  const eslint: ESLint = new ESLint({
    cwd: REPOSITORY_ROOT,
    overrideConfigFile: true,
    overrideConfig: config,
  });
  const [result]: ESLint.LintResult[] = await eslint.lintText(code, { filePath });
  const messages: Linter.LintMessage[] = result?.messages ?? [];

  // A parse failure would silently hide every rule under test
  const fatal: Linter.LintMessage | undefined = messages.find((message: Linter.LintMessage): boolean =>
    Boolean(message.fatal),
  );
  if (fatal) {
    throw new Error(`Fixture failed to parse: ${fatal.message}`);
  }

  return messages.filter((message: Linter.LintMessage): boolean => message.ruleId === ruleId);
}

/* ─── Tests ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe('createEslintConfig', () => {
  it('requires a description on every JSDoc block, not only on functions', async (): Promise<void> => {
    const messages: Linter.LintMessage[] = await lintForRule(
      baseConfig,
      interfaceFixture,
      'src/fixture.ts',
      'jsdoc/require-description',
    );

    // Only the undescribed interface is reported, anchored on its JSDoc block
    expect(messages.map((message: Linter.LintMessage): number => message.line)).toEqual([11]);
  });

  it('rejects arrow functions assigned at module scope', async (): Promise<void> => {
    const messages: Linter.LintMessage[] = await lintForRule(
      baseConfig,
      scriptScopeArrowFixture,
      'src/fixture.ts',
      RESTRICTED_SYNTAX_RULE,
    );

    // The exported and the local arrow are both reported
    expect(messages.map((message: Linter.LintMessage): number => message.line)).toEqual([1, 2]);
  });

  it('allows arrows as closures inside function bodies and as callback arguments', async (): Promise<void> => {
    const messages: Linter.LintMessage[] = await lintForRule(
      baseConfig,
      permittedArrowFixture,
      'src/fixture.ts',
      RESTRICTED_SYNTAX_RULE,
    );

    expect(messages).toEqual([]);
  });
});

describe('createFrameworkEslintConfig', () => {
  it('rejects type declarations and every inline type literal inside a single-file component', async (): Promise<void> => {
    const messages: Linter.LintMessage[] = await lintForRule(
      frameworkConfig,
      inlineTypesComponentFixture,
      'src/fixture.vue',
      RESTRICTED_SYNTAX_RULE,
    );

    // The interface, type alias, enum, four macro literals (one nested in Readonly), and the annotation literal
    expect(messages.map((message: Linter.LintMessage): number => message.line)).toEqual([2, 5, 6, 9, 10, 11, 12, 13]);
  });

  it('accepts named contract types and primitive macro generics inside a single-file component', async (): Promise<void> => {
    const messages: Linter.LintMessage[] = await lintForRule(
      frameworkConfig,
      moduleTypesComponentFixture,
      'src/fixture.vue',
      RESTRICTED_SYNTAX_RULE,
    );

    // Named types and a primitive model generic are legal
    expect(messages).toEqual([]);
  });

  it('keeps the script-scope arrow ban active inside a single-file component', async (): Promise<void> => {
    const messages: Linter.LintMessage[] = await lintForRule(
      frameworkConfig,
      scriptScopeArrowComponentFixture,
      'src/fixture.vue',
      RESTRICTED_SYNTAX_RULE,
    );

    expect(messages.map((message: Linter.LintMessage): number => message.line)).toEqual([2]);
  });
});
