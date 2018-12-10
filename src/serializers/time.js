import _ from 'lodash-firecloud';
import moment from 'moment';
import momentTz from 'moment-timezone';

export let serializeTime = async function({entry}) {
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

export default serializeTime;
