
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
                        ctx.error('unezpected qualified ident `' + varName + '`', lineno)
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