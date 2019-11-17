import _ from 'lodash-firecloud';
import defaultLevels from './default-levels';

import {
  MinLogArg,
  MinLogEntry,
  MinLogLevel,
  MinLogLevelCode,
  MinLogLevelName,
  MinLogLevelNameToCode,
  MinLogListener,
  MinLogOptions,
  MinLogSerializer
} from './types';

type MinLogDefaultLevelLogFns = {
  [TKey in keyof (typeof defaultLevels)]: (...args: MinLogArg[]) => Promise<void>;
};

export class MinLog {
  serializers: MinLogSerializer[] = [];

  listeners: MinLogListener[] = [];

  levels: MinLogLevelNameToCode = defaultLevels;

  requireRawEntry: boolean = false;

  requireSrc: boolean = false;

  time: (...args) => Promise<void>;

  constructor(options: MinLogOptions = {}) {
    _.mergeConcatArrays(this, options);

    _.forEach(this.levels, (levelCode, levelName) => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this[levelName] = _.bind(this.log, this, levelCode);
    });
  }

  child(childOptions: MinLogOptions = {}): MinLog {
    let serializers = [
      ...this.serializers,
      ...childOptions.serializers
    ];
    let listeners = [
      ...this.listeners,
      ...childOptions.listeners
    ];

    let childLogger = new (this.constructor as typeof MinLog)(_.assign({}, childOptions, {
      serializers,
      listeners
    }));

    return childLogger;
  }

  levelIsBeyondGroup(
    levelCodeOrName: MinLogLevel,
    groupCodeOrName: MinLogLevel
  ): boolean {
    let levelCode = this.levelToLevelCode(levelCodeOrName);
    let maxLevelCode = this.maxLevelCodeInGroup(groupCodeOrName);
    return levelCode > maxLevelCode;
  }

  levelToLevelCode(levelCodeOrName: MinLogLevel): MinLogLevelCode {
    if (_.isNumber(levelCodeOrName)) {
      let levelCode = levelCodeOrName;
      return levelCode;
    }

    let levelName = _.toLower(levelCodeOrName);
    if (/^lvl[0-9]+$/.test(levelName)) {
      let levelCodeStr = _.replace(levelName, /^lvl/, '');
      let levelCode = _.toInteger(levelCodeStr);
      return levelCode;
    }

    if (_.isUndefined(this.levels[levelName])) {
      throw new Error(`Unknown level name ${levelName}. Known: ${_.keys(this.levels)}.`);
    }

    return this.levels[levelName];
  }

  levelToLevelName(levelCodeOrName: MinLogLevel): MinLogLevelName {
    if (_.isString(levelCodeOrName)) {
      let levelName = _.toLower(levelCodeOrName);

      if (_.isUndefined(this.levels[levelName])) {
        throw new Error(`Unknown level name ${levelName}. Known: ${_.keys(this.levels)}.`);
      }

      return levelName;
    }

    let levelCode = levelCodeOrName;
    let levelName = _.defaultTo(_.invert(this.levels)[levelCode], `lvl${levelCode}`);
    return levelName;
  }

  maxLevelCodeInGroup(levelCodeOrName: MinLogLevel): MinLogLevelCode {
    let levelCode = this.levelToLevelCode(levelCodeOrName);

    // round up levelCode to next level group, not inclusive
    let maxLevelCodeGroup = _.floor(levelCode / 10) + 1;
    let maxLevelCode = maxLevelCodeGroup * 10 - 1;
    return maxLevelCode;
  }

  async log(levelCodeOrName: MinLogLevel, ...args: MinLogArg[]): Promise<void> {
    let levelCode: MinLogLevelCode;
    if (_.isString(levelCodeOrName)) {
      levelCode = this.levels[_.toLower(levelCodeOrName)];
    } else {
      levelCode = levelCodeOrName;
    }

    let src;
    if (this.requireSrc) {
      let callSites = _.getStackTrace(5);
      let externalCallSite = _.find(callSites, function(callSite) {
        return callSite.getFileName() !== __filename;
      });
      if (_.isDefined(externalCallSite)) {
        src = {
          file: externalCallSite.getFileName(),
          line: externalCallSite.getLineNumber(),
          function: externalCallSite.getFunctionName()
        };
      }
    }

    let entry: MinLogEntry = {
      _args: args,
      _time: Date.now(),
      _level: levelCode,
      _src: src
    };

    _.forEach(args, function(arg, index) {
      let amendEntry: object = {
        [`_arg${index}`]: arg
      };

      if (_.isError(arg) && _.isUndefined(entry.err)) {
        amendEntry = {
          err: arg
        };
      } else if (_.isString(arg) && _.isUndefined(entry.msg)) {
        amendEntry = {
          msg: arg
        };
      } else if (_.isPlainObject(arg)) {
        arg = arg as object;
        amendEntry = arg;
      }

      _.merge(entry, amendEntry);
    });

    let rawEntry;
    if (this.requireRawEntry) {
      rawEntry = _.cloneDeep(entry);
    }

    for (let serializer of this.serializers) {
      entry = await serializer({entry, logger: this as unknown as TypescriptMinLog, rawEntry});
      if (_.isUndefined(entry)) {
        break;
      }
    }

    if (_.isUndefined(entry)) {
      return;
    }

    for (let listener of this.listeners) {
      await listener({entry, logger: this as unknown as TypescriptMinLog, rawEntry});
    }
  }

  // trackTime(...logArgs, fn)
  async trackTime(...args): Promise<void> {
    let fn = args.pop();
    args.push({
      _timeStart: Date.now()
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.time(...args);

    let result = await fn();
    args.push({
      _timeEnd: Date.now()
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.time(...args);
    return result;
  }
}

export type TypescriptMinLog = MinLog & {
  new(options?: MinLogOptions): MinLog & MinLogDefaultLevelLogFns;
};

export let TypescriptMinLog = MinLog as TypescriptMinLog;

export default TypescriptMinLog;
