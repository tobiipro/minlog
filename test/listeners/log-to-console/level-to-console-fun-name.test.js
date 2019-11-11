import * as logToConsoleModule from '../../../src/listeners/log-to-console';
import _ from 'lodash-firecloud';

import {
  MinLog
} from '../../../src';

describe('logToConsole listener', function() {
  describe('_levelToConsoleFun', function() {
    it('should not regress (default levels)', function() {
      let instance = new MinLog();
      let snapshot = {};

      _.forEach(instance.levels, function(levelCode, levelName) {
        let levels = [
          levelCode - 1,
          levelCode,
          levelCode + 1,
          levelName,
          `x${levelName}x`
        ];

        _.forEach(levels, function(level) {
          // @ts-ignore
          snapshot[level] = logToConsoleModule._levelToConsoleFun({
            level,
            levels: instance.levels
          });
        });
      });

      expect(snapshot).toMatchSnapshot();
    });
  });
});
