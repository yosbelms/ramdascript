%lex
%%
[ \r\n\f\t\u00A0\u2028\u2029\uFEFF]+        /* skip whitespace */
"//".*                                      /* skip comments */
"/*"([\s\S]*?)"*/"                          /* skip comments */

"{#"([\s\S]*?)"#}"                          return 'JSBLOCK'

"'"([^\\']|\\[\s\S])*"'"                    return 'STRING'
"/"([^\\/]|\\[\s\S])*"/"[gimy]*             return 'REGEXP'

"_"                                         return 'SPECIAL_PLACEHOLDER'

"nil"                                       return 'NIL'
"true"|"false"                              return 'BOOLEAN'

0x[\da-fA-F]+|^\d*\.?\d+(?:[eE][+-]?\d+)?\b return 'NUMBER'
[\$_a-zA-Z\x7f-\uffff]+[\$\w\x7f-\uffff]*   return 'IDENT'

"{"  return '{'
"}"  return '}'
"("  return '('
")"  return ')'
"["  return '['
"]"  return ']'
":"  return ':'
","  return ','
"."  return '.'

$    return 'EOF'

.   {
        yy.parseError('character ' + yytext + ' with code: ' + yytext.charCodeAt(0), {
            line: yylloc.first_line
        })
    }

/lex
