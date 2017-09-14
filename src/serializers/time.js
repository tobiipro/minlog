import _ from 'lodash';
import moment from 'moment';
import momentTz from 'moment-timezone';

let _log = {
  local: console
};

export default async function({entry}) {
  let {_time} = entry;

  if (!_.isDate(_time)) {
    return entry;
  }

  entry._time = {
    stamp: moment(_time).toISOString(),
    zone: momentTz.tz.guess(),
    utc_offset: moment(_time).utcOffset()
  };

  return entry;
};
