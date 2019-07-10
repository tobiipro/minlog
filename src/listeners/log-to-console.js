import _ from 'lodash-firecloud';
import fastSafeStringify from 'fast-safe-stringify';

let _isBrowser = typeof window !== 'undefined';
let _isNode = typeof process !== 'undefined' && _.isDefined(_.get(process, 'versions.node'));

let _levelToConsoleFun = function({level, levels}) {
  if (_.isString(level)) {
    // eslint-disable-next-line prefer-destructuring
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

/*
cfg has 2 properties
- contextId (optional, default to 'top' in browser and undefined elsewhere)
  An identifier for the current "context".
- level (optional, defaults to trace)
  Any log entry less important that cfg.level is ignored.
*/

export let serialize = function({entry, logger, _rawEntry, cfg}) {
  let contextId;
  let hasCssSupport = false;

  if (_isBrowser) {
    if (window.parent === window) {
      contextId = 'top';
    }
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
  if (_.isEmpty(src)) {
    src = '';
  } else if (_isBrowser) {
    // FIXME assumes webpack; could be a cfg flag, unless webpack can be detected
    src = `@webpack:///./${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
  } else {
    src = `${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
  }

  let msg = entry.msg || '';
  if (msg) {
    let {
      _duration: duration
    } = entry;

    if (duration) {
      msg = `${msg} - took ${duration.ms} ms`;
      if (duration.ms > 1000) {
        msg = `${msg} (${duration.human})`;
      }
    }
  }

  let extra = _.omit(entry, [
    '_args',
    '_babelSrc',
    '_duration',
    '_level',
    '_src',
    '_time',
    '_timeEnd',
    '_timeStart',
    'msg'
  ]);

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
  extra = _.toPairs(extra);
  extra = _.sortBy(extra, 0);
  extra = _.fromPairs(extra);

  return {
    cfg,
    hasCssSupport,

    now,
    levelName,
    formattedLevelName,
    consoleFun,
    color,
    src,
    msg,

    extra
  };
};

export let toFormatArgs = function(...args) {
  let {
    format,
    formatArgs
  } = _.reduce(args, function(result, arg) {
    let {
      format,
      formatArgs
    } = result;

    if (_.isString(arg)) {
      format.push(arg);
      return {
        format,
        formatArgs
      };
    }

    format.push(arg[0]);
    formatArgs.push(arg[1]);

    return {
      format,
      formatArgs
    };
  }, {
    format: [],
    formatArgs: []
  });

  format = _.join(format, '');
  formatArgs.unshift(format);
  return formatArgs;
};

export let logToConsole = function(cfg = {}) {
  // eslint-disable-next-line complexity
  return async function({entry, logger, rawEntry}) {
    if (_.isDefined(rawEntry) &&
        _.filter(rawEntry._args).length === 1 &&
        rawEntry._args[0]._babelSrc) {
      return;
    }

    if (logger.levelIsBeyondGroup(entry._level, cfg.level)) {
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
    } = serialize({entry, logger, rawEntry, cfg});
    cfg = cfg2;

    let extraArgs = [];
    // devTools collapses objects with 'too many' keys,
    // so we output objects with only one key
    _.forEach(extra, function(value, key) {
      if (_.isUndefined(value)) {
        return;
      }

      value = {
        [key]: value
      };

      if (_isBrowser) {
        extraArgs.push('\n');
        extraArgs.push(value);
      } else if (_isNode) {
        // prefer JSON output over util.inspect output
        value = fastSafeStringify(value, undefined, 2);
        value = `\n${value}`;
        extraArgs.push(value);
      }
    });

    let formatArgs = [];

    // color
    if (hasCssSupport) {
      formatArgs.push([
        '%c',
        color
      ]);
    }

    // timestamp
    formatArgs.push([
      '%s',
      now
    ]);

    // context
    if (_.isDefined(cfg.contextId)) {
      formatArgs.push([
        ' %s',
        cfg.contextId
      ]);
    }

    // level name
    if (hasCssSupport) {
      formatArgs.push([
        '%c',
        'font-weight: bold'
      ]);
    }
    formatArgs.push([
      ' %s',
      formattedLevelName
    ]);

    // color
    if (hasCssSupport) {
      formatArgs.push([
        '%c',
        color
      ]);
    }

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

    // eslint-disable-next-line no-console
    console[consoleFun](...formatArgs);
  };
};

export default logToConsole;
