
exports.newContext = function newContext(filename) {
    return {
        filename: filename || '<vm>',

        buffer: [],

        indentLevel: 0,

        indentUnit:  '    ',

        currentIndent: '',

        usedRamdaFn: {},

        definedVars: {},

        errors: [],

        out: function out() {
            return this.buffer.join('')
        },

        write: function(d) {
            this.buffer.push(d)
        },

        newLine: function newLine() {
            this.buffer.push('\n' + this.currentIndent)
        },

        updateIndent: function updateIndent() {
            var str = ''
            for (var idx = 0; idx < this.indentLevel; idx++) {
                str += this.indentUnit
            }
            this.currentIndent = str
        },

        indent: function indent() {
            this.indentLevel++
            this.updateIndent()
        },

        dedent: function dedent() {
            this.indentLevel--
            this.updateIndent()
        },

        addUsedRamdaFn: function addUsedRamdaFn(name) {
            this.usedRamdaFn[name] = 1
        },

        addDefinedVar: function addDefinedVar(name) {
            this.definedVars[name] = 1
        },

        error: function error(msg, lineno) {
            this.errors.push(msg + ' at ' + this.filename + ':' + lineno)
        },

        hasError: function() {
            return this.errors.length > 0
        }
    }
}