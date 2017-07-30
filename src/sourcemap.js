
// This is a version,
// the original code can be found at
// https://github.com/jashkenas/coffeescript/tree/master/src/sourcemap.litcoffee

var VLQ_SHIFT            = 5
var VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT
var VLQ_VALUE_MASK       = VLQ_CONTINUATION_BIT - 1
var BASE64_CHARS         = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function toVlq(value) {
    var nextChunk
    var vlq           = ''
    var signBit       = value < 0 ? 1 : 0
    var valueToEncode = (Math.abs(value) << 1) + signBit

    while (valueToEncode || !vlq) {
        nextChunk     = valueToEncode & VLQ_VALUE_MASK
        valueToEncode = valueToEncode >> VLQ_SHIFT

        if (valueToEncode) {
            nextChunk |= VLQ_CONTINUATION_BIT
        }

        vlq += toBase64(nextChunk)
    }
    return vlq
}

function toBase64(value) {
    var b64 = BASE64_CHARS[value]

    if (!b64) {
        throw 'Can not encode ' + value + ' to base-64'
    }
    return b64
}

var newLineMap = function newLineMap(l) {
    return {
        line    : l,
        segments: [],

        add: function(generatedColumn, sourceLine, sourceColumn) {
            this.segments[generatedColumn] = {
                line        : this.line,
                column      : generatedColumn,
                sourceLine  : sourceLine,
                sourceColumn: sourceColumn
            }

            return this.segments
        }
    }
}

exports.newSourceMap = function newSourceMap() {
    return {
        lines: [],
        names: null,

        add: function(sourceLine, sourceColumn, generatedLine, generatedColumn) {
            var line = this.lines[generatedLine]

            if (!line) {
                line = this.lines[generatedLine] = newLineMap(generatedLine)
            }

            line.add(generatedColumn, sourceLine, sourceColumn)
        },

        generate: function(cfg) {
            cfg = cfg || {}

            var i
            var j
            var line
            var sm
            var segment
            var segmentsLen
            var currentLine      = 0
            var lastSourceLine   = 0
            var lastSourceColumn = 0
            var lastColumn       = 0
            var linesLen         = this.lines.length
            var mapping          = ''
            var segmentSep       = ''

            for (i = 0; i < linesLen; i++) {
                line = this.lines[i]

                if (!line) continue

                segmentsLen = line.segments.length

                for (j = 0; j < segmentsLen; j++) {
                    segment = line.segments[j]

                    if (!segment) continue

                    while (currentLine < segment.line) {
                        segmentSep = ''
                        lastColumn = 0
                        mapping    += ';'
                        currentLine++
                    }

                    mapping += segmentSep
                    mapping += toVlq(segment.column - lastColumn)
                    mapping += toVlq(0)
                    mapping += toVlq(segment.sourceLine - lastSourceLine)
                    mapping += toVlq(segment.sourceColumn - lastSourceColumn)

                    lastColumn       = segment.column
                    lastSourceLine   = segment.sourceLine
                    lastSourceColumn = segment.sourceColumn

                    segmentSep = ','
                }
            }

            sm = {
                version       : 3,
                file          : '',
                sourceRoot    : '',
                sources       : [''],
                sourcesContent: [null],
                names         : [],
                mappings      : mapping
            }

            if (cfg.file) {
                sm.file = cfg.file
            }

            if (cfg.sourceRoot) {
                sm.sourceRoot = cfg.sourceRoot
            }

            if (cfg.source) {
                sm.sources = [cfg.source]
            }

            if (cfg.sourceContent) {
                sm.sourcesContent = [cfg.sourceContent]
            }

            return JSON.stringify(sm)
        }
    }
}