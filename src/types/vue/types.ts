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
 * ██████████████████████████████████████████████ src/types/vue/types.ts ███████████████████████████████████████████████
 *
 * Shared Vue utility types: the resolved props shape for withDefaults(defineProps<T>(), ...) annotations.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The resolved shape of a `withDefaults(defineProps<TProps>(), ...)` call: the raw props interface with the defaulted
 * keys promoted to required, wrapped readonly. Annotate the `props` const with it so the maximal-annotations doctrine
 * covers component props:
 *
 * `const props: TPropsWithDefaults<ICardTiltOptions, 'intensity' | 'scale'> = withDefaults(...)`
 * @public
 */
export type TPropsWithDefaults<TProps, TDefaulted extends keyof TProps> = Readonly<
  TProps & Required<Pick<TProps, TDefaulted>>
>;
