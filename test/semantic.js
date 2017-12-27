
describe('Semantic analizer', function() {

    var getCtx = function(src) {
        return ram.compile(src, {printErrors: false}).ctx
    }

    it('adds error if other that S-Expression or identifier are used as operations', function() {
        var ctx = getCtx('([]) ({}) (\'\') (nil) (0) (/x/)')
        expect(contains(ctx.errors[0], T.ARRAY)).toBe(true)
        expect(contains(ctx.errors[1], T.OBJECT)).toBe(true)
        expect(contains(ctx.errors[2], T.STRING)).toBe(true)
        expect(contains(ctx.errors[3], T.NIL)).toBe(true)
        expect(contains(ctx.errors[4], T.NUMBER)).toBe(true)
        expect(contains(ctx.errors[5], T.REGEXP)).toBe(true)
    })

    describe('`def`', function() {
        describe('can be used', function() {
            it('in module scope', function() {
                var ctx = getCtx('(def x)')
                expect(ctx.errors.length).toBe(0)
            })

            it('in function literal scope', function() {
                var ctx = getCtx('(def somFunc (fn [] (def x) 1))')
                expect(ctx.errors.length).toBe(0)
            })

            it('not as expression', function() {
                var ctx = getCtx('((def x))')
                expect(contains(ctx.errors[0], 'def')).toBe(true)
            })

            it('not as the last s-expression in a function scope', function() {
                var ctx = getCtx('(def somFunc (fn [] (def x)))')
                expect(contains(ctx.errors[0], 'def')).toBe(true)
            })
        })

        it('must have arguments', function() {
            var ctx = getCtx('(def)')
            expect(contains(ctx.errors[0], 'def')).toBe(true)
        })

        it('must have no more than two arguments', function() {
            var ctx = getCtx('(def x y z)')
            expect(contains(ctx.errors[0], 'def')).toBe(true)
        })

        it('should add error when define a var more than once', function() {
            var ctx = getCtx('(def x) (def x)')
            expect(contains(ctx.errors[0], 'x')).toBe(true)
        })

        it('should add error when define a qualified identifier', function() {
            var ctx = getCtx('(def x.y)')
            expect(contains(ctx.errors[0], 'x.y')).toBe(true)
        })
    })

    describe('`import`', function() {
        it('can be used only in module scope', function() {
            var ctx = getCtx('((import x y))')
            expect(contains(ctx.errors[0], 'import')).toBe(true)
        })

        it('must have arguments', function() {
            var ctx = getCtx('(import)')
            expect(contains(ctx.errors[0], 'import')).toBe(true)
        })

        it('must have exactly two arguments', function() {
            var ctx = getCtx('(import x y z)')
            expect(contains(ctx.errors[0], 'import')).toBe(true)
        })
    })

    describe('`new`', function() {
        it('can be used only in module scope', function() {
            var ctx = getCtx('(new)')
            expect(contains(ctx.errors[0], 'new')).toBe(true)
        })
    })

    describe('`fn`', function() {
        it('must have a list as the first argument', function() {
            var ctx = getCtx('(fn x)')
            expect(contains(ctx.errors[0], 'fn')).toBe(true)
        })

        it('must have a list as the first argument', function() {
            var ctx = getCtx('(fn [3])')
            expect(contains(ctx.errors[0], T.NUMBER)).toBe(true)
        })
    })

    describe('`alter`', function() {
        it('must have arguments', function() {
            var ctx = getCtx('(alter)')
            expect(contains(ctx.errors[0], 'alter')).toBe(true)
        })

        it('must have no more than two arguments', function() {
            var ctx = getCtx('(alter x y z)')
            expect(contains(ctx.errors[0], 'alter')).toBe(true)
        })
    })

    describe('`R` identifier', function() {
        it('adds error if `R` is used as operator', function() {
            var ctx = getCtx('(R)')
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })

        it('adds error if `R` is used in S-Expression', function() {
            var ctx = getCtx('(x R)')
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })

        it('adds error if `R` is used in Array', function() {
            var ctx = getCtx('(x [R])')
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })

        it('adds error if `R` is used in Object', function() {
            var ctx = getCtx('(x {:x R})')
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })
    })

    it('adds error if ES keywords are used as identifier', function() {
        var ctx = getCtx('(if let for const)')
        expect(contains(ctx.errors[0], 'if')).toBe(true)
        expect(contains(ctx.errors[1], 'let')).toBe(true)
        expect(contains(ctx.errors[2], 'for')).toBe(true)
        expect(contains(ctx.errors[3], 'const')).toBe(true)
    })

    it('adds error a builtin function is used as data in S-Expression', function() {
        var ctx = getCtx('(x fn alter new)')
        expect(contains(ctx.errors[0], 'fn')).toBe(true)
        expect(contains(ctx.errors[1], 'alter')).toBe(true)
        expect(contains(ctx.errors[2], 'new')).toBe(true)
    })

})