# Jens Johnson • Developer Style Guide • Async & Promises

Asynchrony is **explicit** and **awaited**. The doctrine: 

> `await` everything, parallelize the independent, wrap the legacy.

Related: 
- [error-handling.md](error-handling.md) (failure paths)
- [functions.md](functions.md) (signatures)
- [control-flow-and-iteration.md](control-flow-and-iteration.md) (iteration)

---

## `async`/`await` Over `.then()`

**`async`/`await` is the default for promise consumption**, and a function never mixes the two styles.

One carve-out: a **named-stage pipeline** is acceptable for top-level handlers and similar composition points, where
every stage is a named function and the chain terminates its own errors. This reads as a declared pipeline, not
control flow:

```typescript
// ✅ ACCEPTABLE: named stages, one per line, terminal catch
return someBigChain()
  .then(fooIt)
  .then(barIt)
  .catch(catchIt);
```

The discipline that keeps this clean: **stages are named functions** (no inline arrow logic), **one stage per line**,
and **the chain always ends in `.catch()`** (or is returned to a caller that catches). Inline-arrow `.then()` bodies
and uncaught chains remain banned; the process entry point uses the terminal `.catch()` form (see
[cli-and-scripts.md](cli-and-scripts.md)).

```typescript
// ✅ DO
async function fetchCandidates(capturedAt: string): Promise<IVertifixCandidate[]> {
  // Query the matches endpoint for runs near the capture time
  const result: IVertifixMatchesResult = await $fetch<IVertifixMatchesResult>('/api/lab/vertifix/matches', {
    query: { capturedAt },
  });

  return result.candidates;
}

// ✅ DO: entry-point exception
runCli().catch((error: unknown) => exitWithError(error instanceof Error ? error.message : String(error)));

// ❌ AVOID
function fetchCandidates(capturedAt: string): Promise<IVertifixCandidate[]> {
  return $fetch('/api/lab/vertifix/matches', { query: { capturedAt } }).then((result) => result.candidates);
}
```

- Async signatures always annotate `: Promise<T>` explicitly.

## Parallelism

**Independent async work runs in parallel via `Promise.all()`; sequential `await` is reserved for genuine data
dependencies.**

```typescript
// ✅ DO: independent fetches fan out together
const [stats, activities]: [IStravaStatsResponse, IStravaActivity[]] = await Promise.all([
  fetchAthleteStats(athleteId),
  fetchRecentActivities(athleteId),
]);

// ✅ DO: per-element async work maps into Promise.all
const uploads: IStravaUpload[] = await Promise.all(
  items.map(async (item: IVertifixItem): Promise<IStravaUpload> => uploadTcx(item.tcx, item.activity)),
);

// ❌ AVOID: accidental serialization
const stats: IStravaStatsResponse = await fetchAthleteStats(athleteId);
const activities: IStravaActivity[] = await fetchRecentActivities(athleteId); // independent of stats!
```

Use `Promise.allSettled()` when partial failure is acceptable and each result is handled individually;
`Promise.all()` when one failure should fail the batch. Default: `all`.

## No Floating Promises

**Every promise is `await`ed, returned, or explicitly terminated.** Fire-and-forget requires a deliberate `void`
operator plus a comment justifying it.

Enforcement target: `@typescript-eslint/no-floating-promises` (requires type-aware linting); adopt in new configs,
convention + review until then.

## Wrapping Callback APIs

Legacy callback APIs are wrapped in a `new Promise` at the lowest level, so everything above stays `async`/`await`:

```typescript
// ✅ DO: wrap once at the boundary
const fonts: string[] = await new Promise<string[]>((res, rej) =>
  figlet.fonts((error: Error | null, list?: string[]): void => (error ? rej(error) : res(list ?? []))),
);
```

Sleeping/polling uses the same primitive:

```typescript
// Wait between polling attempts
await new Promise((resolve) => setTimeout(resolve, intervalMs));
```

Bounded polling loops carry explicit `attempts` and `intervalMs` parameters with defaults, and fail loudly on
exhaustion (see `pollUpload` in [error-handling.md](error-handling.md#message-style)).

## Failure Paths

- `try`/`catch` wraps the **narrowest awaited operation that can fail**, not the whole function.
- Catches take `(error: unknown)` and narrow before use; message extraction goes through a helper when the error
  shape is polymorphic (H3 errors carrying `statusMessage`, etc.).
- Full doctrine in [error-handling.md](error-handling.md).

```typescript
// ✅ DO: narrow scope, state transition on failure
async function searchMatches(id: string): Promise<void> {
  // Flag the item as matching while the search runs
  patch(id, { status: 'matching', error: null });

  try {
    // Query for candidate activities near the capture time
    const result: IVertifixMatchesResult = await $fetch<IVertifixMatchesResult>('/api/lab/vertifix/matches', {
      query: { capturedAt: item.capturedAt },
    });
    patch(id, { candidates: result.candidates, status: 'matched' });
  } catch (error: unknown) {
    patch(id, { status: 'error', error: errorMessage(error) });
  }
}
```

## Enforcement

| Rule                    | Tooling                                                                    |
|-------------------------|----------------------------------------------------------------------------|
| No floating promises    | Convention + review (candidate: `@typescript-eslint/no-floating-promises`) |
| Await in loops          | Review; per-element awaits inside `.map()` must feed `Promise.all`         |
| Explicit `Promise<T>`   | Convention + review                                                        |
