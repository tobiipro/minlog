import _ from 'lodash';
import {getCallerInfo} from './util';
import defaultLevels from './levels';

export default class MinLog {
  serializers = [];
  listeners = [];

  constructor({
    entry = this.entry,
    serializers = this.serializers,
    listeners = this.listeners,
    levels = defaultLevels
  } = {}) {
    this.entry = entry;
    this.serializers = _.clone(serializers);
    this.listeners = _.clone(listeners);
    this.levels = _.clone(levels);

    _.forEach(this.levels, (level, levelName) => {
      if (_.isNumber(level)) {
        this[levelName] = _.bind(this.log, this, levelName);
      }
    });
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
