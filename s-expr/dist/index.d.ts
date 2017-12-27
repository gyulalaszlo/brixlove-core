import * as result from '@brixlove/result';
import { Result } from "@brixlove/result";
import { Maybe } from "@brixlove/maybe";
export interface SCata<V, X> {
    Nil(): X;
    Value(v: V): X;
    List(vs: Array<SExpr<V>>): X;
}
/**
 * A Tree of list/value data.
 */
export interface SExpr<V> {
    cata<X>(cata: SCata<V, X>): X;
}
/**
 * Returns an empty SExpression.
 */
export declare function empty<V>(): SExpr<V>;
/**
 * Creates a new value atom from the provided value
 */
export declare function of<V>(v: V): SExpr<V>;
/**
 * Creates a new value atom from the provided value
 */
export declare function listOf<V>(v: Array<SExpr<V>>): SExpr<V>;
/**
 * Creates a level of nesting (a list) around the value, so concat() can be used efficiently
 */
export declare function nest<V>(v: SExpr<V>): SExpr<V>;
/**
 * Concatenates two SExpressions
 */
export declare function concat<V>(a: SExpr<V>, b: SExpr<V>): SExpr<V>;
/**
 * Transforms the inner values of this SExpr
 */
export declare function map<V, X>(f: (v: V) => X, a: SExpr<V>): SExpr<X>;
/**
 * Depth & left-first steps over each element and applies f to the element and the current result
 */
export declare function reduce<V, X>(f: (memo: X, v: V) => X, x: X, a: SExpr<V>): X;
/**
 * Applies a transformation contained in an SExpr to an SExpr with the output having the
 * data layout of the product of the function and arg data layout.
 */
export declare function ap<V, X>(a: SExpr<(v: V) => X>, b: SExpr<V>): SExpr<X>;
/**
 * Chain implementation.
 */
export declare function chain<V, X>(f: (v: V) => SExpr<X>, a: SExpr<V>): SExpr<X>;
export declare function head<V>(a: SExpr<V>): Maybe<SExpr<V>>;
export declare function tail<V>(a: SExpr<V>): Maybe<SExpr<V>>;
/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
export declare function fromNestedArrayUsing<E, V>(f: (a: any) => result.Result<E, V>, v: any): result.Result<E, SExpr<V>>;
/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
export declare function fromNestedArray(v: any): result.Result<string, SExpr<any>>;
export interface Decoder<E, V, X> {
    expand(e: SExpr<V>): Result<E, SExpr<V>>;
    onValue(v: V): Result<E, X>;
    onList(vs: Array<X>): Result<E, X>;
}
export declare type DecodeResult<V> = Result<string, V>;
export declare namespace decode {
    interface Dec<V, X> {
        (v: SExpr<V>): DecodeResult<X>;
    }
    /**
     * Returns `Ok v` if v is a string or an error.
     * @param v
     * @return {DecodeResult<string>}
     */
    function mustBeString(v: any): DecodeResult<string>;
    /**
     * Returns `Ok v` if v is a string or an error.
     * @param v
     * @return {DecodeResult<string>}
     */
    function mustBeNumber(v: any): DecodeResult<number>;
    /**
     */
    /**
     * Decode an SExpr string into an String.
     */
    function String<V>(v: SExpr<V>): DecodeResult<string>;
    /**
     * Decode a JSON number into an Elm Int.
     */
    function Number<V>(v: SExpr<V>): DecodeResult<number>;
    /**
     * Decode a JSON number into an Elm Int.
     */
    function List<V, X>(d: Dec<V, X>): Dec<V, Array<X>>;
    function Field<V, X, Y>(name: string, f: (v: X) => DecodeResult<Y>): Dec<V, Y>;
    function StringField<V>(name: string): Dec<V, string>;
    function NumberField<V>(name: string): Dec<V, number>;
    function chain<V, X, Y>(f: (v: X) => DecodeResult<Y>, d: Dec<V, X>): Dec<V, Y>;
    function chain2<V, X0, X1, Y>(f: (v0: X0, v1: X1) => DecodeResult<Y>, d0: Dec<V, X0>, d1: Dec<V, X1>): Dec<V, Y>;
    function map<V, X, Y>(f: (v: X) => Y, d: Dec<V, X>): Dec<V, Y>;
    function map2<V, X0, X1, Y>(f: (v0: X0, v1: X1) => Y, d0: Dec<V, X0>, d1: Dec<V, X1>): Dec<V, Y>;
    function tuple2<V, X0, X1, Y>(f: (v0: X0, v1: X1) => Y, d0: Dec<V, X0>, d1: Dec<V, X1>): Dec<V, Y>;
    function oneOf<V, X>(decoders: Array<Dec<V, X>>): Dec<V, X>;
}
