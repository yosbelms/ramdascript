
var nodes   = require('./nodes')
var util    = require('./util')
var T       = nodes.type
var newNode = nodes.node

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
                    ctx.write('void 0 ')
                    ctx.newLine()
                }
            return
            case 'fn' :
                var body, args = data[0]

                ctx.write('function (')

                // write arguments
                if (args.content && args.content.length > 0) {
                    args.content.forEach(function(arg, idx, arr) {
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
function writeCommonJSWrapper(ctx) {
    if (Object.keys(ctx.usedRamdaFns).length > 0) {
        ctx.writeTop('var R = require(\'ramda\')\n\n')
    }

    /*
    Granular require for each function, for minimal bundle size
    TODO: Consult Ramda authors

    var rfns = []
    Object.keys(ctx.usedRamdaFns).forEach(function(key) {
        rfns.push(ctx.indentUnit + key + ': require(\'ramda/src/' + key + '\')')
    })

    if (rfns.length > 0) {
        ctx.writeTop('var R = {\n' + rfns.join(',\n') + '\n}\n\n')
    }
    */

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
    ctx.writeTop('(function () {\n\n')
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
            writeCommonJSWrapper(ctx)
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