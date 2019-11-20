import _ from 'lodash-firecloud';
import fastSafeStringify from 'fast-safe-stringify';

import {
  MinLogFormatArgs,
  MinLogLevel,
  MinLogListener
} from '../types';

import {
  jsonStringifyReplacer,
  keepOnlyExtra
} from '../util';

import {
  logToConsole,
  serialize as serializeLogToConsole,
  toFormatArgs
} from './log-to-console';

import {
  Fn,
  MaybePromise
} from 'lodash-firecloud/types';

export interface Cfg {

  /**
   * Any log entry less important that cfg.level is ignored.
   */
  level?: MinLogLevel;
}

let _nonBreakingWhitespace = ' ';

let _isAwsLambda = function(): boolean {
  let isNode = typeof process !== 'undefined' && _.isDefined(_.get(process, 'versions.node'));
  if (!isNode) {
    return false;
  }

  let isAwsLambda = _.isDefined(process.env.LAMBDA_TASK_ROOT);
  if (!isAwsLambda) {
    return false;
  }

  return true;
};

export let format = function(...formatArgs: MinLogFormatArgs): void {
  let [
    format,
    ...args
  ] = formatArgs;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  let chunk = require('util').format(format, ...args);
  chunk = _.replace(chunk, /\n/g, '\r');
  chunk = `${chunk}\n`;
  process.stdout.write(chunk);
};

export let logToConsoleAwsLambda = function(cfg: MaybePromise<Cfg> | Fn<MaybePromise<Cfg>> = {}): MinLogListener {
  if (!_isAwsLambda()) {
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
    cfg = _.isFunction(cfg) ? await cfg() : await cfg;

    // handle https://github.com/tobiipro/babel-preset-firecloud#babel-plugin-firecloud-src-arg-default-config-needed
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
    cfg = cfg2;

    // use relative path, shorter output
    src = _.replace(src, /\/var\/task\//g, './');

    // prefer JSON output over util.inspect output
    let extra = _.omit(entry, [
      '_args'
    ]);
    let extraStr = fastSafeStringify(extra, jsonStringifyReplacer, 2);
    extraStr = `\n${extraStr}`;

    // maintain whitespace (looking at you AWS CloudWatch WebUI)
    // by replacing space with non-breaking space
    extraStr = _.replace(extraStr, / /g, _nonBreakingWhitespace);

    let extraArgs = [
      extraStr
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
    // eslint-disable-next-line lodash/prop-shorthand
    let argNames = _.keys(keepOnlyExtra(entry));
    if (!_.isEmpty(argNames)) {
      msg = `${msg} (${_.join(argNames, ', ')})`;
    }
    msg = `${msg} `;
    msg = _.padEnd(msg, 255, _nonBreakingWhitespace);
    msg = `${msg}.`;
    formatPairs.push([
      '\n%s',
      msg
    ]);

    let formatArgs = toFormatArgs(...formatPairs);
    formatArgs.push(...extraArgs);

    format(...formatArgs);
  };
};

export default logToConsoleAwsLambda;
