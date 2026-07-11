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
 * █████████████████████████████████████████████ src/test-utils/symbol.ts ██████████████████████████████████████████████
 *
 * Symbol metadata registry: defineSymbol attaches a readable name/description to a symbol; symbolName/symbolDescription
 * read it back.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ISymbolMetadata } from './types';

/**
 * The registry mapping a symbol (a function or class) to its human-readable metadata
 * @internal
 * @constant
 */
const SYMBOL_METADATA: WeakMap<object, ISymbolMetadata> = new WeakMap<object, ISymbolMetadata>();

/**
 * Registers human-readable metadata (a readable name and optional description) for an exported symbol, then returns
 * the symbol unchanged so it can wrap a declaration or be called beside one. Consumers read it back with
 * {@link symbolName} / {@link symbolDescription}; unit suites use it to title their `describe` blocks from the source
 * symbol rather than a hand-typed string
 * @public
 * @function
 * @param symbol - The symbol to annotate (i.e. an exported function)
 * @param metadata - The readable name and optional description
 * @returns The same symbol, unchanged
 */
export function defineSymbol<TSymbol extends object>(symbol: TSymbol, metadata: ISymbolMetadata): TSymbol {
  SYMBOL_METADATA.set(symbol, metadata);
  return symbol;
}

/**
 * Resolves a symbol's readable name, falling back to its intrinsic `.name` (i.e. a function's declared name) and
 * finally to "anonymous"
 * @public
 * @function
 * @param symbol - The symbol to look up
 * @returns The readable name registered via {@link defineSymbol}, or the symbol's own name
 */
export function symbolName(symbol: object): string {
  return SYMBOL_METADATA.get(symbol)?.name ?? (symbol as { name?: string }).name ?? 'anonymous';
}

/**
 * Resolves a symbol's registered description, if any
 * @public
 * @function
 * @param symbol - The symbol to look up
 * @returns The description registered via {@link defineSymbol}, or undefined
 */
export function symbolDescription(symbol: object): string | undefined {
  return SYMBOL_METADATA.get(symbol)?.description;
}
