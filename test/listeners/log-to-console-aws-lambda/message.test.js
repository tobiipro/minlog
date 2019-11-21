import * as logToConsoleAwsLambdaModule from '../../../src/listeners/log-to-console-aws-lambda';
import _ from 'lodash-firecloud';

import {
  logger
} from './logger';

describe('logToConsoleAwsLambda listener', function() {
  beforeEach(function() {
    let OriginalDate = Date;
    let dateStub = new Date(0);
    // @ts-ignore
    let spyOnGlobalDate = jest.spyOn(global, 'Date');
    // @ts-ignore
    spyOnGlobalDate.mockImplementation(function(...args) {
      if (args.length) {
        let dateStub = new OriginalDate(...args);
        return dateStub;
      }
      return dateStub;
    });
    // @ts-ignore
    spyOnGlobalDate.now = function() {
      return dateStub.valueOf();
    };
  });

  afterEach(function() {
    jest.restoreAllMocks();
  });

  it('should print a message', async function() {
    let loggerCallArgs = [
      'This is a message.'
    ];

    let snapshot;
    let spyFormat = jest.spyOn(logToConsoleAwsLambdaModule, 'format');

    spyFormat.mockImplementationOnce(function(format, ...formatArgs) {
      snapshot = {
        format,
        formatArgs
      };

      let [
        _now,
        _hyphen,
        _level,
        _src,
        msg
      ] = formatArgs;

      let cond = _.startsWith(msg, loggerCallArgs[0]);
      expect(cond).toBe(true);
    });

    logger.error(...loggerCallArgs);
    await logger.flush();

    expect(spyFormat).toHaveBeenCalledTimes(1);
    expect(snapshot).toMatchSnapshot();
  });
});
