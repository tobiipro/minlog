import _ from 'lodash-firecloud';
import moment from 'moment';
import momentTz from 'moment-timezone';

let _maybeToDefinedMoment = function(timestamp: number | string): moment.Moment {
  if (!_.isNumber(timestamp) || timestamp < 0) {
    return;
  }

  let result = moment(timestamp);
  if (!result.isValid()) {
    return;
  }

  return result;
};

export let serializeTime = function() {
  return async function({entry}) {
    let {
      _time,
      _timeStart,
      _timeEnd
    } = entry;

    let momentTime = _maybeToDefinedMoment(_time);
    if (_.isUndefined(momentTime)) {
      return entry;
    }

    entry._time = {
      stamp: momentTime.toISOString(),
      localStamp: momentTime.toISOString(true),
      zone: momentTz.tz.guess(),
      utc_offset: momentTime.utcOffset()
    };

    let momentTimeStart = _maybeToDefinedMoment(_timeStart);
    if (_.isUndefined(momentTimeStart)) {
      return entry;
    }

    entry._timeStart = {
      stamp: momentTimeStart.toISOString(),
      localStamp: momentTimeStart.toISOString(true),
      zone: momentTz.tz.guess(),
      utc_offset: momentTimeStart.utcOffset()
    };

    let momentTimeEnd = _maybeToDefinedMoment(_timeEnd);
    if (_.isUndefined(momentTimeEnd)) {
      return entry;
    }

    entry._timeEnd = {
      stamp: momentTimeEnd.toISOString(),
      localStamp: momentTimeEnd.toISOString(true),
      zone: momentTz.tz.guess(),
      utc_offset: momentTimeEnd.utcOffset()
    };

    let duration = moment.duration(_timeEnd - _timeStart);
    entry._duration = {
      stamp: duration.toISOString(),
      human: duration.humanize(),
      ms: duration.asMilliseconds()
    };

    return entry;
  };
};

export default serializeTime;
