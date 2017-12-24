"use strict";
var maybe;
(function (maybe_1) {
    var Nothing = (function () {
        function Nothing() {
        }
        return Nothing;
    }());
    var Just = (function () {
        function Just(v) {
            this.just = v;
        }
        return Just;
    }());
    /**
     * Creates singleton / constructors
     */
    maybe_1.nothing = new Nothing();
    function just(v) { return new Just(v); }
    maybe_1.just = just;
    function map(f, v) {
        return then(function (v) { return just(f(v)); }, v);
    }
    maybe_1.map = map;
    function then(f, v) {
        return v instanceof Just ? f(v.just) : v;
    }
    maybe_1.then = then;
    function withDefault(def, v) {
        return v instanceof Just ? v.just : def;
    }
    maybe_1.withDefault = withDefault;
    function maybe(n, j, v) {
        return v instanceof Just ? j(v.just) : n();
    }
    maybe_1.maybe = maybe;
    /** Returns Just `v` if v is not undefined or null, or `Nothing` otherwise */
    function fromNullable(v) {
        return (typeof v === 'undefined' || v === null) ? maybe_1.nothing : just(v);
    }
    maybe_1.fromNullable = fromNullable;
})(maybe = exports.maybe || (exports.maybe = {}));
