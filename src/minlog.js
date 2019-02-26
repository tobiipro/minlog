import _ from 'lodash-firecloud';

import {
  getCallerInfo
} from './util';

export let defaultLevels = {
  time: 70,

  // npm alias
  fatal: 0, // emergency
  verbose: 70, // debug
  silly: 80,

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
  trace: 90
};

export class MinLog {
  levels = defaultLevels;

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

    _.forEach(this.levels, (levelCode, levelName) => {
      this[levelName] = _.bind(this.log, this, levelCode);
    });
  }

  levelIsBeyondGroup(levelCodeOrName, groupCodeOrName) {
    let levelCode = this.levelToLevelCode(levelCodeOrName);
    let maxLevelCode = this.maxLevelCodeInGroup(groupCodeOrName);
    return levelCode > maxLevelCode;
  }

  levelToLevelCode(levelCodeOrName) {
    if (_.isInteger(levelCodeOrName)) {
      let levelCode = levelCodeOrName;
      return levelCode;
    }

    let levelName = _.toLower(levelCodeOrName);
    if (/^lvl[0-9]+$/.test(levelName)) {
      let levelCode = _.replace(levelName, /^lvl/, '');
      levelCode = _.toInteger(levelCode);
      return levelCode;
    }

    if (_.isUndefined(this.levels[levelName])) {
      throw new Error(`Unknown level name ${levelName}. Known: ${_.keys(this.levels)}.`);
    }

    return this.levels[levelName];
  }

  levelToLevelName(levelCodeOrName) {
    if (_.isString(levelCodeOrName)) {
      let levelName = _.toLower(levelCodeOrName);

      if (_.isUndefined(this.levels[levelName])) {
        throw new Error(`Unknown level name ${levelName}. Known: ${_.keys(this.levels)}.`);
      }

      return levelName;
    }

    let levelCode = levelCodeOrName;
    let levelName = _.invert(this.levels)[levelCode] || `lvl${levelCode}`;
    return levelName;
  }

  maxLevelCodeInGroup(levelCodeOrName) {
    let levelCode = this.levelToLevelCode(levelCodeOrName);

    // round up levelCode to next level group, not inclusive
    let maxLevelCodeGroup = _.floor(levelCode / 10) + 1;
    let maxLevelCode = maxLevelCodeGroup * 10 - 1;
    return maxLevelCode;
  }

  async log(levelCodeOrName, ...args) {
    let levelCode = levelCodeOrName;
    if (_.isString(levelCodeOrName)) {
      levelCode = this.levels[_.toLower(levelCodeOrName)];
    }

    let src = getCallerInfo(5);

    let entry = {
      _args: args,
      _time: new Date(),
      _level: levelCode,
      _src: src
    };

    _.forEach(args, function(arg, index) {
      let amendEntry = {
        [`_arg${index}`]: arg
      };

      if (_.isError(arg) && _.isUndefined(entry.err)) {
        amendEntry.err = arg;
      } else if (_.isString(arg) && _.isUndefined(entry.msg)) {
        amendEntry.msg = arg;
      } else if (_.isPlainObject(arg)) {
        _.defaults(amendEntry, arg);
      }

      _.merge(entry, amendEntry);
    });

    let rawEntry = _.cloneDeep(entry);

    for (let serializer of this.serializers) {
      // eslint-disable-next-line require-atomic-updates
      entry = await serializer({entry, logger: this, rawEntry});
    }

    for (let listener of this.listeners) {
      await listener({entry, logger: this, rawEntry});
    }
  }

  // trackTime(...logArgs, fn)
  async trackTime(...args) {
    let fn = args.pop();
    args.push({
      _timeStart: new Date()
    });

    this.time(...args);

    await fn();
    args.push({
      _timeEnd: new Date()
    });

    this.time(...args);
  }
}

export default MinLog;
