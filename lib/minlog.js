'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird/js/release/bluebird');

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodashFirecloud = require('lodash-firecloud');

var _lodashFirecloud2 = _interopRequireDefault(_lodashFirecloud);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let MinLog = function () {
  function MinLog({
    serializers = this.serializers,
    listeners = this.listeners,
    levels = {}
  } = {}) {
    _classCallCheck(this, MinLog);

    this.levels = {
      // npm alias
      fatal: 0, // emergency
      verbose: 70, // debug
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
      warn: 40, // warning
      info: 60, // informational
      trace: 90
    };
    this.serializers = [];
    this.listeners = [];

    this.serializers = _lodashFirecloud2.default.clone(serializers);
    this.listeners = _lodashFirecloud2.default.clone(listeners);
    this.levels = _lodashFirecloud2.default.merge(this.levels, levels);

    _lodashFirecloud2.default.forEach(this.levels, (_level, levelName) => {
      this[levelName] = _lodashFirecloud2.default.bind(this.log, this, levelName);
    });
  }

  _createClass(MinLog, [{
    key: 'levelToLevelName',
    value: function levelToLevelName(level) {
      if (_lodashFirecloud2.default.isString(level)) {
        // eslint-disable-next-line prefer-destructuring
        level = this.levels[level];

        if (_lodashFirecloud2.default.isUndefined(level)) {
          throw new Error(`Unknown level name ${level}. Known: ${_lodashFirecloud2.default.keys(this.levels)}.`);
        }
      }

      let levelName = _lodashFirecloud2.default.invert(this.levels)[level] || `lvl${level}`;
      return levelName;
    }
  }, {
    key: 'log',
    value: (() => {
      var _ref = (0, _bluebird.coroutine)(function* (level, ...args) {
        var _this = this;

        if (_lodashFirecloud2.default.isString(level)) {
          // eslint-disable-next-line prefer-destructuring
          level = this.levels[level];
        }

        let src = (0, _util.getCallerInfo)(5);

        let entry = {
          _time: new Date(),
          _level: level,
          _src: src
        };

        _lodashFirecloud2.default.forEach(args, function (arg, index) {
          let amendEntry = {
            [`_arg${index}`]: arg
          };

          if (_lodashFirecloud2.default.isError(arg) && _lodashFirecloud2.default.isUndefined(entry.msg)) {
            amendEntry.err = arg;
          } else if (_lodashFirecloud2.default.isString(arg) && _lodashFirecloud2.default.isUndefined(entry.msg)) {
            amendEntry.msg = arg;
          } else if (_lodashFirecloud2.default.isPlainObject(arg)) {
            _lodashFirecloud2.default.defaults(amendEntry, arg);
          }

          _lodashFirecloud2.default.merge(entry, amendEntry);
        });

        let rawEntry = _lodashFirecloud2.default.cloneDeep(entry);
        rawEntry._args = args;

        yield Promise.all(_lodashFirecloud2.default.map(this.serializers, (() => {
          var _ref2 = (0, _bluebird.coroutine)(function* (serializer) {
            entry = yield serializer({ entry, logger: _this, rawEntry });
          });

          return function (_x2) {
            return _ref2.apply(this, arguments);
          };
        })()));

        _lodashFirecloud2.default.forEach(this.listeners, function (listener) {
          listener({ entry, logger: _this, rawEntry });
        });
      });

      function log(_x) {
        return _ref.apply(this, arguments);
      }

      return log;
    })()
  }]);

  return MinLog;
}();

exports.default = MinLog;

//# sourceMappingURL=minlog.js.map