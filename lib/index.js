'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeTime = exports.serializeErr = exports.logToConsole = exports.MinLog = undefined;

var _minlog = require('./minlog');

var _minlog2 = _interopRequireDefault(_minlog);

var _logToConsole = require('./listeners/log-to-console');

var _logToConsole2 = _interopRequireDefault(_logToConsole);

var _err = require('./serializers/err');

var _err2 = _interopRequireDefault(_err);

var _time = require('./serializers/time');

var _time2 = _interopRequireDefault(_time);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.MinLog = _minlog2.default;
exports.logToConsole = _logToConsole2.default;
exports.serializeErr = _err2.default;
exports.serializeTime = _time2.default;
exports.default = _minlog2.default;

//# sourceMappingURL=index.js.map