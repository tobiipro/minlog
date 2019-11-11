import * as logToConsoleModule from '../../../src/listeners/log-to-console';
import _ from 'lodash-firecloud';

import {
  logger
} from './logger';

describe('logToConsole listener', function() {
  it('should print an error', async function() {
    let spyFormat = jest.spyOn(logToConsoleModule, 'format');

    let loggerCallArgs = [
      new Error('This is an error.')
    ];

    spyFormat.mockImplementationOnce(function(consoleFun, format, ...formatArgs) {
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

      if (!cond) {
        // eslint-disable-next-line no-console
        console.error({
          consoleFun,
          format,
          formatArgs
        });
      }
      expect(cond).toBe(true);
    });

    await logger.error(...loggerCallArgs);
    expect(spyFormat).toHaveBeenCalledTimes(1);
  });
});
