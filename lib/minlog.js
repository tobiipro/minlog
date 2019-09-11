"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.MinLog = exports.defaultLevels = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

let defaultLevels = {
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
  trace: 90 };exports.defaultLevels = defaultLevels;


class MinLog {


  constructor({
    serializers = [],
    listeners = [],
    levels = {},
    requireRawEntry = false,
    requireSrc = false } =
  {}) {_defineProperty(this, "levels", exports.defaultLevels);
    this.serializers = _lodashFirecloud.default.clone(serializers);
    this.listeners = _lodashFirecloud.default.clone(listeners);
    this.levels = _lodashFirecloud.default.merge(this.levels, levels);
    this.requireRawEntry = requireRawEntry;
    this.requireSrc = requireSrc;

    _lodashFirecloud.default.forEach(this.levels, (levelCode, levelName) => {
      this[levelName] = _lodashFirecloud.default.bind(this.log, this, levelCode);
    });
  }

  child(childConfig = {}) {
    let serializers = _lodashFirecloud.default.concat([], this.serializers, childConfig.serializers);
    let listeners = _lodashFirecloud.default.concat([], this.listeners, childConfig.listeners);

    let childLogger = new this.constructor(_lodashFirecloud.default.assign({}, childConfig, {
      serializers,
      listeners }));


    return childLogger;
  }

  levelIsBeyondGroup(levelCodeOrName, groupCodeOrName) {
    let levelCode = this.levelToLevelCode(levelCodeOrName);
    let maxLevelCode = this.maxLevelCodeInGroup(groupCodeOrName);
    return levelCode > maxLevelCode;
  }

  levelToLevelCode(levelCodeOrName) {
    if (_lodashFirecloud.default.isInteger(levelCodeOrName)) {
      let levelCode = levelCodeOrName;
      return levelCode;
    }

    let levelName = _lodashFirecloud.default.toLower(levelCodeOrName);
    if (/^lvl[0-9]+$/.test(levelName)) {
      let levelCode = _lodashFirecloud.default.replace(levelName, /^lvl/, '');
      levelCode = _lodashFirecloud.default.toInteger(levelCode);
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
    let levelName = _lodashFirecloud.default.invert(this.levels)[levelCode] || `lvl${levelCode}`;
    return levelName;
  }

  maxLevelCodeInGroup(levelCodeOrName) {
    let levelCode = this.levelToLevelCode(levelCodeOrName);

    // round up levelCode to next level group, not inclusive
    let maxLevelCodeGroup = _lodashFirecloud.default.floor(levelCode / 10) + 1;
    let maxLevelCode = maxLevelCodeGroup * 10 - 1;
    return maxLevelCode;
  }

  async log(levelCodeOrName, ...args) {
    let levelCode = levelCodeOrName;
    if (_lodashFirecloud.default.isString(levelCodeOrName)) {
      levelCode = this.levels[_lodashFirecloud.default.toLower(levelCodeOrName)];
    }

    let src;
    if (this.requireSrc) {
      let [
      _thisCallSite,
      callerCallSite] =
      _lodashFirecloud.default.getStackTrace(2);
      if (_lodashFirecloud.default.isDefined(callerCallSite)) {
        src = {
          file: callerCallSite.getFileName(),
          line: callerCallSite.getLineNumber(),
          function: callerCallSite.getFunctionName() };

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
        amendEntry = arg;
      }

      _lodashFirecloud.default.merge(entry, amendEntry);
    });

    let rawEntry;
    if (this.requireRawEntry) {
      rawEntry = _lodashFirecloud.default.cloneDeep(entry);
    }

    for (let serializer of this.serializers) {
      // eslint-disable-next-line require-atomic-updates
      entry = await (async createError => {try {return await serializer({ entry, logger: this, rawEntry });} catch (_awaitTraceErr) {let err = createError();_awaitTraceErr.stack += "\n...\n" + err.stack;throw _awaitTraceErr;}})(() => new Error());
      if (_lodashFirecloud.default.isUndefined(entry)) {
        break;
      }
    }

    if (_lodashFirecloud.default.isUndefined(entry)) {
      return;
    }

    for (let listener of this.listeners) {
      await (async createError => {try {return await listener({ entry, logger: this, rawEntry });} catch (_awaitTraceErr2) {let err = createError();_awaitTraceErr2.stack += "\n...\n" + err.stack;throw _awaitTraceErr2;}})(() => new Error());
    }
  }

  // trackTime(...logArgs, fn)
  async trackTime(...args) {
    let fn = args.pop();
    args.push({
      _timeStart: Date.now() });


    this.time(...args);

    let result = await (async createError => {try {return await fn();} catch (_awaitTraceErr3) {let err = createError();_awaitTraceErr3.stack += "\n...\n" + err.stack;throw _awaitTraceErr3;}})(() => new Error());
    args.push({
      _timeEnd: Date.now() });


    this.time(...args);
    return result;
  }}exports.MinLog = MinLog;var _default =


MinLog;exports.default = _default;

//# sourceMappingURL=minlog.js.map