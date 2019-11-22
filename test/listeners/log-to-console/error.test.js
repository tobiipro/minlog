import * as logToConsoleModule from '../../../src/listeners/log-to-console';
import _ from 'lodash-firecloud';

import {
  logger
} from './logger';

describe('logToConsole listener', function() {
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

  it('should print an error', async function() {
    let loggerCallArgs = [
      new Error('This is an error.')
    ];
    // keep only one-level of the stacktrace
    loggerCallArgs[0].stack = _.join([
      _.split(loggerCallArgs[0].stack, '\n')[0]
    ], '\n');

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
        _msg,
        objectStr
      ] = formatArgs;

      let object = JSON.parse(objectStr);
      let cond = _.isMatch(object, {
        err: {
          name: loggerCallArgs[0].name,
          message: loggerCallArgs[0].message
        }
      });
      expect(cond).toBe(true);
    });

    logger.error(...loggerCallArgs);
    await logger.flush();

    expect(spyFormat).toHaveBeenCalledTimes(1);
    expect(snapshot).toMatchSnapshot();
  });
});
