"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.logToConsole = exports._levelToConsoleFun = exports._isBrowser = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _moment = _interopRequireDefault(require("moment"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

let _isBrowser = typeof window !== 'undefined';exports._isBrowser = _isBrowser;

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
    // FIXME on AWS Lambda the console.trace call will print '[object Object]'¯\_(ツ)_/¯
    if (!exports._isBrowser && process.env.LAMBDA_ENV) {
      return 'log';
    }

    return 'trace';
  }

  return 'log';
};

/*
   cfg has 2 properties
   - contextId (optional, default to 'top' or '?')
     An identifier for the current "context".
   - level (optional, defaults to trace)
     Any log entry less important that cfg.level is ignored.
   */exports._levelToConsoleFun = _levelToConsoleFun;

let logToConsole = function (cfg = {}) {
  let contextId = '?';
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


    let prefixFormat = '%c%s %c%s%c';
    if (!hasCssSupport) {
      prefixFormat = _lodashFirecloud.default.replace(prefixFormat, /%c/g, hasCssSupport ? '%c' : '%s');
    }
    let prefixArgs = [
    maybeCss(color),
    now,
    maybeCss('font-weight: bold'),
    formattedLevelName,
    maybeCss(color)];


    let src = '';
    if (entry._babelSrc) {
      src = _lodashFirecloud.default.merge({}, entry._src, entry._babelSrc);
      src = ` @webpack:///./${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
    } else if (entry._src) {
      src = entry._src;
      src = ` ${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
    }

    let context = {};

    if (exports._isBrowser) {
      _lodashFirecloud.default.merge(context, {
        window,
        documentElement: window.document.documentElement });

    }

    let srcFormat = '%s in the %s context';
    let srcArgs = [
    src,
    cfg.contextId];


    let msgFormat = '';
    let msgArgs = [];
    if (entry.msg) {
      let {
        _duration: duration,
        msg } =
      entry;
      if (duration) {
        msg = `${msg} - took ${duration.ms} ms (${duration.human})`;
      }

      msgFormat = '\n%s';
      msgArgs = [
      msg];

    }

    let extraFormat = '';
    let extraArgs = [];

    let extra = _lodashFirecloud.default.omit(rawEntry, [
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

    _lodashFirecloud.default.merge(extra, context);

    // devTools console sorts keys when object is expanded
    extra = _lodashFirecloud.default.toPairs(extra);
    extra = _lodashFirecloud.default.sortBy(extra, 0);
    extra = _lodashFirecloud.default.fromPairs(extra);

    // devTools collapses objects with 'too many' keys,
    // so we output objects with only one key
    _lodashFirecloud.default.forEach(extra, function (value, key) {
      extraArgs.push('\n');
      extraArgs.push({ [key]: value });
    });

    let format = `${prefixFormat}${srcFormat}:${msgFormat}${extraFormat}`;
    let vars = [
    ...prefixArgs,
    ...srcArgs,
    ...msgArgs,
    ...extraArgs];


    // eslint-disable-next-line no-console
    console[consoleFun](format, ...vars);
  };
};exports.logToConsole = logToConsole;var _default = exports.logToConsole;exports.default = _default;

//# sourceMappingURL=log-to-console.js.map