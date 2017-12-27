"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var result = require("@brixlove/result");
var maybe_1 = require("@brixlove/maybe");
/**
 * Returns an empty SExpression.
 */
function empty() {
    return impl.nil;
}
exports.empty = empty;
/**
 * Creates a new value atom from the provided value
 */
function of(v) {
    return new impl.Atom(v);
}
exports.of = of;
/**
 * Creates a new value atom from the provided value
 */
function listOf(v) {
    return new impl.List(v);
}
exports.listOf = listOf;
/**
 * Creates a level of nesting (a list) around the value, so concat() can be used efficiently
 */
function nest(v) {
    return new impl.List(v.cata({
        Nil: function () { return []; },
        Value: function (_) { return [v]; },
        List: function (_) { return [v]; },
    }));
}
exports.nest = nest;
/**
 * Concatenates two SExpressions
 */
function concat(a, b) {
    return a.cata({
        Nil: function () { return b; },
        // Value: (v)=> new impl.List<V>([a,b]),
        Value: function (v) { return b.cata({
            Nil: function () { return a; },
            Value: function (vb) { return new impl.List([a, b]); },
            List: function (vb) { return new impl.List([a].concat(vb)); },
        }); },
        List: function (vs) { return b.cata({
            Nil: function () { return a; },
            Value: function (vb) { return new impl.List(vs.concat([b])); },
            List: function (vb) { return new impl.List(vs.concat(vb)); },
        }); }
    });
}
exports.concat = concat;
/**
 * Transforms the inner values of this SExpr
 */
function map(f, a) {
    return a.cata({
        Nil: function () { return a; },
        Value: function (v) { return new impl.Atom(f(v)); },
        List: function (vs) { return new impl.List(vs.map(function (e) { return map(f, e); })); },
    });
}
exports.map = map;
/**
 * Depth & left-first steps over each element and applies f to the element and the current result
 */
function reduce(f, x, a) {
    return a.cata({
        Nil: function () { return x; },
        Value: function (v) { return f(x, v); },
        List: function (vs) { return vs.reduce(function (memo, v) { return reduce(f, memo, v); }, x); },
    });
}
exports.reduce = reduce;
/**
 * Applies a transformation contained in an SExpr to an SExpr with the output having the
 * data layout of the product of the function and arg data layout.
 */
function ap(a, b) {
    function _value(f, v) {
        return v.cata({
            Nil: function () { return b; },
            Value: function (vb) { return new impl.Atom(f(vb)); },
            List: function (vsb) { return new impl.List(vsb.map(function (e) { return ap(a, e); })); }
        });
    }
    var _list = function (funs) { return new impl.List(funs.map(function (f) { return ap(f, b); })); };
    return a.cata({
        Nil: empty,
        Value: function (f) { return _value(f, b); },
        List: function (fs) { return b.cata({
            Nil: empty,
            Value: function () { return _list(fs); },
            List: function () { return _list(fs); }
        }); }
    });
}
exports.ap = ap;
/**
 * Chain implementation.
 */
function chain(f, a) {
    return a.cata({
        Nil: function () { return a; },
        Value: function (v) { return f(v); },
        List: function (vs) { return new impl.List(vs.map(function (e) { return chain(f, e); })); },
    });
}
exports.chain = chain;
// ---------------------------------------------------------------------------
function head(a) {
    return a.cata({
        Nil: function () { return maybe_1.maybe.nothing; },
        Value: function (_) { return maybe_1.maybe.nothing; },
        List: function (vs) { return vs.length > 0 ? maybe_1.maybe.just(vs[0]) : maybe_1.maybe.nothing; }
    });
}
exports.head = head;
function tail(a) {
    return a.cata({
        Nil: function () { return maybe_1.maybe.nothing; },
        Value: function (_) { return maybe_1.maybe.nothing; },
        List: function (vs) { return vs.length > 1 ? maybe_1.maybe.just(listOf(vs.slice(1))) : maybe_1.maybe.nothing; }
    });
}
exports.tail = tail;
// ---------------------------------------------------------------------------
/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
function fromNestedArrayUsing(f, v) {
    if (!Array.isArray(v)) {
        return f(v).map(of);
    }
    return result.all(v.map(function (e) { return fromNestedArrayUsing(f, e); })).map(function (es) { return new impl.List(es); });
}
exports.fromNestedArrayUsing = fromNestedArrayUsing;
/**
 * Attempts to create an SExpression from a nested array of values using the supplied parsing function.
 */
function fromNestedArray(v) {
    return fromNestedArrayUsing(function (v) { return result.ok(v); }, v);
}
exports.fromNestedArray = fromNestedArray;
var decode;
(function (decode) {
    /**
     * Returns `Ok v` if v is a string or an error.
     * @param v
     * @return {DecodeResult<string>}
     */
    function mustBeString(v) {
        return typeof v === 'string' ? result.ok(v) : result.err("Expected a string, got " + v);
    }
    decode.mustBeString = mustBeString;
    /**
     * Returns `Ok v` if v is a string or an error.
     * @param v
     * @return {DecodeResult<string>}
     */
    function mustBeNumber(v) {
        return typeof v === 'number' ? result.ok(v) : result.err("Expected a number, got " + v);
    }
    decode.mustBeNumber = mustBeNumber;
    /**
     */
    /**
     * Decode an SExpr string into an String.
     */
    function String(v) {
        return v.cata({
            Nil: function () { return result.err('Expected a string, got a Nil'); },
            Value: mustBeString,
            List: function (vs) { return result.err('Expected a string, got a List'); },
        });
    }
    decode.String = String;
    /**
     * Decode a JSON number into an Elm Int.
     */
    function Number(v) {
        return v.cata({
            Nil: function () { return result.err('Expected a string, got a Nil'); },
            Value: mustBeNumber,
            List: function (vs) { return result.err('Expected a string, got a List'); },
        });
    }
    decode.Number = Number;
    /**
     * Decode a JSON number into an Elm Int.
     */
    function List(d) {
        return function _listDecoder(v) {
            return v.cata({
                Nil: function () { return result.err('Expected a List, got a Nil'); },
                Value: function () { return result.err('Expected a List, got a Value'); },
                List: function (vs) { return result.all(vs.map(d)); },
            });
        };
    }
    decode.List = List;
    // ---------------------------------------------------------------------------
    function Field(name, f) {
        return function _fieldDecoder(v) {
            return v.cata({
                Nil: function () { return result.err('Expected an Object Value, got a Nil'); },
                Value: function (v) { return _onField(name, v).chain(f); },
                List: function (_) { return result.err('Expected an Object Value, got a Value'); },
            });
        };
    }
    decode.Field = Field;
    function StringField(name) {
        return Field(name, mustBeString);
    }
    decode.StringField = StringField;
    function NumberField(name) {
        return Field(name, mustBeNumber);
    }
    decode.NumberField = NumberField;
    function _onField(fieldName, v) {
        return typeof v === 'object' ?
            (typeof v[fieldName] !== 'undefined' ?
                result.ok(v[fieldName]) :
                result.err("Expected a field named '" + fieldName + "' in " + v)) :
            result.err("Expected an object value, got " + v);
    }
    // ---------------------------------------------------------------------------
    function chain(f, d) {
        return function _chainDecoder(v) {
            return d(v).chain(f);
        };
    }
    decode.chain = chain;
    function chain2(f, d0, d1) {
        return function _chainDecoder(v) {
            return result.chain2(f, d0(v), d1(v));
        };
    }
    decode.chain2 = chain2;
    // ---------------------------------------------------------------------------
    function map(f, d) {
        return function _mapDecoder(v) {
            return d(v).map(f);
        };
    }
    decode.map = map;
    function map2(f, d0, d1) {
        return function _mapDecoder2(v) {
            return result.map2(f, d0(v), d1(v));
        };
    }
    decode.map2 = map2;
    // ---------------------------------------------------------------------------
    function tuple2(f, d0, d1) {
        return function _tupleDecoder2(v) {
            return v.cata({
                Nil: function () { return result.err('Expected a Tuple, got a Nil'); },
                Value: function () { return result.err('Expected a Tuple, got a Value'); },
                List: function (vs) { return vs.length === 2 ?
                    result.map2(f, d0(vs[0]), d1(vs[1])) :
                    result.err('Expected a Tuple, got a Value'); },
            });
        };
    }
    decode.tuple2 = tuple2;
    function oneOf(decoders) {
        return function _oneOf(c) {
            return result.any(function (f) { return f(c); }, decoders).mapError(function (es) { return es.join(' '); });
        };
    }
    decode.oneOf = oneOf;
})(decode = exports.decode || (exports.decode = {}));
var impl;
(function (impl) {
    // ---------------------------------------------------------------------------
    var Nil = /** @class */ (function () {
        function Nil() {
        }
        Nil.prototype.cata = function (cata) {
            return cata.Nil();
        };
        return Nil;
    }());
    impl.Nil = Nil;
    impl.nil = new impl.Nil();
    // ---------------------------------------------------------------------------
    var Atom = /** @class */ (function () {
        function Atom(v) {
            this._value = v;
        }
        Atom.prototype.cata = function (cata) {
            return cata.Value(this._value);
        };
        Atom.prototype.toString = function () {
            return _toString(this._value);
        };
        return Atom;
    }());
    impl.Atom = Atom;
    // ---------------------------------------------------------------------------
    var List = /** @class */ (function () {
        function List(v) {
            this._value = v;
        }
        List.prototype.cata = function (cata) {
            return cata.List(this._value);
        };
        List.prototype.toString = function () {
            return "(" + this._value.map(_toString).join(' ') + ")";
        };
        return List;
    }());
    impl.List = List;
    // ---------------------------------------------------------------------------
    function _toString(v) {
        if (typeof v !== 'undefined') {
            return v.toString();
        }
        return 'undefined';
    }
})(impl || (impl = {}));
