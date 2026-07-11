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
 * █████████████████████████████████████████ src/test-utils/file-name.test.ts ██████████████████████████████████████████
 *
 * Unit tests for getTestFileName: Nuxt alias mapping, src-relative library paths, and the .test marker strip.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { getTestFileName } from './file-name';
import { symbolName } from './symbol';

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(getTestFileName), (): void => {
    it('aliases an app composable test to its #composables source path', (): void => {
      expect(getTestFileName('file:///repo/app/composables/use-x/utils.test.ts')).toBe('#composables/use-x/utils.ts');
    });

    it('keeps the server root prefix for server sources', (): void => {
      expect(getTestFileName('file:///repo/server/utils/tcx/utils.test.ts')).toBe('#server/utils/tcx/utils.ts');
    });

    it('keeps the shared root prefix for shared sources', (): void => {
      expect(getTestFileName('file:///repo/shared/utils/units/utils.test.ts')).toBe('#shared/utils/units/utils.ts');
    });

    it('keeps the repo-relative src path for a plain library', (): void => {
      expect(getTestFileName('file:///repo/src/test-utils/symbol.test.ts')).toBe('src/test-utils/symbol.ts');
    });

    it('strips only the .test marker and preserves the extension', (): void => {
      expect(getTestFileName('file:///repo/app/utils/foo/utils.test.ts')).toBe('#utils/foo/utils.ts');
    });

    it('returns the stripped url when the path sits outside the known roots', (): void => {
      expect(getTestFileName('file:///repo/scripts/thing.test.ts')).toBe('file:///repo/scripts/thing.ts');
    });
  });
});
