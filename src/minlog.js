import _ from 'lodash';
import {
  getCallerInfo
} from './util';

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
    serializers = this.serializers,
    listeners = this.listeners,
    levels = {}
  } = {}) {
    this.serializers = _.clone(serializers);
    this.listeners = _.clone(listeners);
    this.levels = _.merge(this.levels, levels);

    _.forEach(this.levels, (_level, levelName) => {
      this[levelName] = _.bind(this.log, this, levelName);
    });
  }

  levelToLevelName(level) {
    if (_.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this.levels[level];

      if (_.isUndefined(level)) {
        throw new Error(`Unknown level name ${level}. Known: ${_.keys(this.levels)}.`);
      }
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

  async log(level, ...args) {
    if (_.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this.levels[level];
    }

    let src = getCallerInfo(5);

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
