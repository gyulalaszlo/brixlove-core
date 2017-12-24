import { Result } from '@brixlove/result';
/**
 * We'll need something to hold our errors so we can fromString sense if we encounter any.
 */
export interface Fail {
    msg: string;
    inner?: Array<Fail>;
}
export declare function stringify(e: Fail, prefix?: string, nestPrefix?: string): string;
export declare function error<V>(msg: string, inners?: Array<Fail>): Result<Fail, V>;
/** Fail with the given message */
export declare function from(msg: string, inners?: Array<Fail>): Fail;
/** Fail with the given message */
export declare function fromMany(msg: string, inners: Array<Fail>): Fail;
/** Wrap */
export declare function addContext(msg: string, f: Fail): Fail;
export declare function inContext<V>(msg: (() => string) | string, f: Result<Fail, V>): Result<Fail, V>;
