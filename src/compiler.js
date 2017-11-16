
var nodes   = require('./nodes')
var util    = require('./util')
var T       = nodes.type
var newNode = nodes.node

// walk through nodes
function walk(node, parent, ctx) {
    if (!node) {
        return
    }

    node.parent = parent

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
            visitJSBlock(node, parent, ctx)
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
        case T.REGEXP  :
            visitRegexp(node, parent, ctx)
        break
        case T.NUMBER  :
        case T.BOOLEAN :
        case T.LITERAL :
            visitLiteral(node, parent, ctx)
    }
}

function visitLiteral(node, parent, ctx) {
    var content = node.content
    var firstLine = node.loc.firstLine
    var splitted

    if (content.indexOf('\n') === -1) {
        ctx.write(content, node.loc)
        return
    }

    splitted = content.split('\n')
    splitted.forEach(function(part, idx){
        ctx.write(part, firstLine + idx)
        ctx.newLine()
    })
}

function visitNil(node, parent, ctx) {
    ctx.write('null', node.loc)
}

function visitString(node, parent, ctx) {
    var str = node.content
    node.content = str.replace(/\n|\r\n/g, '\\\n')
    visitLiteral(node, parent, ctx)
}

function visitRegexp(node, parent, ctx) {
    var str = node.content
    node.content = str.replace(/\n|\r\n/g, '')
    visitLiteral(node, parent, ctx)
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
        || isAccessibleVar(node, cont)
    )) {
        if (util.isRamdaFunction(cont)) {
            ctx.addUsedRamdaFn(cont)
            cont = 'R.' + cont
        }
    }
    ctx.write(cont, node.loc)
}

function visitSpecialPlaceholder(node, parent, ctx) {
    ctx.addUsedRamdaFn('__')
    ctx.write('R.__', node.loc)
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
                ctx.write('new ', node.loc)
            break
            case 'def' :
                var varName = data[0]
                var value   = data[1]

                ctx.write('var ', node.loc)
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
                    ctx.write('function (', node.loc)
                } else {
                    ctx.addUsedRamdaFn('curry')
                    ctx.write('R.curry(function (', node.loc)
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
                    //ctx.write('return ')

                    // separate each s-expression by comma
                    body.forEach(function(item, idx, arr) {
                        if (idx === arr.length - 1) {
                            ctx.write('return ')
                        }
                        walk(item, node, ctx)
                        ctx.write(';')
                        if (idx < arr.length - 1) {
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
                    ctx.write('var ', node.loc)
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
            case 'export' :
                var exported = node.content[0]
                if (exported.type === T.IDENT) {
                    // export as default
                    parent.exportedDefault = exported.content
                } else if (exported.type === T.ARRAY) {
                    exported.content.forEach(function(exported) {
                        util.addExportedVar(parent, exported.content)
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

function visitJSBlock(node, parent, ctx) {
    var str = node.content
    node.content = util.trim(str.substring(2, str.length - 2))
    visitLiteral(node, parent, ctx)
}

// whether is a node that needs indentation before to write it
function isIndentableNode(node) {
    return node.type === T.SEXPR
}

function isAccessibleVar(node, varName) {
    if (!node) {
        return false
    }
    return util.isDefVar(node, varName) || isAccessibleVar(node.parent, varName)
}

// write CommonJS stub
function writeCommonJSStub(ast, ctx, requireRamda) {
    // Granular require for each Ramda function, for minimal bundle size
    if (requireRamda) {
        var usedFns = []

        Object.keys(ctx.usedRamdaFns).forEach(function(key) {
            usedFns.push(ctx.indentUnit + key + ': require(\'ramda/src/' + key + '\')')
        })

        if (usedFns.length > 0) {
            ctx.newLineTop()
            ctx.newLineTop()
            ctx.writeTop('}')
            ctx.newLineTop()

            usedFns.forEach(function(fnName, idx) {
                if (idx != 0) {
                    ctx.newLineTop()
                    ctx.writeTop(',')
                }
                ctx.writeTop(fnName)
            })

            ctx.newLineTop()
            ctx.writeTop('var R = {')
        }
    }

    ctx.newLine()
    ctx.newLine()

    if (ast.exportedDefault) {
        ctx.write('module.exports = ' + ast.exportedDefault)
    } else {
        ast.exportedVars.forEach(function(name, idx, arr){
            ctx.write('exports.' + name + ' = ' + name)
            if (idx < arr.length - 1) {
                ctx.newLine()
            }
        })
    }
}

// write IIFE stub
function writeIIFEStub(ctx) {
    ctx.newLineTop()
    ctx.newLineTop()
    ctx.writeTop(';(function () {')

    ctx.newLine()
    ctx.newLine()
    ctx.write('})()')
}

function writeCompilerInfo(ctx) {
    var version = require('../package.json').version
    ctx.newLineTop()
    ctx.newLineTop()
    ctx.writeTop('// Generated by RamdaScript ' + version)
}

// convert the AST in JS code
// params
//     ast    AST
//     ctx    Shared context
//     format Module format (cjs, iife, none)
//
exports.astToChunks = function astToChunks(ast, ctx, format) {
    walk(ast, null, ctx)
    format = format || 'none'

    switch (format) {
        case 'cjs' :
            writeCommonJSStub(ast, ctx, true)
        break
        case 'cjs-export' :
            writeCommonJSStub(ast, ctx, false)
        break
        case 'iife' :
            writeIIFEStub(ctx)
        break
        case 'none' :
        break
        default :
            throw '`' + format + '` is not a valid format'
    }
    writeCompilerInfo(ctx)
    return ctx.chunks
}