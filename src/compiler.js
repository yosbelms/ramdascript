
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
        case T.IDENT   :
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

function visitSpecialPlaceholder(node, parent, ctx) {
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

                ctx.addDefinedVar(varName.content)

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
            case 'reset' :
                var recver = data[0]
                var value  = data[1]

                if (parent.type === T.MODULE) {
                    ctx.write(';')
                }

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
            return
            case 'import' :
                var tmpVar  = '$mod'
                var modPath = data[0]
                var refer   = data[1]

                if (refer.type == T.IDENT) {
                    ctx.write('var ')
                    walk(refer, node, ctx)
                    ctx.write(' = require(')
                    walk(modPath, node, ctx)
                    ctx.write(')')
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

    // prepend `R.` to the name if it is a ramda function
    if (util.isRamdaFunction(operator.content)) {
        ctx.addUsedRamdaFn(operator.content)
        operator.content = 'R.' + operator.content
    }

    walk(operator, node, ctx)
    ctx.write('(')
    ctx.indent()

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
    ctx.write('[')
    ctx.indent()

    if (node.content) {
        node.content.forEach(function(child, idx, arr){
            ctx.newLine()
            walk(child, node, ctx)
            if (idx < arr.length - 1) {
                ctx.write(', ')
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

function isIndentableNode(node) {
    return node.type === T.SEXPR
}

function writeHeader(ctx) {
    if (Object.keys(ctx.usedRamdaFn).length > 1) {
        ctx.buffer.unshift('var R = require(\'ramda\')\n\n')
    }
}

function writeFooter(ctx) {
    ctx.newLine()
    ctx.newLine()
    Object.keys(ctx.definedVars).forEach(function(name, idx, arr){
        ctx.write('exports.' + name + ' = ' + name)
        if (idx < arr.length - 1) {
            ctx.newLine()
        }
    })
}

exports.compileAst = function compileAst(ast, ctx, addWrapper) {
    walk(ast, null, ctx)
    if (addWrapper) {
        writeHeader(ctx)
        writeFooter(ctx)
    }
    return ctx.out()
}