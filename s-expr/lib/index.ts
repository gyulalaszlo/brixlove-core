import * as result from '@brixlove/result'

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
    return nil;
}

/**
 * Creates a new value atom from the provided value
 */
export function of<V>(v: V): SExpr<V> {
    return new Atom(v);
}

/**
 * Creates a level of nesting (a list) around the value, so concat() can be used efficiently
 */
export function nest<V>(v: SExpr<V>): SExpr<V> {
    return new List<V>(v.cata({
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
        // Value: (v)=> new List<V>([a,b]),
        Value: (v) => b.cata({
            Nil: () => a,
            Value: (vb) => new List([a, b]),
            List: (vb) => new List([a].concat(vb)),
        }),
        List: (vs) => b.cata({
            Nil: () => a,
            Value: (vb) => new List(vs.concat([b])),
            List: (vb) => new List(vs.concat(vb)),
        })
    });
}

/**
 * Transforms the inner values of this SExpr
 */
export function map<V, X>(f: (v: V) => X, a: SExpr<V>): SExpr<X> {
    return a.cata({
        Nil: () => (a as any) as Nil<X>,
        Value: (v) => new Atom<X>(f(v)),
        List: (vs) => new List<X>(vs.map(e => map(f, e))),
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
            Nil: () => (b as any) as Nil<X>,
            Value: (vb) => new Atom(f(vb)),
            List: (vsb) => new List(vsb.map(e => ap(a, e)))
        });
    }

    const _list = funs => new List(funs.map(f => ap(f, b)));
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
        Nil: () => (a as any) as Nil<X>,
        Value: (v) => f(v),
        List: (vs) => new List<X>(vs.map(e => chain(f, e))),
    });
}


// ---------------------------------------------------------------------------


/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
export function fromNestedArrayUsing<E, V>(f: (a: any) => result.Result<E, V>, v: any): result.Result<E, SExpr<V>> {

    if (!Array.isArray(v)) {
        return f(v).map(of);
    }

    return result.all(v.map(e => fromNestedArrayUsing(f, e))).map(es => new List(es));
}

/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
export function fromNestedArray(v: any): result.Result<string, SExpr<any>> {
    return fromNestedArrayUsing(v => result.ok(v), v);
}

// ---------------------------------------------------------------------------
class Nil<V> implements SExpr<V> {

    cata<X>(cata: SCata<V, X>): X {
        return cata.Nil();
    }
}

const nil = new Nil();

// ---------------------------------------------------------------------------
class Atom<V> implements SExpr<V> {
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
class List<V> implements SExpr<V> {

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

