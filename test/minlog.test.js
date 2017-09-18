import _ from 'lodash';
import MinLog from '../src/minlog';
import defaultLevels from '../src/levels';

describe('MinLog', () => {
  it('should be defined', () => {
    expect(MinLog).toBeDefined();
  });


  it('should have default log levels funcs', () => {
    let instance = new MinLog();

    _.forEach(defaultLevels, (level, levelName) => {
      if (_.isNumber(level)) {
        expect(instance).toHaveProperty(levelName);
      }
    });
  });


  it('should have non-default log levels funcs when supplied', () => {
    let customLevels = {
      foo: 0,
      bar: 10,
      baz: 20
    };

    let instance = new MinLog({levels: customLevels});

    _.forEach(customLevels, (_level, levelName) => {
      expect(instance).toHaveProperty(levelName);
    });
  });


  it('should have levels clone in a property', () => {
    let instance = new MinLog();

    expect(_.isEqual(instance.levels, defaultLevels)).toBeTruthy();
  });
});
