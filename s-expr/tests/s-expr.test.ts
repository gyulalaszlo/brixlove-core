import * as S from '../lib/index';
import * as result from '@brixlove/result'
import * as maybe from '@brixlove/maybe'
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
        const f = (m, x) => m + x;
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
            expect(S.fromNestedArray([1, 2, 3]))
                .to.deep.equal(result.ok(cc(cc(s(1), s(2)), s(3))))
        });
        it('should parse nested', () => {
            expect(S.fromNestedArray([1, 2, [3, 4]]))
                .to.deep.equal(result.ok(cc(cc(s(1), s(2)), S.nest(cc(s(3), s(4))))))
        });
    });

    describe('decomposing', () => {


        describe('head', () => {
            it('should return Nothing for Nil', () => {
                expect(S.head(S.empty()))
                    .to.equal(maybe.nothing);
            });
            it('should return Just the atom for an atom', () => {
                expect(S.head(S.of("a")))
                    .to.equal(maybe.nothing);
            });
            it('should return Just the head of a List if it has a head', () => {
                expect(S.head(S.listOf([S.of("a"), S.of("b")])))
                    .to.deep.equal(maybe.just(S.of("a")));
            });
        });
        describe('tail', () => {
            it('should return Nothing for Nil', () => {
                expect(S.tail(S.empty())).to.equal(maybe.nothing);
            });
            it('should return Just the atom for an atom', () => {
                expect(S.tail(S.of("a")))
                    .to.equal(maybe.nothing);
            });
            it('should return nothing for an empty list', () => {
                expect(S.tail(S.listOf([])))
                    .to.deep.equal(maybe.nothing);
            });
            it('should return nothing for a single element list', () => {
                expect(S.tail(S.listOf([S.of("a")])))
                    .to.deep.equal(maybe.nothing);
            });
            it('should return Just the head of a List if it has a head', () => {
                expect(S.tail(S.listOf([S.of("a"), S.of("b")])))
                    .to.deep.equal(maybe.just(S.listOf([S.of("b")])));

            });
        });
    });
    describe('Decoder', () => {

        describe('String()', () => {
            it('should fail for non-strings', () => {
                expect(S.decode.String(S.empty())).to.have.property('err');
                expect(S.decode.String(S.of(10))).to.have.property('err');
                expect(S.decode.String(S.listOf([S.of("a")]))).to.have.property('err');
            });
            it('should succeed for strings', () => {
                expect(S.decode.String(S.of("a"))).to.have.property('ok', "a");
                expect(S.decode.String(S.of("asds"))).to.have.property('ok', "asds");
            });
        });
        describe('Number()', () => {
            it('should fail for non-numbers', () => {
                expect(S.decode.Number(S.empty())).to.have.property('err');
                expect(S.decode.Number(S.of("10"))).to.have.property('err');
                expect(S.decode.Number(S.listOf([S.of(10)]))).to.have.property('err');
            });
            it('should succeed for numbers', () => {
                expect(S.decode.Number(S.of(10))).to.have.property('ok', 10);
                expect(S.decode.Number(S.of(20))).to.have.property('ok', 20);
            });
        });

        describe('Field()', () => {
            const dec = S.decode.Field('foo', v => typeof v === 'number' ? result.ok(v) : result.err(`Not a number: ${v}`));
            it('should fail for non-objects', () => {
                expect(dec(S.empty())).to.have.property('err');
                expect(dec(S.of("10"))).to.have.property('err');
                expect(dec(S.listOf([S.of(10)]))).to.have.property('err');
                expect(dec(S.of({foo: "10"}))).to.have.property('err');
                expect(dec(S.of({foo: "10", bar: 10}))).to.have.property('err');
            });

            it('should succeed for objects', () => {
                expect(dec(S.of({foo: 10}))).to.have.property('ok', 10);
                expect(dec(S.of({foo: 20, bar: 10}))).to.have.property('ok', 20);
            });

            const expectError = v => expect(v).to.have.property('err');
            const expectOk = (v, e) => expect(v).to.have.property('ok', e);

            describe('StringField()', () => {
                const dec = S.decode.StringField("foo");
                it('should parse string fields', () => {
                    expectOk(dec(S.of({foo: "foo"})), "foo");
                    expectOk(dec(S.of({foo: "foo", bar: "bar"})), "foo");
                });
                it('should not parse non-string fields', () => {
                    expectError(dec(S.of({foo: ["foo"]})));
                    expectError(dec(S.of({foo: {foo: "foo"},})));
                    expectError(dec(S.of({foo: 10})));
                });
            });

            describe('NumberField()', () => {
                const dec = S.decode.NumberField("foo");
                it('should parse string fields', () => {
                    expectOk(dec(S.of({foo: 421})), 421);
                    expectOk(dec(S.of({foo: 421, bar: "bar"})), 421);
                });
                it('should not parse non-string fields', () => {
                    expectError(dec(S.of({foo: [421]})));
                    expectError(dec(S.of({foo: {foo: 421},})));
                    expectError(dec(S.of({foo: "10"})));
                });
            });
        });


        describe('List()', () => {
            const listDecoder = S.decode.List(S.decode.String);
            const dec = v => listDecoder(v);
            it('should fail for non-lists', () => {
                expect(dec(S.empty())).to.have.property('err');
                expect(dec(S.of("yo"))).to.have.property('err');
                expect(dec(S.of(["asd"]))).to.have.property('err');
            });
            it('should succeed for lists', () => {
                expect(dec(S.listOf([S.of("asd")]))).to.have.deep.property('ok', ["asd"]);
                expect(dec(S.listOf([S.of("asd"), S.of("bar")]))).to.have.deep.property('ok', ["asd", "bar"]);
            });
            it('should fail for improper lists', () => {
                expect(dec(S.listOf([S.of(10)]))).to.have.property('err');
                expect(dec(S.listOf([S.of<any>("asd"), S.of(10)]))).to.have.property('err')
            });
        });


        describe('transformations', () => {


            describe('map()', () => {
                const dec = S.decode.map((s: string) => s.toUpperCase(), S.decode.String);
                it('should transform decoded values', () => {
                    expect(dec(S.of("hello"))).to.have.property('ok', "HELLO");
                });
                it('should not transform failed values', () => {
                    expect(dec(S.of(10))).to.have.property('err');
                })
            });

            describe('map2()', () => {
                const dec = S.decode.map((s: string) => s.toUpperCase(), S.decode.String);
                const dec2 = S.decode.map((s: string) => `Hello ${s}!`, S.decode.String);
                const decMap2 = S.decode.map2((a: string, b: string) => `${a} / ${b}`, dec, dec2);

                it('should transform decoded values', () => {
                    expect(decMap2(S.of("foo"))).to.have.property('ok', "FOO / Hello foo!")
                });
                it('should fail if a decoder fails decoded values', () => {
                    expect(decMap2(S.of(12))).to.have.property('err')
                });
            });

            describe('chain()', () => {
                const dec = S.decode.chain((s: string) => s.length > 3 ? result.ok(s.toUpperCase()) : result.err('too short'), S.decode.String);
                it('should transform decoded values', () => {
                    expect(dec(S.of("hello"))).to.have.property('ok', "HELLO");
                });
                it('should not forward failure', () => {
                    expect(dec(S.of("he"))).to.have.property('err');
                })
                it('should not transform failed values', () => {
                    expect(dec(S.of(10))).to.have.property('err');
                })
            });
        });

    });


    describe('Sample decoders', () => {
        describe('Mapbox-expr-like', () => {
            class Stop<I, O> {
                constructor(i: I, o: O, z: number) {
                    this.inValue = i;
                    this.outValue = o;
                    this.zoom = z;
                }

                inValue: I;
                outValue: O;
                zoom: number;
            }

            const stopTyped = t => S.decode.tuple2((i, o) => new Stop(i, o, 0), t, t);
            const basicStep = S.decode.oneOf([
                stopTyped(S.decode.String),
                stopTyped(S.decode.Number),
                stopTyped(S.decode.oneOf<any,any>([S.decode.String, S.decode.Number])),
            ]);

            const chk = p => e => {
                let input = S.fromNestedArray(e);
                let r = input.chain(p);
                console.log("%s => %s", input, r);
                return expect(r);
            }

            describe('basicStop()', () => {

                const c = chk(basicStep);
                it('should decode a basic string step', () => {
                    c(["foo", "bar"]).to.have.property('ok')
                        .includes({'inValue': "foo", outValue: 'bar'})
                });
                it('should decode a basic number step', () => {
                    c([10, 1]).to.have.property('ok')
                        .includes({'inValue': 10, outValue: 1})
                });

                it('should decode number / string combinations', () => {
                    c(["foo", 1]).to.have.property('ok')
                        .includes({inValue: "foo", outValue: 1})
                });
            });
        });
    });
});