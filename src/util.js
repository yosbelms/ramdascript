
var ext = '.ram'

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
    'reset',
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

exports.isESKeyword = function isESKeyword(fname) {
    return ESKeywords.indexOf(fname) > -1
}

exports.isRamdaFunction = function isRamdaFunction(fname) {
    return RamdaFunctions.indexOf(fname) > -1
}

exports.isBuiltinFunction = function isBuiltinFunction(fname) {
    return BuiltinFunctions.indexOf(fname) > -1
}

exports.isArray = function isArray(obj) {
    return Array.isArray(obj)
}

exports.isObject = function isObject(obj) {
    return obj && obj.constructor === Object
}

exports.format = function format(str, data) {
    var value
    data = data || {}
    return str.replace(rFormat, function(all, key) {
        value = data[key]
        return value === void 0 ? '' : value
    })
}

exports.trim = function trim(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '')
}

exports.parseError = function parseError(msg, hash, replaceMsg) {
    var yy = this
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

    throw msg + ' at ' + (yy.filename || '<vm>' ) + ':' + hash.line
}