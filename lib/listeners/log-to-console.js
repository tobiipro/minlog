'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._levelToConsoleFun = undefined;

var _bluebird = require('bluebird/js/release/bluebird');

exports.default = function (cfg = {}) {
  return (() => {
    var _ref = (0, _bluebird.coroutine)(function* ({ entry, logger, rawEntry }) {
      if (_lodashFirecloud2.default.filter(rawEntry._args).length === 1 && rawEntry._args[0]._babelSrc) {
        return;
      }

      let maxLevelName = cfg.level || 'trace';
      let maxLevel = logger.levels[maxLevelName];
      maxLevel = _lodashFirecloud2.default.floor(maxLevel / 10) * 10 + 10 - 1; // round up to next level, not inclusive
      if (entry.level > maxLevel) {
        return;
      }

      let now = (0, _moment2.default)(entry._time.stamp).utcOffset(entry._time.utc_offset).toISOString();
      let levelName = logger.levelToLevelName(entry._level);
      let formattedLevelName = _lodashFirecloud2.default.padStart(_lodashFirecloud2.default.toUpper(levelName), '5');
      let consoleFun = exports._levelToConsoleFun({
        level: entry._level,
        levels: logger.levels
      });

      let color = '';
      switch (consoleFun) {
        case 'log':
        case 'info':
        case 'trace':
          color = 'color: dodgerblue';
          break;
        default:
      }

      let prefixFormat = '%c%s %c%s%c';
      let prefixArgs = [color, now, 'font-weight: bold', formattedLevelName, color];

      let src = '';
      if (entry._babelSrc) {
        src = _lodashFirecloud2.default.merge({}, entry._src, entry._babelSrc);
        src = ` @webpack:///./${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
      } else if (entry._src) {
        src = entry._src;
        src = ` ${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
      }

      let iframeId = _lodashFirecloud2.default.defaultTo(cfg.iframeId, window.parent === window ? 'top' : '?');

      let context = {
        window,
        documentElement: window.document.documentElement
      };

      let srcFormat = '%s in the %s context';
      let srcArgs = [src, iframeId];

      let msgFormat = '';
      let msgArgs = [];
      if (entry.msg) {
        msgFormat = '\n%s';
        msgArgs = [entry.msg];
      }

      let extraFormat = '';
      let extraArgs = [];

      let extra = _lodashFirecloud2.default.omit(rawEntry, ['_args', '_babelSrc', '_level', '_src', '_time', 'iframeId', 'msg']);
      _lodashFirecloud2.default.merge(extra, context);

      // devTools console sorts keys when object is expanded
      extra = _lodashFirecloud2.default.toPairs(extra);
      extra = _lodashFirecloud2.default.sortBy(extra, 0);
      extra = _lodashFirecloud2.default.fromPairs(extra);

      // devTools collapses objects with 'too many' keys,
      // so we output objects with only one key
      _lodashFirecloud2.default.forEach(extra, function (value, key) {
        extraArgs.push('\n');
        extraArgs.push({ [key]: value });
      });

      // eslint-disable-next-line no-console
      console[consoleFun](`${prefixFormat}${srcFormat}:${msgFormat}${extraFormat}`, ...prefixArgs, ...srcArgs, ...msgArgs, ...extraArgs);
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();
};

var _lodashFirecloud = require('lodash-firecloud');

var _lodashFirecloud2 = _interopRequireDefault(_lodashFirecloud);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _levelToConsoleFun = exports._levelToConsoleFun = function ({ level, levels }) {
  if (_lodashFirecloud2.default.isString(level)) {
    // eslint-disable-next-line prefer-destructuring
    level = levels[level];
  }

  if (_lodashFirecloud2.default.inRange(level, 0, levels.warn)) {
    return 'error';
  } else if (_lodashFirecloud2.default.inRange(level, levels.warn, levels.info)) {
    return 'warn';
  } else if (_lodashFirecloud2.default.inRange(level, levels.info, levels.debug)) {
    return 'info';
  } else if (_lodashFirecloud2.default.inRange(level, levels.debug, levels.trace)) {
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
- level (optional, defaults to trace)
  Any log entry less important that cfg.level is ignore.
- iframeId (optional, default to 'top' or '?'
  An identifier for the current "window".
*/

//# sourceMappingURL=log-to-console.js.map