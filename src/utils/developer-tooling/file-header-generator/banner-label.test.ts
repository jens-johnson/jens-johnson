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
 * ██████████████████████ src/utils/developer-tooling/file-header-generator/banner-label.test.ts ███████████████████████
 *
 * Unit tests for toBannerLabel: Nuxt app/server/shared alias mapping, src-relative library paths, and idempotency.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { toBannerLabel } from './banner-label';

/* ─── toBannerLabel ──────────────────────────────────────────────────────────────────────────────────────────────── */

describe('toBannerLabel', () => {
  it('drops the app root and prefixes the alias marker for a Nuxt app path', () => {
    expect(toBannerLabel('app/types/services/enums.ts')).toBe('#types/services/enums.ts');
  });

  it('aliases each Nuxt app subtree to its bare segment', () => {
    expect(toBannerLabel('app/components/containment/card/enums.ts')).toBe('#components/containment/card/enums.ts');
    expect(toBannerLabel('app/composables/use-theme/enums.ts')).toBe('#composables/use-theme/enums.ts');
    expect(toBannerLabel('app/pages/index.vue')).toBe('#pages/index.vue');
    expect(toBannerLabel('app/layouts/default.vue')).toBe('#layouts/default.vue');
    expect(toBannerLabel('app/utils/foo.ts')).toBe('#utils/foo.ts');
  });

  it('keeps the server root behind the alias marker', () => {
    expect(toBannerLabel('server/utils/auth/types.ts')).toBe('#server/utils/auth/types.ts');
  });

  it('keeps the shared root behind the alias marker', () => {
    expect(toBannerLabel('shared/utils/symbol/index.ts')).toBe('#shared/utils/symbol/index.ts');
  });

  it('keeps a plain library src path unchanged', () => {
    expect(toBannerLabel('src/utils/developer-tooling/file-header-generator/utils.ts')).toBe(
      'src/utils/developer-tooling/file-header-generator/utils.ts',
    );
  });

  it('maps a root found inside a fuller path or file url', () => {
    expect(toBannerLabel('file:///repo/app/composables/use-x/utils.ts')).toBe('#composables/use-x/utils.ts');
    expect(toBannerLabel('/Users/me/proj/server/utils/foo.ts')).toBe('#server/utils/foo.ts');
  });

  it('leaves an already-aliased label unchanged, so re-running the generator is idempotent', () => {
    expect(toBannerLabel('#server/utils/foo.ts')).toBe('#server/utils/foo.ts');
    expect(toBannerLabel('#components/data/chip.vue')).toBe('#components/data/chip.vue');
  });

  it('returns a path outside the known roots unchanged', () => {
    expect(toBannerLabel('bin/deploy.sh')).toBe('bin/deploy.sh');
    expect(toBannerLabel('.editorconfig')).toBe('.editorconfig');
  });
});
