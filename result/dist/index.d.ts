import Maybe from '@brixlove/maybe';
/**
 * A Result is the result of a computation that may fail.
 *
 * A Result is either Ok meaning the computation succeeded, or it is an Err meaning that there was some failure.
 */
export interface Result<E, V> {
    /**
     * Apply a function to a result. If the result is Ok, it will be converted. If the result is an Err, the same error value will propagate through.
     * @param {(v: V) => X} f
     * @return {Result<E, X>}
     */
    map<X>(f: (v: V) => X): Result<E, X>;
    /**
     * Transform an Err value.
     * @param {(v: E) => X} f
     * @return {Result<X, V>}
     */
    mapError<X>(f: (v: E) => X): Result<X, V>;
    /**
     * Chain together a sequence of computations that may fail.
     *
     * @param {(v: V) => Result<E, X>} f
     * @return {Result<E, X>}
     */
    chain<X>(f: (v: V) => Result<E, X>): Result<E, X>;
    chainError<X>(f: (v: E) => Result<X, V>): Result<X, V>;
    either<X>(err: (e: E) => X, ok: (v: V) => X): X;
}
/**
 * Creates a new Result with an OK value
 * @param {V} v
 * @return {Result<E, V>}
 */
export declare function ok<E, V>(v: V): Result<E, V>;
/**
 * Creates a new Result with an Err value
 * @param {E} e
 * @return {Result<E, V>}
 */
export declare function err<E, V>(e: E): Result<E, V>;
/**
 * Creates a result from a Maybe
 * @param {E} e
 * @param {Maybe<V>} v
 * @return {Result<E, V>}
 */
export declare function fromMaybe<E, V>(e: E, v: Maybe<V>): Result<E, V>;
/**
 * Folds an array of values through a function producing a result until one returns an Ok
 */
export declare function any<V, E, X>(f: (v: V) => Result<E, X>, vs: Array<V>): Result<Array<E>, X>;
/**
 * Collects an array of Values or the first error from an array of results.
 */
export declare function all<E, V>(vs: Array<Result<E, V>>): Result<E, Array<V>>;
export declare function is<E, V>(x: Result<E, V>): boolean;
/**
 * Attempts to get the Ok (Right) value from a Result or throws the Err value.
 * @param {Result<E, V>} x
 * @return {V}
 */
export declare function rightOrThrow<E, V>(x: Result<E, V>): V;
