import * as S from '../lib/index';
import * as result from '@brixlove/result'
import {expect} from 'chai';

describe('s-expressions', () => {
    describe('empty()', () => {
        it('should have a singleton nil', () => {
            let a = S.empty();
            expect(a).to.equal(S.empty());
        });
    });

    describe('of()', () => {

        it('should create values', () => {
            function chk<V>([s, v]: [S.SExpr<V>, V]) {
                expect(s.cata({
                    Nil: () => null,
                    Value: (v) => v,
                    List: (_) => null,
                })).to.deep.equal(v);
            }

            [
                [S.of("a"), "a"],
                [S.of(12), 12],
                [S.of([1, "a"]), [1, "a"]],
            ].forEach((e: [S.SExpr<any>, any]) => chk<any>(e));
        });
    });

    describe('concat()', () => {

        it('should concat Nil-s', () => {
            [
                [S.empty(), S.empty(), S.empty()],
                [S.of("a"), S.empty(), S.of("a")],
                [S.empty(), S.of("a"), S.of("a")],
            ].forEach(([a, b, e]) => {
                expect(S.concat(a, b)).to.deep.equal(e)
            })
        });

        it('should be associative', () => {
            let a = S.of("a");
            let b = S.of("b");
            let c = S.of("c");
            expect(S.concat(S.concat(a, b), c))
                .to.deep.equal(S.concat(a, S.concat(b, c)))
        });

    });

    describe('nest()', () => {

        it('should be associative', () => {
            let a = S.of("a");
            let b = S.of("b");
            let c = S.of("c");
            let l0 = S.concat(a, b);
            expect(S.nest(l0)).to.deep.equal(S.concat(S.nest(S.empty()), S.nest(l0)))
            console.log(S.concat(c, S.nest(l0)).toString())
        });

    });


    describe('ap()', () => {
        const f = x => x + 10;
        const f2 = x => x + 100;
        const f3 = x => `<${x}>`;
        const f4 = x => `(${x})`;
        const ap = v => S.ap(S.of(f), v);
        const ap2 = v => S.ap(S.concat(S.of(f), S.of(f2)), v);
        let v0 = S.of(8);
        let v1 = S.of(12);


        describe('single function', () => {
            it('should ignore Nils', () => {
                expect(ap(S.empty())).to.equal(S.empty());
            });
            it('transform values', () => {
                expect(ap(S.of(8))).to.deep.equal(S.of(18));
            });
            it('transform lists values', () => {
                expect(ap(S.concat(v0, v1))).to.deep.equal(S.concat(S.of(18), S.of(22)));
            });
        });

        describe('list of function', () => {
            it('should ignore Nils', () => {
                expect(ap2(S.empty())).to.equal(S.empty());
            });
            it('transform values', () => {
                expect(ap2(S.of(8))).to.deep.equal(S.concat(S.of(18), S.of(108)));
            });
            it('transform lists values', () => {
                let expr = S.concat(
                    S.nest(S.concat(S.of(18), S.of(22))),
                    S.nest(S.concat(S.of(108), S.of(112)))
                );
                expect(ap2(S.concat(v0, v1))).to.deep.equal(
                    expr
                );
            });
        });

        // it('data layout', () => {
        //     let fs = S.concat(
        //         S.concat(S.of(f), S.of(f2)),
        //         S.nest(S.concat(S.of(f3), S.of(f4)))
        //     );
        //
        //     let e = S.concat(v0, v1);
        //     let expr = S.concat(
        //         S.nest(S.concat(S.of(18), S.of(22))),
        //         S.nest(S.concat(S.of(69), S.of(0)))
        //     );
        //     console.log(fs.toString(),"\n\n", e.toString())
        //     expect(S.ap(fs, expr)).to.deep.equal(
        //         expr
        //     );
        // });
    });

    describe('map()', () => {
        const f = x => x + 10;
        const map = v => S.map(f, v);
        let v0 = S.of(8);
        let v1 = S.of(12);

        it('should ignore Nils', () => {
            expect(map(S.empty())).to.equal(S.empty());
        });
        it('transform values', () => {
            expect(map(S.of(8))).to.deep.equal(S.of(18));
        });
        it('transform lists values', () => {
            expect(map(S.concat(v0, v1))).to.deep.equal(S.concat(S.of(18), S.of(22)));
        });
    });

    describe('reduce()', () => {
        const f = (m,x) => m + x;
        const reduce = v => S.reduce(f, 0, v);
        let v0 = S.of(8);
        let v1 = S.of(12);

        it('should ignore Nils', () => {
            expect(reduce(S.empty())).to.equal(0);
        });
        it('should fold values', () => {
            expect(reduce(S.of(8))).to.equal(8);
        });
        it('should fold lists of values', () => {
            expect(reduce(S.concat(S.nest(S.concat(v0, v1)), v0))).to.equal(28);
        });
    });

    describe('chain()', () => {
        const f = x => S.of(x + 10);
        const map = v => S.chain(f, v);
        let v0 = S.of(8);
        let v1 = S.of(12);

        it('should ignore Nils', () => {
            expect(map(S.empty())).to.equal(S.empty());
        });
        it('transform values', () => {
            expect(map(S.of(8))).to.deep.equal(S.of(18));
        });
        it('transform lists values', () => {
            expect(map(S.concat(v0, v1))).to.deep.equal(S.concat(S.of(18), S.of(22)));
        });
    });
    const s = S.of;
    const cc = S.concat;
    describe('fromNestedArray()', () => {
        it('should parse arrays', () => {
            expect(S.fromNestedArray([1,2,3]))
                .to.deep.equal(result.ok(cc(cc(s(1), s(2)), s(3))))
        });
        it('should parse nested', () => {
            expect(S.fromNestedArray([1,2,[3,4]]))
                .to.deep.equal(result.ok(cc(cc(s(1), s(2)), S.nest(cc(s(3), s(4))))))
        });
    });
});