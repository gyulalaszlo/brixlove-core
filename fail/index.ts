import {Result, err, ok} from '@brixlove/result'

/**
 * We'll need something to hold our errors so we can fromString sense if we encounter any.
 */
export interface Fail {
    msg: string;
    inner?: Array<Fail>;
}


export function stringify(e: Fail, prefix: string = "", nestPrefix = "\t"): string {
    let o = ('>> ' + e.msg).split(/[\r\n]/).map(l => prefix + l);
    if (e.inner && e.inner.length > 1) {
        prefix += ".";
    }
    if (e.inner) {
        o = o.concat(e.inner.map(e => stringify(e, prefix + nestPrefix, nestPrefix)));
    }
    return o.join("\n");
}


class FailT implements Fail {
    readonly msg: string;
    readonly inner?: Array<Fail>;

    constructor(msg: string, inner?: Array<Fail>) {
        this.msg = msg;
        this.inner = inner ? (Array.isArray(inner) ? inner : [inner]) : [];
    }

    toString(): string {
        return stringify(this);
    }

}


export function error<V>(msg: string, inners?: Array<Fail>): Result<Fail, V> {
    return err<Fail, V>(from(msg, inners));
}

/** Fail with the given message */
export function from(msg: string, inners?: Array<Fail>): Fail {
    return new FailT(msg, inners);
}

/** Fail with the given message */
export function fromMany(msg: string, inners: Array<Fail>): Fail {
    return new FailT(msg, inners);
}

/** Wrap */
export function addContext(msg: string, f: Fail): Fail {
    return new FailT(msg, [f]);
}

export function inContext<V>(msg: (() => string) | string, f: Result<Fail, V>): Result<Fail, V> {
    const _msg = () => (typeof msg === 'string') ? msg : msg();
    const reWrap = (f: Fail) => err<Fail, V>(addContext(_msg(), f));
    return f.chainError<Fail>(reWrap);
}


