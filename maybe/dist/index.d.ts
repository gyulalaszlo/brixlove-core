export interface Maybe<V> {
}
export declare namespace maybe {
    /**
     * Creates singleton / constructors
     */
    const nothing: Maybe<any>;
    function just<T>(v: T): Maybe<T>;
    function map<V, X>(f: (v: V) => X, v: Maybe<V>): Maybe<X>;
    function then<V, X>(f: (v: V) => Maybe<X>, v: Maybe<V>): Maybe<X>;
    function withDefault<V>(def: V, v: Maybe<V>): V;
    function maybe<V, X>(n: () => X, j: (v: V) => X, v: Maybe<V>): X;
    /** Returns Just `v` if v is not undefined or null, or `Nothing` otherwise */
    function fromNullable<V>(v?: V): Maybe<V>;
}
export default Maybe;
