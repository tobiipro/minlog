import _ from 'lodash-firecloud';
import fastSafeStringify from 'fast-safe-stringify';
import util from 'util';

import {
  logToConsole,
  serialize as serializeLogToConsole,
  toFormatArgs
} from './log-to-console';

let _nonBreakingWhitespace = ' ';

let _isBrowser = typeof window !== 'undefined';
let _isNode = typeof process !== 'undefined' && _.isDefined(_.get(process, 'versions.node'));
let _isAwsLambda = _isNode && _.isDefined(process.env.LAMBDA_TASK_ROOT);

/*
cfg has 1 property
- level (optional, defaults to trace)
  Any log entry less important that cfg.level is ignored.
*/

export let logToConsoleAwsLambda = function(cfg = {}) {
  if (!_isAwsLambda) {
    // use vanilla logger e.g. behind aws-lambda-proxy
    return logToConsole(cfg);
  }

  // from https://github.com/Financial-Times/lambda-logger
  // This does make process.stdout.write a blocking function (process.stdout._handle.setBlocking(true);),
  // as AWS Lambda previously streamed to an output which was synchronous,
  // but has since changed to asynchronous behaviour, leading to lost logs.
  if (_.isFunction(_.get(process, 'stdout._handle.setBlocking'))) {
    process.stdout._handle.setBlocking(true);
  }

  // eslint-disable-next-line complexity
  return async function({entry, logger, rawEntry}) {
    if (_.isDefined(rawEntry) &&
        _.filter(rawEntry._args).length === 1 &&
        rawEntry._args[0]._babelSrc) {
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
      msg,
      extra
    } = serializeLogToConsole({entry, logger, rawEntry, cfg});
    cfg = cfg2;

    msg = `${msg} `;
    msg = _.padEnd(msg, 255, _nonBreakingWhitespace);
    msg = `${msg}.`;

    // prefer JSON output over util.inspect output
    extra = fastSafeStringify(extra, undefined, 2);
    extra = `\n${extra}`;

    // maintain whitespace (looking at you AWS CloudWatch WebUI)
    // by replacing space with non-breaking space
    extra = _.replace(extra, / /g, _nonBreakingWhitespace);

    let extraArgs = [
      extra
    ];

    let formatArgs = [];

    // timestamp
    formatArgs.push([
      '%s',
      now
    ]);

    // awsRequestId
    formatArgs.push([
      ' %s',
      // skip for readability, still available in 'extra'
      // entry.context.awsRequestId
      '-'
    ]);

    // level name
    formatArgs.push([
      '\t%s',
      formattedLevelName
    ]);

    // src
    if (src) {
      formatArgs.push([
        ' %s',
        src
      ]);
    }

    // msg
    formatArgs.push([
      '\n%s',
      msg
    ]);

    formatArgs = toFormatArgs(...formatArgs);
    formatArgs = _.concat(formatArgs, extraArgs);

    // eslint-disable-next-line global-require
    let chunk = util.format(...formatArgs);
    chunk = _.replace(chunk, /\n/g, '\r');
    chunk = `${chunk}\n`;
    process.stdout.write(chunk);
  };
};

export default logToConsoleAwsLambda;
