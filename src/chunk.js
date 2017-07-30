
module.exports = function chunk(content, loc) {
    var chunk = {
        content : content || '',
        loc     : loc
    }

    chunk.toString = chunkToString(chunk)

    return chunk
}

function chunkToString(chunk) {
	return function () {
		return chunk.content
	}
}