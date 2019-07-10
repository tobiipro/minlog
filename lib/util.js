"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.getCallerInfo = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

// See http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
let getCallerInfo = function (level) {
  // eslint-disable-next-line babel/no-invalid-this, consistent-this
  let self = this;

  // 'strict' mode has no caller info
  if (self === undefined) {
    return;
  }

  let origLimit = Error.stackTraceLimit;
  let origPrepare = Error.prepareStackTrace;
  Error.stackTraceLimit = level;

  let info;
  Error.prepareStackTrace = function (_err, stack) {
    let caller = stack[level - 1];
    if (_lodashFirecloud.default.isUndefined(caller)) {
      return;
    }

    info = {
      file: caller.getFileName(),
      line: caller.getLineNumber(),
      function: caller.getFunctionName() };

  };
  // eslint-disable-next-line babel/no-unused-expressions
  Error().stack;

  Error.stackTraceLimit = origLimit;
  Error.prepareStackTrace = origPrepare;
  return info;
};exports.getCallerInfo = getCallerInfo;var _default =

exports;exports.default = _default;

//# sourceMappingURL=util.js.map