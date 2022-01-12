"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.keepOnlyExtra = exports.jsonStringifyReplacer = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}





let jsonStringifyReplacer = function (_key, value) {var _value2;
  if (_lodashFirecloud.default.isFunction((_value2 = value) === null || _value2 === void 0 ? void 0 : _value2.toJSON)) {
    return value;
  }

  if (
  _lodashFirecloud.default.isArray(value) ||
  _lodashFirecloud.default.isBoolean(value) ||
  _lodashFirecloud.default.isNil(value) ||
  _lodashFirecloud.default.isNumber(value) ||
  _lodashFirecloud.default.isPlainObject(value) ||
  _lodashFirecloud.default.isString(value) ||
  _lodashFirecloud.default.isSymbol(value))
  {
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  value = require('util').inspect(value);
  value = _lodashFirecloud.default.split(value, '\n');
  if (value.length < 2) {
    value = value[0];
  }
  return value;
};exports.jsonStringifyReplacer = jsonStringifyReplacer;

let keepOnlyExtra = function (logEntry) {
  let extraLogEntry = _lodashFirecloud.default.pickBy(logEntry, function (_value, key) {
    if (_lodashFirecloud.default.includes([
    'ctx',
    'msg'],
    key)) {
      return false;
    }
    if (_lodashFirecloud.default.startsWith(key, '_')) {
      return false;
    }
    return true;
  });

  return extraLogEntry;
};exports.keepOnlyExtra = keepOnlyExtra;

//# sourceMappingURL=util.js.map