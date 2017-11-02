
var R       = require('ramda')
var fs      = require('fs')
var path    = require('path')
var Module  = require('module')
var argv    = process.argv.slice(2)
var ram     = require('./ramdascript')
var repl    = require('./repl')
var util    = require('./util')
var rOption = /^-(\S+)/
var command = argv.shift()

var help    = ['',
'Usage: ram [command] [args]',
'',
'If "command" is a .ram file will run that file',
'If called without any command will print this help',
'',
'run [-src]',
'',
'Run .ram file containig RamdaScript code',
'  -src    Route to source file with RamdaScript code',
'',
'compile [-src] [-dst] [-format]',
'',
'Compile to JavaScript and save as .js file',
'  -src    Route to source file or directory with RamdaScript code',
'          the default value is the current directory (cwd)',
'  -dst    Route where the resulting JavaScript code will be saved',
'          if route is "stdout" the resulting code will be sent to stdout',
'  -format Specify module format, possible values are: cjs, iife, none.',
'          cjs is the default',
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

dispatch(command, parseOpts(argv))

function dispatch(command, opts) {
    switch (command) {
        case 'compile' :
            compile(opts)
        break
        case 'run' :
            run(opts)
        break
        case 'repl' :
            repl.launch({R: R})
        break
        case 'eval' :
            _eval(opts)
        break
        case 'help' :
        default :
            if (command && path.extname(command) === util.ext) {
                opts['src'] = command
                dispatch('run', opts)
            } else {
                console.log(help.join('\n'))
            }
    }
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

function run(opts) {
    // register `.ram` extension in nodejs modules
    Module._extensions[util.ext] = function(module, filename) {
        var content = fs.readFileSync(filename, 'utf8')
        var result = ram.compile(content, {
            filename: filename,
            // just use commonjs export, `R` will be imported from global
            format : 'cjs-export',
        })
        module._compile(result.js, filename)
    }

    var src = opts['src']
    var absolute = path.resolve(process.cwd(), src)
    // globalize Ramda module to be used by loaded modules
    global.R = R
    require(absolute)
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
        var fn = new Function('R', ram.compile(src, '<eval>').js)
        fn(R)
    }
}

// executes compile command
function compile(opts) {
    var srcPath  = opts['src'] || process.cwd()
    var dstPath  = opts['dst']
    var format   = opts['format'] || 'cjs'
    var toStdout = dstPath === 'stdout'
    var stat     = fs.statSync(srcPath)

    if (!srcPath) {
        srcPath = path.cwd()
    }

    // calculate destiny path based on source path
    if (!dstPath) {
        dstPath = path.join(
            path.dirname(srcPath),
            path.basename(srcPath, util.ext) + (stat.isFile() ? '.js' : '')
        )
    }

    if (stat.isFile()) {
        compileFile(srcPath, dstPath, format, toStdout)
    } else if (stat.isDirectory()) {
        compileDir(srcPath, dstPath, format)
    }
}

// recursively compile a directory tree containig RamdaScript
// files and saves the resulting JavaScript code to the provided destiny
// if the destiny path is omitted the JavaScript code will be saved adjacent
// to the RamdaScript source file
function compileDir(srcPath, dstPath, format, toStdout) {
    fs.readdir(srcPath, function(err, list) {
        if (err) throw err

        list.forEach(function(fname) {
            fname = path.join(srcPath, fname)

            fs.stat(fname, function(err, stat) {
                if (err) throw err

                // skip files and dirs with name starting with `.`
                if (/^\./.test(fname)) {
                    return
                }

                if (stat.isFile() && path.extname(fname) === util.ext) {
                    compileFile(fname, path.join(dstPath, path.basename(fname, util.ext) + '.js'), format, toStdout)
                } else if (stat.isDirectory()) {
                    compileDir(fname, path.join(dstPath, path.basename(fname)), format, toStdout)
                }
            })
        })
    })
}

// compile a the provided file containig RamdaScript code and save the
// resulting JavaScript code, if the destiny path is omitted the JavaScript code
// will be saved adjacent to the RamdaScript source file
function compileFile(srcPath, dstPath, format, toStdout) {
    if (! fs.existsSync(dstPath)) {
        makePath(dstPath)
    }

    fs.readFile(srcPath, 'utf8', function(err, data) {
        if (err) throw err

        var cwd         = process.cwd()
        var smapDstPath = dstPath + '.map'
        var smapSrcPath = path.relative(
            path.dirname(
                path.join(cwd, dstPath)),
                path.join(cwd, srcPath))
        var result = ram.compile(data, {
            filename : srcPath,
            format  : format,
            sourceMap: !toStdout,
            sourceMapCfg: {
                source: smapSrcPath,
                sourceContent: data
            }
        })

        if (toStdout) {
            process.stdout.write(result.js + '\n')
            return
        }

        if (result.js) {
            result.js = result.js + '\n//# sourceMappingURL=' + path.basename(dstPath) + '.map'
            fs.writeFile(dstPath, result.js, 'utf8', function(err) {
                if (err) throw err
            })
        }

        if (result.sourceMap) {
            fs.writeFile(smapDstPath, result.sourceMap, 'utf8', function(err) {
                if (err) throw err
            })
        }
    })
}

// makes a directory path in the filesystem
function makePath(dirPath) {
    dirPath = path.dirname(dirPath).split(path.sep)
    dirPath.reduce(function(dirPath, p) {
        dirPath = path.join(dirPath, p)
        if (! fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath)
            } catch (e) {
                throw 'Could not make path ' + dirPath
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
