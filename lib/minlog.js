"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.MinLog = exports.BaseMinLog = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _defaultLevels = _interopRequireDefault(require("./default-levels"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}




























class BaseMinLog {
















  constructor(options = {}) {_defineProperty(this, "_queue", []);_defineProperty(this, "_queueFlushing", void 0);_defineProperty(this, "serializers", []);_defineProperty(this, "listeners", []);_defineProperty(this, "levels", _defaultLevels.default);_defineProperty(this, "requireRawEntry", false);_defineProperty(this, "requireSrc", false);_defineProperty(this, "time", void 0);
    _lodashFirecloud.default.mergeConcatArrays(this, options);

    _lodashFirecloud.default.forEach(this.levels, (levelCode, levelName) => {
      // prefer not using _.bind or any other external function
      // in order to improve function name detection via _.getStackTrace below
      this[levelName] = (...args) => this.log(levelCode, ...args);
    });
  }

  child(childOptions = {}) {
    let serializers = [
    ...this.serializers,
    ...childOptions.serializers];

    let listeners = [
    ...this.listeners,
    ...childOptions.listeners];


    let childLogger = new this.constructor(_lodashFirecloud.default.assign({}, childOptions, {
      serializers,
      listeners }));


    return childLogger;
  }

  levelIsBeyondGroup(
  levelCodeOrName,
  groupCodeOrName)
  {
    let levelCode = this.levelToLevelCode(levelCodeOrName);
    let maxLevelCode = this.maxLevelCodeInGroup(groupCodeOrName);
    return levelCode > maxLevelCode;
  }

  levelToLevelCode(levelCodeOrName) {
    if (_lodashFirecloud.default.isNumber(levelCodeOrName)) {
      let levelCode = levelCodeOrName;
      return levelCode;
    }

    let levelName = _lodashFirecloud.default.toLower(levelCodeOrName);
    if (/^lvl[0-9]+$/.test(levelName)) {
      let levelCodeStr = _lodashFirecloud.default.replace(levelName, /^lvl/, '');
      let levelCode = _lodashFirecloud.default.toInteger(levelCodeStr);
      return levelCode;
    }

    if (_lodashFirecloud.default.isUndefined(this.levels[levelName])) {
      throw new Error(`Unknown level name ${levelName}. Known: ${_lodashFirecloud.default.keys(this.levels)}.`);
    }

    return this.levels[levelName];
  }

  levelToLevelName(levelCodeOrName) {
    if (_lodashFirecloud.default.isString(levelCodeOrName)) {
      let levelName = _lodashFirecloud.default.toLower(levelCodeOrName);

      if (_lodashFirecloud.default.isUndefined(this.levels[levelName])) {
        throw new Error(`Unknown level name ${levelName}. Known: ${_lodashFirecloud.default.keys(this.levels)}.`);
      }

      return levelName;
    }

    let levelCode = levelCodeOrName;
    let levelName = _lodashFirecloud.default.defaultTo(_lodashFirecloud.default.invert(this.levels)[levelCode], `lvl${levelCode}`);
    return levelName;
  }

  maxLevelCodeInGroup(levelCodeOrName) {
    let levelCode = this.levelToLevelCode(levelCodeOrName);

    // round up levelCode to next level group, not inclusive
    let maxLevelCodeGroup = _lodashFirecloud.default.floor(levelCode / 10) + 1;
    let maxLevelCode = maxLevelCodeGroup * 10 - 1;
    return maxLevelCode;
  }

  async flush() {
    await (async (createError) => {try {return await this._queueFlushing;} catch (_awaitTraceErr) {let err = createError();_awaitTraceErr.stack += "\n...\n" + err.stack;throw _awaitTraceErr;}})(() => new Error());

    let deferred = _lodashFirecloud.default.deferred();
    this._queueFlushing = deferred.promise;

    let flushed = false;
    this._queue.push(async function () {
      flushed = true;
    });

    // eslint-disable-next-line no-unmodified-loop-condition, @typescript-eslint/no-unnecessary-condition
    while (!flushed) {
      let fn = this._queue.shift();
      await (async (createError) => {try {return await fn();} catch (_awaitTraceErr2) {let err = createError();_awaitTraceErr2.stack += "\n...\n" + err.stack;throw _awaitTraceErr2;}})(() => new Error());
    }

    deferred.resolve();
    this._queueFlushing = undefined;
  }

  log(levelCodeOrName, ...args)

  {
    let levelCode;
    if (_lodashFirecloud.default.isString(levelCodeOrName)) {
      levelCode = this.levels[_lodashFirecloud.default.toLower(levelCodeOrName)];
    } else {
      levelCode = levelCodeOrName;
    }

    let src;





    if (this.requireSrc) {var _maybeBabelSrcArg$_ba;
      // handle https://github.com/tobiipro/babel-preset-firecloud#babel-plugin-firecloud-src-arg-default-config-needed
      let maybeBabelSrcArg = args[0];
      let babelSrcAbsoluteFilename = maybeBabelSrcArg === null || maybeBabelSrcArg === void 0 ? void 0 : (_maybeBabelSrcArg$_ba = maybeBabelSrcArg._babelSrc) === null || _maybeBabelSrcArg$_ba === void 0 ? void 0 : _maybeBabelSrcArg$_ba.file;
      if (!_lodashFirecloud.default.startsWith(babelSrcAbsoluteFilename, '/')) {
        babelSrcAbsoluteFilename = undefined;
      }

      let callSites = _lodashFirecloud.default.getStackTrace(5);
      let callSite = _lodashFirecloud.default.find(callSites, function (callSite) {
        let filename = callSite.getFileName();

        if (_lodashFirecloud.default.isDefined(babelSrcAbsoluteFilename)) {
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

      if (_lodashFirecloud.default.isDefined(callSite)) {
        src = {
          file: callSite.getFileName(),
          line: callSite.getLineNumber(),
          function: _lodashFirecloud.default.defaultTo(callSite.getFunctionName(), undefined) };

      }
    }

    let entry = {
      _args: args,
      _time: Date.now(),
      _level: levelCode,
      _src: src };


    _lodashFirecloud.default.forEach(args, function (arg, index) {
      let amendEntry = {
        [`_arg${index}`]: arg };


      if (_lodashFirecloud.default.isError(arg) && _lodashFirecloud.default.isUndefined(entry.err)) {
        amendEntry = {
          err: arg };

      } else if (_lodashFirecloud.default.isString(arg) && _lodashFirecloud.default.isUndefined(entry.msg)) {
        amendEntry = {
          msg: arg };

      } else if (_lodashFirecloud.default.isPlainObject(arg)) {
        arg = arg;
        amendEntry = arg;
      }

      _lodashFirecloud.default.merge(entry, amendEntry);
    });

    let rawEntry;
    if (this.requireRawEntry) {
      rawEntry = _lodashFirecloud.default.cloneDeep(entry);
    }

    let deferred = _lodashFirecloud.default.deferred();
    this._queue.push(async () => {
      for (let serializer of this.serializers) {
        entry = await (async (createError) => {try {return await serializer({ entry, logger: this, rawEntry });} catch (_awaitTraceErr3) {let err = createError();_awaitTraceErr3.stack += "\n...\n" + err.stack;throw _awaitTraceErr3;}})(() => new Error());
        if (_lodashFirecloud.default.isUndefined(entry)) {
          break;
        }
      }

      if (_lodashFirecloud.default.isUndefined(entry)) {
        return;
      }

      for (let listener of this.listeners) {
        await (async (createError) => {try {return await listener({ entry, logger: this, rawEntry });} catch (_awaitTraceErr4) {let err = createError();_awaitTraceErr4.stack += "\n...\n" + err.stack;throw _awaitTraceErr4;}})(() => new Error());
      }

      deferred.resolve();
    });

    _lodashFirecloud.default.defer(async () => {
      await (async (createError) => {try {return await this.flush();} catch (_awaitTraceErr5) {let err = createError();_awaitTraceErr5.stack += "\n...\n" + err.stack;throw _awaitTraceErr5;}})(() => new Error());
    });

    return {
      promise: deferred.promise };

  }

  // trackTime(...logArgs, fn)
  /* eslint-disable lines-between-class-members, no-dupe-class-members */












  /* eslint-enable lines-between-class-members, no-dupe-class-members */

  // eslint-disable-next-line no-dupe-class-members
  trackTime(...args) {
    let fn = args.pop();
    args.push({
      _timeStart: Date.now() });


    this.time(...args);

    let result = fn();
    _lodashFirecloud.default.defer(async () => {
      try {
        await (async (createError) => {try {return await result;} catch (_awaitTraceErr6) {let err = createError();_awaitTraceErr6.stack += "\n...\n" + err.stack;throw _awaitTraceErr6;}})(() => new Error());
      } catch {
      }

      args.push({
        _timeEnd: Date.now() });


      this.time(...args);
    });

    return result;
  }}


// instance type
exports.BaseMinLog = BaseMinLog;




let MinLog = BaseMinLog;exports.MinLog = MinLog;var _default = exports.MinLog;exports.default = _default;

//# sourceMappingURL=minlog.js.map