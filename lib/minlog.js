"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = require("bluebird/js/release/bluebird");

var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class MinLog {
  constructor({
    serializers = this.serializers,
    listeners = this.listeners,
    levels = {}
  } = {}) {
    _defineProperty(this, "levels", {
      // npm alias
      fatal: 0,
      // emergency
      verbose: 70,
      // debug
      silly: 80,
      // https://tools.ietf.org/html/rfc3164 (multiplier 10)
      emergency: 0,
      alert: 10,
      critical: 20,
      error: 30,
      warning: 40,
      notice: 50,
      informational: 60,
      debug: 70,
      // console
      warn: 40,
      // warning
      info: 60,
      // informational
      trace: 90
    });

    _defineProperty(this, "serializers", []);

    _defineProperty(this, "listeners", []);

    this.serializers = _lodashFirecloud.default.clone(serializers);
    this.listeners = _lodashFirecloud.default.clone(listeners);
    this.levels = _lodashFirecloud.default.merge(this.levels, levels);

    _lodashFirecloud.default.forEach(this.levels, (_level, levelName) => {
      this[levelName] = _lodashFirecloud.default.bind(this.log, this, levelName);
    });
  }

  levelToLevelName(level) {
    if (_lodashFirecloud.default.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this.levels[level];

      if (_lodashFirecloud.default.isUndefined(level)) {
        throw new Error(`Unknown level name ${level}. Known: ${_lodashFirecloud.default.keys(this.levels)}.`);
      }
    }

    let levelName = _lodashFirecloud.default.invert(this.levels)[level] || `lvl${level}`;
    return levelName;
  }

  log(level, ...args) {
    var _this = this;

    return (0, _bluebird.coroutine)(function* () {
      if (_lodashFirecloud.default.isString(level)) {
        // eslint-disable-next-line prefer-destructuring
        level = _this.levels[level];
      }

      let src = (0, _util.getCallerInfo)(5);
      let entry = {
        _time: new Date(),
        _level: level,
        _src: src
      };

      _lodashFirecloud.default.forEach(args, function (arg, index) {
        let amendEntry = {
          [`_arg${index}`]: arg
        };

        if (_lodashFirecloud.default.isError(arg) && _lodashFirecloud.default.isUndefined(entry.msg)) {
          amendEntry.err = arg;
        } else if (_lodashFirecloud.default.isString(arg) && _lodashFirecloud.default.isUndefined(entry.msg)) {
          amendEntry.msg = arg;
        } else if (_lodashFirecloud.default.isPlainObject(arg)) {
          _lodashFirecloud.default.defaults(amendEntry, arg);
        }

        _lodashFirecloud.default.merge(entry, amendEntry);
      });

      let rawEntry = _lodashFirecloud.default.cloneDeep(entry);

      rawEntry._args = args; // eslint-disable-next-line require-atomic-updates

      entry = yield _lodashFirecloud.default.reduce(_this.serializers,
      /*#__PURE__*/
      function () {
        var _ref = (0, _bluebird.coroutine)(function* (entryPromise, serializer) {
          let entry = yield entryPromise;
          entry = yield serializer({
            entry,
            logger: _this,
            rawEntry
          });
          return Promise.resolve(entry);
        });

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }(), Promise.resolve(entry));

      _lodashFirecloud.default.forEach(_this.listeners, listener => {
        listener({
          entry,
          logger: _this,
          rawEntry
        });
      });
    })();
  }

}

exports.default = MinLog;

//# sourceMappingURL=minlog.js.map