"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.serializeTime = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _moment = _interopRequireDefault(require("moment"));
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

let serializeTime = async function ({ entry }) {
  let {
    _time,
    _timeStart,
    _timeEnd } =
  entry;

  if (!_lodashFirecloud.default.isDate(_time)) {
    return entry;
  }

  entry._time = {
    stamp: (0, _moment.default)(_time).toISOString(),
    localStamp: (0, _moment.default)(_time).toISOString(true),
    zone: _momentTimezone.default.tz.guess(),
    utc_offset: (0, _moment.default)(_time).utcOffset() };


  if (!_lodashFirecloud.default.isDate(_timeStart)) {
    return entry;
  }

  entry._timeStart = {
    stamp: (0, _moment.default)(_timeStart).toISOString(),
    localStamp: (0, _moment.default)(_timeStart).toISOString(true),
    zone: _momentTimezone.default.tz.guess(),
    utc_offset: (0, _moment.default)(_timeStart).utcOffset() };


  if (!_lodashFirecloud.default.isDate(_timeEnd)) {
    return entry;
  }

  entry._timeEnd = {
    stamp: (0, _moment.default)(_timeEnd).toISOString(),
    localStamp: (0, _moment.default)(_timeEnd).toISOString(true),
    zone: _momentTimezone.default.tz.guess(),
    utc_offset: (0, _moment.default)(_timeEnd).utcOffset() };


  let duration = _moment.default.duration(_timeEnd - _timeStart);
  entry._duration = {
    stamp: duration.toISOString(),
    human: duration.humanize(),
    ms: duration.milliseconds() };


  return entry;
};exports.serializeTime = serializeTime;var _default = exports.serializeTime;exports.default = _default;

//# sourceMappingURL=time.js.map