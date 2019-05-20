"use strict";Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, "logToConsole", { enumerable: true, get: function () {return _logToConsole.default;} });Object.defineProperty(exports, "logToConsoleAwsLambda", { enumerable: true, get: function () {return _logToConsoleAwsLambda.default;} });Object.defineProperty(exports, "serializeErr", { enumerable: true, get: function () {return _err.default;} });Object.defineProperty(exports, "serializeTime", { enumerable: true, get: function () {return _time.default;} });Object.defineProperty(exports, "MinLog", { enumerable: true, get: function () {return _minlog.MinLog;} });Object.defineProperty(exports, "defaultLevels", { enumerable: true, get: function () {return _minlog.defaultLevels;} });var _logToConsole = _interopRequireDefault(require("./listeners/log-to-console"));
var _logToConsoleAwsLambda = _interopRequireDefault(require("./listeners/log-to-console-aws-lambda"));
var _err = _interopRequireDefault(require("./serializers/err"));
var _time = _interopRequireDefault(require("./serializers/time"));

var _minlog = require("./minlog");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

//# sourceMappingURL=index.js.map