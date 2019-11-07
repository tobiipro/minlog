"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.logToConsoleAwsLambda = exports._isAwsLambda = exports._isNode = exports._nonBreakingWhitespace = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _fastSafeStringify = _interopRequireDefault(require("fast-safe-stringify"));
var _util = _interopRequireDefault(require("util"));






var _logToConsole = require("./log-to-console");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}





let _nonBreakingWhitespace = ' ';exports._nonBreakingWhitespace = _nonBreakingWhitespace;

let _isNode = typeof process !== 'undefined' && _lodashFirecloud.default.isDefined(_lodashFirecloud.default.get(process, 'versions.node'));exports._isNode = _isNode;
let _isAwsLambda = exports._isNode && _lodashFirecloud.default.isDefined(process.env.LAMBDA_TASK_ROOT);

/*
                                                                                                        cfg has 1 property
                                                                                                        - level (optional, defaults to trace)
                                                                                                          Any log entry less important that cfg.level is ignored.
                                                                                                        */exports._isAwsLambda = _isAwsLambda;

let logToConsoleAwsLambda = function (cfg =

{}) {
  if (!exports._isAwsLambda) {
    // use vanilla logger e.g. behind aws-lambda-proxy
    return (0, _logToConsole.logToConsole)(cfg);
  }

  // from https://github.com/Financial-Times/lambda-logger
  // This does make process.stdout.write a blocking function (process.stdout._handle.setBlocking(true);),
  // as AWS Lambda previously streamed to an output which was synchronous,
  // but has since changed to asynchronous behaviour, leading to lost logs.
  if (_lodashFirecloud.default.isFunction(_lodashFirecloud.default.get(process, 'stdout._handle.setBlocking'))) {
    // @ts-ignore
    process.stdout._handle.setBlocking(true);
  }

  // eslint-disable-next-line complexity
  return async function ({ entry, logger, rawEntry }) {
    // eslint-disable-next-line require-atomic-updates
    cfg = _lodashFirecloud.default.isFunction(cfg) ? await (async createError => {try {return await cfg();} catch (_awaitTraceErr) {let err = createError();_awaitTraceErr.stack += "\n...\n" + err.stack;throw _awaitTraceErr;}})(() => new Error()) : await (async createError => {try {return await cfg;} catch (_awaitTraceErr2) {let err = createError();_awaitTraceErr2.stack += "\n...\n" + err.stack;throw _awaitTraceErr2;}})(() => new Error());

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
    // eslint-disable-next-line require-atomic-updates
    cfg = cfg2;

    msg = `${msg} `;
    msg = _lodashFirecloud.default.padEnd(msg, 255, exports._nonBreakingWhitespace);
    msg = `${msg}.`;

    // prefer JSON output over util.inspect output
    let rawExtra = _lodashFirecloud.default.omit(rawEntry, [
    '_args']);

    let rawExtraStr = (0, _fastSafeStringify.default)(rawExtra, undefined, 2);
    rawExtraStr = `\n${rawExtraStr}`;

    // maintain whitespace (looking at you AWS CloudWatch WebUI)
    // by replacing space with non-breaking space
    rawExtraStr = _lodashFirecloud.default.replace(rawExtraStr, / /g, exports._nonBreakingWhitespace);

    let extraArgs = [
    rawExtraStr];


    let formatPairs = [];

    // timestamp
    formatPairs.push([
    '%s',
    now]);


    // awsRequestId
    formatPairs.push([
    '\t%s',
    _lodashFirecloud.default.get(entry, 'ctx.awsRequestId', '-')]);


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
    formatPairs.push([
    '\n%s',
    msg]);


    let formatArgs = (0, _logToConsole.toFormatArgs)(...formatPairs);
    formatArgs = _lodashFirecloud.default.concat(formatArgs, extraArgs);

    let [
    format,
    ...params] =
    formatArgs;

    // eslint-disable-next-line global-require
    let chunk = _util.default.format(format, ...params);
    chunk = _lodashFirecloud.default.replace(chunk, /\n/g, '\r');
    chunk = `${chunk}\n`;
    process.stdout.write(chunk);
  };
};exports.logToConsoleAwsLambda = logToConsoleAwsLambda;var _default = exports.logToConsoleAwsLambda;exports.default = _default;

//# sourceMappingURL=log-to-console-aws-lambda.js.map