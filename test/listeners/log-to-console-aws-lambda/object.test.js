import * as logToConsoleAwsLambdaModule from '../../../src/listeners/log-to-console-aws-lambda';
import _ from 'lodash-firecloud';

import {
  logger
} from './logger';

let _nonBreakingWhitespace = ' ';

describe('logToConsoleAwsLambda listener', function() {
  it('should print an object', async function() {
    let spyFormat = jest.spyOn(logToConsoleAwsLambdaModule, 'format');

    let loggerCallArgs = [{
      key: 'This is a value.'
    }];

    spyFormat.mockImplementationOnce(function(consoleFun, format, ...formatArgs) {
      let [
        _now,
        _level,
        _src,
        _msg,
        objectStr
      ] = formatArgs;

      // JSON.parse cannot handle non-breaking whitespace
      objectStr = _.replace(objectStr, new RegExp(_nonBreakingWhitespace, 'g'), ' ');

      let object = JSON.parse(objectStr);
      let cond = _.isMatch(object, loggerCallArgs[0]);

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
