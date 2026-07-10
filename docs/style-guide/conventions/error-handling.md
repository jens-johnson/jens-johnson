# Jens Johnson • Developer Style Guide • Error Handling

Failure is part of the API. The doctrine is:

> **Error layering**: expected outcomes are *values*, broken invariants are *exceptions*, and every boundary
> *translates*.

Related:
- [typescript.md](typescript.md) (result unions, `unknown` narrowing)
- [async-and-promises.md](async-and-promises.md) (failure paths)
- [cli-and-scripts.md](cli-and-scripts.md) (process exits)

## The Layered Doctrine

| Layer                                    | Mechanism                                                    |
|------------------------------------------|--------------------------------------------------------------|
| Expected, recoverable outcomes           | **Result unions**: `{ ok: true; value: T } \| { ok: false }` |
| Programmer errors & unrecoverable states | **`throw new Error(...)`** with an actionable message        |
| Process boundary (CLI)                   | **`exitWithError`**: message to stderr, exit code 1          |
| HTTP boundary (Nuxt/Nitro server)        | **`createError({ statusCode, ... })`**                       |
| UI boundary (client composables)         | **Catch + state transition** (`status: 'error'`)             |

### 1. Result Unions for Expected Outcomes

Validation of untrusted input, parsing that can legitimately miss, and any failure the caller is *expected* to
handle return a discriminated union instead of throwing. Control flow via exceptions is banned for expected cases.

```typescript
// ✅ DO: the failure is a value; the caller must branch
/**
 * Validates an untrusted body into a clean payload.
 * @public
 * @function
 * @param input - The untrusted request body
 * @returns An ok result with the clean value, or `{ ok: false }` on any shape violation
 */
export function validateMetricsPayload(input: unknown): { ok: true; value: IMetricsPayload } | { ok: false } {
  if (!isRecord(input) || typeof input.ts !== 'string') {
    return { ok: false };
  }

  return { ok: true, value: rebuildFromKnownFields(input) };
}
```

- **Failed validation returns no detail** (`{ ok: false }`, a generic 422 upstream); never leak what specifically
  failed to an untrusted caller. Detail belongs in server logs.
- **Rebuild, don't pass through**: validators construct the clean value from known fields, silently dropping any
  extras an attacker sent.

### 2. Throw for Broken Invariants

Impossible states, misconfiguration, and contract violations throw a plain `Error`. These are bugs or environment
problems, not outcomes.

```typescript
// ✅ DO
if (maxWidth > MAX_INNER_CONTENT_LENGTH) {
  throw new Error(`Banner is ${maxWidth} chars wide but the limit is ${MAX_INNER_CONTENT_LENGTH}. Use a narrower font or shorter text.`);
}
```

Throw the **most specific native error that fits the semantics**: `TypeError` for wrong-type arguments, `RangeError`
for out-of-domain values; plain `Error` otherwise. **Custom `Error` subclasses are deferred** until a domain
genuinely needs programmatic discrimination between error kinds; none exist today.

### 3. Translate at boundaries

Errors never cross a boundary raw; each boundary owns its dialect.

```typescript
// ✅ CLI boundary: stderr + exit code (see cli-and-scripts.md)
runCli().catch((error: unknown) => exitWithError(error instanceof Error ? error.message : String(error)));

// ✅ HTTP boundary: H3 error with status semantics
if (!session.isAdmin) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden; admin access required',
  });
}

// ✅ UI boundary: failure becomes state, the interface stays alive
} catch (error: unknown) {
  patch(id, { status: 'error', error: errorMessage(error) });
}
```

- HTTP semantics:
  - `4xx` for caller mistakes (auth, validation, not-found)
  - `502`/`504` for upstream dependency failures
  - `500` for our own misconfiguration

## `try`/`catch` Mechanics

- **Narrowest possible scope**: wrap the single operation that can fail, not the whole function body.
- **`catch (error: unknown)`** always; narrow with `instanceof Error` before touching `.message`.
- **Never swallow silently**: an intentionally-empty catch (expected absence, i.e. optional EXIF parsing) requires
  a comment stating why, and returns an explicit sentinel (`null`).

```typescript
// ✅ DO: justified swallow with an explicit sentinel
async function readCaptureDate(file: File): Promise<string | null> {
  try {
    // Attempt to pull a capture timestamp out of the EXIF tags
    const meta: IExifTags | undefined = await exifr.parse(file, EXIF_TAGS);
    return meta?.DateTimeOriginal?.toISOString() ?? null;
  } catch {
    // Files without parseable EXIF are expected; absence is the answer, not an error
    return null;
  }
}
```

- **Polymorphic error shapes** (i.e. H3 errors carrying `statusMessage`/`data`) are unwrapped by a single
  `errorMessage(error: unknown): string` helper per domain, never ad-hoc at each call site.

## API Upstream Calls

An HTTP handler's awaited calls to external services (third-party APIs, storage) go through an **upstream guard**:
a small server util that awaits the operation, lets deliberate framework errors (`createError`) pass through, and
translates any unexpected rejection into a **502 with a human-readable message and the original failure as `cause`**.
A dead upstream then surfaces as a clean gateway error instead of a raw 500 stack.

```typescript
// server/utils/http: the guard is one small, tested function
export async function runUpstream<TResult>(operation: Promise<TResult>, statusMessage: string): Promise<TResult> {
  try {
    return await operation;
  } catch (error: unknown) {
    if (isError(error)) {
      throw error;
    }
    throw createError({ statusCode: 502, statusMessage, cause: error });
  }
}

// In a handler: every awaited external call names its failure
const upload: IStravaUpload = await runUpstream(uploadTcx(tcx, activity), 'The Strava upload failed.');
```

- The guard wraps **external I/O only**; framework built-ins (`readBody`, `getQuery`) and internal guards throw their
  own deliberate errors.
- Every `@throws` a handler can produce (including the guard's 502) is listed in its JSDoc and its file-header
  THROWS section.

## Message Style

Error messages are **actionable**: state what is wrong *and* what to do about it.

```typescript
// ✅ DO
throw new Error('No file-header.config.json found. Pass --config <path> or create one next to the generator.');
throw new Error(`unknown figlet font "${font}". Try --list-fonts.`);

// ❌ AVOID
throw new Error('config not found');
throw new Error('invalid font');
```

- Interpolate the offending value (quoted) so the message is diagnosable without a debugger.
- Messages are prose: sentence-shaped, no em dashes, backticks/quotes around identifiers and values.

## Enforcement

| Rule                    | Tooling                                                              |
|-------------------------|----------------------------------------------------------------------|
| No silent console noise | `no-console: ['warn', { allow: ['warn', 'error'] }]`                 |
| Unhandled rejections    | Entry-point `.catch()` pattern + review                              |
| Result-union validators | Convention; the union type makes skipping the branch a compile error |
