import * as logToConsoleAwsLambdaModule from '../../../src/listeners/log-to-console-aws-lambda';
import _ from 'lodash-firecloud';

import {
  logger
} from './logger';

let _nonBreakingWhitespace = ' ';

describe('logToConsoleAwsLambda listener', function() {
  it('should print an error', async function() {
    let spyFormat = jest.spyOn(logToConsoleAwsLambdaModule, 'format');

    let loggerCallArgs = [
      new Error('This is an error.')
    ];

    spyFormat.mockImplementationOnce(function(consoleFun, format, ...formatArgs) {
      let [
        _now,
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
