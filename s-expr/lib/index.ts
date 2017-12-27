import * as result from '@brixlove/result'
import List = impl.List;
import {Result} from "@brixlove/result";
import {Maybe, maybe} from "@brixlove/maybe";

export interface SCata<V, X> {
    Nil(): X

    Value(v: V): X

    List(vs: Array<SExpr<V>>): X
}

/**
 * A Tree of list/value data.
 */
export interface SExpr<V> {
    cata<X>(cata: SCata<V, X>): X
}

/**
 * Returns an empty SExpression.
 */
export function empty<V>(): SExpr<V> {
    return impl.nil;
}

/**
 * Creates a new value atom from the provided value
 */
export function of<V>(v: V): SExpr<V> {
    return new impl.Atom(v);
}

/**
 * Creates a new value atom from the provided value
 */
export function listOf<V>(v: Array<SExpr<V>>): SExpr<V> {
    return new impl.List(v);
}

/**
 * Creates a level of nesting (a list) around the value, so concat() can be used efficiently
 */
export function nest<V>(v: SExpr<V>): SExpr<V> {
    return new impl.List<V>(v.cata({
        Nil: () => [],
        Value: _ => [v],
        List: _ => [v],
    }));
}

/**
 * Concatenates two SExpressions
 */
export function concat<V>(a: SExpr<V>, b: SExpr<V>): SExpr<V> {
    return a.cata({
        Nil: () => b,
        // Value: (v)=> new impl.List<V>([a,b]),
        Value: (v) => b.cata({
            Nil: () => a,
            Value: (vb) => new impl.List([a, b]),
            List: (vb) => new impl.List([a].concat(vb)),
        }),
        List: (vs) => b.cata({
            Nil: () => a,
            Value: (vb) => new impl.List(vs.concat([b])),
            List: (vb) => new impl.List(vs.concat(vb)),
        })
    });
}

/**
 * Transforms the inner values of this SExpr
 */
export function map<V, X>(f: (v: V) => X, a: SExpr<V>): SExpr<X> {
    return a.cata({
        Nil: () => (a as any) as impl.Nil<X>,
        Value: (v) => new impl.Atom<X>(f(v)),
        List: (vs) => new impl.List<X>(vs.map(e => map(f, e))),
    });
}

/**
 * Depth & left-first steps over each element and applies f to the element and the current result
 */
export function reduce<V, X>(f: (memo: X, v: V) => X, x: X, a: SExpr<V>): X {
    return a.cata({
        Nil: () => x,
        Value: (v) => f(x, v),
        List: (vs) => vs.reduce((memo, v) => reduce(f, memo, v), x),
    })
}

/**
 * Applies a transformation contained in an SExpr to an SExpr with the output having the
 * data layout of the product of the function and arg data layout.
 */
export function ap<V, X>(a: SExpr<(v: V) => X>, b: SExpr<V>): SExpr<X> {
    function _value(f: (v: V) => X, v: SExpr<V>): SExpr<X> {
        return v.cata({
            Nil: () => (b as any) as impl.Nil<X>,
            Value: (vb) => new impl.Atom(f(vb)),
            List: (vsb) => new impl.List(vsb.map(e => ap(a, e)))
        });
    }

    const _list = funs => new impl.List(funs.map(f => ap(f, b)));
    return a.cata({
        Nil: empty,
        Value: (f: (v: V) => X) => _value(f, b),
        List: (fs: Array<SExpr<(v: V) => X>>) => b.cata({
            Nil: empty,
            Value: () => _list(fs),
            List: () => _list(fs)
        })
    });
}


/**
 * Chain implementation.
 */
export function chain<V, X>(f: (v: V) => SExpr<X>, a: SExpr<V>): SExpr<X> {
    return a.cata({
        Nil: () => (a as any) as impl.Nil<X>,
        Value: (v) => f(v),
        List: (vs) => new impl.List<X>(vs.map(e => chain(f, e))),
    });
}

// ---------------------------------------------------------------------------

export function head<V>(a: SExpr<V>): Maybe<SExpr<V>> {
    return a.cata({
        Nil: () => maybe.nothing,
        Value: (_) => maybe.nothing,
        List: (vs) => vs.length > 0 ? maybe.just(vs[0]) : maybe.nothing
    })
}

export function tail<V>(a: SExpr<V>): Maybe<SExpr<V>> {
    return a.cata({
        Nil: () => maybe.nothing,
        Value: (_) => maybe.nothing,
        List: (vs) => vs.length > 1 ? maybe.just(listOf(vs.slice(1))) : maybe.nothing
    })
}

// ---------------------------------------------------------------------------


/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
export function fromNestedArrayUsing<E, V>(f: (a: any) => result.Result<E, V>, v: any): result.Result<E, SExpr<V>> {

    if (!Array.isArray(v)) {
        return f(v).map(of);
    }

    return result.all(v.map(e => fromNestedArrayUsing(f, e))).map(es => new impl.List(es));
}

/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
export function fromNestedArray(v: any): result.Result<string, SExpr<any>> {
    return fromNestedArrayUsing(v => result.ok(v), v);
}

// ---------------------------------------------------------------------------

export interface Decoder<E, V, X> {
    expand(e: SExpr<V>): Result<E, SExpr<V>>

    onValue(v: V): Result<E, X>

    onList(vs: Array<X>): Result<E, X>
}

export type DecodeResult<V> = Result<string, V>;

export namespace decode {

    export interface Dec<V, X> {
        (v: SExpr<V>): DecodeResult<X>
    }

    /**
     * Returns `Ok v` if v is a string or an error.
     * @param v
     * @return {DecodeResult<string>}
     */
    export function mustBeString(v: any): DecodeResult<string> {
        return typeof v === 'string' ? result.ok(v) : result.err(`Expected a string, got ${v}`);
    }

    /**
     * Returns `Ok v` if v is a string or an error.
     * @param v
     * @return {DecodeResult<string>}
     */
    export function mustBeNumber(v: any): DecodeResult<number> {
        return typeof v === 'number' ? result.ok(v) : result.err(`Expected a number, got ${v}`);
    }

    /**
     */
    /**
     * Decode an SExpr string into an String.
     */
    export function String<V>(v: SExpr<V>): DecodeResult<string> {
        return v.cata<DecodeResult<string>>({
            Nil: () => result.err('Expected a string, got a Nil'),
            Value: mustBeString,
            List: (vs) => result.err('Expected a string, got a List'),
        })
    }


    /**
     * Decode a JSON number into an Elm Int.
     */
    export function Number<V>(v: SExpr<V>): DecodeResult<number> {
        return v.cata<DecodeResult<number>>({
            Nil: () => result.err('Expected a string, got a Nil'),
            Value: mustBeNumber,
            List: (vs) => result.err('Expected a string, got a List'),
        })
    }

    /**
     * Decode a JSON number into an Elm Int.
     */
    export function List<V, X>(d: Dec<V, X>): Dec<V, Array<X>> {
        return function _listDecoder(v: SExpr<V>): DecodeResult<Array<X>> {
            return v.cata<DecodeResult<Array<X>>>({
                Nil: () => result.err('Expected a List, got a Nil'),
                Value: () => result.err('Expected a List, got a Value'),
                List: (vs) => result.all(vs.map(d)),
            });
        }
    }

// ---------------------------------------------------------------------------

    export function Field<V, X, Y>(name: string, f: (v: X) => DecodeResult<Y>): Dec<V, Y> {
        return function _fieldDecoder(v: SExpr<V>): DecodeResult<Y> {
            return v.cata<DecodeResult<Y>>({
                Nil: () => result.err('Expected an Object Value, got a Nil'),
                Value: (v) => _onField(name, v).chain(f),
                List: (_) => result.err('Expected an Object Value, got a Value'),
            })
        }
    }


    export function StringField<V>(name: string): Dec<V, string> {
        return Field(name, mustBeString);
    }

    export function NumberField<V>(name: string): Dec<V, number> {
        return Field(name, mustBeNumber);
    }


    function _onField<V, X>(fieldName: string, v: V): DecodeResult<any> {
        return typeof v === 'object' ?
            (typeof v[fieldName] !== 'undefined' ?
                result.ok(v[fieldName]) :
                result.err(`Expected a field named '${fieldName}' in ${v}`)) :
            result.err(`Expected an object value, got ${v}`);
    }

// ---------------------------------------------------------------------------

    export function chain<V, X, Y>(f: (v: X) => DecodeResult<Y>, d: Dec<V, X>): Dec<V, Y> {
        return function _chainDecoder(v: SExpr<V>): DecodeResult<Y> {
            return d(v).chain(f);
        }
    }

    export function chain2<V, X0, X1, Y>(f: (v0: X0, v1: X1) => DecodeResult<Y>, d0: Dec<V, X0>, d1: Dec<V, X1>): Dec<V, Y> {
        return function _chainDecoder(v: SExpr<V>): DecodeResult<Y> {
            return result.chain2(f, d0(v), d1(v));
        }
    }
// ---------------------------------------------------------------------------

    export function map<V, X, Y>(f: (v: X) => Y, d: Dec<V, X>): Dec<V, Y> {
        return function _mapDecoder(v: SExpr<V>): DecodeResult<Y> {
            return d(v).map(f);
        }
    }

    export function map2<V, X0, X1, Y>(f: (v0: X0, v1: X1) => Y, d0: Dec<V, X0>, d1: Dec<V, X1>): Dec<V, Y> {
        return function _mapDecoder2(v: SExpr<V>): DecodeResult<Y> {
            return result.map2(f, d0(v), d1(v));
        }
    }


// ---------------------------------------------------------------------------

    export function tuple2<V, X0, X1, Y>(f: (v0: X0, v1: X1) => Y, d0: Dec<V, X0>, d1: Dec<V, X1>): Dec<V, Y> {
        return function _tupleDecoder2(v: SExpr<V>): DecodeResult<Y> {
            return v.cata<DecodeResult<Y>>({
                Nil: () => result.err('Expected a Tuple, got a Nil'),
                Value: () => result.err('Expected a Tuple, got a Value'),
                List: (vs) => vs.length === 2 ?
                    result.map2(f, d0(vs[0]), d1(vs[1])) :
                    result.err('Expected a Tuple, got a Value'),
                }
            )
        }
    }

    export function oneOf<V,X>(decoders:Array<Dec<V,X>>):Dec<V,X> {
        return function _oneOf(c:SExpr<V>):DecodeResult<X> {
            return result.any(f => f(c), decoders).mapError(es => es.join(' '));
        }
    }

}

namespace impl {

// ---------------------------------------------------------------------------
    export class Nil<V> implements SExpr<V> {

        cata<X>(cata: SCata<V, X>): X {
            return cata.Nil();
        }
    }

    export const nil = new impl.Nil();

// ---------------------------------------------------------------------------
    export class Atom<V> implements SExpr<V> {
        private readonly _value: V;

        constructor(v: V) {
            this._value = v;
        }

        cata<X>(cata: SCata<V, X>): X {
            return cata.Value(this._value);
        }

        toString(): string {
            return _toString(this._value);
        }
    }


// ---------------------------------------------------------------------------
    export class List<V> implements SExpr<V> {

        private readonly _value: Array<SExpr<V>>;

        constructor(v: Array<SExpr<V>>) {
            this._value = v;
        }


        cata<X>(cata: SCata<V, X>): X {
            return cata.List(this._value);
        }

        toString(): string {
            return `(${this._value.map(_toString).join(' ')})`
        }
    }


// ---------------------------------------------------------------------------
    function _toString(v: any): string {
        if (typeof v !== 'undefined') {
            return v.toString();
        }

        return 'undefined'
    }

}
