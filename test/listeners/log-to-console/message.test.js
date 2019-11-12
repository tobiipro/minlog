import * as logToConsoleModule from '../../../src/listeners/log-to-console';
import _ from 'lodash-firecloud';

import {
  logger
} from './logger';

describe('logToConsole listener', function() {
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

  it('should print a message', async function() {
    let loggerCallArgs = [
      'This is a message.'
    ];

    let snapshot;
    let spyFormat = jest.spyOn(logToConsoleModule, 'format');

    spyFormat.mockImplementationOnce(function(consoleFun, format, ...formatArgs) {
      snapshot = {
        consoleFun,
        format,
        formatArgs
      };

      let [
        _now,
        _level,
        _src,
        msg
      ] = formatArgs;

      let cond = _.startsWith(msg, loggerCallArgs[0]);
      expect(cond).toBe(true);
    });

    await logger.error(...loggerCallArgs);
    expect(spyFormat).toHaveBeenCalledTimes(1);
    expect(snapshot).toMatchSnapshot();
  });
});
