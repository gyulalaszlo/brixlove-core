import Maybe from '@brixlove/maybe';
export interface Result<E, V> {
    map<X>(f: (v: V) => X): Result<E, X>;
    mapError<X>(f: (v: E) => X): Result<X, V>;
    chain<X>(f: (v: V) => Result<E, X>): Result<E, X>;
    chainError<X>(f: (v: E) => Result<X, V>): Result<X, V>;
    either<X>(err: (e: E) => X, ok: (v: V) => X): X;
}
export declare function ok<E, V>(v: V): Result<E, V>;
export declare function err<E, V>(e: E): Result<E, V>;
export declare function fromMaybe<E, V>(e: E, v: Maybe<V>): Result<E, V>;
/**
 * Folds an array of values through a function producing a result until
 *
 */
export declare function any<V, E, X>(f: (v: V) => Result<E, X>, vs: Array<V>): Result<Array<E>, X>;
/**
 * Folds an array of values through a function producing a result until
 */
export declare function all<E, V>(vs: Array<Result<E, V>>): Result<E, Array<V>>;
export declare function is<E, V>(x: Result<E, V>): boolean;
export declare function rightOrThrow<E, V>(x: Result<E, V>): V;
