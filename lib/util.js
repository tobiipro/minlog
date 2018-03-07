'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCallerInfo = undefined;

var _lodashFirecloud = require('lodash-firecloud');

var _lodashFirecloud2 = _interopRequireDefault(_lodashFirecloud);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// See http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
let getCallerInfo = exports.getCallerInfo = function (level) {
  // eslint-disable-next-line no-invalid-this, consistent-this
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
    if (_lodashFirecloud2.default.isUndefined(caller)) {
      return;
    }

    info = {
      file: caller.getFileName(),
      line: caller.getLineNumber(),
      function: caller.getFunctionName()
    };
  };
  // eslint-disable-next-line no-unused-expressions
  Error().stack;

  Error.stackTraceLimit = origLimit;
  Error.prepareStackTrace = origPrepare;
  return info;
};

exports.default = exports;

//# sourceMappingURL=util.js.map