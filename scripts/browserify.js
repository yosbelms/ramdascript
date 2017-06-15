var browserify = require('browserify')
browserify(__dirname + '/../src/browser.js').
exclude('path').
bundle().
pipe(process.stdout)