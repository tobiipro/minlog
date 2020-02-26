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
  MinLogRawEntry,
  MinLogSerializer
} from './types';

import {
  Fn,
  InstanceReplace,
  MaybePromise
} from 'lodash-firecloud/types';

interface MinLogLogFn {
  (...args: MinLogArg[]): ReturnType<MinLog['log']>;
}

type MinLogDefaultLevelLogFns = {
  [TKey in keyof typeof defaultLevels]: MinLogLogFn;
};

export class BaseMinLog {
  _queue: Fn<Promise<void>, []>[] = [];

  _queueFlushing: Promise<void>;

  serializers: MinLogSerializer[] = [];

  listeners: MinLogListener[] = [];

  levels: MinLogLevelNameToCode = defaultLevels;

  requireRawEntry: boolean = false;

  requireSrc: boolean = false;

  time: MinLogLogFn;

  constructor(options: MinLogOptions = {}) {
    _.mergeConcatArrays(this, options);

    _.forEach(this.levels, (levelCode, levelName) => {
      // prefer not using _.bind or any other external function
      // in order to improve function name detection via _.getStackTrace below
      this[levelName] = ((...args) => {
        return this.log(levelCode, ...args);
      }) as MinLogLogFn;
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

  async flush(): Promise<void> {
    await this._queueFlushing;

    let deferred = _.deferred<void>();
    this._queueFlushing = deferred.promise;

    let flushed = false;
    this._queue.push(async function() {
      flushed = true;
    });

    // eslint-disable-next-line no-unmodified-loop-condition, @typescript-eslint/no-unnecessary-condition
    while (!flushed) {
      let fn = this._queue.shift();
      await fn();
    }

    deferred.resolve();
    this._queueFlushing = undefined;
  }

  log(levelCodeOrName: MinLogLevel, ...args: MinLogArg[]): {
    promise: Promise<void>;
  } {
    let levelCode: MinLogLevelCode;
    if (_.isString(levelCodeOrName)) {
      levelCode = this.levels[_.toLower(levelCodeOrName)];
    } else {
      levelCode = levelCodeOrName;
    }

    let src: {
      file: string;
      line: number;
      function: string;
    };

    if (this.requireSrc) {
      // handle https://github.com/tobiipro/babel-preset-firecloud#babel-plugin-firecloud-src-arg-default-config-needed
      let maybeBabelSrcArg = args[0] as any;
      let babelSrcAbsoluteFilename = maybeBabelSrcArg?._babelSrc?.file as string;
      if (!_.startsWith(babelSrcAbsoluteFilename, '/')) {
        babelSrcAbsoluteFilename = undefined;
      }

      let callSites = _.getStackTrace(5);
      let callSite = _.find(callSites, function(callSite) {
        let filename = callSite.getFileName();

        if (_.isDefined(babelSrcAbsoluteFilename)) {
          let matchesBabelFilename = filename === babelSrcAbsoluteFilename;
          if (matchesBabelFilename) {
            return true;
          }
        } else {
          let isExternal = filename !== __filename;
          if (isExternal) {
            return true;
          }
        }

        return false;
      });

      if (_.isDefined(callSite)) {
        src = {
          file: callSite.getFileName(),
          line: callSite.getLineNumber(),
          function: _.defaultTo(callSite.getFunctionName(), undefined)
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

    let rawEntry: MinLogRawEntry;
    if (this.requireRawEntry) {
      rawEntry = _.cloneDeep(entry) as unknown as MinLogRawEntry;
    }

    let deferred = _.deferred<void>();
    this._queue.push(async () => {
      for (let serializer of this.serializers) {
        entry = await serializer({entry, logger: this as unknown as MinLog, rawEntry});
        if (_.isUndefined(entry)) {
          break;
        }
      }

      if (_.isUndefined(entry)) {
        return;
      }

      for (let listener of this.listeners) {
        await listener({entry, logger: this as unknown as MinLog, rawEntry});
      }

      deferred.resolve();
    });

    _.defer(_.asyncCb(async () => {
      await this.flush();
    }));

    return {
      promise: deferred.promise
    };
  }

  // trackTime(...logArgs, fn)
  /* eslint-disable lines-between-class-members, no-dupe-class-members */
  trackTime<TFn extends Fn>(fn: TFn): ReturnType<TFn>;
  trackTime<TFn extends Fn>(_arg1: MinLogArg, fn: TFn): ReturnType<TFn>;
  trackTime<TFn extends Fn>(_arg1: MinLogArg, _arg2: MinLogArg, fn: TFn): ReturnType<TFn>;
  trackTime<TFn extends Fn>(_arg1: MinLogArg, _arg2: MinLogArg, _arg3: MinLogArg, fn: TFn): ReturnType<TFn>;
  trackTime<TFn extends Fn>(
    _arg1: MinLogArg, _arg2: MinLogArg, _arg3: MinLogArg, _arg4: MinLogArg,
    fn: TFn
  ): ReturnType<TFn>;
  trackTime<TFn extends Fn>(
    _arg1: MinLogArg, _arg2: MinLogArg, _arg3: MinLogArg, _arg4: MinLogArg, _arg5: MinLogArg,
    fn: TFn
  ): ReturnType<TFn>;
  /* eslint-enable lines-between-class-members, no-dupe-class-members */

  // eslint-disable-next-line no-dupe-class-members
  trackTime(...args: (MinLogArg | Fn)[]): MaybePromise<any> {
    let fn = args.pop() as Fn<MaybePromise<any>>;
    args.push({
      _timeStart: Date.now()
    });

    this.time(...args);

    let result = fn();
    _.defer(_.asyncCb(async () => {
      try {
        await result;
      } catch {
      }

      args.push({
        _timeEnd: Date.now()
      });

      this.time(...args);
    }));

    return result;
  }
}

// instance type
export type MinLog = BaseMinLog & MinLogDefaultLevelLogFns;

// constructor type
export type MinLogConstructor = InstanceReplace<typeof BaseMinLog, MinLog>;

export let MinLog = BaseMinLog as MinLogConstructor;

export default MinLog;
