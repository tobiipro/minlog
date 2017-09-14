# minlog [![Build Status][2]][1]

`minlog` is inspired by [bunyan](https://github.com/trentm/node-bunyan)
which was meant to be "a simple and fast JSON logging module",
but in time got one too many built-in (aka forced) features.

`minlog` works with 4 concepts:

* logging `levels` which create the platform of logging verbosity
* a log `entry` which is an object that carries the logging information (level, timestamp, etc)
* `serializer` functions which are called in order to transform the log call's arguments into a log `entry`
* `listener` functions which are called in parallel (async) to handle the log `entry` (i.e. print/save/proxy it)

## Example

```javascript
import {
  MinLog,
  logToConsole,
  serializeErr,
  serializeTime
} from 'minlog';

let log = new MinLog({
  serializers: [
    serializeTime,
    serializeErr
  ],
  listeners: [
    logToConsole
  ]
});

log.warn('This is a warning!');
log.error('This is an error!');
```


## Docs

All signatures take one argument, which is an object, with the properties acting as named arguments.

The `MinLog` constructor takes:

* `serializers`: a list of serializer functions
* `listeners`: a list of listener functions
* `levels`: if you want to override the built-in map of semantical levels to numerical ones

The `serializer` and the `listener` functions take:

* `entry`: the logging information in its current form
* `logger`: a reference to the MinLog instance
* `rawEntry`: the pre-serializers state of the logging information

The `serializer` function must return a Promise with an amended `entry`.

In its raw form, the `entry` knows only of:

* `_time`: a Date object
* `_level`: the logging level
* `_src`: the logging source (file, line and function)
* `_argN`: the positional argument passed to the logging call
* `err`: the first Error object passed to the logging call
* `msg`: the first String object passed to the logging call
* properties of the plain objects passed to the logging call


## Clarifications

There is no builtin functionality for filtering log entries based on a logging level.
This is by design, as it is up to the listener to worry about checking the entry's level
and decide to ignore it or not.


## License

[Apache 2.0](LICENSE)


  [1]: https://travis-ci.org/tobiipro/minlog
  [2]: https://travis-ci.org/tobiipro/minlog.svg?branch=master
