"use strict";
var maybe_1 = require("@brixlove/maybe");
var Ok = (function () {
    function Ok(v) {
        this.ok = v;
    }
    Ok.prototype.map = function (f) {
        return new Ok(f(this.ok));
    };
    Ok.prototype.mapError = function (f) {
        // YUCK
        return this;
    };
    Ok.prototype.chain = function (f) {
        return f(this.ok);
    };
    Ok.prototype.chainError = function (f) {
        // YUCK
        return this;
    };
    Ok.prototype.either = function (err, ok) {
        return ok(this.ok);
    };
    Ok.prototype.toString = function () {
        return "Ok: " + (typeof this.ok === 'undefined' ? 'undefined' : this.ok.toString());
    };
    return Ok;
}());
var Err = (function () {
    function Err(v) {
        this.err = v;
    }
    Err.prototype.map = function (f) {
        // YUCK
        return this;
    };
    Err.prototype.mapError = function (f) {
        return new Err(f(this.err));
    };
    Err.prototype.chainError = function (f) {
        return f(this.err);
    };
    Err.prototype.chain = function (f) {
        // YUCK
        return this;
    };
    Err.prototype.either = function (err, ok) {
        return err(this.err);
    };
    Err.prototype.toString = function () {
        return "Err: " + (typeof this.err === 'undefined' ? 'undefined' : this.err.toString());
    };
    return Err;
}());
/**
 * Creates a new Result with an OK value
 * @param {V} v
 * @return {Result<E, V>}
 */
function ok(v) {
    return new Ok(v);
}
exports.ok = ok;
/**
 * Creates a new Result with an Err value
 * @param {E} e
 * @return {Result<E, V>}
 */
function err(e) {
    return new Err(e);
}
exports.err = err;
/**
 * Creates a result from a Maybe
 * @param {E} e
 * @param {Maybe<V>} v
 * @return {Result<E, V>}
 */
function fromMaybe(e, v) {
    return maybe_1.maybe.maybe(function () { return err(e); }, ok, v);
}
exports.fromMaybe = fromMaybe;
/**
 * Folds an array of values through a function producing a result until one returns an Ok
 */
function any(f, vs) {
    function concatErrors(errs, res) {
        return res.mapError(function (err) { return errs.concat([err]); });
    }
    function step(m, v) {
        return m.chainError(function (errs) { return concatErrors(errs, f(v)); });
    }
    return vs.reduce(step, err([]));
}
exports.any = any;
/**
 * Collects an array of Values or the first error from an array of results.
 */
function all(vs) {
    function step(m, v) {
        return m.chain(function (vs) { return v.map(function (v) { return vs.concat([v]); }); });
    }
    return vs.reduce(step, ok([]));
}
exports.all = all;
function is(x) {
    return x instanceof Ok || x instanceof Err;
}
exports.is = is;
/**
 * Attempts to get the Ok (Right) value from a Result or throws the Err value.
 * @param {Result<E, V>} x
 * @return {V}
 */
function rightOrThrow(x) {
    if (x instanceof Err) {
        throw x.err;
    }
    else {
        return x.ok;
    }
}
exports.rightOrThrow = rightOrThrow;
