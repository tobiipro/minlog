import {
  MinLog,
  logToConsoleAwsLambda,
  serializeErr,
  serializeTime
} from '../../../src';

// faking an AWS Lambda environment
process.env.LAMBDA_TASK_ROOT = '';

export let logger = new MinLog({
  serializers: [
    serializeTime(),
    serializeErr()
  ],
  listeners: [
    logToConsoleAwsLambda({
      level: 'error' // ignore log entries below the "error" level threshold
    })
  ]
});

delete process.env.LAMBDA_TASK_ROOT;

export default exports;
