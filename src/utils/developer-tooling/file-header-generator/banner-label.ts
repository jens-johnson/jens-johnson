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
 * █████████████████████████ src/utils/developer-tooling/file-header-generator/banner-label.ts █████████████████████████
 *
 * Resolves a repository path to its file-header banner label, shared by the generator and the test-file-name resolver.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * Resolves a repository path to the banner label mandated by the file-header convention, so the generator and the
 * test-file-name resolver produce identical labels for the same source file. A Nuxt app root (`app/`) collapses to its
 * alias segment (`app/composables/use-x` becomes `#composables/use-x`), `server/` and `shared/` keep their root behind
 * the alias marker (`#server/…`, `#shared/…`), and a plain library keeps its repo-relative `src/…` path. Any path
 * outside these roots is returned unchanged.
 * @public
 * @function
 * @param sourcePath - A repo-relative path (`server/utils/foo.ts`) or a fuller path/URL that contains one of the roots
 * @returns The banner label for the path, or the path unchanged when it sits outside the known roots
 */
export function toBannerLabel(sourcePath: string): string {
  // Nuxt app roots map to the alias-prefixed banner label: `app/*` drops its root, `server`/`shared` keep theirs
  const nuxtRoot: RegExpMatchArray | null = sourcePath.match(/(?:^|\/)(app|server|shared)\/(.+)$/);
  if (nuxtRoot) {
    const [, root, rest]: RegExpMatchArray = nuxtRoot;
    return root === 'app' ? `#${rest}` : `#${root}/${rest}`;
  }

  // A plain library keeps its repo-relative `src/…` path, matching its raw-path banner convention
  const srcRoot: RegExpMatchArray | null = sourcePath.match(/(?:^|\/)(src\/.+)$/);
  if (srcRoot) {
    return srcRoot[1] ?? sourcePath;
  }

  // Everything else keeps its raw path
  return sourcePath;
}
