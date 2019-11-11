import {
  MinLog,
  logToConsole,
  serializeErr,
  serializeTime
} from '../../../src';

export let logger = new MinLog({
  serializers: [
    serializeTime(),
    serializeErr()
  ],
  listeners: [
    logToConsole({
      level: 'error' // ignore log entries below the "error" level threshold
    })
  ]
});

export default exports;
