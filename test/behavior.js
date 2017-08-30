
describe('Special placeholder', function() {
    it('should be equal to R.__', function() {
        var vars = {}
        run('(alter vars.val _)', vars)
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
        run('(alter vars.sum (vars.fn 1, 2))', vars)
        expect(vars.sum).toEqual(3)
    })
})

describe('Array', function() {
    it('should be equal to a JS Array', function() {
        var vars = {}
        run('(alter vars.arr [1 2 3])', vars)
        expect(vars.arr).toEqual([1, 2, 3])
    })
})

describe('Object', function() {
    it('should be equal to a JS Object', function() {
        var vars = {}
        run('(alter vars.obj {: a 1 :b 2})', vars)
        expect(vars.obj).toEqual({a: 1, b: 2})
    })
})

describe('`alter`', function() {
    it('should mutate variables', function() {
        var vars = {}
        run('(alter vars.val 1)', vars)
        expect(vars.val).toBe(1)
    })

    it('should partialy applied', function() {
        var vars = {}
        run('(def alt (alter vars.val)) (alt 10)', vars)
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
        run('(alter vars.obj (new vars.Cls 1 2))', vars)
        expect(vars.obj.a).toEqual(1)
        expect(vars.obj.b).toEqual(2)
    })
})

describe('`def`', function() {
    it('should declare variables', function() {
        var vars = {}
        run('(def x 1) (alter vars.val x)', vars)
        expect(vars.val).toBe(1)
    })
})

describe('`fn`', function() {
    it('should create a function', function() {
        var vars = {}
        run('(alter vars.fn (fn [] 5))', vars)
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
        run('(def require vars.require) (import \'react\' React) (alter vars.val React)', vars)
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
        run('(def require vars.require) (import \'\' [mod1, mod2]) (alter vars.val [mod1, mod2])', vars)
        expect(vars.val).toEqual(['mod1', 'mod2'])
    })
})

describe('JSBlock', function() {
    it('should pass through compilation', function() {
        var vars = {}
        run('(alter vars.val (map {# n=>n*n #} [1 2 3]))', vars)
        expect(vars.val).toEqual([1, 4, 9])
    })
})

describe('Identifiers', function() {
    it('are not identified as Ramda function if beeing defined', function() {
        var vars = {}
        run('(def T 0) (alter vars.val T)', vars)
        expect(vars.val).not.toBe(R.T)
    })

    it('are not identified as Ramda function if is a property', function() {
        var vars = {}
        run('(def obj {:T 0}) (alter vars.val obj.T)', vars)
        expect(vars.val).not.toBe(R.T)
    })

    it('are not identified as Ramda function if is previously defined', function() {
        var vars = {}
        run('(def T F) (alter vars.val (T))', vars)
        expect(vars.val).toBe(false)
    })
})

describe('Regular Expression', function() {
    it('should be passed as is to JS', function() {
        var vars = {}
        run('(def r /ab/) (alter vars.result (r.test \'ab\'))', vars)
        expect(vars.result).toBe(true)
    })
})