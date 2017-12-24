"use strict";
var result_1 = require("@brixlove/result");
function stringify(e, prefix, nestPrefix) {
    if (prefix === void 0) { prefix = ""; }
    if (nestPrefix === void 0) { nestPrefix = "\t"; }
    var o = ('>> ' + e.msg).split(/[\r\n]/).map(function (l) { return prefix + l; });
    if (e.inner && e.inner.length > 1) {
        prefix += ".";
    }
    if (e.inner) {
        o = o.concat(e.inner.map(function (e) { return stringify(e, prefix + nestPrefix, nestPrefix); }));
    }
    return o.join("\n");
}
exports.stringify = stringify;
var FailT = (function () {
    function FailT(msg, inner) {
        this.msg = msg;
        this.inner = inner ? (Array.isArray(inner) ? inner : [inner]) : [];
    }
    FailT.prototype.toString = function () {
        return stringify(this);
    };
    return FailT;
}());
function error(msg, inners) {
    return result_1.err(from(msg, inners));
}
exports.error = error;
/** Fail with the given message */
function from(msg, inners) {
    return new FailT(msg, inners);
}
exports.from = from;
/** Fail with the given message */
function fromMany(msg, inners) {
    return new FailT(msg, inners);
}
exports.fromMany = fromMany;
/** Wrap */
function addContext(msg, f) {
    return new FailT(msg, [f]);
}
exports.addContext = addContext;
function inContext(msg, f) {
    var _msg = function () { return (typeof msg === 'string') ? msg : msg(); };
    var reWrap = function (f) { return result_1.err(addContext(_msg(), f)); };
    return f.chainError(reWrap);
}
exports.inContext = inContext;
