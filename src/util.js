import _ from 'lodash-firecloud';

// see https://stackoverflow.com/a/10480227/465684
let _isStrictMode = (function() {
  // eslint-disable-next-line babel/no-invalid-this
  return !this;
})();

// See http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
export let getCallerInfo = function(level) {
  // 'strict' mode has no caller info
  if (_isStrictMode) {
    return;
  }

  let origLimit = Error.stackTraceLimit;
  let origPrepare = Error.prepareStackTrace;
  Error.stackTraceLimit = level;

  let info;
  Error.prepareStackTrace = function(_err, stack) {
    let caller = stack[level - 1];
    if (_.isUndefined(caller)) {
      return;
    }

    info = {
      file: caller.getFileName(),
      line: caller.getLineNumber(),
      function: caller.getFunctionName()
    };
  };
  // eslint-disable-next-line babel/no-unused-expressions
  Error().stack;

  Error.stackTraceLimit = origLimit;
  Error.prepareStackTrace = origPrepare;
  return info;
};

export default exports;
