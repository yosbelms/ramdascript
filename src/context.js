
// Returns a new compilation context object to be shared
// between compilation steps (semantic analizing and compilation)
// it keeps track of defined variables, used ramda functions,
// errors, and JS code
exports.newContext = function newContext(filename) {
    return {

        // filename
        filename: filename || '<vm>',

        // the compiled JS
        buffer: [],

        indentLevel: 0,

        indentUnit: '    ',

        // indentation spaces
        currentIndent: '',

        // used Ramda functions
        usedRamdaFns: {},

        // vars defined in a script
        definedVars: {},

        errors: [],

        // returns the compiled JS
        out: function out() {
            return this.buffer.join('')
        },

        // write to the buffer
        write: function(d) {
            this.buffer.push(d)
        },

        // write at top of the buffer
        writeTop: function(d) {
            this.buffer.unshift(d)
        },

        // write a new line and indentation
        newLine: function newLine() {
            this.buffer.push('\n' + this.currentIndent)
        },

        // updates current indentation spaces depending
        // on current indentation level
        updateIndent: function updateIndent() {
            var str = ''
            for (var idx = 0; idx < this.indentLevel; idx++) {
                str += this.indentUnit
            }
            this.currentIndent = str
        },

        // augment indentation
        indent: function indent() {
            this.indentLevel++
            this.updateIndent()
        },

        // diminish indentation
        dedent: function dedent() {
            this.indentLevel--
            this.updateIndent()
        },

        // register used Ramda functions
        addUsedRamdaFn: function addUsedRamdaFn(name) {
            this.usedRamdaFns[name] = 0
        },

        // register defined vars
        addDefinedVar: function addDefinedVar(name) {
            this.definedVars[name] = 0
        },

        // whether is registered as defined
        isDefinedVar: function varIsDefined(name) {
            return this.definedVars.hasOwnProperty(name)
        },

        // add error
        error: function error(msg, lineno) {
            this.errors.push(msg + ' at ' + this.filename + ':' + lineno)
        },

        // whether the context has error
        hasError: function() {
            return this.errors.length > 0
        }
    }
}