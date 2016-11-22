
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