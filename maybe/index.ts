
export interface Maybe<V> {
}

export namespace maybe {
    class Nothing implements Maybe<any> {
    }

    class Just<V> implements Maybe<V> {
        readonly just: V;

        constructor(v: V) {
            this.just = v;
        }
    }

    /**
     * Creates singleton / constructors
     */
    export const nothing:Maybe<any> = new Nothing();
    export function just<T>(v: T):Maybe<T> { return new Just(v); }

    export function map<V, X>(f: (v: V) => X, v: Maybe<V>): Maybe<X> {
        return then<V, X>(v => just(f(v)), v);
    }

    export function then<V, X>(f: (v: V) => Maybe<X>, v: Maybe<V>): Maybe<X> {
        return v instanceof Just ? f(v.just) : v;
    }

    export function withDefault<V>(def: V, v: Maybe<V>): V {
        return v instanceof Just ? (v as Just<V>).just : def;
    }

    export function maybe<V,X>(n:()=>X, j:(v:V)=>X, v: Maybe<V>): X {
        return v instanceof Just ? j((v as Just<V>).just) : n();
    }

    /** Returns Just `v` if v is not undefined or null, or `Nothing` otherwise */
    export function fromNullable<V>(v?: V): Maybe<V> {
        return (typeof v === 'undefined' || v === null) ? nothing : just(v);
    }
}


export default Maybe;