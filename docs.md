
# RamdaScript

RamdaScript is a language that compiles to JavaScript. It is a syntactic sugar to make elegant what is already streightforward, the Ramda API.

* [Overview](#overview)
* [Installation](#installation)
* [Language Reference](#language-reference)
    * [Literals and Comments](#literals-and-comments)
    * [Functions](#functions)
        * [New](#new)
        * [Def](#def)
        * [Fn](#fn)
        * [Alter](#alter)
        * [Import](#import)
        * [More functions](#more-functions)
    * [Embedded JavaScript](#embedded-javascript)
* [Further Reading](#further-reading)

## Overview

RamdaScript was created after trying to write apps logic using only Ramda. I quickly realized that the Lisp syntax fits better than JavaScript when writing large codebase using a declarative approach. Furthemore, it is always tempting to fall in writing imperative snippets, and finally end up with a mixing of different paradigms.

RamdaScript compiles to readable and pretty-printed JavaScript. The following RamdaScript code:

```
(def todos [
    {
        : title 'See todo list'
        : completed false
    }
    {
        : title 'Procrastinate'
        : completed true
    }])

(def findCompleted
    (filter
        (propEq 'completed' true)))

(console.log (findCompleted todos))
```

Compiles to:

```
var todos = [
    {
        title : 'See todo list',
        completed : false
    },
    {
        title : 'Procrastinate',
        completed : true
    }
]

var findCompleted = R.filter(
    R.propEq('completed', true))

console.log(
    findCompleted(todos))
```

## Installation

To install, first make sure you have a working copy of the latest stable version of Node.js. You can then install RamdaScript globally with [npm](https://npmjs.org):

```shell
npm install -g ramdascript
```

If you need RamdaScript as a dependency, install it locally:

```shell
npm install --save ramdascript
```

## Usage

Once installed, you should have access to the `ram` command, which can compile `.ram` files to `.js`, and provide an interactive REPL. The `ram` CLI takes the following subcommands:

```
Usage: ram [command] [args]

If called without any command will print this help

compile [-src] [-dst] [-nowrap]

Compile to JavaScript and save as .js file
  -src    Route to source file or directory with RamdaScript code
          the default value is the current directory (cwd)
  -dst    Route where the resulting JavaScript code will be saved
          if route is "stdout" the resulting code will be sent to stdout
  -wrap   Specify module wrapper, possible values are: commonjs, closure, none;
          commonjs is the default

eval [-src]

Compile and print RamdaScript code directly from the command line
  -src    RamdaScript source code to be executed
          if -src is stdin the code will be readed from stdin

repl

Launch an interactive RamdaScript session

help

Print this help
```

Executing `ram` without any command is the same as `ram help`

Examples :

Compile a script

```shell
ram compile -src path/to/script.ram
```

Recursively compile `.ram` files contained inside a directory

```shell
ram compile -src path/to/dir -dst path/to/destiny
```

Run a short RamdaScript snippet

```shell
ram eval -src "(console.log (map (add 1) [1 2 3]))"
```

> Compiled RamdaScript code directly depends on Ramda, so, Ramda installation is a requirement to roun generated code.

## Language Reference

RamdaScript uses a S-Expression based syntax made popular by the Lisp family. In RamdaScript elements are separated by spaces, although commas (`,`) are optional. It has few builtin functions apart from the rich set that [Ramda API](http://ramdajs.com/docs/) provides, these are:

- `new`
- `def`
- `fn`
- `alter`
- `import`

Ramda functions are very well documented [here](http://ramdajs.com/docs/)

### Literals and Comments

RamdaScript shares `Boolean` and `Number` syntaxes with JavaScript, `Strings` are delimited by single quotes (`'`) and can be multilined, the `nil` keyword is the equivalen to JavaScript `null`. The underscore (`_`) symbol is the equivalent to the Ramda special placeholder.

String

```
'John Doe'
```

Multilined String
```
'Hellow
World'
```

Number

```
1
.5
0.3
1e9
```

Boolean

```
true
false
```

Null value

```
nil
```

Array

```
[1 2 3]
```

Object

```
{:name 'John' :age 30}
```

S-Expression

```
(a b c)
```

Special placeholder(`_`), detailed description [here](http://ramdajs.com/docs/index.html#__)

```
((subtract _ 8) 10)
```

Single line comment

```
// this is a comment
```

Multiline comment

```
/*
this is
a comment
*/
```

Optional commas, can be used to separate elements inside S-Expression, Array items, and Object properties.

```
(a, b, c)
[1, 2, 3]
{:a 1, b: 2}
```

### Functions

RamdaScript imports all Ramda functions, although it provides a few builtin for better interoperability with JavaScript

#### New

Returns an instance of a class.

```
(new Todo 'Download a Forex App')
```

#### Def

Declares a variable and assigns a value to it.

```
(def counter 0)
```

#### Fn

Returns a lamda function.

```
(fn [args...] exprs...)
```

The first parameter is a list of arguments, followed by one or more expressions. Once executed it will evaluate every expression in the same order as providaded and returns the result of evaluate the last expression.

```
(def four
    (fn [] 1 2 3 4)

(console.log (four))

// 4
```

#### Alter

Modifies and returns the value of a variable. This function can be partially applied.

```
(alter app.state newState)

// partial application
((alter app.state) newState)
```


#### Import

Imports external modules

```
(import 'react' React)
```

```
(import 'sanctuary' [Maybe, Just, Nothing])
```

Import uses CommonJS underlaying.

#### More functions

Ramda documentation http://ramdajs.com/docs/

### Embedded JavaScript

Hopefully, you will never need to use it, but if you ever need to appeal for JavaScript snippets into your RamdaScript code, you can use `{#` `#}` wrappers.

```
(filter {# n => n % 2 == 0 #} [1 2 3 4])
```

```
{# var even = n => n % 2 == 0 #}

(filter even [1 2 3 4])
```

The source code contained between these wrappers will pass through compilation process.

## Further reading

Ramda website http://ramdajs.com

Ramda wiki https://github.com/ramda/ramda/wiki