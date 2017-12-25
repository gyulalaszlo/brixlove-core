import Maybe, {maybe} from '@brixlove/maybe';

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


class Ok<E, V> implements Result<E, V> {
    ok: V;

    constructor(v: V) {
        this.ok = v;
    }

    map<X>(f: (v: V) => X): Result<E, X> {
        return new Ok<E, X>(f(this.ok));
    }

    mapError<X>(f: (v: E) => X): Result<X, V> {
        // YUCK
        return (this as any) as Ok<X, V>;
    }


    chain<X>(f: (v: V) => Result<E, X>): Result<E, X> {
        return f(this.ok);
    }

    chainError<X>(f: (v: E) => Result<X, V>): Result<X, V> {
        // YUCK
        return (this as any) as Ok<X, V>;
    }

    either<X>(err: (e: E) => X, ok: (v: V) => X): X {
        return ok(this.ok);
    }

    toString(): string {
        return `Ok: ${typeof this.ok === 'undefined' ? 'undefined' : this.ok.toString()}`;
    }

}

class Err<E, V> implements Result<E, V> {
    err: E;

    constructor(v: E) {
        this.err = v;
    }

    map<X>(f: (v: V) => X): Result<E, X> {
        // YUCK
        return (this as any) as Err<E, X>;
    }

    mapError<X>(f: (v: E) => X): Result<X, V> {
        return new Err<X, V>(f(this.err));
    }

    chainError<X>(f: (v: E) => Result<X, V>): Result<X, V> {
        return f(this.err);
    }

    chain<X>(f: (v: V) => Result<E, X>): Result<E, X> {
        // YUCK
        return (this as any) as Err<E, X>;
    }

    either<X>(err: (e: E) => X, ok: (v: V) => X): X {
        return err(this.err);
    }

    toString(): string {
        return `Err: ${typeof this.err === 'undefined' ? 'undefined' : this.err.toString()}`;
    }
}

/**
 * Creates a new Result with an OK value
 * @param {V} v
 * @return {Result<E, V>}
 */
export function ok<E, V>(v: V): Result<E, V> {
    return new Ok(v);
}

/**
 * Creates a new Result with an Err value
 * @param {E} e
 * @return {Result<E, V>}
 */
export function err<E, V>(e: E): Result<E, V> {
    return new Err(e);
}

/**
 * Creates a result from a Maybe
 * @param {E} e
 * @param {Maybe<V>} v
 * @return {Result<E, V>}
 */
export function fromMaybe<E, V>(e: E, v: Maybe<V>): Result<E, V> {
    return maybe.maybe<V, Result<E, V>>(() => err(e), ok, v);
}

/**
 * Folds an array of values through a function producing a result until one returns an Ok
 */
export function any<V, E, X>(f: (v: V) => Result<E, X>, vs: Array<V>): Result<Array<E>, X> {
    function concatErrors(errs: Array<E>, res: Result<E, X>): Result<Array<E>, X> {
        return res.mapError(err => errs.concat([err]));
    }

    function step(m: Result<Array<E>, X>, v: V): Result<Array<E>, X> {
        return m.chainError((errs) => concatErrors(errs, f(v)));
    }

    return vs.reduce(step, err([]))
}


/**
 * Collects an array of Values or the first error from an array of results.
 */
export function all<E, V>(vs: Array<Result<E, V>>): Result<E, Array<V>> {
    function step(m: Result<E, Array<V>>, v: Result<E, V>): Result<E, Array<V>> {
        return m.chain(vs => v.map(v => vs.concat([v])));
    }

    return vs.reduce(step, ok([]));
}

export function is<E, V>(x: Result<E, V>): boolean {
    return x instanceof Ok || x instanceof Err;
}

/**
 * Attempts to get the Ok (Right) value from a Result or throws the Err value.
 * @param {Result<E, V>} x
 * @return {V}
 */
export function rightOrThrow<E, V>(x: Result<E, V>): V {
    if (x instanceof Err) {
        throw (x as Err<E, V>).err;
    } else {
        return (x as Ok<E, V>).ok;
    }
}

/**
 * Apply a function to two results, if both results are Ok. If not, the first argument which is an Err will propagate through.
 */
export function map2<E, V, X0, X1>(f: (v0: X0, v1: X1) => V, d0: Result<E, X0>, d1: Result<E, X1>): Result<E, V> {
    return chain2((v0, v1) => ok(f(v0, v1)), d0, d1);
}

/**
 * Apply a function to three results, if all results are Ok. If not, the first argument which is an Err will propagate through.
 */
export function map3<E, V, X0, X1, X2>(f: (v0: X0, v1: X1, v2: X2) => V, d0: Result<E, X0>, d1: Result<E, X1>, d2: Result<E, X2>): Result<E, V> {
    return chain3((v0, v1, v2) => ok(f(v0, v1, v2)), d0, d1, d2);
}

/**
 * Apply a function to three results, if all results are Ok. If not, the first argument which is an Err will propagate through.
 */
export function map4<E, V, X0, X1, X2, X3>(f: (v0: X0, v1: X1, v2: X2, v3: X3) => V,
                                           d0: Result<E, X0>,
                                           d1: Result<E, X1>,
                                           d2: Result<E, X2>,
                                           d3: Result<E, X3>): Result<E, V> {
    return chain4((v0, v1, v2, v3) => ok(f(v0, v1, v2, v3)), d0, d1, d2, d3);
}

/**
 * Chain a function with two results, if both results are Ok. If not, the first argument which is an Err will propagate through.
 */
export function chain2<E, V, X0, X1>(f: (v0: X0, v1: X1) => Result<E, V>,
                                     d0: Result<E, X0>,
                                     d1: Result<E, X1>): Result<E, V> {
    return d0.chain(v0 => d1.chain(v1 => f(v0, v1)))
}

/**
 * Chain a function with three results, if both results are Ok. If not, the first argument which is an Err will propagate through.
 */
export function chain3<E, V, X0, X1, X2>(f: (v0: X0, v1: X1, v2: X2) => Result<E, V>,
                                         d0: Result<E, X0>,
                                         d1: Result<E, X1>,
                                         d2: Result<E, X2>): Result<E, V> {
    return d0.chain(v0 => chain2((v1, v2) => f(v0, v1, v2), d1, d2));
}


/**
 * Chain a function with four results, if both results are Ok. If not, the first argument which is an Err will propagate through.
 */
export function chain4<E, V, X0, X1, X2, X3>(f: (v0: X0, v1: X1, v2: X2, v3: X3) => Result<E, V>,
                                             d0: Result<E, X0>,
                                             d1: Result<E, X1>,
                                             d2: Result<E, X2>,
                                             d3: Result<E, X3>): Result<E, V> {
    return chain2((v0, v1) => chain2((v2, v3) => f(v0, v1, v2, v3), d2, d3), d0, d1);
}
