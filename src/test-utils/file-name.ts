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
 * ████████████████████████████████████████████ src/test-utils/file-name.ts ████████████████████████████████████████████
 *
 * getTestFileName resolves a co-located test's URL to its source module's file-header banner label for describe titles.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * Resolves a co-located test file's URL to the label of the source file it exercises, matching that repo's
 * [file-header](../../docs/style-guide/conventions/file-headers.md) banner convention: Nuxt app roots become the
 * alias-prefixed form (`#composables/use-x/utils.ts`), while a plain `src/`-rooted library keeps the repo-relative
 * path (`src/test-utils/symbol.ts`). Unit suites pass `import.meta.url` and use the result to title the outermost
 * `describe` block, so the suite tree mirrors the module layout
 * @public
 * @function
 * @param testFileUrl - The test file's `import.meta.url`
 * @returns The source file's banner label, or the stripped URL when the path sits outside the known roots
 */
export function getTestFileName(testFileUrl: string): string {
  // Drop the `.test` marker so the label points at the source module the suite exercises
  const sourceUrl: string = testFileUrl.replace(/\.test(\.[cm]?[jt]s)$/, '$1');

  // Nuxt app roots map to the alias-prefixed banner label (app/* drops its root; server/shared keep theirs)
  const nuxtRoot: RegExpMatchArray | null = sourceUrl.match(/\/(app|server|shared)\/(.+)$/);
  if (nuxtRoot) {
    const [, root, rest]: RegExpMatchArray = nuxtRoot;
    return root === 'app' ? `#${rest}` : `#${root}/${rest}`;
  }

  // A plain library keeps the repo-relative `src/...` path, matching its raw-path banner convention
  const srcRoot: RegExpMatchArray | null = sourceUrl.match(/\/(src\/.+)$/);
  if (srcRoot) {
    const [, srcPath]: RegExpMatchArray = srcRoot;
    return srcPath ?? sourceUrl;
  }

  return sourceUrl;
}
