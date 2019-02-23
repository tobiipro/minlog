import _ from 'lodash-firecloud';

export let serializeErr = async function({entry}) {
  let {
    err
  } = entry;

  if (!_.isError(err)) {
    return entry;
  }

  let stack = _.split(err.stack || '', '\n');
  stack = _.isEmpty(stack) ? undefined : stack;

  entry.err = _.pick(err, [
    'name',
    'message',
    'uncaught',
    // custom
    'inPromise'
  ]);
  entry.err.stack = stack;

  let uncaughtMsg = err.uncaught ? 'Uncaught ' : '';
  let inPromiseMsg = err.inPromise ? '(in promise) ' : '';
  let msg = _.isUndefined(stack) ? entry.err.message : _.join(entry.err.stack, '\n');
  msg = `${uncaughtMsg}${inPromiseMsg}${entry.err.name}: ${msg}`;
  entry.msg = entry.msg || msg;

  return entry;
};

export default serializeErr;
