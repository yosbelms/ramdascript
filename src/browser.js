window.R = require('ramda')
window.RamdaScript = module.exports = require('./ramdascript')
window.RamdaScript.run = run

function run(src) {
    var result = RamdaScript.compile(src, {format: 'none'})
    var fn     = new Function(result.js)
    return fn()
}

function runScripts() {
    var i
    var scripts = window.document.getElementsByTagName('script')

    for (i = 0; i < scripts.length; i++) {
        if (scripts[i].type === 'text/ramdascript') {
            run(scripts[i].innerHTML)
        }
    }
}

if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', runScripts, false)
} else {
    window.attachEvent('onload', runScripts)
}