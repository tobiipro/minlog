import _ from 'lodash-firecloud';
import fastSafeStringify from 'fast-safe-stringify';
import util from 'util';

import {
  MinLogLevel,
  MinLogListener
} from '../types';

import {
  logToConsole,
  serialize as serializeLogToConsole,
  toFormatArgs
} from './log-to-console';

let _nonBreakingWhitespace = ' ';

let _isNode = typeof process !== 'undefined' && _.isDefined(_.get(process, 'versions.node'));
let _isAwsLambda = _isNode && _.isDefined(process.env.LAMBDA_TASK_ROOT);

/*
cfg has 1 property
- level (optional, defaults to trace)
  Any log entry less important that cfg.level is ignored.
*/

export let logToConsoleAwsLambda = function(cfg: {
  level?: MinLogLevel
} = {}): MinLogListener {
  if (!_isAwsLambda) {
    // use vanilla logger e.g. behind aws-lambda-proxy
    return logToConsole(cfg);
  }

  // from https://github.com/Financial-Times/lambda-logger
  // This does make process.stdout.write a blocking function (process.stdout._handle.setBlocking(true);),
  // as AWS Lambda previously streamed to an output which was synchronous,
  // but has since changed to asynchronous behaviour, leading to lost logs.
  if (_.isFunction(_.get(process, 'stdout._handle.setBlocking'))) {
    // @ts-ignore
    process.stdout._handle.setBlocking(true);
  }

  // eslint-disable-next-line complexity
  return async function({entry, logger, rawEntry}) {
    // eslint-disable-next-line require-atomic-updates
    cfg = _.isFunction(cfg) ? await cfg() : await cfg;

    if (_.isDefined(rawEntry) &&
        _.filter(rawEntry._args).length === 1 &&
        _.isDefined(rawEntry._args[0]._babelSrc)) {
      return;
    }

    if (_.isDefined(cfg.level) && logger.levelIsBeyondGroup(entry._level, cfg.level)) {
      return;
    }

    let {
      cfg: cfg2,
      now,
      formattedLevelName,
      src,
      msg
    // @ts-ignore
    } = serializeLogToConsole({entry, logger, rawEntry, cfg});
    // eslint-disable-next-line require-atomic-updates
    cfg = cfg2;

    msg = `${msg} `;
    msg = _.padEnd(msg, 255, _nonBreakingWhitespace);
    msg = `${msg}.`;

    // prefer JSON output over util.inspect output
    let rawExtra = _.omit(rawEntry, [
      '_args'
    ]);
    let rawExtraStr = fastSafeStringify(rawExtra, undefined, 2);
    rawExtraStr = `\n${rawExtraStr}`;

    // maintain whitespace (looking at you AWS CloudWatch WebUI)
    // by replacing space with non-breaking space
    rawExtraStr = _.replace(rawExtraStr, / /g, _nonBreakingWhitespace);

    let extraArgs = [
      rawExtraStr
    ];

    let formatPairs = [];

    // timestamp
    formatPairs.push([
      '%s',
      now
    ]);

    // awsRequestId
    formatPairs.push([
      '\t%s',
      _.get(entry, 'ctx.awsRequestId', '-')
    ]);

    // level name
    formatPairs.push([
      '\t%s',
      formattedLevelName
    ]);

    // src
    if (_.isDefined(src)) {
      formatPairs.push([
        '\t%s',
        src
      ]);
    }

    // msg
    formatPairs.push([
      '\n%s',
      msg
    ]);

    let formatArgs = toFormatArgs(...formatPairs);
    formatArgs = _.concat(formatArgs, extraArgs);

    let [
      format,
      ...params
    ] = formatArgs;

    // eslint-disable-next-line global-require
    let chunk = util.format(format, ...params);
    chunk = _.replace(chunk, /\n/g, '\r');
    chunk = `${chunk}\n`;
    process.stdout.write(chunk);
  };
};

export default logToConsoleAwsLambda;
