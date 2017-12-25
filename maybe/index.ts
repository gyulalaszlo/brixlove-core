
export interface Maybe<V> {
    map<X>(f: (v: V) => X): Maybe<X>
    chain<X>(f: (v: V) => Maybe<X>): Maybe<X>
}

export namespace maybe {
    class Nothing<V> implements Maybe<V> {

        map<X>(f: (v: V) => X): Maybe<X> {
            // YUCK
            return (this as any) as Nothing<X>;
        }

        chain<X>(f: (v: V) => Maybe<X>): Maybe<X> {
            // YUCK
            return (this as any) as Nothing<X>;
        }
    }

    class Just<V> implements Maybe<V> {
        readonly just: V;

        constructor(v: V) {
            this.just = v;
        }

        map<X>(f: (v: V) => X): Maybe<X> {
            return just(f(this.just));
        }

        chain<X>(f: (v: V) => Maybe<X>): Maybe<X> {
            return f(this.just);
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
        return v instanceof Just ? f(v.just) : ((v as any) as Nothing<X>);
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

/**
 * Creates singleton / constructors
 */
export const nothing = maybe.nothing;
export const just = maybe.just;

export default Maybe;