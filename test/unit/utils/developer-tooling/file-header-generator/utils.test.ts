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
 * ███████████████████████ test/unit/utils/developer-tooling/file-header-generator/utils.test.ts ███████████████████████
 *
 * Unit tests for the file-header generator's pure cores: width math, banner geometry, section rendering, detection,
 * assembly, and write-mode header replacement.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import type { IHeaderConfig, IHeaderSpec } from '../../../../../src/utils/developer-tooling/file-header-generator';
import {
  applyCommentStyle,
  ARG_KEYS,
  buildHeaderContent,
  centerBanner,
  CommentStyle,
  createSectionDivider,
  detectCommentStyle,
  detectFileType,
  fileNameBar,
  FileType,
  MAX_INNER_CONTENT_LENGTH,
  normalizeStringLength,
  removeExistingHeader,
  renderEntries,
  renderHeader,
  renderList,
  renderNamed,
  stripCommonIndent,
  wrap,
  writeHeaderToFile,
} from '../../../../../src/utils/developer-tooling/file-header-generator';

/* ─── Fixtures ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/* A minimal header config with a tiny two-line banner, so geometry assertions stay hand-checkable */
const config: IHeaderConfig = {
  projectName: 'test-project',
  width: 120,
  banner: ['██', '████'],
};

/* A representative library-module path, shared by the spec fixture and the detection tests */
const moduleFilePath: string = 'src/example.ts';

/* The smallest valid spec: a file and a description, nothing else populated */
const minimalSpec: IHeaderSpec = {
  file: moduleFilePath,
  description: 'A minimal example file.',
};

/* A full-width separator of block characters, as rendered at a header's boundaries */
const separator: string = '█'.repeat(MAX_INNER_CONTENT_LENGTH);

/* A temp directory for the write-mode tests, removed after the suite */
const scratchDirectory: string = mkdtempSync(join(tmpdir(), 'file-header-generator-'));

afterAll((): void => {
  rmSync(scratchDirectory, { recursive: true, force: true });
});

/* ─── Width helpers ──────────────────────────────────────────────────────────────────────────────────────────────── */

describe('normalizeStringLength', () => {
  it('measures plain ascii strings by character count', () => {
    expect(normalizeStringLength('abc')).toBe(3);
    expect(normalizeStringLength('')).toBe(0);
  });

  it('counts astral characters such as emoji as a single glyph', () => {
    // '🐚' is two UTF-16 code units but one code point; .length would report 4 here
    expect(normalizeStringLength('🐚🐚')).toBe(2);
  });
});

describe('wrap', () => {
  it('passes through lines that already fit the width', () => {
    expect(wrap('short line', 20)).toEqual(['short line']);
  });

  it('greedily wraps words, flushing each line before it exceeds the width', () => {
    expect(wrap('aaa bbb ccc ddd', 7)).toEqual(['aaa bbb', 'ccc ddd']);
  });

  it('treats existing newlines as hard breaks and preserves blank lines', () => {
    expect(wrap('one\n\ntwo', 20)).toEqual(['one', '', 'two']);
  });

  it('keeps a single unbreakable word intact rather than splitting it mid-word', () => {
    expect(wrap('abcdefghijk', 5)).toEqual(['abcdefghijk']);
  });

  it('preserves a paragraph leading indent on every wrapped line', () => {
    expect(wrap('  aaa bbb ccc', 7)).toEqual(['  aaa', '  bbb', '  ccc']);
  });
});

/* ─── Banner + separators ────────────────────────────────────────────────────────────────────────────────────────── */

describe('stripCommonIndent', () => {
  it('removes the smallest shared indent while preserving relative indentation', () => {
    expect(stripCommonIndent(['  a', '    b'])).toEqual(['a', '  b']);
  });

  it('ignores blank lines when measuring the shared indent', () => {
    expect(stripCommonIndent(['', '  a'])).toEqual(['', 'a']);
  });
});

describe('centerBanner', () => {
  it('pads every line with one shared left offset so the block centers as a whole', () => {
    // The widest line is 4 wide; the shared offset is floor((117 - 4) / 2) = 56 spaces
    expect(centerBanner(['██', '████'])).toEqual([`${' '.repeat(56)}██`, `${' '.repeat(56)}████`]);
  });

  it('throws when the widest line exceeds the inner content width', () => {
    expect(() => centerBanner(['█'.repeat(MAX_INNER_CONTENT_LENGTH + 1)])).toThrow(/limit is 117/);
  });
});

describe('fileNameBar', () => {
  it('centers the file name between two runs of block characters totalling the content width', () => {
    // 117 - 2 spaces - 8 name chars = 107 bar chars, split 53 left / 54 right
    expect(fileNameBar('src/x.ts')).toBe(`${'█'.repeat(53)} src/x.ts ${'█'.repeat(54)}`);
    expect(normalizeStringLength(fileNameBar('src/x.ts'))).toBe(MAX_INNER_CONTENT_LENGTH);
  });

  it('throws when the file name cannot fit alongside the bars and padding', () => {
    expect(() => fileNameBar('x'.repeat(MAX_INNER_CONTENT_LENGTH - 5))).toThrow(/too long/);
  });
});

describe('createSectionDivider', () => {
  it('renders the title after three rule characters and pads to the content width', () => {
    const divider: string = createSectionDivider('USAGE');

    expect(divider.startsWith('─── USAGE ')).toBe(true);
    expect(normalizeStringLength(divider)).toBe(MAX_INNER_CONTENT_LENGTH);
  });
});

/* ─── Section rendering ──────────────────────────────────────────────────────────────────────────────────────────── */

describe('renderList', () => {
  it('renders each item as a bullet', () => {
    expect(renderList(['one', 'two'])).toEqual(['  • one', '  • two']);
  });

  it('hang-indents the continuation lines of a wrapped item under its bullet', () => {
    const lines: string[] = renderList(['word '.repeat(30).trim()]);

    expect(lines.length).toBeGreaterThan(1);
    expect(lines[0]).toMatch(/^ {2}• word/);
    expect(lines[1]).toMatch(/^ {4}word/);
  });
});

describe('renderEntries', () => {
  it('renders a field name bullet followed by its populated, labelled attributes in key order', () => {
    const lines: string[] = renderEntries(
      [
        {
          name: '--file',
          description: 'The file',
          type: 'string',
          required: true,
        },
      ],
      ARG_KEYS,
    );

    expect(lines).toEqual(['  • --file', '    - Description: The file', '    - Type: string', '    - Required: true']);
  });

  it('omits attributes that are undefined or empty', () => {
    expect(renderEntries([{ name: '--flag', description: '' }], ARG_KEYS)).toEqual(['  • --flag']);
  });
});

describe('renderNamed', () => {
  it('appends a description after the name when present and renders the bare name otherwise', () => {
    expect(renderNamed([{ name: 'a', description: 'does a' }, { name: 'b' }])).toEqual(['  • a: does a', '  • b']);
  });
});

/* ─── Detection ──────────────────────────────────────────────────────────────────────────────────────────────────── */

describe('detectFileType', () => {
  it('maps extensions to their file types', () => {
    expect(detectFileType(moduleFilePath)).toBe(FileType.module);
    expect(detectFileType('component.vue')).toBe(FileType.vue);
    expect(detectFileType('deploy.sh')).toBe(FileType.script);
    expect(detectFileType('config.yml')).toBe(FileType.config);
    expect(detectFileType('README.md')).toBe(FileType.doc);
    expect(detectFileType('index.html')).toBe(FileType.markup);
  });

  it('reads a .ts file under bin/ or scripts/ as an executable script, not a library module', () => {
    expect(detectFileType('bin/deploy.ts')).toBe(FileType.script);
    expect(detectFileType('scripts/build/run.js')).toBe(FileType.script);
  });

  it('tolerates a leading nuxt alias segment before reading the extension', () => {
    expect(detectFileType('#components/data/chip.vue')).toBe(FileType.vue);
  });

  it('falls back to generic for unknown extensions', () => {
    expect(detectFileType('mystery.xyz')).toBe(FileType.generic);
  });
});

describe('detectCommentStyle', () => {
  it('chooses hash comments for shell, yaml, and known extensionless dotfiles', () => {
    expect(detectCommentStyle('deploy.sh')).toBe(CommentStyle.hash);
    expect(detectCommentStyle('config.yml')).toBe(CommentStyle.hash);
    expect(detectCommentStyle('.envrc')).toBe(CommentStyle.hash);
    expect(detectCommentStyle('.editorconfig')).toBe(CommentStyle.hash);
  });

  it('chooses html comments for markup and markdown', () => {
    expect(detectCommentStyle('index.html')).toBe(CommentStyle.html);
    expect(detectCommentStyle('README.md')).toBe(CommentStyle.html);
  });

  it('defaults to block comments for typescript and everything else', () => {
    expect(detectCommentStyle(moduleFilePath)).toBe(CommentStyle.block);
    expect(detectCommentStyle('unknown.xyz')).toBe(CommentStyle.block);
  });
});

/* ─── Assembly ───────────────────────────────────────────────────────────────────────────────────────────────────── */

describe('applyCommentStyle', () => {
  it('prefixes hash comments per line, with a bare hash on blank lines', () => {
    expect(applyCommentStyle(['a', '', 'b'], CommentStyle.hash)).toBe('# a\n#\n# b\n');
  });

  it('wraps html comments around the raw lines', () => {
    expect(applyCommentStyle(['a', '', 'b'], CommentStyle.html)).toBe('<!--\na\n\nb\n-->\n');
  });

  it('renders block comments with starred continuation lines', () => {
    expect(applyCommentStyle(['a', '', 'b'], CommentStyle.block)).toBe('/**\n * a\n *\n * b\n */\n');
  });
});

describe('buildHeaderContent', () => {
  it('opens with a separator, the centered banner, the filename bar, and the description', () => {
    const lines: string[] = buildHeaderContent(minimalSpec, config, FileType.module);

    // The header opens and closes with full-width separators
    expect(lines[0]).toBe(separator);
    expect(lines[lines.length - 1]).toBe(separator);

    // The filename bar and description are present verbatim
    expect(lines).toContain(fileNameBar(moduleFilePath));
    expect(lines).toContain('A minimal example file.');
  });

  it('omits sections whose spec fields are unpopulated', () => {
    const lines: string[] = buildHeaderContent(minimalSpec, config, FileType.module);

    expect(lines.join('\n')).not.toContain('─── USAGE');
    expect(lines.join('\n')).not.toContain('─── SEE');
  });

  it('renders a divider plus body for each populated section', () => {
    const spec: IHeaderSpec = {
      ...minimalSpec,
      usage: 'pnpm example',
      see: ['https://example.com'],
    };
    const lines: string[] = buildHeaderContent(spec, config, FileType.module);

    expect(lines).toContain(createSectionDivider('USAGE'));
    expect(lines).toContain('pnpm example');
    expect(lines).toContain(createSectionDivider('SEE'));
    expect(lines).toContain('  • https://example.com');
  });
});

describe('renderHeader', () => {
  it('detects the file type and comment style from the spec file path', () => {
    const header: string = renderHeader(minimalSpec, config);

    expect(header.startsWith('/**\n')).toBe(true);
    expect(header.endsWith(' */\n')).toBe(true);
  });

  it('keeps every rendered line within the 120-character width budget', () => {
    const header: string = renderHeader(
      {
        ...minimalSpec,
        file: 'deploy.sh',
        usage: 'bash deploy.sh',
      },
      config,
    );
    const widths: number[] = header
      .trimEnd()
      .split('\n')
      .map((line: string): number => normalizeStringLength(line));

    // Hash-commented content lines are `# ` + up to 117 characters = at most 119
    expect(Math.max(...widths)).toBeLessThanOrEqual(config.width);
  });
});

/* ─── Write mode ─────────────────────────────────────────────────────────────────────────────────────────────────── */

describe('removeExistingHeader', () => {
  it('strips a leading block header that contains a banner run and preserves the body', () => {
    const header: string = applyCommentStyle([separator, 'old header', separator], CommentStyle.block);

    expect(removeExistingHeader(`${header}\nconst x: number = 1;\n`)).toBe('const x: number = 1;\n');
  });

  it('strips a leading run of hash header lines containing a banner run', () => {
    const header: string = applyCommentStyle([separator, 'old header', separator], CommentStyle.hash);

    expect(removeExistingHeader(`${header}\necho hi\n`)).toBe('echo hi\n');
  });

  it('leaves a file without a banner run untouched, even when it opens with a comment', () => {
    const body: string = '/** plain jsdoc */\nconst x: number = 1;\n';

    expect(removeExistingHeader(body)).toBe(body);
  });
});

describe('writeHeaderToFile', () => {
  it('preserves a shebang above the header and separates the header from the body with a blank line', () => {
    // Write a header into a script that already has a shebang and a body
    const scriptPath: string = join(scratchDirectory, 'script.sh');
    writeFileSync(scriptPath, '#!/usr/bin/env bash\n\nset -euo pipefail\n');
    const header: string = renderHeader({ ...minimalSpec, file: 'script.sh' }, config);
    writeHeaderToFile(scriptPath, header, FileType.script);

    // The shebang stays on line one, the header follows, and one blank line precedes the body
    expect(readFileSync(scriptPath, 'utf8')).toBe(`#!/usr/bin/env bash\n${header}\nset -euo pipefail\n`);
  });

  it('replaces its own previous output, so writing twice yields the same file', () => {
    const scriptPath: string = join(scratchDirectory, 'idempotent.sh');
    writeFileSync(scriptPath, '#!/usr/bin/env bash\n\nset -euo pipefail\n');
    const header: string = renderHeader({ ...minimalSpec, file: 'idempotent.sh' }, config);

    // Two consecutive writes must not stack headers or drift the layout
    writeHeaderToFile(scriptPath, header, FileType.script);
    const firstPass: string = readFileSync(scriptPath, 'utf8');
    writeHeaderToFile(scriptPath, header, FileType.script);

    expect(readFileSync(scriptPath, 'utf8')).toBe(firstPass);
  });

  it('creates a missing target file containing just the header', () => {
    const freshPath: string = join(scratchDirectory, 'fresh.ts');
    const header: string = renderHeader({ ...minimalSpec, file: 'fresh.ts' }, config);
    writeHeaderToFile(freshPath, header, FileType.module);

    expect(readFileSync(freshPath, 'utf8')).toBe(header);
  });

  it('inserts the header inside the script block of a vue single-file component', () => {
    const componentPath: string = join(scratchDirectory, 'component.vue');
    writeFileSync(componentPath, '<script setup lang="ts">\nconst x: number = 1;\n</script>\n');
    const header: string = renderHeader(
      {
        ...minimalSpec,
        file: 'component.vue',
        kind: 'vue',
      },
      config,
    );
    writeHeaderToFile(componentPath, header, FileType.vue);

    expect(readFileSync(componentPath, 'utf8')).toBe(
      `<script setup lang="ts">\n${header}const x: number = 1;\n</script>\n`,
    );
  });
});
