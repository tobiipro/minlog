import TypescriptMinLog from '../minlog';
import _ from 'lodash-firecloud';
import fastSafeStringify from 'fast-safe-stringify';

import {
  MinLogEntry,
  MinLogFormatArgs,
  MinLogLevel,
  MinLogLevelNameToCode,
  MinLogListener,
  MinLogRawEntry,
  MinLogSerializedTime
} from '../types';

import {
  keepOnlyExtra
} from '../util';

type FormatPair = string | [string, any];

let _isBrowser = typeof window !== 'undefined';
let _isNode = typeof process !== 'undefined' && _.isDefined(_.get(process, 'versions.node'));

let _levelToConsoleFun = function({level, levels}: {
  level: MinLogLevel,
  levels: MinLogLevelNameToCode
}): string {
  if (_.isString(level)) {
    level = levels[level];
  }

  if (_.inRange(level, 0, levels.warn)) {
    return 'error';
  } else if (_.inRange(level, levels.warn, levels.info)) {
    return 'warn';
  } else if (_.inRange(level, levels.info, levels.debug)) {
    return 'info';
  } else if (_.inRange(level, levels.debug, levels.trace)) {
    // return 'debug';
    // console.debug doesn't seem to print anything,
    // but console.debug is an alias to console.log anyway
    return 'log';
  } else if (level === levels.trace) {
    return 'trace';
  }

  return 'log';
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export let serialize = function({entry, logger, rawEntry: _rawEntry, cfg}: {
  entry: MinLogEntry & {
    _time: MinLogSerializedTime
  },
  logger: TypescriptMinLog,
  rawEntry: MinLogRawEntry,
  cfg?: {
    contextId?: string,
    level?: MinLogLevel,
    localTime?: boolean,
    localStamp?: number,
    stamp?: number
  }
}) {
  let contextId;
  let hasCssSupport = false;

  if (_isBrowser) {
    contextId = window.parent === window ? 'top' : 'iframe';
    hasCssSupport = true;
  }

  cfg = _.defaults({}, cfg, {
    contextId,
    level: 'trace',
    localTime: false
  });

  let now = cfg.localTime ?
    entry._time.localStamp :
    entry._time.stamp;
  let levelName = logger.levelToLevelName(entry._level);
  let formattedLevelName = _.padStart(_.toUpper(levelName), 5);
  let consoleFun = _levelToConsoleFun({
    level: entry._level,
    levels: logger.levels
  });

  let color = '';
  switch (consoleFun) {
  case 'log':
  case 'info':
  case 'trace':
    color = 'color: dodgerblue';
    break;
  default:
  }

  let src = _.merge({}, entry._src, entry._babelSrc);
  let srcStr: string;

  if (_.isEmpty(src)) {
    srcStr = '';
  } else {
    _.defaults(src, {
      // column may only be available in _babelSrc
      // prefer a default, over not printing `:?` for structured parsing, with no optional groups
      column: '?'
    });
    let inSrcFunction = _.isDefined(src.function) ? ` in ${src.function}()` : '';
    srcStr = `${src.file}:${src.file}:${src.column}${inSrcFunction}`;
  }

  let msg = _.defaultTo(entry.msg, '');
  if (!_.isEmpty(msg)) {
    let {
      _duration: duration
    } = entry;

    if (_.isDefined(duration)) {
      msg = `${msg} - took ${duration.ms} ms`;
      if (duration.ms > 1000) {
        msg = `${msg} (${duration.human})`;
      }
    }
  }

  let extra = keepOnlyExtra(entry);

  if (_isBrowser) {
    let ctx = {
      window,
      documentElement: window.document.documentElement
    };
    _.merge(extra, {
      ctx
    });
  }

  // devTools console sorts keys when object is expanded
  let extraPairs = _.toPairs(extra);
  // eslint-disable-next-line lodash/prop-shorthand
  extraPairs = _.sortBy(extraPairs, 0);
  extra = _.fromPairs(extraPairs);

  return {
    cfg,
    hasCssSupport,

    now,
    levelName,
    formattedLevelName,
    consoleFun,
    color,
    src: srcStr,
    msg,

    extra
  };
};

export let toFormatArgs = function(...formatPairs: FormatPair[]): MinLogFormatArgs {
  let {
    format,
    formatArgs
  } = _.reduce(formatPairs, function(result, formatPair) {
    let {
      format,
      formatArgs
    } = result;

    if (_.isString(formatPair)) {
      format.push(formatPair);
      return {
        format,
        formatArgs
      };
    }

    format.push(formatPair[0]);
    formatArgs.push(formatPair[1]);

    return {
      format,
      formatArgs
    };
  }, {
    format: [],
    formatArgs: []
  });

  let formatStr = _.join(format, '');
  formatArgs.unshift(formatStr);
  return formatArgs as [string, ...any[]];
};

export let format = function(consoleFun: string, ...formatArgs: MinLogFormatArgs): void {
  let [
    format,
    ...args
  ] = formatArgs;

  // eslint-disable-next-line no-console
  console[consoleFun](format, ...args);
};

export let logToConsole = function(cfg: {

  /**
   * Any log entry less important that cfg.level is ignored.
   */
  level?: MinLogLevel,

  /**
   * A context id. In a browser environment, it defaults to 'top'/'iframe'.
   */
  contextId?: string
} = {}): MinLogListener {
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
      hasCssSupport,
      now,
      formattedLevelName,
      consoleFun,
      color,
      src,
      msg,
      extra
    // @ts-ignore
    } = serialize({entry, logger, rawEntry, cfg});
    // eslint-disable-next-line require-atomic-updates
    cfg = cfg2;

    let extraArgs = [];
    // devTools collapses objects with 'too many' keys,
    // so we output objects with only one key
    _.forEach(extra, function(value, key) {
      if (_.isUndefined(value)) {
        return;
      }

      let valueObj = {
        [key]: value
      };

      if (_isBrowser) {
        extraArgs.push('\n');
        extraArgs.push(valueObj);
      } else if (_isNode) {
        // prefer JSON output over util.inspect output
        let valueStr = fastSafeStringify(valueObj, undefined, 2);
        valueStr = `\n${valueStr}`;
        extraArgs.push(valueStr);
      }
    });

    let formatPairs = [];

    // color
    if (hasCssSupport) {
      formatPairs.push([
        '%c',
        color
      ]);
    }

    // timestamp
    formatPairs.push([
      '%s',
      now
    ]);

    // context
    if (_.isDefined(cfg.contextId)) {
      formatPairs.push([
        ' %s',
        cfg.contextId
      ]);
    }

    // level name
    if (hasCssSupport) {
      formatPairs.push([
        '%c',
        'font-weight: bold'
      ]);
    }
    formatPairs.push([
      ' %s',
      formattedLevelName
    ]);

    // color
    if (hasCssSupport) {
      formatPairs.push([
        '%c',
        color
      ]);
    }

    // src
    if (_.isDefined(src)) {
      formatPairs.push([
        ' %s',
        src
      ]);
    }

    // msg
    formatArgs.push([
      '\n%s',
      msg
    ]);

    let formatArgs = toFormatArgs(...formatPairs);
    formatArgs.push(...extraArgs);

    // eslint-disable-next-line no-console
    format(consoleFun, ...formatArgs);
  };
};

export default logToConsole;
