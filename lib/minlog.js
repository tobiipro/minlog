"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));

var _util = require("./util");function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}



class MinLog {




























  constructor({
    serializers = this.serializers,
    listeners = this.listeners,
    levels = {} } =
  {}) {_defineProperty(this, "levels", { time: 70, // npm alias
      fatal: 0, // emergency
      verbose: 70, // debug
      silly: 80, // https://tools.ietf.org/html/rfc3164 (multiplier 10)
      emergency: 0, alert: 10, critical: 20, error: 30, warning: 40, notice: 50, informational: 60, debug: 70, // console
      warn: 40, // warning
      info: 60, // informational
      trace: 90 });_defineProperty(this, "serializers", []);_defineProperty(this, "listeners", []);this.serializers = _lodashFirecloud.default.clone(serializers);this.listeners = _lodashFirecloud.default.clone(listeners);this.levels = _lodashFirecloud.default.merge(this.levels, levels);_lodashFirecloud.default.forEach(this.levels, (levelCode, levelName) => {this[levelName] = _lodashFirecloud.default.bind(this.log, this, levelCode);});
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

    let src = (0, _util.getCallerInfo)(5);

    let entry = {
      _time: new Date(),
      _level: levelCode,
      _src: src };


    _lodashFirecloud.default.forEach(args, function (arg, index) {
      let amendEntry = {
        [`_arg${index}`]: arg };


      if (_lodashFirecloud.default.isError(arg) && _lodashFirecloud.default.isUndefined(entry.err)) {
        amendEntry.err = arg;
      } else if (_lodashFirecloud.default.isString(arg) && _lodashFirecloud.default.isUndefined(entry.msg)) {
        amendEntry.msg = arg;
      } else if (_lodashFirecloud.default.isPlainObject(arg)) {
        _lodashFirecloud.default.defaults(amendEntry, arg);
      }

      _lodashFirecloud.default.merge(entry, amendEntry);
    });

    let rawEntry = _lodashFirecloud.default.cloneDeep(entry);
    rawEntry._args = args;

    for (let serializer of this.serializers) {
      // eslint-disable-next-line require-atomic-updates
      entry = await _lodashFirecloud.default.alwaysPromise(serializer({ entry, logger: this, rawEntry }));
    }

    for (let listener of this.listeners) {
      await _lodashFirecloud.default.alwaysPromise(listener({ entry, logger: this, rawEntry }));
    }
  }

  async trackTime(label, fn) {
    let entry = {
      _timeStart: new Date() };

    this.time(label, entry);

    await _lodashFirecloud.default.alwaysPromise(fn());
    entry._timeEnd = new Date();

    this.time(label, entry);
  }}exports.default = MinLog;

//# sourceMappingURL=minlog.js.map