# minlog [![Build Status][2]][1]

`minlog` is a *min*imalistic logger (Swedish pun intended; it translates to "my log"),
inspired by [bunyan](https://github.com/trentm/node-bunyan)
which was meant to be "a simple and fast JSON logging module",
but in time got one too many built-in (aka forced) features.
This minimalism translates to high performance as well,
as seen in [benchmarks](https://github.com/tobiipro/minlog/issues/18).

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
    logToConsole({
      level: 'error' // ignore log entries below the "error" level threshold
    })
  ]
});

log.warn('This is a warning!'); // logToConsole will ignore this
log.error('This is an error!');
```


## Docs

All signatures take one argument, which is an object, with the properties acting as named arguments.

The `MinLog` constructor takes:

* `serializers`: a list of serializer functions
* `listeners`: a list of listener functions
* `levels`: a list of extra mapping from semantical level to numerical one
* `requireRawEntry`: a flag to enable rawEntry in serializers/listeners. Defaults to false for performance reasons.
* `requireSrc`: a flag to enable _src (caller info) in entry. Defaults to false for performance reasons.

The `serializer` and the `listener` functions take:

* `entry`: the logging information in its current form
* `logger`: a reference to the MinLog instance
* `rawEntry`: the pre-serializers state of the logging information

The `serializer` function must return a Promise with an amended `entry`.

In its raw form, the `entry` knows only of:

* `_time`: a Date object
* `_level`: the logging level
* `_src`: the logging source (file, line and function)
* `_argN`: the positional argument passed to the logging call, where N is the numerical index
* `_args`: the positional arguments passed to the logging call
* `err`: the first Error object passed to the logging call
* `msg`: the first String object passed to the logging call
* properties of the plain objects passed to the logging call

The logging call arguments are handled as below for convenience:

* first String argument becomes `entry.msg`, if `entry.msg` is undefined at that point
* first Error argument becomes `entry.err`, if `entry.err` is undefined at that point
* all plain object arguments gets merged into `entry`
* all other arguments are wrapped in a plain object `{_argN: <value>}` and merged into `entry`


## Clarifications

There is no builtin functionality for filtering log entries based on a logging level.
This is by design, as it is up to the listener to worry about checking the entry's level
and decide to ignore it or not.


## License

[Apache 2.0](LICENSE)


  [1]: https://travis-ci.com/tobiipro/minlog
  [2]: https://travis-ci.com/tobiipro/minlog.svg?branch=master
