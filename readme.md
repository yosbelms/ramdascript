# RamdaScript

![badge](https://circleci.com/gh/yosbelms/ramdascript/tree/master.png?circle-token=154390b3f400d0abac1e1457dc7652411debbd4d)

RamdaScript is a functional language that compiles to JavaScript. It has few main features:

* A Lisp dialect.
* Autocurried functions.
* [Ramda](http://ramdajs.com) as the standard library.
* Straightforward interoperability with JavaScript.
* Clean JavaScript output.

## Installation

Using [npm](https://npmjs.org)

```shell
npm install -g ramdascript
```

## Getting started

Run a script

```shell
ram path/to/script.ram
```

Compile a script

```shell
ram compile -src path/to/script.ram
```

To play with the REPL

```shell
ram repl
```

For documentation https://github.com/yosbelms/ramdascript/blob/master/docs.md

See examples https://github.com/yosbelms/ramdascript/tree/master/examples

TodoMVC https://github.com/yosbelms/ramdascript-todomvc

To file an issue  https://github.com/yosbelms/ramdascript/issues

MIT (c) 2016-present Yosbel Marin