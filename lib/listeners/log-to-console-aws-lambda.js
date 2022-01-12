"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.logToConsoleAwsLambda = exports.format = exports.default = exports._nonBreakingWhitespace = exports._isAwsLambda = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _fastSafeStringify = _interopRequireDefault(require("fast-safe-stringify"));







var _util = require("../util");




var _logToConsole = require("./log-to-console");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}





































let _nonBreakingWhitespace = ' ';exports._nonBreakingWhitespace = _nonBreakingWhitespace;

let _isAwsLambda = function () {
  let isNode = typeof process !== 'undefined' && _lodashFirecloud.default.isDefined(_lodashFirecloud.default.get(process, 'versions.node'));
  if (!isNode) {
    return false;
  }

  let isAwsLambda = _lodashFirecloud.default.isDefined(process.env.LAMBDA_TASK_ROOT);
  if (!isAwsLambda) {
    return false;
  }

  return true;
};exports._isAwsLambda = _isAwsLambda;

let format = function (...formatArgs) {
  let [
  format,
  ...args] =
  formatArgs;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  let chunk = require('util').format(format, ...args);
  chunk = _lodashFirecloud.default.replace(chunk, /\n/g, '\r');
  chunk = `${chunk}\n`;
  process.stdout.write(chunk);
};exports.format = format;

let logToConsoleAwsLambda = function (cfg = {}) {var _process$stdout$_hand;
  if (!exports._isAwsLambda()) {
    // use vanilla logger e.g. behind aws-lambda-proxy
    return (0, _logToConsole.logToConsole)(cfg);
  }

  // from https://github.com/Financial-Times/lambda-logger
  // This does make process.stdout.write a blocking function (process.stdout._handle.setBlocking(true);),
  // as AWS Lambda previously streamed to an output which was synchronous,
  // but has since changed to asynchronous behaviour, leading to lost logs.

  // remove eslint-disable-next-line after https://github.com/typescript-eslint/typescript-eslint/issues/1051
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (_lodashFirecloud.default.isFunction((_process$stdout$_hand = process.stdout._handle) === null || _process$stdout$_hand === void 0 ? void 0 : _process$stdout$_hand.setBlocking)) {
    // @ts-ignore
    process.stdout._handle.setBlocking(true);
  }

  // eslint-disable-next-line complexity
  return async function ({ entry, logger, rawEntry }) {var _entry$ctx;
    cfg = _lodashFirecloud.default.isFunction(cfg) ? await (async (createError) => {try {return await cfg();} catch (_awaitTraceErr) {let err = createError();_awaitTraceErr.stack += "\n...\n" + err.stack;throw _awaitTraceErr;}})(() => new Error()) : await (async (createError) => {try {return await cfg;} catch (_awaitTraceErr2) {let err = createError();_awaitTraceErr2.stack += "\n...\n" + err.stack;throw _awaitTraceErr2;}})(() => new Error());

    // handle https://github.com/tobiipro/babel-preset-firecloud#babel-plugin-firecloud-src-arg-default-config-needed
    if (_lodashFirecloud.default.isDefined(rawEntry) &&
    _lodashFirecloud.default.filter(rawEntry._args).length === 1 &&
    _lodashFirecloud.default.isDefined(rawEntry._args[0]._babelSrc)) {
      return;
    }

    if (_lodashFirecloud.default.isDefined(cfg.level) && logger.levelIsBeyondGroup(entry._level, cfg.level)) {
      return;
    }

    let {
      cfg: cfg2,
      now,
      formattedLevelName,
      src,
      msg
      // @ts-ignore
    } = (0, _logToConsole.serialize)({ entry, logger, rawEntry, cfg });
    cfg = cfg2;

    // use relative path, shorter output
    src = _lodashFirecloud.default.replace(src, /\/var\/task\//g, './');

    // prefer JSON output over util.inspect output
    let extra = _lodashFirecloud.default.omit(entry, [
    '_args']);

    let extraStr = (0, _fastSafeStringify.default)(extra, _util.jsonStringifyReplacer, 2);
    extraStr = `\n${extraStr}`;

    // maintain whitespace (looking at you AWS CloudWatch WebUI)
    // by replacing space with non-breaking space
    extraStr = _lodashFirecloud.default.replace(extraStr, / /g, exports._nonBreakingWhitespace);

    let extraArgs = [
    extraStr];


    let formatPairs = [];

    // timestamp
    formatPairs.push([
    '%s',
    now]);


    // awsRequestId
    formatPairs.push([
    '\t%s',
    // remove eslint-disable-next-line after https://github.com/typescript-eslint/typescript-eslint/issues/1051
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    _lodashFirecloud.default.defaultTo((_entry$ctx = entry.ctx) === null || _entry$ctx === void 0 ? void 0 : _entry$ctx.awsRequestId, '-')]);


    // level name
    formatPairs.push([
    '\t%s',
    formattedLevelName]);


    // src
    if (_lodashFirecloud.default.isDefined(src)) {
      formatPairs.push([
      '\t%s',
      src]);

    }

    // msg
    // eslint-disable-next-line lodash/prop-shorthand
    let argNames = _lodashFirecloud.default.keys((0, _util.keepOnlyExtra)(entry));
    if (!_lodashFirecloud.default.isEmpty(argNames)) {
      msg = `${msg} (${_lodashFirecloud.default.join(argNames, ', ')})`;
    }
    msg = `${msg} `;
    msg = _lodashFirecloud.default.padEnd(msg, 255, exports._nonBreakingWhitespace);
    msg = `${msg}.`;
    formatPairs.push([
    '\n%s',
    msg]);


    let formatArgs = (0, _logToConsole.toFormatArgs)(...formatPairs);
    formatArgs.push(...extraArgs);

    exports.format(...formatArgs);
  };
};exports.logToConsoleAwsLambda = logToConsoleAwsLambda;var _default = exports.logToConsoleAwsLambda;exports.default = _default;

//# sourceMappingURL=log-to-console-aws-lambda.js.map