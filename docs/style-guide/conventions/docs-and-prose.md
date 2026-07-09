# Jens Johnson • Developer Style Guide • Docs & Prose

Documentation is a first-class deliverable with its own brand. The doctrine:

> Prose reads as whole sentences without em dashes; markdown has a fixed anatomy per document class; and every doc
> is written to be executed by agents as much as read by humans.

Related:
- [comments.md](comments.md) (prose rules inside code)
- [file-headers.md](file-headers.md) (headers for non-markdown files)
- [project-structure.md](project-structure.md) (`docs/` layout)

## Punctuation & Voice

- **No em dashes (`—`), ever**; use semicolons, colons, parentheses, or rewrite the sentence. The en dash for
  numeric ranges (`1–5`) and box-drawing characters (`─`) in dividers/banners are different glyphs and are fine.
- **`i.e.` is the house abbreviation for introducing examples and clarifications; never use `e.g.`** This applies
  everywhere prose appears: docs, comments, JSDoc, commit bodies, and error messages.
- **Whole sentences over fragments**; fragments are tolerated only in tables.
- **Rules are imperative** ("Use single quotes"), each with a *why*; the personal voice lives in introductions.
- Identifiers, values, paths, and commands are always backticked; files link as markdown links, not bare paths.

## Markdown Mechanics

- **120-character soft wrap** in prose, matching code ([formatting.md](formatting.md#line-length)); URLs and tables
  may overflow.
- **Plain descriptive headings** (no manual numbering; it shatters on insertion), Title Case.
- **Compact table delimiters** (`|------|------|`) with aligned cell padding.
- Code fences always carry a language tag (` ```typescript `, ` ```text ` for trees/output).
- Diagrams are **Mermaid** in fenced blocks, so they render on GitHub and stay diffable.

## Document Anatomy

### READMEs

1. Centered logo/hero (ASCII or image), then the **badge row**
2. One-paragraph overview: what this is, in plain terms
3. Stack/feature table
4. Getting started (prereqs, install, run)
5. Scripts table
6. Architecture summary with `text`-fenced trees
7. Deployment/workflow summary
8. Conventions pointer (to this guide + repo `CLAUDE.md`)

### Convention Documents (this guide's spokes)

1. `H1`: `Jens Johnson • Developer Style Guide • <Topic>`
2. One-line framing sentence, then **the doctrine as a blockquote**
3. `Related:` as a bulleted list of sibling links with parenthetical reasons
4. Rule sections: **Rule → Why → Examples (`✅ DO` / `❌ AVOID`) → Enforcement**
5. An `## Enforcement` table last, mapping every mechanizable rule to its tooling

## Badges

**shields.io `for-the-badge` style**, in two places:

- **README hero rows** and major doc headers: the stack/technology badges.
- **Language-scoped sections** inside guides: a badge line marking which language a rule applies to.

Badge colors use the technology's brand color; badges link to the technology's homepage.

## Collaboration Idioms

Two blockquote markers thread human/agent collaboration through documents:

```markdown
> 🚩 **Review:** An inferred rule pending explicit confirmation; authoritative until amended.

> **⚠️JENS FEEDBACK**
>
> Inline review feedback for an agent to resolve; every instance is addressed and removed in the next pass.
```

Both are greppable (`grep -rn '🚩'`, `grep -rn 'JENS FEEDBACK'`); a clean grep means a settled document.

## Where Docs Live

- `docs/architecture/` for system/design docs; `docs/style-guide/` for conventions; `docs/.archive/` for superseded
  material (archive, never delete).
- Doc filenames are kebab-case (`file-headers.md`, `ci.md`).
- Agent-facing operational context goes to `CLAUDE.md` / `.claude/`, not `docs/`
  ([project-structure.md](project-structure.md#agent-context)).

## Enforcement

| Rule               | Tooling                                                     |
|--------------------|---------------------------------------------------------------|
| Formatting         | Prettier formats markdown (wrap, tables)                      |
| Em-dash ban        | Review + grep (`grep -rn '—' docs/`); candidate lint script   |
| Anatomy            | Convention + review; this document is the reference           |
