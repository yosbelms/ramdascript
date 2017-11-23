%start Module

%ebnf
%%

Module
    : Source* EOF               { return node(T.MODULE, $1, @1) }
    ;

Source
    : SExp
    | JSBlock
    ;

JSBlock
    : JSBLOCK                   { $$ = node(T.JSBLOCK, $1, @1) }
    ;

SExp
    : '(' AtomList ')'          {

            $$ = node(T.SEXPR, $2 || [], @2)

            if ($2 && $2[0]) {
                $$.operator = $2.shift()
            }
        }
    ;

Array
    : '[' AtomList? ']'         { $$ = node(T.ARRAY, $2 || [], @2) }
    ;

QualifiedIdent
    : IDENT                     { $$ = node(T.IDENT, $1, @1) }
    | QualifiedIdent '.' IDENT  {
            $1.content += ('.' + $3);
        }
    ;

Object
    : '{' PropertyList? '}'     { $$ = node(T.OBJECT, $2 || [], @2) }
    ;

PropertyList
    : Property Separator              { $$ = [$1]   }
    | PropertyList Property Separator { $$.push($2) }
    ;

Property
    : KEY_IDENT AtomNoKeyIdent  {
            $$       = node(T.PROPERTY)
            $$.key   = node(T.KEY_IDENT, $1, @1)
            $$.value = $2
        }
    ;

AtomList
    : Atom Separator          { $$ = [$1]   }
    | AtomList Atom Separator { $$.push($2) }
    ;

Atom
    : AtomNoKeyIdent
    | KEY_IDENT               { $$ = node(T.KEY_IDENT, $1, @1) }
    ;

AtomNoKeyIdent
    : QualifiedIdent
    | SPECIAL_PLACEHOLDER    { $$ = node(T.SPECIAL_PLACEHOLDER, $1, @1) }
    | STRING                 { $$ = node(T.STRING, $1, @1)              }
    | NUMBER                 { $$ = node(T.NUMBER, $1, @1)              }
    | REGEXP                 { $$ = node(T.REGEXP, $1, @1)              }
    | NIL                    { $$ = node(T.NIL, $1, @1)                 }
    | BOOLEAN                { $$ = node(T.BOOLEAN, $1, @1)             }
    | JSBlock
    | SExp
    | Array
    | Object
    ;

Separator
    : ','
    |
    ;

%%

var nodes = require('./nodes')
var node  = nodes.node
var T     = nodes.type