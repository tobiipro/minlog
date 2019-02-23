import _ from 'lodash-firecloud';
import fastSafeStringify from 'fast-safe-stringify';
import moment from 'dayjs';

let _isBrowser = typeof window !== 'undefined';
let _isNode = typeof process !== 'undefined' && !_.isUndefined(_.get(process, 'versions.node'));
let _isAwsLambda = _isNode && !_.isUndefined(process.env.LAMBDA_TASK_ROOT);

// from https://github.com/Financial-Times/lambda-logger
// This does make process.stdout.write a blocking function (process.stdout._handle.setBlocking(true);),
// as AWS Lambda previously streamed to an output which was synchronous,
// but has since changed to asynchronous behaviour, leading to lost logs.
if (_isAwsLambda && _.isFunction(_.get(process, 'stdout._handle.setBlocking'))) {
  process.stdout._handle.setBlocking(true);
}

let _levelToConsoleFun = function({level, levels}) {
  // on AWS Lambda the console.trace call will print '[object Object]'¯\_(ツ)_/¯
  // plus all console funs end up in a cloudwatch stream
  if (_isAwsLambda) {
    return 'log';
  }

  if (_.isString(level)) {
    // eslint-disable-next-line prefer-destructuring
    level = levels[level];
  }

  if (_.inRange(level, 0, levels.warn)) {
    return 'error';
  } else if (_.inRange(level, levels.warn, levels.info)) {
    return 'warn';
  } else if (_.inRange(level, levels.info, levels.debug)) {
    return 'info';
  } else if (_.inRange(level, levels.debug, levels.trace)) {
    // return 'debug';
    // console.debug doesn't seem to print anything,
    // but console.debug is an alias to console.log anyway
    return 'log';
  } else if (level === levels.trace) {
    return 'trace';
  }

  return 'log';
};

/*
cfg has 2 properties
- contextId (optional, default to 'top' in browser and undefined elsewhere)
  An identifier for the current "context".
- level (optional, defaults to trace)
  Any log entry less important that cfg.level is ignored.
*/

export let logToConsole = function(cfg = {}) {
  let contextId;
  let hasCssSupport = false;

  if (_isBrowser) {
    if (window.parent === window) {
      contextId = 'top';
    }
    hasCssSupport = true;
  }

  _.defaults(cfg, {
    contextId,
    level: 'trace'
  });

  let maybeCss = function(css) {
    return hasCssSupport ? css : '';
  };

  // eslint-disable-next-line complexity
  return async function({entry, logger, rawEntry}) {
    if (_.filter(rawEntry._args).length === 1 && rawEntry._args[0]._babelSrc) {
      return;
    }

    if (logger.levelIsBeyondGroup(entry._level, cfg.level)) {
      return;
    }

    let now = moment(entry._time.stamp).utcOffset(entry._time.utc_offset).toISOString();
    let levelName = logger.levelToLevelName(entry._level);
    let formattedLevelName = _.padStart(_.toUpper(levelName), '5');
    let consoleFun = _levelToConsoleFun({
      level: entry._level,
      levels: logger.levels
    });

    let color = '';
    switch (consoleFun) {
    case 'log':
    case 'info':
    case 'trace':
      color = maybeCss('color: dodgerblue');
      break;
    default:
    }

    let nowAndContextSep = _.isAwsLambda ? '\t' : ' ';
    let maybeContextFormat = _.isUndefined(cfg.contextId) ? '' : `${nowAndContextSep}%s`;

    let src = '';
    if (entry._babelSrc) {
      src = _.merge({}, entry._src, entry._babelSrc);
      src = ` @webpack:///./${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
    } else if (entry._src) {
      src = entry._src;
      src = ` ${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
    }

    let prefixFormat = `%c%s${maybeContextFormat}${nowAndContextSep}%c%s%c%s`;
    if (!hasCssSupport) {
      prefixFormat = _.replace(prefixFormat, /%c/g, hasCssSupport ? '%c' : '%s');
    }
    let prefixArgs = [
      maybeCss(color),
      now,
      _.isUndefined(cfg.contextId) ? '' : cfg.contextId,
      maybeCss('font-weight: bold'),
      formattedLevelName,
      maybeCss(color),
      src
    ];

    let msgFormat = '';
    let msgArgs = [];
    if (entry.msg) {
      let {
        _duration: duration,
        msg
      } = entry;
      if (duration) {
        msg = `${msg} - took ${duration.ms} ms`;
        if (duration.ms > 1000) {
          msg = `${msg} (${duration.human})`;
        }
      }

      msgFormat = '\n%s';
      msgArgs = [
        msg
      ];
    }

    let extraFormat = '';
    let extraArgs = [];

    let extra = _.omit(entry, [
      '_args',
      '_babelSrc',
      '_duration',
      '_level',
      '_src',
      '_time',
      '_timeEnd',
      '_timeStart',
      'contextId',
      'msg'
    ]);
    extra = _.omitBy(extra, function(_value, key) {
      return /^_arg[0-9+]$/.test(key);
    });

    let context = {};
    if (_isBrowser) {
      _.merge(context, {
        window,
        documentElement: window.document.documentElement
      });
    }
    _.merge(extra, context);

    // devTools console sorts keys when object is expanded
    extra = _.toPairs(extra);
    extra = _.sortBy(extra, 0);
    extra = _.fromPairs(extra);

    // devTools collapses objects with 'too many' keys,
    // so we output objects with only one key
    _.forEach(extra, function(value, key) {
      if (_.isUndefined(value)) {
        return;
      }

      let obj = {
        [key]: value
      };

      if (_isNode) {
        // prefer JSON output over util.inspect output
        obj = fastSafeStringify(obj, undefined, 2);
        obj = `\n${obj}`;

        if (_isAwsLambda) {
          // maintain whitespace (looking at you AWS CloudWatch WebUI)
          // by replacing space with non-breaking space
          obj = _.replace(obj, / /g, ' ');
        }
      } else {
        extraArgs.push('\n');
      }

      extraArgs.push(obj);
    });

    let format = `${prefixFormat}:${msgFormat}${extraFormat}`;
    let vars = [
      ...prefixArgs,
      ...msgArgs,
      ...extraArgs
    ];

    if (_isAwsLambda) {
      // eslint-disable-next-line global-require
      let msg = require('util').format(format, ...vars);
      msg = _.replace(msg, /\n/g, '\r');
      msg = `${msg}\n`;
      process.stdout.write(msg);
      return;
    }

    // eslint-disable-next-line no-console
    console[consoleFun](format, ...vars);
  };
};

export default logToConsole;
