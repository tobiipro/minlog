import MinLog from '../../src/minlog';
import _ from 'lodash-firecloud';

import {
  _levelToConsoleFun
} from '../../src/listeners/log-to-console';

describe('logToConsole listener', function() {
  describe('_levelToConsoleFun', function() {
    it('should not regress (default levels)', function() {
      let instance = new MinLog();
      let snapshot = {};

      _.forEach(instance.levels, function(level, levelName) {
        let levels = [
          level - 1,
          level,
          level + 1,
          levelName,
          `x${levelName}x`
        ];

        _.forEach(levels, function(level) {
          snapshot[level] = _levelToConsoleFun({
            level,
            levels: instance.levels
          });
        });
      });

      expect(snapshot).toMatchSnapshot();
    });
  });
});
