'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird/js/release/bluebird');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _stacktraceJs = require('stacktrace-js');

var _stacktraceJs2 = _interopRequireDefault(_stacktraceJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _bluebird.coroutine)(function* ({ entry }) {
    let { err } = entry;

    if (!_lodash2.default.isError(err)) {
      return entry;
    }

    let stack;
    try {
      stack = yield _stacktraceJs2.default.fromError(err);
    } catch (stacktraceError) {
      try {
        stack = yield _stacktraceJs2.default.fromError(err, { offline: true });
      } catch (stacktraceError2) {
        // eslint-disable-next-line no-console
        console.error(stacktraceError2);
      }
      // eslint-disable-next-line no-console
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

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

//# sourceMappingURL=err.js.map