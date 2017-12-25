"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maybe;
(function (maybe_1) {
    var Nothing = /** @class */ (function () {
        function Nothing() {
        }
        Nothing.prototype.map = function (f) {
            // YUCK
            return this;
        };
        Nothing.prototype.chain = function (f) {
            // YUCK
            return this;
        };
        return Nothing;
    }());
    var Just = /** @class */ (function () {
        function Just(v) {
            this.just = v;
        }
        Just.prototype.map = function (f) {
            return just(f(this.just));
        };
        Just.prototype.chain = function (f) {
            return f(this.just);
        };
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
/**
 * Creates singleton / constructors
 */
exports.nothing = maybe.nothing;
exports.just = maybe.just;
