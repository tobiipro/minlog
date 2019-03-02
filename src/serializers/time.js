import _ from 'lodash-firecloud';
import moment from 'moment';
import momentTz from 'moment-timezone';

export let serializeTime = async function({entry}) {
  let {
    _time,
    _timeStart,
    _timeEnd
  } = entry;

  if (!_.isDate(_time)) {
    return entry;
  }

  entry._time = {
    stamp: moment(_time).toISOString(),
    localStamp: moment(_time).toISOString(true),
    zone: momentTz.tz.guess(),
    utc_offset: moment(_time).utcOffset()
  };

  if (!_.isDate(_timeStart)) {
    return entry;
  }

  entry._timeStart = {
    stamp: moment(_timeStart).toISOString(),
    localStamp: moment(_timeStart).toISOString(true),
    zone: momentTz.tz.guess(),
    utc_offset: moment(_timeStart).utcOffset()
  };

  if (!_.isDate(_timeEnd)) {
    return entry;
  }

  entry._timeEnd = {
    stamp: moment(_timeEnd).toISOString(),
    localStamp: moment(_timeEnd).toISOString(true),
    zone: momentTz.tz.guess(),
    utc_offset: moment(_timeEnd).utcOffset()
  };

  let duration = moment.duration(_timeEnd - _timeStart);
  entry._duration = {
    stamp: duration.toISOString(),
    human: duration.humanize(),
    ms: duration.milliseconds()
  };

  return entry;
};

export default serializeTime;
