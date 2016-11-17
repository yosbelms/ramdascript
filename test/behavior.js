
describe('Special placeholder', function() {
    it('should be equal to R.__', function() {
        var vars = {}
        run('(reset vars.val _)', vars)
        expect(vars.val).toEqual(R.__)
    })
})

describe('S-Expression', function() {
    it('should take the first arguments as operator and execute it using the rest of arguments', function() {
        var vars = {
            fn: function fn(a, b) {
                return a + b
            }
        }
        run('(reset vars.sum (vars.fn 1, 2))', vars)
        expect(vars.sum).toEqual(3)
    })
})

describe('Array', function() {
    it('should be equal to a JS Array', function() {
        var vars = {}
        run('(reset vars.arr [1 2 3])', vars)
        expect(vars.arr).toEqual([1, 2, 3])
    })
})

describe('Object', function() {
    it('should be equal to a JS Object', function() {
        var vars = {}
        run('(reset vars.obj {: a 1 :b 2})', vars)
        expect(vars.obj).toEqual({a: 1, b: 2})
    })
})

describe('`reset`', function() {
    it('should mutate variables', function() {
        var vars = {}
        run('(reset vars.val 1)', vars)
        expect(vars.val).toBe(1)
    })

    it('should partialy applied', function() {
        var vars = {}
        run('(def alt (reset vars.val)) (alt 10)', vars)
        expect(vars.val).toBe(10)
    })
})

describe('`new`', function() {
    it('should instantiate a class', function() {
        var vars = {
            Cls: function(a, b) {
                this.a = a
                this.b = b
            }
        }
        run('(reset vars.obj (new vars.Cls 1 2))', vars)
        expect(vars.obj.a).toEqual(1)
        expect(vars.obj.b).toEqual(2)
    })
})

describe('`def`', function() {
    it('should declare variables', function() {
        var vars = {}
        run('(def x 1) (reset vars.val x)', vars)
        expect(vars.val).toBe(1)
    })
})

describe('`fn`', function() {
    it('should create a function', function() {
        var vars = {}
        run('(reset vars.fn (fn [] 5))', vars)
        expect(vars.fn()).toBe(5)
    })
})

describe('`import`', function() {
    it('should execute require', function() {
        var name
        var vars = {
            require: function(n) {
                name = n
            }    
        }
        run('(def require vars.require) (import \'react\' React)', vars)
        expect(name).toBe('react')
    })

    it('should import the module', function() {
        var vars = {
            require: function() {
                return 4
            }
        }
        run('(def require vars.require) (import \'react\' React) (reset vars.val React)', vars)
        expect(vars.val).toBe(4)
    })

    it('should import module members', function() {
        var vars = {
            require: function() {
                return {
                    mod1: 'mod1',
                    mod2: 'mod2',
                }
            }
        }
        run('(def require vars.require) (import \'\' [mod1, mod2]) (reset vars.val [mod1, mod2])', vars)
        expect(vars.val).toEqual(['mod1', 'mod2'])
    })
})