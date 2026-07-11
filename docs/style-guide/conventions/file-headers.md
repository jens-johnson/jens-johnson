# Jens Johnson • Developer Style Guide • File Header Convention

## Explanation

Every source file that supports comments opens with a **file header**: a fixed-width ASCII banner carrying the
project logo, the file's path, a one-line description, and a few structured sections describing how the file is used.
Headers make a repo instantly legible; you can tell what a file is, where it sits, and how to use it without reading
the code. They also give every file a consistent, branded frame.

Headers are produced by a single generator so they stay byte-consistent across projects:
[`src/utils/developer-tooling/file-header-generator/`](../../../src/utils/developer-tooling/file-header-generator) via the `file-header-generator` bin (see
[Tooling](#tooling)). Do not hand-format banners; generate them.

## Anatomy

```text
/**
 * ██████████████████████████████████  <- top rule (full-width █ bar)
 *
 *        ...project logo (ASCII)...    <- centered banner art
 *
 * ██████████████████████████████████  <- rule
 * ████████  path/to/file.ext  ███████  <- filename bar (path centered in █)
 *
 * One-line description of the file.    <- description
 *
 * ─── USAGE ────────────────────────   <- section divider
 *
 * how to use it
 *
 * ─── PROPS ────────────────────────   <- more sections, by file type
 *
 *   • name
 *     - Description: ...
 *
 * ██████████████████████████████████  <- bottom rule
 */
```

The pieces, top to bottom:

1. **Top rule**: a full-width run of `█`.
2. **Logo banner**: the project's ASCII logo, centered. Stored once per project (see [Tooling](#tooling)).
3. **Rule + filename bar**: the file path centered inside a `█` bar. Use the alias-prefixed path for aliased source
   (i.e. `#components/data/chip.vue`) or the repo-relative path otherwise (i.e. `bin/deploy.sh`).
4. **Description**: one line (wraps if long) saying what the file is.
5. **Sections**: zero or more `─── TITLE ───` dividers with structured content. Only sections that apply to the file
   are included; a component with no slots has no `SLOTS` section.
6. **Bottom rule**: a closing full-width `█` run.

## Comment style by file type

The banner content is identical everywhere; only the surrounding comment syntax changes, chosen by file type.

| Comment style | Syntax                     | File types                                                         |
|---------------|----------------------------|--------------------------------------------------------------------|
| **block**     | `/** … */`, ` * ` per line | TS, JS, MJS/CJS, Vue (inside `<script setup>`), CSS/SCSS           |
| **hash**      | `# …` per line             | Shell (`.sh`), YAML, TOML, `.env`, `.envrc`, `.editorconfig`, etc. |
| **html**      | `<!-- … -->`               | HTML, SVG, XML, Markdown                                           |

### Notes:

- **Vue**: the header is a `/** */` block placed **inside** `<script setup lang="ts">` (the generator inserts it
  right after the opening tag, or creates the script block if the file has none). A **template-only** component
  with no logic (a slot pass-through, i.e. a Nuxt Content `ProseP`/`ProseCode` override) still gets a header; the
  generator adds an otherwise-empty `<script setup lang="ts">` block to host it. Every source file carries a
  header, no exceptions.
- **Shell / Node scripts** with a shebang keep the `#!...` line first; the header follows it.

## Geometry

- **Target line length: 120 characters.** The banner's inner **content is a fixed 117 characters** wide; the comment
  prefix makes up the difference, so the art lines up identically regardless of comment style:
  - block: `" * "` (3) + 117 = **120**
  - hash: `"# "` (2) + 117 = **119**
  - html: no per-line prefix = **117** (wrapped by `<!--` / `-->`)
- **Rules**: 117 `█` characters.
- **Logo**: centered by padding the whole block with one shared left offset (preserves the art's internal shape).
  Art wider than 117 is rejected; pick a narrower font or shorter text.
- **Filename bar**: `█` padding, one space, the path, one space, `█` padding; the path sits centered, total 117.
- **Section divider**: `─── TITLE ` followed by `─` to fill 117.
- **Description and section text** wrap at 117; lines that already fit (like code samples) are preserved verbatim.

## Sections by file type

Sections render in this order and are omitted when empty:

| File type                          | Sections (in order)                                                                  |
|------------------------------------|--------------------------------------------------------------------------------------|
| **Vue component**                  | `USAGE`, `PROPS`, `MODEL`, `EMITS`, `SLOTS`, `EXPOSED`, `SEE`                        |
| **API handler** (server/api|routes)| `USAGE`, `AUTH`, `PARAMS`, `QUERY`, `BODY`, `RETURNS`, `THROWS`, `SIDE EFFECTS`, `SEE` |
| **Script** (sh/node)               | `USAGE`, `ARGUMENTS`, `OPTIONS`, `ENV`, `RETURNS`, `SIDE EFFECTS`, `EXAMPLES`, `SEE` |
| **Module** (ts/js)                 | `USAGE`, `EXPORTS`, `SEE`                                                            |
| **Config** (yaml, toml, env)       | `USAGE`, `ENV`, `SEE`                                                                |
| **Markup / doc / generic**         | `USAGE`, `SEE`                                                                       |

Stylesheets (`.css`, `.scss`) are treated as **generic** (`USAGE`, `SEE`); pass `--kind` to override any detection.
API handlers are detected by path (`server/api/**`, `server/routes/**`); the `USAGE` line states the method +
route (i.e. `POST /api/lab/vertifix/commit`), `THROWS` lists error responses as `<status> when <condition>`, and
an endpoint documents its full request/response contract (auth, params, query, body, returns).

Two content shapes:

- **Named entries** (`PROPS`, `EMITS`, `SLOTS`, `ARGUMENTS`, `OPTIONS`, `ENV`, `MODEL`) render as a `• name` bullet
  with indented `- Key: value` sub-lines, and only the keys you provide:
  - props / args: `Description`, `Type`, `Required`, `Default`
  - emits: `Description`, `Payload`
  - slots: `Description`, `Slot props`
- **Lists** (`SEE`, `RETURNS`, `SIDE EFFECTS`, `EXPORTS`) render as simple `• item` bullets.

### Example (Vue component)

```text
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
 * ██████████████████████████████████████ #components/containment/card/index.vue ███████████████████████████████████████
 *
 * Surface card primitive. Elevated container with border, rounded corners, and a background surface color.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <ContainmentCard :as="li" pad="lg">content</ContainmentCard>
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • as
 *     - Description: root element tag
 *     - Type: string
 *     - Required: false
 *     - Default: "div" (use "article", "li", etc. as needed)
 *   • pad
 *     - Description: inner padding preset
 *     - Type: "none" | "sm" | "md" | "lg"
 *     - Required: false
 *     - Default: "md"
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
```

## Tooling

The generator is a barrel module at [`src/utils/developer-tooling/file-header-generator/`](../../../src/utils/developer-tooling/file-header-generator), fronted by
an executable shim at [`bin/file-header-generator.ts`](../../../bin/file-header-generator.ts) (exposed as the `file-header-generator` bin and the
`header` / `header:banner` package scripts). It reads a per-project config,
[`file-header.config.json`](../../../file-header.config.json) at the repo root, which stores the logo banner, the
project name, and the width.

| File                | Role                                                                          |
|---------------------|--------------------------------------------------------------------------------|
| `bin/file-header-generator.ts`| executable shim: shebang + an import of the module's `cli.ts`                  |
| `cli.ts`            | executing entry: invokes the CLI dispatcher (deliberately not in the barrel)   |
| `index.ts`          | barrel re-export of the module                                                 |
| `enums.ts`          | `CommentStyle`, `FileType`                                                     |
| `constants.ts`      | geometry, drawing characters, key-label maps, extension lookups, CLI options   |
| `types.ts`          | `IHeaderConfig`, `IField`, `IHeaderSpec`, `ISection`, `ICliValues`, `T*` types |
| `utils.ts`          | width/banner math, section rendering, detection, assembly, I/O, command layer  |

The module is also consumable programmatically as `@jens-johnson/style-guide/utils/developer-tooling/file-header-generator`.

### Generate a Header

Basics come from flags; structured sections come from a JSON spec (a path or inline JSON):

```bash
# print to stdout
pnpm header --file "#components/data/chip.vue" --description "Compact status chip." --spec chip.spec.json

# write it straight into the file (replaces an existing header)
pnpm header --file "bin/deploy.sh" --description "Deploy the current branch." --spec deploy.spec.json --write
```

A spec covers everything the flags do, plus the structured sections:

```json
{
  "file": "#components/containment/card/index.vue",
  "description": "Surface card primitive.",
  "usage": "<ContainmentCard :as=\"li\" pad=\"lg\">content</ContainmentCard>",
  "props": [
    { "name": "as", "description": "root element tag", "type": "string", "required": false, "default": "\"div\"" },
    { "name": "pad", "description": "inner padding preset", "type": "\"none\" | \"sm\" | \"md\" | \"lg\"" }
  ]
}
```

File **kind** (which sections apply) and **comment style** are auto-detected from the extension and path; override
with `--kind` and `--comment` when needed.

### Create or Change a Project Banner

The banner is generated from text in a [figlet](https://github.com/patorjk/figlet.js) font, width-checked against
the 117-char limit, and saved into the config for reuse:

```bash
pnpm header:banner --project "JJ" --font "ANSI Shadow"          # preview
pnpm header:banner --project "JJ" --font "ANSI Shadow" --save   # save into the config
pnpm header:banner --list-fonts                                 # browse fonts
```

For a bespoke logo (like the hand-tuned `JJ` mark), paste the art straight into the config's `banner` array; the
generator re-centers whatever is stored.

## Conventions

- **Generate, never hand-format.** The 117/120 geometry and centering are exact; let the tool own them.
- **Keep descriptions to one line** and write whole sentences; prefer semicolons or a rewrite over em dashes.
- **Only include sections that apply.** Omit empty ones rather than writing "none".
- **Use the alias-prefixed path** in the filename bar for aliased source, otherwise the repo-relative path.
- **Re-run the generator** (with `--write`) when a file's props, args, or purpose change, so the header stays true.
