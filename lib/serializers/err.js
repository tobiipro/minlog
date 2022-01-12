"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.serializeErr = exports.default = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}






let serializeErr = function () {
  return async function ({ entry }) {
    let {
      err } =
    entry;

    if (!_lodashFirecloud.default.isError(err)) {
      return entry;
    }

    let stack = _lodashFirecloud.default.split(_lodashFirecloud.default.defaultTo(err.stack, ''), '\n');
    stack = _lodashFirecloud.default.isEmpty(stack) ? undefined : stack;

    entry.err = _lodashFirecloud.default.pick(err, [
    'name',
    'message',
    // custom
    'uncaught',
    'inPromise']);

    entry.err.stack = stack;

    let uncaughtMsg = entry.err.uncaught ? 'Uncaught ' : '';
    let inPromiseMsg = entry.err.inPromise ? '(in promise) ' : '';
    let msg = _lodashFirecloud.default.isUndefined(entry.err.stack) ?
    `${entry.err.name}: ${entry.err.message}` :
    _lodashFirecloud.default.join(entry.err.stack, '\n');
    msg = `${uncaughtMsg}${inPromiseMsg}${msg}`;
    entry.msg = _lodashFirecloud.default.defaultTo(entry.msg, msg);

    return entry;
  };
};exports.serializeErr = serializeErr;var _default = exports.serializeErr;exports.default = _default;

//# sourceMappingURL=err.js.map