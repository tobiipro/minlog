"use strict";Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, "MinLog", { enumerable: true, get: function () {return _minlog.default;} });Object.defineProperty(exports, "defaultLevels", { enumerable: true, get: function () {return _defaultLevels.default;} });Object.defineProperty(exports, "logToConsole", { enumerable: true, get: function () {return _logToConsole.default;} });Object.defineProperty(exports, "logToConsoleAwsLambda", { enumerable: true, get: function () {return _logToConsoleAwsLambda.default;} });Object.defineProperty(exports, "serializeErr", { enumerable: true, get: function () {return _err.default;} });Object.defineProperty(exports, "serializeTime", { enumerable: true, get: function () {return _time.default;} });var _minlog = _interopRequireDefault(require("./minlog"));
var _defaultLevels = _interopRequireDefault(require("./default-levels"));
var _logToConsole = _interopRequireDefault(require("./listeners/log-to-console"));
var _logToConsoleAwsLambda = _interopRequireDefault(require("./listeners/log-to-console-aws-lambda"));
var _err = _interopRequireDefault(require("./serializers/err"));
var _time = _interopRequireDefault(require("./serializers/time"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

//# sourceMappingURL=index.js.map