import _ from 'lodash';

let _log = {
  local: console
};

// See http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
export let _getCallerInfo = function(level) {
  // eslint-disable-next-line no-invalid-this, consistent-this
  let self = this;

  // 'strict' mode has no caller info
  if (self === undefined) {
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
  // eslint-disable-next-line no-unused-expressions
  Error().stack;

  Error.stackTraceLimit = origLimit;
  Error.prepareStackTrace = origPrepare;
  return info;
};

export default class MinLog {
  levels = {
    // https://tools.ietf.org/html/rfc3164 (multiplier 10)
    emergency: 0,
    alert: 10,
    critical: 20,
    error: 30,
    warning: 40,
    notice: 50,
    informational: 60,
    debug: 70,

    // console
    warn: 40, // warning
    info: 60, // informational
    trace: 90,

    // alias
    fatal: 0, // emergency
    verbose: 70, // debug
    silly: 80
  };

  serializers = [];
  listeners = [];

  constructor({
    entry = this.entry,
    serializers = this.serializers,
    listeners = this.listeners
  }) {
    this.entry = entry;
    this.serializers = _.clone(serializers);
    this.listeners = _.clone(listeners);

    _.forEach(this.levels, (_level, levelName) => {
      this[levelName] = _.bind(this.log, this, levelName);
    });
  }

  levelToLevelName(level) {
    if (_.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this.levels[level] || this.levels.trace;
    }

    let levelName = _.invert(this.levels)[level] || `lvl${level}`;
    switch (levelName) {
      case 'verbose':
        levelName = 'debug';
        break;
      default:
        break;
    }

    return levelName;
  }

  levelToConsoleFun(level) {
    if (_.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this.levels[level];
    }

    if (_.inRange(level, 0, this.levels.warn)) {
      return 'error';
    } else if (_.inRange(level, this.levels.warn, this.levels.info)) {
      return 'warn';
    } else if (_.inRange(level, this.levels.info, this.levels.debug)) {
      return 'info';
    } else if (_.inRange(level, this.levels.debug, this.levels.trace)) {
      // return 'debug';
      // console.debug doesn't seem to print anything,
      // but console.debug is an alias to console.log anyway
      return 'log';
    } else if (level === this.levels.trace) {
      return 'trace';
    }

    return 'log';
  }

  async log(level, ...args) {
    if (_.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this.levels[level];
    }

    let src = exports._getCallerInfo(5);

    let entry = {
      _time: new Date(),
      _level: level,
      _src: src
    };

    _.forEach(args, function(arg, index) {
      let amendEntry = {
        [`_arg${index}`]: arg
      };

      if (_.isError(arg) && _.isUndefined(entry.msg)) {
        amendEntry.err = arg;
      } else if (_.isString(arg) && _.isUndefined(entry.msg)) {
        amendEntry.msg = arg;
      } else if (_.isPlainObject(arg)) {
        _.defaults(amendEntry, arg);
      }

      _.merge(entry, amendEntry);
    });

    let rawEntry = _.cloneDeep(entry);
    rawEntry._args = args;

    await Promise.all(_.map(this.serializers, async (serializer) => {
      entry = await serializer({entry, logger: this, rawEntry});
    }));

    _.forEach(this.listeners, (listener) => {
      listener({entry, logger: this, rawEntry});
    });
  }
}
