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
    serializeTime(),
    serializeErr()
  ],
  listeners: [
    logToConsole({
      level: 'error' // ignore log entries below the "error" level threshold
    })
  ]
});

log.warn('This is a warning!'); // logToConsole will ignore this
log.error('This is an error!');

// if you want to make sure that a log entry has been processed by all serializers/listeners
await log.error('This is an error!').promise;

// if you want to make sure that all previous log entries have been processed by all serializers/listeners
await log.flush();
```


## Docs

All signatures take one argument, which is an object, with the properties acting as named arguments.

The `MinLog` constructor takes an object (or a Promise/function that returns an object) with:

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


## Datadog Grok Parser

If you intend to use minlog in a AWS Lambda and want Datadog to properly parse `minlog` messages, use

<details><summary>this definition</summary>:

```grok
minlog_rule %{minlog_timestamp}\s+%{minlog_lambda_request_id}\s+%{minlog_level}\s+(%{minlog_src}\s+)?%{minlog_msg}\s+%{minlog_extra}
minlog_raw_rule %{minlog_timestamp}\s+%{minlog_lambda_request_id}\s+%{minlog_level}\s+[^\{]*\s+%{minlog_extra}

### NO CHANGES BELOW THIS LINE

# Common
report_rule REPORT %{request_id}\s+Duration: %{number:duration:scale(1000000)} ms\s+Billed Duration: %{number:lambda.billed_duration} ms\s+Memory Size: %{number:lambda. memorysize} MB\s+Max Memory Used: %{number:lambda.max_memory_used} MB%{data:xray:keyvalue(": ")}

default_request_rule %{word:lambda.step}\s+%{request_id}(\s+Version: %{notSpace:lambda.version})?

timeout_rule (%{date("yyyy-MM-dd'T'HH:mm:ss.SSSZ"):timestamp}|%{date("yyyy-MM-dd'T'HH:mm:ss.SSZ"):timestamp})\s+%{notSpace:lambda.request_id}\s+%{regex("Task timed out"):error.message} after (%{number:duration:scale(1000000000)} seconds|%{number:duration:scale(1000000)} milliseconds)

process_error_rule %{request_id} (%{regex("Process exited before completing request"):error.message}|%{regex("Error"):level}:%{data:error.message})

# Node
node_json_rule %{node_prelude}(\s*Invoke Error\s*)?%{data::json}

# Python
python_rule %{python_prelude}.*
python_error %{regex("[^:]*"):error.message}: %{notSpace:error.kind}(\n|\s|\t)*Traceback \(most recent call last\):(?s)\s*%{data:error.stack}

# Ruby
ruby_basic %{regex("[\\w]")},\s\[%{date("yyyy-MM-dd'T'HH:mm:ss.SSSSSS"):timestamp} #%{number}\]\s+%{word:level} --\s*: %{data::keyvalue}

fallback_json (%{date("yyyy-MM-dd'T'HH:mm:ss.SSSZ"):timestamp}|%{date("yyyy-MM-dd'T'HH:mm:ss.SSZ"):timestamp})\s+%{notSpace:lambda.request_id}\s+(%{word:level}:)?(%{data::json})
# Sample
# START RequestId: c9a3b892-c2ca-4391-82fe-a47570039262 Version: $LATEST
# REPORT RequestId: ab5d39f5-1270-4226-9878-27f51b1bed57	Duration: 8384.24 ms	Billed Duration: 8400 ms 	Memory Size: 128 MB	Max Memory Used: 128 MB
# 2019-07-18T18:58:55.265Z	189a9433-fb77-4659-90d4-bc06edb890e0	ERROR	Invoke Error	{"errorType":"Error","errorMessage":"A test error"}
# 2019-07-18T18:58:22.286Z b5264ab7-2056-4f5b-bb0f-a06a70f6205d Task timed out after 30.03 seconds
# [ERROR]	2019-07-18T21:30:46.599Z	ffbce4c2-d80e-4ffa-a0bc-505361e28b8a	This is a regular python error
# 2019-07-18T19:47:18.146Z	95ce2ab7-cf99-4030-bede-2055a69cedec	ERROR	This is a regular node error
```

Advanced settings: Extract from `message`:

```grok
minlog_timestamp %{date("yyyy-MM-dd'T'HH:mm:ss.SSSZ"):timestamp}
minlog_lambda_request_id (\-|%{notSpace:lambda.request_id})
minlog_level %{word:level}
minlog_src %{regex("[^:]+"):minlog._src.filename}:%{regex("[0-9]+"):minlog._src.line}:%{regex("[0-9]+"):minlog._src.column}( in %{notSpace:minlog._src.function})?
minlog_msg %{data:minlog.msg}([\u00A0]{0,255}\.)?
minlog_extra %{regex("\\{.*\\}"):minlog:json}

### NO CHANGES BELOW THIS LINE

request_id RequestId: %{notSpace:lambda.request_id}
node_prelude (%{date("yyyy-MM-dd'T'HH:mm:ss.SSSZ"):timestamp}|%{date("yyyy-MM-dd'T'HH:mm:ss.SSZ"):timestamp})\s+%{notSpace:lambda.request_id}\s+(\[)?+%{word:level}+(\])?
python_prelude \[%{word:level}\]?\s+(%{date("yyyy-MM-dd'T'HH:mm:ss.SSSZ"):timestamp}|%{date("yyyy-MM-dd'T'HH:mm:ss.SSZ"):timestamp})\s+%{notSpace:lambda.request_id}
```

</details>

## License

[Apache 2.0](LICENSE)


  [1]: https://travis-ci.com/tobiipro/minlog
  [2]: https://travis-ci.com/tobiipro/minlog.svg?branch=master
