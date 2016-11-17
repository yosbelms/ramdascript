
var R       = require('../vendor/ramda')
var fs      = require('fs')
var path    = require('path')
var argv    = process.argv.slice(2)
var ram     = require('./ramdascript')
var repl    = require('./repl')
var util    = require('./util')
var rOption = /^-(\S+)/
var command = argv.shift()
var opts    = parseOpts(argv)
var file    = ''

var help    = ['',
'Usage: ram [command] [args]',
'',
'If called without any command will print this help',
'',
'compile -src [-dst] [-nowrap]',
'',
'Compile to JavaScript and save as .js file',
'  -src    Route to source file or directory with RamdaScript code',
'  -dst    Route where the resulting JavaScript code will be saved',
'          if route is "stdout" the resulting code will be sent to stdout',
'  -nowrap Whether do not use CommonJS wrappers',
'',
'eval [-src]',
'',
'Compile and print RamdaScript code directly from the command line',
'  -src    RamdaScript source code to be executed',
'          if -src is stdin the code will be readed from stdin',
'',
'repl',
'',
'Launch an interactive RamdaScript session',
'',
'help',
'',
'Print this help',
]

switch (command) {
    case 'compile' :
        compile(opts)
    break
    case 'repl' :
        repl.launch({R: R})
    break
    case 'eval' :
        _eval(opts)
    break
    case 'help' :
    default :
        console.log(help.join('\n'))
}

// extract cli options
function parseOpts(argv) {
    var lastOpt, parsed, opts = {}
    argv.forEach(function(arg){
        parsed = rOption.exec(arg)
        if (parsed) {
            lastOpt = parsed[1]
            opts[lastOpt] = true
            return
        }
        opts[lastOpt] = arg
    })
    return opts
}

// executes eval command
function _eval(opts) {
    var src = opts['src']

    // read from stdin
    if (src === 'stdin') {
        readFromStdin(function(src) {
            run(src)
        })
    } else {
        run(src)
    }

    function run(src) {
        var fn = new Function('R', ram.compile(src, '<eval>'))
        fn(R)
    }
}

// executes compile command
function compile(opts) {
    var srcPath    = opts['src'] || process.cwd()
    var dstPath    = opts['dst']
    var addWrapper = !opts['nowrap']
    var toStdout   = dstPath === 'stdout'
    var stat       = fs.statSync(srcPath)

    if (!dstPath) {
        dstPath = path.join(
            path.dirname(srcPath),
            path.basename(srcPath, util.ext) + (stat.isFile() ? '.js' : '')
        )
    }

    if (stat.isFile()) {
        compileFile(srcPath, dstPath, addWrapper, toStdout)
    } else if (stat.isDirectory()) {
        compileDir(srcPath, dstPath, addWrapper)
    }
}

// recursively compile a directory tree containig RamdaScript
// files and saves the resulting JavaScript code to the provided destiny
// if the destiny path is omitted the JavaScript code will be saved adjacent
// to the RamdaScript source file
function compileDir(srcPath, dstPath, addWrapper, toStdout) {
    fs.readdir(srcPath, function(err, files){
        files = files.reduce(function(arr, fname){
            if (path.extname(fname) === util.ext) {
                arr.push(fname)
            }
            return arr
        }, [])

        files.forEach(function(fname){
            compileFile(path.join(srcPath, fname), path.join(dstPath, path.basename(fname, util.ext) + '.js'), addWrapper, toStdout)
        })
    })
}

// compile a the provided file containig RamdaScript code and save the
// resulting JavaScript code, if the destiny path is omitted the JavaScript code
// will be saved adjacent to the RamdaScript source file
function compileFile(srcPath, dstPath, addWrapper, toStdout) {
    if (! fs.existsSync(dstPath)) {
        makePath(dstPath)
    }

    fs.readFile(srcPath, 'utf8', function(err, data) {
        var js
        if (err) {
            throw err
        }

        js = ram.compile(data, {
            addWrapper: addWrapper
        })

        if (toStdout) {
            process.stdout.write(js + '\n')
            return
        }

        if (js) {
            fs.writeFile(dstPath, js, 'utf8', function(err){
                if (err) {
                    throw err
                }
            })
        }
    })
}

// makes a directory path in the filesysytem
function makePath(dirPath) {
    dirPath = path.dirname(dirPath).split(path.sep)
    dirPath.reduce(function(dirPath, p){
        dirPath = path.join(dirPath, p)
        if (! fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath)
            } catch (e) {
                throw 'Could not make path ' + genPath
            }
        }
        return dirPath
    }, '')
}

// reads from stdin and execute a callback `cb`
// passing the the content as param
function readFromStdin(cb) {
    var chunks = []
    var stdin = process.stdin
    stdin.resume()
    stdin.setEncoding('utf8')

    stdin.on('data', function (chunk) {
        chunks.push(chunk)
    })

    stdin.on('end', function() {
        cb(chunks.join(' '))
    })
}
