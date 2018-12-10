import _ from 'lodash-firecloud';
import stacktrace from 'stacktrace-js';

export let serializeErr = async function({entry}) {
  let {err} = entry;

  if (!_.isError(err)) {
    return entry;
  }

  let stack;
  try {
    stack = await stacktrace.fromError(err);
  } catch (stacktraceError) {
    try {
      stack = await stacktrace.fromError(err, {offline: true});
    } catch (stacktraceError2) {
      // eslint-disable-next-line no-console
      console.error(stacktraceError2);
    }
    // eslint-disable-next-line no-console
    console.error(stacktraceError);
  }

  entry.err = {
    name: err.name,
    message: err.message,
    stack,

    // custom
    uncaught: err.uncaught
  };

  let uncaught = err.uncaught ? 'Uncaught ' : '';
  let inPromise = err.inPromise ? '(in promise) ' : '';
  entry.msg = entry.msg ||
    `${uncaught}${inPromise}${err.name}: ${err.message}`;

  return entry;
};

export default serializeErr;
