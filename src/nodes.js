
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
        defVars : [],
        parent  : null,
        loc     : loc && {
            firstLine  : loc.first_line,
            lastLine   : loc.last_line,
            firstColumn: loc.first_column,
            lastColumn : loc.last_column,
        }
    }
}