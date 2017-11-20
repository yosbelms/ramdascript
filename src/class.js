var curry = require('ramda/src/curry')

// #extend [(class A) Object (class B)]
// Creates a new class by extending a base class
//
// ```
// (def Person (extend Object {
//     :name 'Steve'
//     :getName (func [][] this.name)}))
// ```
exports.extend = curry(function extend(Base, definition) {
    var newClass = function(){}
    newClass.prototype = Object.assign(Object.create(Base.prototype), definition)
    return newClass
})