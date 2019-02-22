"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.logToConsole = exports._levelToConsoleFun = exports._isAwsLambda = exports._isNode = exports._isBrowser = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _fastSafeStringify = _interopRequireDefault(require("fast-safe-stringify"));
var _moment = _interopRequireDefault(require("moment"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

let _isBrowser = typeof window !== 'undefined';exports._isBrowser = _isBrowser;
let _isNode = typeof process !== 'undefined' && !_lodashFirecloud.default.isUndefined(_lodashFirecloud.default.get(process, 'versions.node'));exports._isNode = _isNode;
let _isAwsLambda = exports._isNode && !_lodashFirecloud.default.isUndefined(process.env.LAMBDA_TASK_ROOT);

// from https://github.com/Financial-Times/lambda-logger
// This does make process.stdout.write a blocking function (process.stdout._handle.setBlocking(true);),
// as AWS Lambda previously streamed to an output which was synchronous,
// but has since changed to asynchronous behaviour, leading to lost logs.
exports._isAwsLambda = _isAwsLambda;if (exports._isAwsLambda && _lodashFirecloud.default.isFunction(_lodashFirecloud.default.get(process, 'stdout._handle.setBlocking'))) {
  process.stdout._handle.setBlocking(true);
}

let _levelToConsoleFun = function ({ level, levels }) {
  // on AWS Lambda the console.trace call will print '[object Object]'¯\_(ツ)_/¯
  // plus all console funs end up in a cloudwatch stream
  if (exports._isAwsLambda) {
    return 'log';
  }

  if (_lodashFirecloud.default.isString(level)) {
    // eslint-disable-next-line prefer-destructuring
    level = levels[level];
  }

  if (_lodashFirecloud.default.inRange(level, 0, levels.warn)) {
    return 'error';
  } else if (_lodashFirecloud.default.inRange(level, levels.warn, levels.info)) {
    return 'warn';
  } else if (_lodashFirecloud.default.inRange(level, levels.info, levels.debug)) {
    return 'info';
  } else if (_lodashFirecloud.default.inRange(level, levels.debug, levels.trace)) {
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
   */exports._levelToConsoleFun = _levelToConsoleFun;

let logToConsole = function (cfg = {}) {
  let contextId;
  let hasCssSupport = false;

  if (exports._isBrowser) {
    if (window.parent === window) {
      contextId = 'top';
    }
    hasCssSupport = true;
  }

  _lodashFirecloud.default.defaults(cfg, {
    contextId,
    level: 'trace' });


  let maybeCss = function (css) {
    return hasCssSupport ? css : '';
  };

  // eslint-disable-next-line complexity
  return async function ({ entry, logger, rawEntry }) {
    if (_lodashFirecloud.default.filter(rawEntry._args).length === 1 && rawEntry._args[0]._babelSrc) {
      return;
    }

    if (logger.levelIsBeyondGroup(entry._level, cfg.level)) {
      return;
    }

    let now = (0, _moment.default)(entry._time.stamp).utcOffset(entry._time.utc_offset).toISOString();
    let levelName = logger.levelToLevelName(entry._level);
    let formattedLevelName = _lodashFirecloud.default.padStart(_lodashFirecloud.default.toUpper(levelName), '5');
    let consoleFun = exports._levelToConsoleFun({
      level: entry._level,
      levels: logger.levels });


    let color = '';
    switch (consoleFun) {
      case 'log':
      case 'info':
      case 'trace':
        color = maybeCss('color: dodgerblue');
        break;
      default:}


    let nowAndContextSep = _lodashFirecloud.default.isAwsLambda ? '\t' : ' ';
    let maybeContextFormat = _lodashFirecloud.default.isUndefined(cfg.contextId) ? '' : `${nowAndContextSep}%s`;

    let src = '';
    if (entry._babelSrc) {
      src = _lodashFirecloud.default.merge({}, entry._src, entry._babelSrc);
      src = ` @webpack:///./${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
    } else if (entry._src) {
      src = entry._src;
      src = ` ${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
    }

    let prefixFormat = `%c%s${maybeContextFormat}${nowAndContextSep}%c%s%c%s`;
    if (!hasCssSupport) {
      prefixFormat = _lodashFirecloud.default.replace(prefixFormat, /%c/g, hasCssSupport ? '%c' : '%s');
    }
    let prefixArgs = [
    maybeCss(color),
    now,
    _lodashFirecloud.default.isUndefined(cfg.contextId) ? '' : cfg.contextId,
    maybeCss('font-weight: bold'),
    formattedLevelName,
    maybeCss(color),
    src];


    let msgFormat = '';
    let msgArgs = [];
    if (entry.msg) {
      let {
        _duration: duration,
        msg } =
      entry;
      if (duration) {
        msg = `${msg} - took ${duration.ms} ms`;
        if (duration.ms > 1000) {
          msg = `${msg} (${duration.human})`;
        }
      }

      msgFormat = '\n%s';
      msgArgs = [
      msg];

    }

    let extraFormat = '';
    let extraArgs = [];

    let extra = _lodashFirecloud.default.omit(entry, [
    '_args',
    '_babelSrc',
    '_duration',
    '_level',
    '_src',
    '_time',
    '_timeEnd',
    '_timeStart',
    'contextId',
    'msg']);

    extra = _lodashFirecloud.default.omitBy(extra, function (_value, key) {
      return /^_arg[0-9+]$/.test(key);
    });

    let context = {};
    if (exports._isBrowser) {
      _lodashFirecloud.default.merge(context, {
        window,
        documentElement: window.document.documentElement });

    }
    _lodashFirecloud.default.merge(extra, context);

    // devTools console sorts keys when object is expanded
    extra = _lodashFirecloud.default.toPairs(extra);
    extra = _lodashFirecloud.default.sortBy(extra, 0);
    extra = _lodashFirecloud.default.fromPairs(extra);

    // devTools collapses objects with 'too many' keys,
    // so we output objects with only one key
    _lodashFirecloud.default.forEach(extra, function (value, key) {
      extraArgs.push('\n');
      let obj = {
        [key]: value };


      // fix for util.inspect having no indentation
      if (!exports._isBrowser) {
        obj = (0, _fastSafeStringify.default)(obj, undefined, 2);
      }

      extraArgs.push(obj);
    });

    let format = `${prefixFormat}:${msgFormat}${extraFormat}`;
    let vars = [
    ...prefixArgs,
    ...msgArgs,
    ...extraArgs];


    if (exports._isAwsLambda) {
      // eslint-disable-next-line global-require
      let msg = require('util').format(format, ...vars);
      msg = _lodashFirecloud.default.replace(msg, /\n/g, '\r');
      msg = `${msg}\n`;
      process.stdout.write(msg);
      return;
    }

    // eslint-disable-next-line no-console
    console[consoleFun](format, ...vars);
  };
};exports.logToConsole = logToConsole;var _default = exports.logToConsole;exports.default = _default;

//# sourceMappingURL=log-to-console.js.map