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

  it('should print an object', async function() {
    let loggerCallArgs = [{
      key: 'This is a value.'
    }];

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
      let cond = _.isMatch(object, loggerCallArgs[0]);
      expect(cond).toBe(true);
    });

    logger.error(...loggerCallArgs);
    await logger.flush();

    expect(spyFormat).toHaveBeenCalledTimes(1);
    expect(snapshot).toMatchSnapshot();
  });
});
