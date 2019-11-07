import _ from 'lodash-firecloud';

import {
  MinLogSerializedErr,
  MinLogSerializer
} from '../types';

export let serializeErr = function(): MinLogSerializer {
  return async function({entry}) {
    let {
      err
    } = entry;

    if (!_.isError(err)) {
      return entry;
    }

    let stack = _.split(_.defaultTo(err.stack, ''), '\n');
    stack = _.isEmpty(stack) ? undefined : stack;

    entry.err = _.pick(err, [
      'name',
      'message',
      'uncaught',
      // custom
      'inPromise'
    ]) as unknown as MinLogSerializedErr;
    entry.err.stack = stack;

    let uncaughtMsg = entry.err.uncaught ? 'Uncaught ' : '';
    let inPromiseMsg = entry.err.inPromise ? '(in promise) ' : '';
    let msg = _.isUndefined(entry.err.stack) ?
      `${entry.err.name}: ${entry.err.message}` :
      _.join(entry.err.stack, '\n');
    msg = `${uncaughtMsg}${inPromiseMsg}${msg}`;
    entry.msg = _.defaultTo(entry.msg, msg);

    return entry;
  };
};

export default serializeErr;
