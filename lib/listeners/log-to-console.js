"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.logToConsole = exports.format = exports.toFormatArgs = exports.serialize = exports._levelToConsoleFun = exports._isNode = exports._isBrowser = void 0;
var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _fastSafeStringify = _interopRequireDefault(require("fast-safe-stringify"));











var _util = require("../util");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
























let _isBrowser = typeof window !== 'undefined';exports._isBrowser = _isBrowser;
let _isNode = typeof process !== 'undefined' && _lodashFirecloud.default.isDefined(process.versions.node);exports._isNode = _isNode;

let _levelToConsoleFun = function (args)


{
  let {
    level,
    levels } =
  args;
  if (_lodashFirecloud.default.isString(level)) {
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
exports._levelToConsoleFun = _levelToConsoleFun;let serialize = function (args)












{
  let {
    entry,
    logger,
    rawEntry: _rawEntry,
    cfg } =
  args;
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


  // handle https://github.com/tobiipro/babel-preset-firecloud#babel-plugin-firecloud-src-arg-default-config-needed
  let src = _lodashFirecloud.default.merge({}, entry._src, entry._babelSrc);
  let srcStr;

  if (_lodashFirecloud.default.isEmpty(src)) {
    srcStr = '';
  } else {
    _lodashFirecloud.default.defaults(src, {
      // column may only be available in _babelSrc
      // prefer a default, over not printing `:?` for structured parsing, with no optional groups
      column: '?' });

    let inSrcFunction = _lodashFirecloud.default.isDefined(src.function) ? ` in ${src.function}()` : '';
    srcStr = `${src.file}:${src.line}:${src.column}${inSrcFunction}`;
  }

  let msg = _lodashFirecloud.default.defaultTo(entry.msg, '');
  if (!_lodashFirecloud.default.isEmpty(msg)) {
    let {
      _duration: duration } =
    entry;

    if (_lodashFirecloud.default.isDefined(duration)) {
      msg = `${msg} - took ${duration.ms} ms`;
      if (duration.ms > 1000) {
        msg = `${msg} (${duration.human})`;
      }
    }
  }

  let extra = (0, _util.keepOnlyExtra)(entry);

  if (exports._isBrowser) {
    let ctx = {
      window,
      documentElement: window.document.documentElement };

    _lodashFirecloud.default.merge(extra, {
      ctx });

  }

  // devTools console sorts keys when object is expanded
  let extraPairs = _lodashFirecloud.default.toPairs(extra);
  // eslint-disable-next-line lodash/prop-shorthand
  extraPairs = _lodashFirecloud.default.sortBy(extraPairs, 0);
  extra = _lodashFirecloud.default.fromPairs(extraPairs);

  return {
    cfg,
    hasCssSupport,

    now,
    levelName,
    formattedLevelName,
    consoleFun,
    color,
    src: srcStr,
    msg,

    extra };

};exports.serialize = serialize;

let toFormatArgs = function (...formatPairs) {
  let {
    format,
    formatArgs } =
  _lodashFirecloud.default.reduce(formatPairs, function (result, formatPair) {
    let {
      format,
      formatArgs } =
    result;

    if (_lodashFirecloud.default.isString(formatPair)) {
      format.push(formatPair);
      return {
        format,
        formatArgs };

    }

    format.push(formatPair[0]);
    formatArgs.push(formatPair[1]);

    return {
      format,
      formatArgs };

  }, {
    format: [],
    formatArgs: [] });


  let formatStr = _lodashFirecloud.default.join(format, '');
  formatArgs.unshift(formatStr);
  return formatArgs;
};exports.toFormatArgs = toFormatArgs;

let format = function (consoleFun, ...formatArgs) {
  let [
  format,
  ...args] =
  formatArgs;

  // eslint-disable-next-line no-console
  console[consoleFun](format, ...args);
};exports.format = format;

let logToConsole = function (cfg = {}) {
  // eslint-disable-next-line complexity
  return async function ({ entry, logger, rawEntry }) {
    cfg = _lodashFirecloud.default.isFunction(cfg) ? await (async createError => {try {return await cfg();} catch (_awaitTraceErr) {let err = createError();_awaitTraceErr.stack += "\n...\n" + err.stack;throw _awaitTraceErr;}})(() => new Error()) : await (async createError => {try {return await cfg;} catch (_awaitTraceErr2) {let err = createError();_awaitTraceErr2.stack += "\n...\n" + err.stack;throw _awaitTraceErr2;}})(() => new Error());

    // handle https://github.com/tobiipro/babel-preset-firecloud#babel-plugin-firecloud-src-arg-default-config-needed
    if (_lodashFirecloud.default.isDefined(rawEntry) &&
    _lodashFirecloud.default.filter(rawEntry._args).length === 1 &&
    _lodashFirecloud.default.isDefined(rawEntry._args[0]._babelSrc)) {
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
      extra
      // @ts-ignore
    } = exports.serialize({ entry, logger, rawEntry, cfg });
    cfg = cfg2;

    let extraArgs = [];
    // devTools collapses objects with 'too many' keys,
    // so we output objects with only one key
    _lodashFirecloud.default.forEach(extra, function (value, key) {
      if (_lodashFirecloud.default.isUndefined(value)) {
        return;
      }

      let valueObj = {
        [key]: value };


      if (exports._isBrowser) {
        extraArgs.push('\n');
        extraArgs.push(valueObj);
      } else if (exports._isNode) {
        // prefer JSON output over util.inspect output
        let valueStr = (0, _fastSafeStringify.default)(valueObj, _util.jsonStringifyReplacer, 2);
        valueStr = `\n${valueStr}`;
        extraArgs.push(valueStr);
      }
    });

    let formatPairs = [];

    // color
    if (hasCssSupport) {
      formatPairs.push([
      '%c',
      color]);

    }

    // timestamp
    formatPairs.push([
    '%s',
    now]);


    // context
    if (_lodashFirecloud.default.isDefined(cfg.contextId)) {
      formatPairs.push([
      ' %s',
      cfg.contextId]);

    }

    // level name
    if (hasCssSupport) {
      formatPairs.push([
      '%c',
      'font-weight: bold']);

    }
    formatPairs.push([
    ' %s',
    formattedLevelName]);


    // color
    if (hasCssSupport) {
      formatPairs.push([
      '%c',
      color]);

    }

    // src
    if (_lodashFirecloud.default.isDefined(src)) {
      formatPairs.push([
      ' %s',
      src]);

    }

    // msg
    // eslint-disable-next-line lodash/prop-shorthand
    let argNames = _lodashFirecloud.default.keys((0, _util.keepOnlyExtra)(entry));
    if (!_lodashFirecloud.default.isEmpty(argNames)) {
      msg = `${msg} (${_lodashFirecloud.default.join(argNames, ', ')})`;
    }
    formatPairs.push([
    '\n%s',
    msg]);


    let formatArgs = exports.toFormatArgs(...formatPairs);
    formatArgs.push(...extraArgs);

    // eslint-disable-next-line no-console
    exports.format(consoleFun, ...formatArgs);
  };
};exports.logToConsole = logToConsole;var _default = exports.logToConsole;exports.default = _default;

//# sourceMappingURL=log-to-console.js.map