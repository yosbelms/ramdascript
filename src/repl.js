
var repl = require('repl')
var vm   = require('vm')
var ram  = require('./ramdascript')

// launch RamdaScript REPL, external variables can be
// added to the context, example:
//
//     repl.launch({R: require('ramda')})
//
exports.launch = function launch(extCtx) {
    extCtx = extCtx || {}

    // launch
    repl.start('ram> ', null, _eval)

    function _eval(code, ctx, file, cb) {
        var js
        var err
        var result
        try {
            // import passed context
            Object.assign(ctx, extCtx)
            result = ram.compile(code, {
                filename: '<repl>'
            })
            result = vm.runInContext(result.js, ctx, file)
        } catch (e) {
            err = e
        }
        cb(err, result)
    }
}