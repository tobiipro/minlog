"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.serializeTime = exports.default = exports._maybeToDefinedMoment = void 0;var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));
var _moment = _interopRequireDefault(require("moment"));
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

let _maybeToDefinedMoment = function (timestamp) {
  if (!_lodashFirecloud.default.isNumber(timestamp) || timestamp < 0) {
    return;
  }

  let result = (0, _moment.default)(timestamp);
  if (!result.isValid()) {
    return;
  }

  return result;
};exports._maybeToDefinedMoment = _maybeToDefinedMoment;

let serializeTime = function () {
  return async function ({ entry }) {
    let {
      _time,
      _timeStart,
      _timeEnd } =
    entry;

    let momentTime = exports._maybeToDefinedMoment(_time);
    if (_lodashFirecloud.default.isUndefined(momentTime)) {
      return entry;
    }

    entry._time = {
      stamp: momentTime.toISOString(),
      localStamp: momentTime.toISOString(true),
      zone: _momentTimezone.default.tz.guess(),
      utc_offset: momentTime.utcOffset() };


    let momentTimeStart = exports._maybeToDefinedMoment(_timeStart);
    if (_lodashFirecloud.default.isUndefined(momentTimeStart)) {
      return entry;
    }

    entry._timeStart = {
      stamp: momentTimeStart.toISOString(),
      localStamp: momentTimeStart.toISOString(true),
      zone: _momentTimezone.default.tz.guess(),
      utc_offset: momentTimeStart.utcOffset() };


    let momentTimeEnd = exports._maybeToDefinedMoment(_timeEnd);
    if (_lodashFirecloud.default.isUndefined(momentTimeEnd)) {
      return entry;
    }

    entry._timeEnd = {
      stamp: momentTimeEnd.toISOString(),
      localStamp: momentTimeEnd.toISOString(true),
      zone: _momentTimezone.default.tz.guess(),
      utc_offset: momentTimeEnd.utcOffset() };


    let duration = _moment.default.duration(_timeEnd - _timeStart);
    entry._duration = {
      stamp: duration.toISOString(),
      human: duration.humanize(),
      ms: duration.asMilliseconds() };


    return entry;
  };
};exports.serializeTime = serializeTime;var _default = exports.serializeTime;exports.default = _default;

//# sourceMappingURL=time.js.map