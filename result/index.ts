import Maybe, {maybe} from '@brixlove/maybe';

export interface Result<E, V> {
    map<X>(f: (v: V) => X): Result<E, X>;
    mapError<X>(f: (v: E) => X): Result<X, V>;
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
        return new Ok<E,X>(f(this.ok));
    }

    mapError<X>(f: (v: E) => X): Result<X, V> {
        return new Ok<X, V>(this.ok);
    }


    chain<X>(f: (v: V) => Result<E, X>): Result<E, X> {
        return f(this.ok);
    }

    chainError<X>(f: (v: E) => Result<X, V>): Result<X, V> {
        return new Ok<X, V>(this.ok);
    }

    either<X>(err: (e: E) => X, ok: (v: V) => X): X {
        return ok(this.ok);
    }

    toString():string {
        return `Ok: ${typeof this.ok === 'undefined' ? 'undefined' :this.ok.toString()}`;
    }

}

class Err<E, V> implements Result<E, V> {
    err: E;

    constructor(v: E) {
        this.err = v;
    }

    map<X>(f: (v: V) => X): Result<E, X> {
        return new Err<E,X>(this.err);
    }

    mapError<X>(f: (v: E) => X): Result<X, V> {
        return new Err<X, V>(f(this.err));
    }
    chainError<X>(f: (v: E) => Result<X, V>): Result<X, V> {
        return f(this.err);
    }

    chain<X>(f: (v: V) => Result<E, X>): Result<E, X> {
        return new Err<E, X>(this.err);
    }

    either<X>(err: (e: E) => X, ok: (v: V) => X): X {
        return err(this.err);
    }
    toString():string {
        return `Err: ${typeof this.err === 'undefined' ? 'undefined' :this.err.toString()}`;
    }
}

export function ok<E, V>(v: V): Result<E, V> {
    return new Ok(v);
}

export function err<E, V>(e: E): Result<E, V> {
    return new Err(e);
}

export function fromMaybe<E,V>(e:E, v:Maybe<V>):Result<E,V> {
    return maybe.maybe<V, Result<E,V>>(()=> err(e), ok, v );
}

/**
 * Folds an array of values through a function producing a result until
 *
 */
export function any<V,E,X>(f:(v:V)=>Result<E,X>, vs:Array<V>):Result<Array<E>,X> {
    function concatErrors(errs:Array<E>, res:Result<E,X>):Result<Array<E>,X> {
        return res.mapError(err => errs.concat([err]));
    }

    function step(m:Result<Array<E>,X>, v:V):Result<Array<E>,X> {
        return m.chainError((errs)=> concatErrors(errs, f(v)));
    }
    return vs.reduce(step, err([]))
}


/**
 * Folds an array of values through a function producing a result until
 */
export function all<E,V>(vs:Array<Result<E,V>>):Result<E,Array<V>> {
    function step(m:Result<E,Array<V>>, v:Result<E,V>):Result<E,Array<V>> {
        return m.chain(vs => v.map(v => vs.concat([v])));
    }
    return vs.reduce(step, ok([]));
}

export function is<E,V>(x:Result<E,V>):boolean {
    return x instanceof Ok || x instanceof Err;
}

export function rightOrThrow<E,V>(x:Result<E,V>):V {
    if (x instanceof Err) {
        throw (x as Err<E,V>).err;
    } else {
        return (x as Ok<E,V>).ok;
    }
}


