var opts = {
    type       : 'lalr',
    moduleName : 'RamdaScriptParser',
    moduleType : 'commonjs',
}

var fs        = require('fs')
var jison     = require('jison')
var lexerBnf  = fs.readFileSync(__dirname + '/../src/bnf.l', 'utf8')
var parserBnf = fs.readFileSync(__dirname + '/../src/bnf.y', 'utf8')
var parser    = jison.Generator(lexerBnf + parserBnf, opts)

// write to file
fs.writeFileSync(__dirname + '/../src/parser.js', parser.generate(), 'utf8')