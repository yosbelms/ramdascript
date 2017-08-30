
describe('Semantic analizer', function() {

    it('adds error if other that S-Expression or identifier are used as operations', function() {
        var ctx = ram.compile('([]) ({}) (\'\') (nil) (0) (/x/)', null, true)
        expect(contains(ctx.errors[0], T.ARRAY)).toBe(true)
        expect(contains(ctx.errors[1], T.OBJECT)).toBe(true)
        expect(contains(ctx.errors[2], T.STRING)).toBe(true)
        expect(contains(ctx.errors[3], T.NIL)).toBe(true)
        expect(contains(ctx.errors[4], T.NUMBER)).toBe(true)
        expect(contains(ctx.errors[5], T.REGEXP)).toBe(true)
    })

    describe('`def`', function() {
        it('can be used only in module scope', function() {
            var ctx = ram.compile('((def x))', null, true)
            expect(contains(ctx.errors[0], 'def')).toBe(true)
        })

        it('must have arguments', function() {
            var ctx = ram.compile('(def)', null, true)
            expect(contains(ctx.errors[0], 'def')).toBe(true)
        })

        it('must have no more than two arguments', function() {
            var ctx = ram.compile('(def x y z)', null, true)
            expect(contains(ctx.errors[0], 'def')).toBe(true)
        })

        it('should add error when define a var more than once', function() {
            var ctx = ram.compile('(def x) (def x)', null, true)
            expect(contains(ctx.errors[0], 'x')).toBe(true)
        })

        it('should add error when define a qualified identifier', function() {
            var ctx = ram.compile('(def x.y)', null, true)
            expect(contains(ctx.errors[0], 'x.y')).toBe(true)
        })
    })

    describe('`import`', function() {
        it('can be used only in module scope', function() {
            var ctx = ram.compile('((import x y))', null, true)
            expect(contains(ctx.errors[0], 'import')).toBe(true)
        })

        it('must have arguments', function() {
            var ctx = ram.compile('(import)', null, true)
            expect(contains(ctx.errors[0], 'import')).toBe(true)
        })

        it('must have exactly two arguments', function() {
            var ctx = ram.compile('(import x y z)', null, true)
            expect(contains(ctx.errors[0], 'import')).toBe(true)
        })
    })

    describe('`new`', function() {
        it('can be used only in module scope', function() {
            var ctx = ram.compile('(new)', null, true)
            expect(contains(ctx.errors[0], 'new')).toBe(true)
        })
    })

    describe('`fn`', function() {
        it('must have a list as the first argument', function() {
            var ctx = ram.compile('(fn x)', null, true)
            expect(contains(ctx.errors[0], 'fn')).toBe(true)
        })

        it('must have a list as the first argument', function() {
            var ctx = ram.compile('(fn [3])', null, true)
            expect(contains(ctx.errors[0], T.NUMBER)).toBe(true)
        })
    })

    describe('`alter`', function() {
        it('must have arguments', function() {
            var ctx = ram.compile('(alter)', null, true)
            expect(contains(ctx.errors[0], 'alter')).toBe(true)
        })

        it('must have no more than two arguments', function() {
            var ctx = ram.compile('(alter x y z)', null, true)
            expect(contains(ctx.errors[0], 'alter')).toBe(true)
        })
    })

    describe('`R` identifier', function() {
        it('adds error if `R` is used as operator', function() {
            var ctx = ram.compile('(R)', null, true)
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })

        it('adds error if `R` is used in S-Expression', function() {
            var ctx = ram.compile('(x R)', null, true)
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })

        it('adds error if `R` is used in Array', function() {
            var ctx = ram.compile('(x [R])', null, true)
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })

        it('adds error if `R` is used in Object', function() {
            var ctx = ram.compile('(x {:x R})', null, true)
            expect(contains(ctx.errors[0], 'R')).toBe(true)
        })
    })

    it('adds error if ES keywords are used as identifier', function() {
        var ctx = ram.compile('(if let for const)', null, true)
        expect(contains(ctx.errors[0], 'if')).toBe(true)
        expect(contains(ctx.errors[1], 'let')).toBe(true)
        expect(contains(ctx.errors[2], 'for')).toBe(true)
        expect(contains(ctx.errors[3], 'const')).toBe(true)
    })

    it('adds error a builtin function is used as data in S-Expression', function() {
        var ctx = ram.compile('(x fn alter new)', null, true)
        expect(contains(ctx.errors[0], 'fn')).toBe(true)
        expect(contains(ctx.errors[1], 'alter')).toBe(true)
        expect(contains(ctx.errors[2], 'new')).toBe(true)
    })
})