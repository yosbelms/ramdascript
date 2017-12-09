
var repl = require('repl')
var vm   = require('vm')
var ram  = require('./ramdascript')
var util = require('./util')

// launch RamdaScript REPL, external variables can be
// added to the context, example:
//
//     repl.launch({R: require('ramda')})
//
exports.launch = function launch(extCtx) {
    extCtx = extCtx || {}
    Object.assign(global, extCtx)
    // launch
    repl.start({
        prompt : 'ram> ',
        eval   : _eval,
        writer : util.inspect
    })
}

function _eval(code, ctx, file, cb) {
    var err
    var result
    var value
    var filename = '<repl>'
    try {
        result = ram.compile(code, {
            filename: filename,
            format: 'none'
        })
        value = vm.runInThisContext(result.js, {
            filename: filename,
            lineOffset: 0,
            displayErrors: true
        })
    } catch (e) {
        err = e
    }
    cb(err, value)
}