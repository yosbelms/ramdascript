(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
module.exports={
    "author"      : "Yosbel Marin",
    "name"        : "ramdascript",
    "version"     : "0.3.0",
    "license"     : "MIT",
    "description" : "JavaScript in the Ramda way",
    "repository"  : "https://github.com/yosbelms/ramdascript.git",

    "main": "./src/ramdascript",

    "preferGlobal": true,

    "bin": {
        "ram": "./bin/ram"
    },

    "scripts": {
        "test"   : "node ./scripts/test.js",
        "parser" : "node ./scripts/parser.js",
        "browserify" : "node ./scripts/browserify.js > ./browser.js",
        "all" : "npm run parser && npm run browserify && npm run test"
    },

    "devDependencies": {
        "jison"   : "0.4.15",
        "jasmine" : "2.3.2"
    },

    "keywords": [
        "ramda",
        "ramdascript",
        "s-expression",
        "clojure",
        "lisp",
        "language",
        "javascript"
    ]
}

},{}],4:[function(require,module,exports){
window.RamdaScript = module.exports = require('./ramdascript')
window.RamdaScript.run = run

function run(src) {
    var js = RamdaScript.compile(src, {wrapper: 'none'})
    var fn = new Function(js)
    return fn()
}

function runScripts() {
    var i
    var scripts = window.document.getElementsByTagName('script')

    for (i = 0; i < scripts.length; i++) {
        if (scripts[i].type === 'text/ramdascript') {
            run(scripts[i].innerHTML)
        }
    }
}

if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', runScripts, false)
} else {
    window.attachEvent('onload', runScripts)
}
},{"./ramdascript":9}],5:[function(require,module,exports){

var nodes    = require('./nodes')
var util     = require('./util')
var T        = nodes.type
var newNode  = nodes.node

// walk through nodes
function walk(node, parent, ctx) {
    if (!node) {
        return
    }

    // walk each node if array
    if (util.isArray(node)) {
        return node.forEach(function(node){
            walk(node, parent, ctx)
        })
    }

    // visit each node depending on its type
    switch (node.type) {
        case T.MODULE :
            visitModule(node, parent, ctx)
        break
        case T.SPECIAL_PLACEHOLDER :
            visitSpecialPlaceholder(node, parent, ctx)
        break
        case T.SEXPR :
            visitSexpr(node, parent,  ctx)
        break
        case T.ARRAY :
            visitArray(node, parent, ctx)
        break
        case T.PROPERTY :
            visitProperty(node, parent, ctx)
        break
        case T.OBJECT :
            visitObject(node, parent, ctx)
        break
        case T.JSBLOCK :
            visitJsBlock(node, parent, ctx)
        break
        case T.NIL :
            visitNil(node, parent, ctx)
        break
        case T.STRING :
            visitString(node, parent, ctx)
        break
        case T.IDENT :
            visitIdent(node, parent, ctx)
        break
        case T.NUMBER  :
        case T.REGEXP  :
        case T.BOOLEAN :
        case T.LITERAL :
            visitLiteral(node, parent, ctx)
    }
}

function visitLiteral(node, parent, ctx) {
    ctx.write(node.content)
}

function visitNil(node, parent, ctx) {
    ctx.write('null')
}

function visitString(node, parent, ctx) {
    var str = node.content
    node.content = str.replace(/\n|\r\n/g, '\\\n')
    ctx.write(node.content)
}

function visitIdent(node, parent, ctx) {
    var cont = node.content

    // do not identify as Ramda function if
    // the identifier is beeing defined
    // or is a property or is previously defined
    if (!(
        (
            parent.type === T.SEXPR
            && parent.operator.content === 'def'
            && parent.content[0] === node
        )
        || parent.type === T.PROPERTY
        || ctx.isDefinedVar(cont)
    )) {
        if (util.isRamdaFunction(cont)) {
            ctx.addUsedRamdaFn(cont)
            cont = 'R.' + cont
        }
    }
    ctx.write(cont)
}

function visitSpecialPlaceholder(node, parent, ctx) {
    ctx.addUsedRamdaFn('__')
    ctx.write('R.__')
}

function visitModule(node, parent, ctx) {
    node.content.forEach(function(child, idx, arr){
        walk(child, node, ctx)
        if (idx < arr.length - 1) {
            ctx.newLine()
            ctx.newLine()
        }
    })
}

function visitSexpr(node, parent, ctx) {
    var operator = node.operator
    var data     = node.content

    if (util.isBuiltinFunction(operator.content)) {
        data = node.content

        // compile builtin functions
        switch (operator.content) {
            case 'new' :
                operator = data[0]
                data     = data.slice(1)
                ctx.write('new ')
            break
            case 'def' :
                var varName = data[0]
                var value   = data[1]

                ctx.write('var ')
                walk(varName, node, ctx)
                ctx.write(' = ')
                if (value) {
                    walk(value, node, ctx)
                } else {
                    ctx.write('void 0')
                }
            return
            case 'fn' :
                var body
                var args = data[0].content

                // curry function if args number is greater than 0
                if (args.length === 0) {
                    ctx.write('function (')
                } else {
                    ctx.addUsedRamdaFn('curry')
                    ctx.write('R.curry(function (')
                }

                // write arguments
                if (args && args.length > 0) {
                    args.forEach(function(arg, idx, arr) {
                        walk(arg, node, ctx)
                        if (idx < arr.length - 1) {
                            ctx.write(', ')
                        }
                    })
                }

                body = data.slice(1)

                ctx.write(') {')
                ctx.indent()
                ctx.newLine()

                if (body.length > 0) {
                    ctx.write('return ')

                    // separate each s-expression by comma
                    body.forEach(function(item, idx, arr) {
                        walk(item, node, ctx)
                        if (idx < arr.length - 1) {
                            ctx.write(', ')
                            ctx.newLine()
                        }
                    })
                }

                ctx.dedent()
                ctx.newLine()
                ctx.write('}')

                // ending curry wrapper
                if (args.length > 0) {
                    ctx.write(')')
                }
            return
            case 'alter' :
                var recver = data[0]
                var value  = data[1]

                if (parent.type === T.MODULE) {
                    // as it it a curried function, it doesn't make sense
                    // to write a partialy applied function that
                    // never going to be used
                    if (value) {
                        // compile as simple assignemnt
                        walk(recver, node, ctx)
                        ctx.write(' = ')
                        walk(value, node, ctx)
                    }
                } else {
                    // write in a function wrapper
                    ctx.write('(function ($val) { return ')
                    walk(recver, node, ctx)
                    ctx.write(' = $val')

                    // if value run immediately
                    if (value) {
                        ctx.write(' })(')
                        walk(value, node, ctx)
                        ctx.write(')')

                    // provide a partialy applied function otherwise
                    } else {
                        ctx.write(' })')
                    }
                }
            return
            case 'import' :
                var tmpVar  = '$mod'
                var modPath = data[0]
                var refer   = data[1]

                // write the name the imported module
                // will be recognized with
                if (refer.type == T.IDENT) {
                    ctx.write('var ')
                    walk(refer, node, ctx)
                    ctx.write(' = require(')
                    walk(modPath, node, ctx)
                    ctx.write(')')

                // write the members to be imported
                } else if (refer.type == T.ARRAY) {
                    ctx.write('var ' + tmpVar + ' = require(')
                    walk(modPath, node, ctx)
                    ctx.write(')')
                    ctx.newLine()

                    refer.content.forEach(function(refer, idx, arr) {
                        refer = refer.content
                        ctx.write('var ' + refer + ' = ' + tmpVar + '.' + refer)
                        ctx.newLine()
                    })
                }
            return
        }
    }

    walk(operator, node, ctx)
    ctx.write('(')
    ctx.indent()

    // visit each data node
    data.forEach(function(child, idx, arr){
        if (isIndentableNode(child)) {
            ctx.newLine()
        }
        walk(child, node, ctx)
        if (idx < arr.length - 1) {
            ctx.write(', ')
        }
    })

    ctx.write(')')
    ctx.dedent()
}

function visitArray(node, parent, ctx) {
    if (node.content.length === 0) {
        // do not make indentation dance
        ctx.write('[]')
        return
    }

    ctx.write('[')
    ctx.indent()

    if (node.content) {
        node.content.forEach(function(child, idx, arr){
            ctx.newLine()
            walk(child, node, ctx)
            if (idx < arr.length - 1) {
                ctx.write(',')
            }
        })
    }

    ctx.dedent()
    ctx.newLine()
    ctx.write(']')
}

function visitProperty(node, parent, ctx) {
    if (util.isESKeyword(node.key.content)) {
        node.key.content = '\'' + node.key.content + '\''
    }
    walk(node.key, node, ctx)
    ctx.write(' : ')
    walk(node.value, node, ctx)
}

function visitObject(node, parent, ctx) {
    if (node.content.length === 0) {
        // do not make indentation dance
        ctx.write('{}')
        return
    }

    ctx.write('{')
    ctx.indent()

    if (node.content) {
        node.content.forEach(function(child, idx, arr){
            ctx.newLine()
            walk(child, node, ctx)
            if (idx < arr.length - 1) {
                ctx.write(',')
            }
        })
    }

    ctx.dedent()
    ctx.newLine()
    ctx.write('}')
}

function visitJsBlock(node, parent, ctx) {
    var str = node.content
    node.content = util.trim(str.substring(2, str.length - 2))
    visitLiteral(node, parent, ctx)
}

// whether is a node that needs indentation before to write it
function isIndentableNode(node) {
    return node.type === T.SEXPR
}

// write CommonJS wrapper
function writeCommonJSWrapper(requireRamda, ctx) {
    /*
    if (Object.keys(ctx.usedRamdaFns).length > 0) {
        ctx.writeTop('var R = require(\'ramda\')\n\n')
    }
    */

    /*
    Granular require for each Ramda function, for minimal bundle size
    */
    if (requireRamda) {
        var usedFns = []

        Object.keys(ctx.usedRamdaFns).forEach(function(key) {
            usedFns.push(ctx.indentUnit + key + ': require(\'ramda/src/' + key + '\')')
        })

        if (usedFns.length > 0) {
            ctx.writeTop('var R = {\n' + usedFns.join(',\n') + '\n}\n\n')
        }
    }

    ctx.newLine()
    ctx.newLine()

    Object.keys(ctx.definedVars).forEach(function(name, idx, arr){
        ctx.write('exports.' + name + ' = ' + name)
        if (idx < arr.length - 1) {
            ctx.newLine()
        }
    })
}

// write Closure wrapper
function writeClosureWrapper(ctx) {
    ctx.writeTop(';(function () {\n\n')
    ctx.newLine()
    ctx.newLine()
    ctx.write('})()')
}

function writeWaterMark(ctx) {
    var version = require('../package.json').version
    ctx.writeTop('// Generated by RamdaScript ' + version + '\n\n')
}

// convert the AST in JS code
// params
//     ast      AST
//     ctx      shared context
//     wrapper  module wrapper (commonjs, closure, none)
//
exports.compileAst = function compileAst(ast, ctx, wrapper) {
    walk(ast, null, ctx)

    wrapper = wrapper || 'none'

    switch (wrapper) {
        case 'commonjs' :
            writeCommonJSWrapper(true, ctx)
        break
        case 'commonjs-export' :
            writeCommonJSWrapper(false, ctx)
        break
        case 'closure' :
            writeClosureWrapper(ctx)
        break
        case 'none' :
        break
        default :
            throw '`' + wrapper + '` is not a valid wrapper'
    }

    writeWaterMark(ctx)
    return ctx.out()
}
},{"../package.json":3,"./nodes":7,"./util":11}],6:[function(require,module,exports){

// Returns a new compilation context object to be shared
// between compilation steps (semantic analizing and compilation)
// it keeps track of defined variables, used ramda functions,
// errors, and JS code
exports.newContext = function newContext(filename) {
    return {

        // filename
        filename: filename || '<vm>',

        // the compiled JS
        buffer: [],

        indentLevel: 0,

        indentUnit: '    ',

        // indentation spaces
        currentIndent: '',

        // used Ramda functions
        usedRamdaFns: {},

        // vars defined in a script
        definedVars: {},

        errors: [],

        // returns the compiled JS
        out: function out() {
            return this.buffer.join('')
        },

        // write to the buffer
        write: function(d) {
            this.buffer.push(d)
        },

        // write at top of the buffer
        writeTop: function(d) {
            this.buffer.unshift(d)
        },

        // write a new line and indentation
        newLine: function newLine() {
            this.buffer.push('\n' + this.currentIndent)
        },

        // updates current indentation spaces depending
        // on current indentation level
        updateIndent: function updateIndent() {
            var str = ''
            for (var idx = 0; idx < this.indentLevel; idx++) {
                str += this.indentUnit
            }
            this.currentIndent = str
        },

        // augment indentation
        indent: function indent() {
            this.indentLevel++
            this.updateIndent()
        },

        // diminish indentation
        dedent: function dedent() {
            this.indentLevel--
            this.updateIndent()
        },

        // register used Ramda functions
        addUsedRamdaFn: function addUsedRamdaFn(name) {
            this.usedRamdaFns[name] = 0
        },

        // register defined vars
        addDefinedVar: function addDefinedVar(name) {
            this.definedVars[name] = 0
        },

        // whether is registered as defined
        isDefinedVar: function varIsDefined(name) {
            return this.definedVars.hasOwnProperty(name)
        },

        // add error
        error: function error(msg, lineno) {
            this.errors.push(msg + ' at ' + this.filename + ':' + lineno)
        },

        // whether the context has error
        hasError: function() {
            return this.errors.length > 0
        }
    }
}
},{}],7:[function(require,module,exports){

// node types
exports.type = {
    SPECIAL_PLACEHOLDER : 'SPECIAL_PLACEHOLDER',
    MODULE   : 'MODULE',
    IDENT    : 'IDENT',
    STRING   : 'STRING',
    REGEXP   : 'REGEXP',
    NUMBER   : 'NUMBER',
    SEXPR    : 'SEXPR',
    ARRAY    : 'ARRAY',
    PROPERTY : 'PROPERTY',
    OBJECT   : 'OBJECT',
    JSBLOCK  : 'JSBLOCK',
    LITERAL  : 'LITERAL',
    BOOLEAN  : 'BOOLEAN',
    NIL      : 'NIL',
}

// returns a new node object
exports.node = function node(type, content, loc) {
    return {
        type    : type,
        content : content,
        loc     : loc && {
            firstLine  : loc.first_line,
            lastLine   : loc.last_line,
            firstColumn: loc.first_column,
            lastColumn : loc.last_column,
        }
    }
}
},{}],8:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var RamdaScriptParser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[5,9,10],$V1=[1,8],$V2=[1,7],$V3=[1,23],$V4=[1,22],$V5=[1,24],$V6=[1,13],$V7=[1,12],$V8=[1,14],$V9=[1,15],$Va=[1,16],$Vb=[1,17],$Vc=[5,9,10,12,14,16,18,21,23,27,29,30,31,32,33,34,35],$Vd=[9,10,12,14,16,18,21,29,30,31,32,33,34],$Ve=[2,28],$Vf=[1,28],$Vg=[9,10,12,14,16,18,21,23,27,29,30,31,32,33,34,35],$Vh=[9,10,12,14,16,18,19,21,23,27,29,30,31,32,33,34,35],$Vi=[1,35],$Vj=[23,27],$Vk=[23,27,35];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Module":3,"Module_repetition0":4,"EOF":5,"Source":6,"SExp":7,"JSBlock":8,"JSBLOCK":9,"(":10,"AtomList":11,")":12,"Array":13,"[":14,"Array_option0":15,"]":16,"QualifiedIdent":17,"IDENT":18,".":19,"Object":20,"{":21,"Object_option0":22,"}":23,"PropertyList":24,"Property":25,"Separator":26,":":27,"Atom":28,"STRING":29,"SPECIAL_PLACEHOLDER":30,"NUMBER":31,"REGEXP":32,"NIL":33,"BOOLEAN":34,",":35,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",9:"JSBLOCK",10:"(",12:")",14:"[",16:"]",18:"IDENT",19:".",21:"{",23:"}",27:":",29:"STRING",30:"SPECIAL_PLACEHOLDER",31:"NUMBER",32:"REGEXP",33:"NIL",34:"BOOLEAN",35:","},
productions_: [0,[3,2],[6,1],[6,1],[8,1],[7,3],[13,3],[17,1],[17,3],[20,3],[24,2],[24,3],[25,3],[25,3],[11,2],[11,3],[28,1],[28,1],[28,1],[28,1],[28,1],[28,1],[28,1],[28,1],[28,1],[28,1],[28,1],[26,1],[26,0],[4,0],[4,2],[15,0],[15,1],[22,0],[22,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return node(T.MODULE, $$[$0-1], _$[$0-1]) 
break;
case 4:
 this.$ = node(T.JSBLOCK, $$[$0], _$[$0]) 
break;
case 5:


            this.$ = node(T.SEXPR, $$[$0-1] || [], _$[$0-1])

            if ($$[$0-1] && $$[$0-1][0]) {
                this.$.operator = $$[$0-1].shift()
            }
        
break;
case 6:
 this.$ = node(T.ARRAY, $$[$0-1] || [], _$[$0-1]) 
break;
case 7:
 this.$ = node(T.IDENT, $$[$0], _$[$0]) 
break;
case 8:

            $$[$0-2].content += ('.' + $$[$0]);
        
break;
case 9:
 this.$ = node(T.OBJECT, $$[$0-1] || [], _$[$0-1]) 
break;
case 10: case 14:
 this.$ = [$$[$0-1]]   
break;
case 11: case 15:
 this.$.push($$[$0-1]) 
break;
case 12:

            this.$       = node(T.PROPERTY)
            this.$.key   = node(T.IDENT, $$[$0-1], _$[$0-1])
            this.$.value = $$[$0]
        
break;
case 13:

            this.$       = node(T.PROPERTY)
            this.$.key   = node(T.STRING, $$[$0-1], _$[$0-1])
            this.$.value = $$[$0]
        
break;
case 17:
 this.$ = node(T.SPECIAL_PLACEHOLDER, $$[$0], _$[$0]) 
break;
case 18:
 this.$ = node(T.STRING, $$[$0], _$[$0])              
break;
case 19:
 this.$ = node(T.NUMBER, $$[$0], _$[$0])              
break;
case 20:
 this.$ = node(T.REGEXP, $$[$0], _$[$0])              
break;
case 21:
 this.$ = node(T.NIL, $$[$0], _$[$0])                 
break;
case 22:
 this.$ = node(T.BOOLEAN, $$[$0], _$[$0])             
break;
case 29:
this.$ = [];
break;
case 30:
$$[$0-1].push($$[$0]);
break;
}
},
table: [o($V0,[2,29],{3:1,4:2}),{1:[3]},{5:[1,3],6:4,7:5,8:6,9:$V1,10:$V2},{1:[2,1]},o($V0,[2,30]),o($V0,[2,2]),o($V0,[2,3]),{7:19,8:18,9:$V1,10:$V2,11:9,13:20,14:$V3,17:11,18:$V4,20:21,21:$V5,28:10,29:$V6,30:$V7,31:$V8,32:$V9,33:$Va,34:$Vb},o($Vc,[2,4]),{7:19,8:18,9:$V1,10:$V2,12:[1,25],13:20,14:$V3,17:11,18:$V4,20:21,21:$V5,28:26,29:$V6,30:$V7,31:$V8,32:$V9,33:$Va,34:$Vb},o($Vd,$Ve,{26:27,35:$Vf}),o($Vg,[2,16],{19:[1,29]}),o($Vg,[2,17]),o($Vg,[2,18]),o($Vg,[2,19]),o($Vg,[2,20]),o($Vg,[2,21]),o($Vg,[2,22]),o($Vg,[2,23]),o($Vg,[2,24]),o($Vg,[2,25]),o($Vg,[2,26]),o($Vh,[2,7]),{7:19,8:18,9:$V1,10:$V2,11:31,13:20,14:$V3,15:30,16:[2,31],17:11,18:$V4,20:21,21:$V5,28:10,29:$V6,30:$V7,31:$V8,32:$V9,33:$Va,34:$Vb},{22:32,23:[2,33],24:33,25:34,27:$Vi},o($Vc,[2,5]),o($Vd,$Ve,{26:36,35:$Vf}),o($Vd,[2,14]),o([9,10,12,14,16,18,21,23,27,29,30,31,32,33,34],[2,27]),{18:[1,37]},{16:[1,38]},{7:19,8:18,9:$V1,10:$V2,13:20,14:$V3,16:[2,32],17:11,18:$V4,20:21,21:$V5,28:26,29:$V6,30:$V7,31:$V8,32:$V9,33:$Va,34:$Vb},{23:[1,39]},{23:[2,34],25:40,27:$Vi},o($Vj,$Ve,{26:41,35:$Vf}),{18:[1,42],29:[1,43]},o($Vd,[2,15]),o($Vh,[2,8]),o($Vg,[2,6]),o($Vg,[2,9]),o($Vj,$Ve,{26:44,35:$Vf}),o($Vj,[2,10]),{7:19,8:18,9:$V1,10:$V2,13:20,14:$V3,17:11,18:$V4,20:21,21:$V5,28:45,29:$V6,30:$V7,31:$V8,32:$V9,33:$Va,34:$Vb},{7:19,8:18,9:$V1,10:$V2,13:20,14:$V3,17:11,18:$V4,20:21,21:$V5,28:46,29:$V6,30:$V7,31:$V8,32:$V9,33:$Va,34:$Vb},o($Vj,[2,11]),o($Vk,[2,12]),o($Vk,[2,13])],
defaultActions: {3:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};


var nodes = require('./nodes')
var node  = nodes.node
var T     = nodes.type/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:/* skip comments */
break;
case 2:/* skip comments */
break;
case 3:return 9
break;
case 4:return 29
break;
case 5:return 32
break;
case 6:return 30
break;
case 7:return 33
break;
case 8:return 34
break;
case 9:return 31
break;
case 10:return 18
break;
case 11:return 21
break;
case 12:return 23
break;
case 13:return 10
break;
case 14:return 12
break;
case 15:return 14
break;
case 16:return 16
break;
case 17:return 27
break;
case 18:return 35
break;
case 19:return 19
break;
case 20:return 5
break;
case 21:
        yy.parseError('character ' + yy_.yytext + ' with code: ' + yy_.yytext.charCodeAt(0), {
            line: yy_.yylloc.first_line
        })
    
break;
}
},
rules: [/^(?:[ \r\n\f\t\u00A0\u2028\u2029\uFEFF]+)/,/^(?:\/\/.*)/,/^(?:\/\*([\s\S]*?)\*\/)/,/^(?:\{#([\s\S]*?)#\})/,/^(?:'([^\\']|\\[\s\S])*')/,/^(?:\/([^\\/]|\\[\s\S])*\/[gimy]*)/,/^(?:_\b)/,/^(?:nil\b)/,/^(?:true|false\b)/,/^(?:0x[\da-fA-F]+|^\d*\.?\d+(?:[eE][+-]?\d+)?\b)/,/^(?:[\$_a-zA-Z\x7f-\uffff]+[\$\w\x7f-\uffff]*)/,/^(?:\{)/,/^(?:\})/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?::)/,/^(?:,)/,/^(?:\.)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = RamdaScriptParser;
exports.Parser = RamdaScriptParser.Parser;
exports.parse = function () { return RamdaScriptParser.parse.apply(RamdaScriptParser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"./nodes":7,"_process":2,"fs":1,"path":undefined}],9:[function(require,module,exports){

var Parser   = require('./parser').Parser
var context  = require('./context')
var compiler = require('./compiler')
var semantic = require('./semantic')
var util     = require('./util')

// Compiles RamdaScript source code to JS, if returnCtx is true it
// return the context intead of compiled JS
// otps:
//     filename  The name of the source file
//     wrapper   module wrapper (commonjs, closure, none)
//
exports.compile = function compile(src, opts, returnCtx) {
    opts    = opts || {}
    var ctx = context.newContext(opts.filename)
    var ast = parse(src, opts)

    // check semantic
    var errors = semantic.checkAst(ast, ctx)

    if (returnCtx) {
        return ctx
    }

    // there is semantic errors?
    if (errors) {
        errors.forEach(function(e){
            console.error(e)
        })
        return
    // everything ok
    } else {
        return compiler.compileAst(ast, ctx, opts.wrapper)
    }
}

// parses the RamdaScript code
function parse(src, opts) {
    var parser = new Parser()
    parser.yy  = {parseError: util.parseError, filename: opts.filename}
    return parser.parse(src)
}

exports.parse = parse
},{"./compiler":5,"./context":6,"./parser":8,"./semantic":10,"./util":11}],10:[function(require,module,exports){

var util    = require('./util')
var nodes   = require('./nodes')
var T       = nodes.type

// walk through nodes
function walk(node, parent, ctx) {
    if (!node) {
        return
    }

    // walk each node if array
    if (util.isArray(node)) {
        return node.forEach(function(node){
            walk(node, parent, ctx)
        })
    }

    switch (node.type) {
        case T.IDENT :
            var name = node.content
            // do not allow ES keywords as identifier
            if (util.isESKeyword(name) && !util.isBuiltinFunction(name)) {
                ctx.error('`' + name + '` is a ECMAScript reserved keyword', node.loc.firstLine)
            }
        break
        case T.MODULE :
        case T.ARRAY  :
            node.content.forEach(function(node){
                if (isRIdent(node)) {
                    ctx.error('can not use `R` as identifier', node.loc.firstLine)
                }
            })
        case T.OBJECT :
            walk(node.content, node, ctx)
        break
        case T.PROPERTY :
            if (isRIdent(node.value)) {
                ctx.error('can not use `R` as identifier', node.value.loc.firstLine)
            }
            walk(node.value, node, ctx)
        break
        case T.SEXPR :
            var operator = node.operator
            var data     = node.content
            var lineno   = operator.loc.firstLine

            // just s-expressions and identifiers are callables
            if (operator.type !== T.IDENT && operator.type !== T.SEXPR) {
                ctx.error(unexpected(operator.type), lineno)
            }

            switch (operator.content) {
                case 'def':
                    // only in the module scope
                    if (parent.type !== T.MODULE) {
                        ctx.error('unexpected `def`', lineno)
                    }
                    // must have one or two arguments
                    if (data.length == 0 || data.length > 2) {
                        ctx.error('`def` must contain one or two arguments', lineno)
                    } else {
                        var varName = data[0].content
                        // can only define a var once
                        if (ctx.isDefinedVar(varName)) {
                            ctx.error('redefining `' + varName + '`', lineno)
                        } else {
                            ctx.addDefinedVar(varName)
                        }
                    }
                    // can not defined using qualified idents
                    if (isQualifiedIdent(data[0])) {
                        ctx.error('unespected qualified ident `' + varName + '`', lineno)
                    }
                break
                case 'import' :
                    if (parent.type !== T.MODULE) {
                        ctx.error('unexpected `import`', lineno)
                    }
                    if (data.length !== 2) {
                        ctx.error('`import` function must contain exactly two arguments', lineno)
                    } else {
                        var refer = data[1]
                        switch (refer.type) {
                            case T.IDENT :
                            break
                            case T.ARRAY :
                                // allowed array of identifiers
                                if (refer.content.length === 0) {
                                    ctx.error(unexpected('empty array'), node.loc.firstLine)
                                }
                                refer.content.forEach(function(node){
                                    if (node.type !== T.IDENT) {
                                        ctx.error(unexpected(node.type), node.loc.firstLine)
                                    }
                                })
                            break
                            default :
                                // allowed identifier
                                ctx.error(unexpected(refer.type), refer.loc.firstLine)
                        }
                    }
                break
                case 'new' :
                    // must provide a class
                    if (data.length === 0) {
                        ctx.error('`new` function must contain at least one argument', lineno)
                    }
                break
                case 'fn' :
                    var args = data[0]
                    if (args && args.type === T.ARRAY) {
                        // arguments must be an list of identifiers
                        args.content.forEach(function(node){
                            if (node.type !== T.IDENT) {
                                ctx.error(unexpected(node.type), node.loc.firstLine)
                            }
                        })
                    } else {
                        // first arguments must be a list of arguments
                        ctx.error('no arguments provided to `fn` function', lineno)
                    }
                break
                case 'alter' :
                    // must have one or two args at lear
                    if (data.length === 0 || data.length > 2) {
                        ctx.error('`alter` function must contain one or two arguments', lineno)
                    }
                break
            }

            // can not use `R` identifier as operator
            if (isRIdent(operator)) {
                ctx.error('can not use `R` as identifier', operator.loc.firstLine)
            }

            data.forEach(function(node) {
                // can not use `R` identifier directly
                if (isRIdent(node)) {
                    ctx.error('can not use `R` as identifier', node.loc.firstLine)
                }
                // can not use builtin fn as data in s-expressions
                if (util.isBuiltinFunction(node.content)) {
                    ctx.error(unexpected(node.content), node.loc.firstLine)
                }
            })

            walk(operator, node, ctx)
            walk(data, node, ctx)
        break
    }
}

// whether a node is and identifier and its content is `R`
function isRIdent(node) {
    return node &&
           node.type &&
           node.type === T.IDENT &&
           node.content === 'R'
}

function isQualifiedIdent(node) {
    return node && node.type === T.IDENT && node.content.indexOf('.') > -1
}

function unexpected(subject) {
    return 'unexpected `' + subject + '`'
}

// validate AST
exports.checkAst = function checkAst(ast, ctx) {
    walk(ast, null, ctx)
    return ctx.hasError() ? ctx.errors : void 0
}
},{"./nodes":7,"./util":11}],11:[function(require,module,exports){

// RamdaScript file extension
var ext = '.ram'

// regex to find `{}` placeholders in a string
var rFormat = /\{([\w\-]+)\}/g

var ESKeywords = [

    // Ecma-262 Keyword
    'break',
    'do',
    'instanceof',
    'typeof',
    'case',
    'else',
    'new',
    'var',
    'catch',
    'finally',
    'return',
    'void',
    'continue',
    'for',
    'switch',
    'while',
    'debugger',
    'function',
    'with',
    'default',
    'if',
    'throw',
    'delete',
    'in',
    'try',
    'null',

    // Ecma-262 FutureReservedWord
    'class',
    'enum',
    'extends',
    'const',
    'export',
    'import',

    // Ecma-262 FutureReservedWord (in strict mode)
    'implements',
    'let',
    'private',
    'public',
    'yield',
    'interface',
    'package',
    'protected',
    'static',
]

var BuiltinFunctions = [
    'new',
    'def',
    'fn',
    'alter',
    'import',
]

var RamdaFunctions  = [
    '__',
    'add',
    'addIndex',
    'adjust',
    'all',
    'allPass',
    'always',
    'and',
    'any',
    'anyPass',
    'ap',
    'aperture',
    'append',
    'apply',
    'applySpec',
    'assoc',
    'assocPath',
    'binary',
    'bind',
    'both',
    'call',
    'chain',
    'clamp',
    'clone',
    'comparator',
    'complement',
    'compose',
    'composeK',
    'composeP',
    'concat',
    'cond',
    'construct',
    'constructN',
    'contains',
    'converge',
    'countBy',
    'curry',
    'curryN',
    'dec',
    'defaultTo',
    'difference',
    'differenceWith',
    'dissoc',
    'dissocPath',
    'divide',
    'drop',
    'dropLast',
    'dropLastWhile',
    'dropRepeats',
    'dropRepeatsWith',
    'dropWhile',
    'either',
    'empty',
    'eqBy',
    'eqProps',
    'equals',
    'evolve',
    'F',
    'filter',
    'find',
    'findIndex',
    'findLast',
    'findLastIndex',
    'flatten',
    'flip',
    'forEach',
    'fromPairs',
    'groupBy',
    'groupWith',
    'gt',
    'gte',
    'has',
    'hasIn',
    'head',
    'identical',
    'identity',
    'ifElse',
    'inc',
    'indexBy',
    'indexOf',
    'init',
    'insert',
    'insertAll',
    'intersection',
    'intersectionWith',
    'intersperse',
    'into',
    'invert',
    'invertObj',
    'invoker',
    'is',
    'isArrayLike',
    'isEmpty',
    'isNil',
    'join',
    'juxt',
    'keys',
    'keysIn',
    'last',
    'lastIndexOf',
    'length',
    'lens',
    'lensIndex',
    'lensPath',
    'lensProp',
    'lift',
    'liftN',
    'lt',
    'lte',
    'map',
    'mapAccum',
    'mapAccumRight',
    'mapObjIndexed',
    'match',
    'mathMod',
    'max',
    'maxBy',
    'mean',
    'median',
    'memoize',
    'merge',
    'mergeAll',
    'mergeWith',
    'mergeWithKey',
    'min',
    'minBy',
    'modulo',
    'multiply',
    'nAry',
    'negate',
    'none',
    'not',
    'nth',
    'nthArg',
    'objOf',
    'of',
    'omit',
    'once',
    'or',
    'over',
    'pair',
    'partial',
    'partialRight',
    'partition',
    'path',
    'pathEq',
    'pathOr',
    'pathSatisfies',
    'pick',
    'pickAll',
    'pickBy',
    'pipe',
    'pipeK',
    'pipeP',
    'pluck',
    'prepend',
    'product',
    'project',
    'prop',
    'propEq',
    'propIs',
    'propOr',
    'props',
    'propSatisfies',
    'range',
    'reduce',
    'reduceBy',
    'reduced',
    'reduceRight',
    'reduceWhile',
    'reject',
    'remove',
    'repeat',
    'replace',
    'reverse',
    'scan',
    'sequence',
    'set',
    'slice',
    'sort',
    'sortBy',
    'split',
    'splitAt',
    'splitEvery',
    'splitWhen',
    'subtract',
    'sum',
    'symmetricDifference',
    'symmetricDifferenceWith',
    'T',
    'tail',
    'take',
    'takeLast',
    'takeLastWhile',
    'takeWhile',
    'tap',
    'test',
    'times',
    'toLower',
    'toPairs',
    'toPairsIn',
    'toString',
    'toUpper',
    'transduce',
    'transpose',
    'traverse',
    'trim',
    'tryCatch',
    'type',
    'unapply',
    'unary',
    'uncurryN',
    'unfold',
    'union',
    'unionWith',
    'uniq',
    'uniqBy',
    'uniqWith',
    'unless',
    'unnest',
    'until',
    'update',
    'useWith',
    'values',
    'valuesIn',
    'view',
    'when',
    'where',
    'whereEq',
    'without',
    'wrap',
    'xprod',
    'zip',
    'zipObj',
    'zipWith',
]

exports.ext = ext

// whether is a ES keyword
exports.isESKeyword = function isESKeyword(fname) {
    return ESKeywords.indexOf(fname) > -1
}

// whether is a Ramda function
exports.isRamdaFunction = function isRamdaFunction(fname) {
    return RamdaFunctions.indexOf(fname) > -1
}

// whether is a builtin function
exports.isBuiltinFunction = function isBuiltinFunction(fname) {
    return BuiltinFunctions.indexOf(fname) > -1
}

exports.isArray = function isArray(obj) {
    return Array.isArray(obj)
}

exports.isObject = function isObject(obj) {
    return obj && obj.constructor === Object
}

// format a string using `{}` placeholder
// example
//     u.format('Hello {0}', ['World'])
//     $> Hello World
//
//     u.format('Hello {name}', {name: 'Peter'})
//     $> Hello Peter
//
exports.format = function format(str, data) {
    var value
    data = data || {}
    return str.replace(rFormat, function(all, key) {
        value = data[key]
        return value === void 0 ? '' : value
    })
}

// trim a string
exports.trim = function trim(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '')
}

// utility function to intercept Jison generated parser errors
exports.parseError = function parseError(msg, hash, replaceMsg) {
    // if non recoverable parser error?
    if (hash && hash.line && hash.expected) {
        switch (hash.text) {
            case '\n':
                hash.text = 'end of line'
            break
            case ''  :
                hash.text = 'end of input'
            break
        }
        msg = replaceMsg ? msg : 'unexpected ' + hash.text
    } else {
        msg = replaceMsg ? msg : msg
    }

    var filename = this.filename || this.yy.filename

    throw msg + ' at ' + (filename || '<vm>' ) + ':' + hash.line
}
},{}]},{},[4]);
