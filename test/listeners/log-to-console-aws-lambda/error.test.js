import * as logToConsoleAwsLambdaModule from '../../../src/listeners/log-to-console-aws-lambda';
import _ from 'lodash-firecloud';

import {
  logger
} from './logger';

let _nonBreakingWhitespace = ' ';

describe('logToConsoleAwsLambda listener', function() {
  beforeEach(function() {
    // eslint-disable-next-line global-require
    let momentTz = require('moment-timezone');
    let spyOnMomentTzGuess = jest.spyOn(momentTz.tz, 'guess');
    spyOnMomentTzGuess.mockImplementation(function() {
      return 'Europe/Stockholm';
    });

    let dateStub = new Date(0);
    dateStub.getTimezoneOffset = function() {
      return 0;
    };
    // @ts-ignore
    let spyOnGlobalDate = jest.spyOn(global, 'Date');
    // @ts-ignore
    spyOnGlobalDate.mockImplementation(function() {
      return dateStub;
    });
    // @ts-ignore
    spyOnGlobalDate.now = function() {
      return 0;
    };
  });

  afterEach(function() {
    jest.restoreAllMocks();
  });

  it('should print an error', async function() {
    let loggerCallArgs = [
      new Error('This is an error.')
    ];
    // keep only one-level of the stacktrace
    loggerCallArgs[0].stack = _.join([
      _.split(loggerCallArgs[0].stack, '\n')[0]
    ], '\n');

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
        msg,
        objectStr
      ] = formatArgs;

      // JSON.parse cannot handle non-breaking whitespace
      objectStr = _.replace(objectStr, new RegExp(_nonBreakingWhitespace, 'g'), ' ');

      let cond1 = _.startsWith(msg, loggerCallArgs[0].toString());

      let object = JSON.parse(objectStr);
      let cond2 = _.isMatch(object, {
        err: {
          name: loggerCallArgs[0].name,
          message: loggerCallArgs[0].message
        }
      });

      let cond = cond1 && cond2;
      expect(cond).toBe(true);
    });

    await logger.error(...loggerCallArgs);
    expect(spyFormat).toHaveBeenCalledTimes(1);
    expect(snapshot).toMatchSnapshot();
  });
});
