"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.logToConsole = exports.toFormatArgs = exports.serialize = exports._levelToConsoleFun = exports._isNode = exports._isBrowser = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _fastSafeStringify = _interopRequireDefault(require("fast-safe-stringify"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

let _isBrowser = typeof window !== 'undefined';exports._isBrowser = _isBrowser;
let _isNode = typeof process !== 'undefined' && _lodashFirecloud.default.isDefined(_lodashFirecloud.default.get(process, 'versions.node'));exports._isNode = _isNode;

let _levelToConsoleFun = function ({ level, levels }) {
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

let serialize = function ({ entry, logger, _rawEntry, cfg }) {
  let contextId;
  let hasCssSupport = false;

  if (exports._isBrowser) {
    contextId = window.parent === window ? 'top' : 'iframe';
    hasCssSupport = true;
  }

  cfg = _lodashFirecloud.default.defaults({}, cfg, {
    contextId,
    level: 'trace',
    localTime: false });


  let now = cfg.localTime ?
  entry._time.localStamp :
  entry._time.stamp;
  let levelName = logger.levelToLevelName(entry._level);
  let formattedLevelName = _lodashFirecloud.default.padStart(_lodashFirecloud.default.toUpper(levelName), 5);
  let consoleFun = exports._levelToConsoleFun({
    level: entry._level,
    levels: logger.levels });


  let color = '';
  switch (consoleFun) {
    case 'log':
    case 'info':
    case 'trace':
      color = 'color: dodgerblue';
      break;
    default:}


  let src = _lodashFirecloud.default.merge({}, entry._src, entry._babelSrc);
  if (_lodashFirecloud.default.isEmpty(src)) {
    src = '';
  } else if (exports._isBrowser) {
    // FIXME assumes webpack; could be a cfg flag, unless webpack can be detected
    src = `@webpack:///${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
  } else {
    src = `${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
  }

  let msg = entry.msg || '';
  if (msg) {
    let {
      _duration: duration } =
    entry;

    if (duration) {
      msg = `${msg} - took ${duration.ms} ms`;
      if (duration.ms > 1000) {
        msg = `${msg} (${duration.human})`;
      }
    }
  }

  let extra = _lodashFirecloud.default.omit(entry, [
  '_args',
  '_babelSrc',
  '_duration',
  '_level',
  '_src',
  '_time',
  '_timeEnd',
  '_timeStart',
  'msg']);


  if (exports._isBrowser) {
    let ctx = {
      window,
      documentElement: window.document.documentElement };

    _lodashFirecloud.default.merge(extra, {
      ctx });

  }

  // devTools console sorts keys when object is expanded
  extra = _lodashFirecloud.default.toPairs(extra);
  extra = _lodashFirecloud.default.sortBy(extra, 0);
  extra = _lodashFirecloud.default.fromPairs(extra);

  return {
    cfg,
    hasCssSupport,

    now,
    levelName,
    formattedLevelName,
    consoleFun,
    color,
    src,
    msg,

    extra };

};exports.serialize = serialize;

let toFormatArgs = function (...args) {
  let {
    format,
    formatArgs } =
  _lodashFirecloud.default.reduce(args, function (result, arg) {
    let {
      format,
      formatArgs } =
    result;

    if (_lodashFirecloud.default.isString(arg)) {
      format.push(arg);
      return {
        format,
        formatArgs };

    }

    format.push(arg[0]);
    formatArgs.push(arg[1]);

    return {
      format,
      formatArgs };

  }, {
    format: [],
    formatArgs: [] });


  format = _lodashFirecloud.default.join(format, '');
  formatArgs.unshift(format);
  return formatArgs;
};exports.toFormatArgs = toFormatArgs;

let logToConsole = function (cfg = {}) {
  // eslint-disable-next-line complexity
  return async function ({ entry, logger, rawEntry }) {
    // eslint-disable-next-line require-atomic-updates
    cfg = _lodashFirecloud.default.isFunction(cfg) ? await (async createError => {try {return await cfg();} catch (_awaitTraceErr) {let err = createError();_awaitTraceErr.stack += "\n...\n" + err.stack;throw _awaitTraceErr;}})(() => new Error()) : await (async createError => {try {return await cfg;} catch (_awaitTraceErr2) {let err = createError();_awaitTraceErr2.stack += "\n...\n" + err.stack;throw _awaitTraceErr2;}})(() => new Error());

    if (_lodashFirecloud.default.isDefined(rawEntry) &&
    _lodashFirecloud.default.filter(rawEntry._args).length === 1 &&
    rawEntry._args[0]._babelSrc) {
      return;
    }

    if (_lodashFirecloud.default.isDefined(cfg.level) && logger.levelIsBeyondGroup(entry._level, cfg.level)) {
      return;
    }

    let {
      cfg: cfg2,
      hasCssSupport,
      now,
      formattedLevelName,
      consoleFun,
      color,
      src,
      msg,
      extra } =
    exports.serialize({ entry, logger, rawEntry, cfg });
    cfg = cfg2;

    let extraArgs = [];
    // devTools collapses objects with 'too many' keys,
    // so we output objects with only one key
    _lodashFirecloud.default.forEach(extra, function (value, key) {
      if (_lodashFirecloud.default.isUndefined(value)) {
        return;
      }

      value = {
        [key]: value };


      if (exports._isBrowser) {
        extraArgs.push('\n');
        extraArgs.push(value);
      } else if (exports._isNode) {
        // prefer JSON output over util.inspect output
        value = (0, _fastSafeStringify.default)(value, undefined, 2);
        value = `\n${value}`;
        extraArgs.push(value);
      }
    });

    let formatArgs = [];

    // color
    if (hasCssSupport) {
      formatArgs.push([
      '%c',
      color]);

    }

    // timestamp
    formatArgs.push([
    '%s',
    now]);


    // context
    if (_lodashFirecloud.default.isDefined(cfg.contextId)) {
      formatArgs.push([
      ' %s',
      cfg.contextId]);

    }

    // level name
    if (hasCssSupport) {
      formatArgs.push([
      '%c',
      'font-weight: bold']);

    }
    formatArgs.push([
    ' %s',
    formattedLevelName]);


    // color
    if (hasCssSupport) {
      formatArgs.push([
      '%c',
      color]);

    }

    // src
    if (src) {
      formatArgs.push([
      ' %s',
      src]);

    }

    // msg
    formatArgs.push([
    '\n%s',
    msg]);


    formatArgs = exports.toFormatArgs(...formatArgs);
    formatArgs = _lodashFirecloud.default.concat(formatArgs, extraArgs);

    // eslint-disable-next-line no-console
    console[consoleFun](...formatArgs);
  };
};exports.logToConsole = logToConsole;var _default = exports.logToConsole;exports.default = _default;

//# sourceMappingURL=log-to-console.js.map