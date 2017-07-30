
var Parser    = require('./parser').Parser
var context   = require('./context')
var compiler  = require('./compiler')
var semantic  = require('./semantic')
var sourcemap = require('./sourcemap')
var util      = require('./util')

// Compiles RamdaScript source code to JS, if returnCtx is true it
// return the context intead of compiled JS
// otps:
//     filename     The name of the source file
//     format       Module format (cjs, iife, none)
//     printErrors  Whether to print errors to console
//     sourceMap    Whether to build sourcemaps
//     sourceMapCfg Sourcemap configuration object
//
exports.compile = function compile(src, opts) {
    opts = opts || {}
    var js     = ''
    var smap   = ''
    var ctx    = context.newContext(opts.filename)
    var chunks = srcToChunks(src, opts, ctx)
    if (chunks) {
        js = chunks.join('')
        if (opts.sourceMap) {
            smap = chunksToSourceMap(chunks, opts.sourceMapCfg)
        }
    }
    return {
        js       : js,
        ctx      : ctx,
        sourceMap: smap
    }
}

// transform RamdaScript source to chunks
function srcToChunks(src, opts, ctx) {
    opts = opts || {}
    var ast = parse(src, opts)
    // check semantic
    var errors = semantic.checkAst(ast, ctx)
    // there is semantic errors?
    if (errors) {
        if (opts.printErrors !== false) {
                errors.forEach(function(e){
                console.error(e)
            })
        }
        return
    // everything ok
    } else {
        return compiler.astToChunks(ast, ctx, opts.format)
    }
}

// convert chunks to source map
//     chunks array of chunks
//     cfg    sourcemap config
//
function chunksToSourceMap(chunks, cfg) {
    var loc
    var outLine   = 0
    var outColumn = 0
    var smap      = sourcemap.newSourceMap()
    var acc = ''

    chunks.forEach(function(chunk) {
        if (chunk.content === '\n') {
            outLine   = outLine + 1
            outColumn = 0
        }
        loc = chunk.loc
        if (loc) {
            smap.add(
                // jison line tracking is 1 based,
                // source maps reads it as 0 based
                loc.firstLine - 1,
                loc.firstColumn,
                outLine,
                outColumn
            )
        }
        if (chunk.content !== '\n') {
            outColumn = outColumn + chunk.content.length
        }
    })

    return smap.generate(cfg)
}

// parses the RamdaScript code
function parse(src, opts) {
    var parser = new Parser()
    parser.yy  = {parseError: util.parseError, filename: opts.filename}
    return parser.parse(src)
}

exports.srcToChunks = srcToChunks
exports.chunksToSourceMap = chunksToSourceMap
exports.parse = parse