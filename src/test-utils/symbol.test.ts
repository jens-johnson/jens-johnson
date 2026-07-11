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
 * ███████████████████████████████████████████ src/test-utils/symbol.test.ts ███████████████████████████████████████████
 *
 * Unit tests for the symbol metadata registry: registration, name fallback chain, and description resolution.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { getTestFileName } from './file-name';
import { defineSymbol, symbolDescription, symbolName } from './symbol';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The readable name registered on the sample symbols under test
 * @internal
 * @constant
 */
const SAMPLE_NAME: string = 'Sample Symbol';

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(defineSymbol), (): void => {
    it('registers a readable name that symbolName resolves', (): void => {
      // Each case owns a fresh function so registrations never leak across tests through the WeakMap
      const sample: () => void = (): void => {};
      defineSymbol(sample, { name: SAMPLE_NAME });
      expect(symbolName(sample)).toBe(SAMPLE_NAME);
    });

    it('returns the same symbol reference it was handed', (): void => {
      const sample: () => void = (): void => {};
      expect(defineSymbol(sample, { name: SAMPLE_NAME })).toBe(sample);
    });
  });

  describe(symbolName(symbolName), (): void => {
    it('falls back to the intrinsic function name when unregistered', (): void => {
      const namedSample: () => void = (): void => {};
      expect(symbolName(namedSample)).toBe('namedSample');
    });

    it('falls back to "anonymous" when there is no name at all', (): void => {
      expect(symbolName({})).toBe('anonymous');
    });
  });

  describe(symbolName(symbolDescription), (): void => {
    it('resolves a registered description', (): void => {
      const sample: () => void = (): void => {};
      defineSymbol(sample, { name: SAMPLE_NAME, description: 'Does a sample thing.' });
      expect(symbolDescription(sample)).toBe('Does a sample thing.');
    });

    it('resolves undefined when no description was registered', (): void => {
      const sample: () => void = (): void => {};
      defineSymbol(sample, { name: SAMPLE_NAME });
      expect(symbolDescription(sample)).toBeUndefined();
    });
  });
});
