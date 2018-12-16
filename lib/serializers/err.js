"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.serializeErr = void 0;

var _bluebird = require("bluebird/js/release/bluebird");

var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));

var _stacktraceJs = _interopRequireDefault(require("stacktrace-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let serializeErr =
/*#__PURE__*/
function () {
  var _ref = (0, _bluebird.coroutine)(function* ({
    entry
  }) {
    let {
      err
    } = entry;

    if (!_lodashFirecloud.default.isError(err)) {
      return entry;
    }

    let stack;

    try {
      stack = yield _stacktraceJs.default.fromError(err);
    } catch (stacktraceError) {
      try {
        stack = yield _stacktraceJs.default.fromError(err, {
          offline: true
        });
      } catch (stacktraceError2) {
        // eslint-disable-next-line no-console
        console.error(stacktraceError2);
      } // eslint-disable-next-line no-console


      console.error(stacktraceError);
    }

    entry.err = {
      name: err.name,
      message: err.message,
      stack,
      // custom
      uncaught: err.uncaught
    };
    let uncaught = err.uncaught ? 'Uncaught ' : '';
    let inPromise = err.inPromise ? '(in promise) ' : '';
    entry.msg = entry.msg || `${uncaught}${inPromise}${err.name}: ${err.message}`;
    return entry;
  });

  return function serializeErr(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.serializeErr = serializeErr;
var _default = exports.serializeErr;
exports.default = _default;

//# sourceMappingURL=err.js.map