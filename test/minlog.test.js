import MinLog from '../src/minlog';
import _ from 'lodash-firecloud';

describe('minlog', function() {
  describe('levels', function() {
    it('should create convenience methods (default levels)', function() {
      let logger = new MinLog();

      _.forEach(_.keys(logger.levels), function(levelName) {
        expect(logger).toHaveProperty(levelName);
      });
    });

    it('should create convenience methods (default and custom levels)', function() {
      let customLevels = {
        foo: 0,
        bar: 10,
        baz: 20
      };

      let logger = new MinLog();
      let customLogger = new MinLog({
        levels: customLevels
      });

      _.forEach(_.keys(customLevels), function(levelName) {
        expect(customLogger).toHaveProperty(levelName);
      });

      _.forEach(_.keys(logger.levels), function(levelName) {
        expect(customLogger).toHaveProperty(levelName);
      });
    });
  });

  describe('levelToLevelCode', function() {
    let logger = new MinLog();

    it('should return the level code for defined level names (case insensitive)', function() {
      _.forEach(_.keys(logger.levels), function(levelName) {
        let levelCode = logger.levelToLevelCode(levelName);
        let upperLevelCode = logger.levelToLevelCode(_.toUpper(levelName));

        expect(levelCode).toBe(logger.levels[levelName]);
        expect(upperLevelCode).toBe(logger.levels[levelName]);
      });
    });

    it('should return the level code for defined level codes', function() {
      _.forEach(_.values(logger.levels), function(vanillaLevelCode) {
        let levelCode = logger.levelToLevelCode(vanillaLevelCode);

        expect(levelCode).toBe(vanillaLevelCode);
      });
    });

    it('should return the level code for undefined <lvlN> levels', function() {
      _.forEach(_.range(0, 100), function(vanillaLevelCode) {
        let levelName = logger.levelToLevelName(vanillaLevelCode);

        if (levelName in logger.levels) {
          // ignore defined levels
          return;
        }

        let levelCode = logger.levelToLevelCode(levelName);
        let upperLevelCode = logger.levelToLevelCode(_.toUpper(levelName));

        expect(levelCode).toBe(vanillaLevelCode);
        expect(upperLevelCode).toBe(vanillaLevelCode);
      });
    });
  });

  describe('levelToLevelName', function() {
    let logger = new MinLog();

    it('should return the level name for defined levels', function() {
      _.forEach(_.keys(logger.levels), function(vanillaLevelName) {
        let levelName = logger.levelToLevelName(logger.levels[vanillaLevelName]);
        let preferrredLevelName = _.invert(logger.levels)[logger.levels[vanillaLevelName]];

        expect(levelName).toBe(preferrredLevelName);
      });
    });

    it('should return <lvlN> for undefined levels', function() {
      _.forEach(_.range(0, 100), function(level) {
        let levelName = logger.levelToLevelName(level);

        if (levelName in logger.levels) {
          // ignore defined levels
          return;
        }

        expect(levelName).toBe(`lvl${level}`);
      });
    });
  });

  describe('maxLevelCodeInGroup', function() {
    let logger = new MinLog();

    it('should return the maximum level up to the next group, not inclusive', function() {
      expect(logger.maxLevelCodeInGroup(60)).toBe(69);
      expect(logger.maxLevelCodeInGroup(69)).toBe(69);
      expect(logger.maxLevelCodeInGroup(70)).toBe(79);
    });
  });

  describe('levelIsBeyondGroup', function() {
    let logger = new MinLog();

    it('should return true for levels beyond the group', function() {
      expect(logger.levelIsBeyondGroup('debug', 'info')).toBe(true);
      expect(logger.levelIsBeyondGroup('debug', 60)).toBe(true);
      expect(logger.levelIsBeyondGroup(70, 'info')).toBe(true);

      // case-insensitive
      expect(logger.levelIsBeyondGroup('dEbUg', 'InfO')).toBe(true);
    });

    it('should return false for levels below and in the group', function() {
      expect(logger.levelIsBeyondGroup('info', 'debug')).toBe(false);
      expect(logger.levelIsBeyondGroup(60, 'debug')).toBe(false);
      expect(logger.levelIsBeyondGroup('info', 70)).toBe(false);

      expect(logger.levelIsBeyondGroup('info', 'info')).toBe(false);
      expect(logger.levelIsBeyondGroup(60, 'info')).toBe(false);
      expect(logger.levelIsBeyondGroup('info', 60)).toBe(false);

      // case-insensitive
      expect(logger.levelIsBeyondGroup('iNFo', 'DeBuG')).toBe(false);
      expect(logger.levelIsBeyondGroup('InfO', 'iNFo')).toBe(false);
    });
  });

  describe('trackTime', function() {
    let logger = new MinLog();

    it('should invoke last arg as fn', async function() {
      let fn = jest.fn();

      await logger.trackTime(fn);
      await logger.trackTime('a', fn);
      await logger.trackTime('a', 'b', fn);
      await logger.trackTime('a', 'b', 'c', fn);
      await logger.trackTime('a', 'b', 'c', 'd', fn);

      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('should return fn result', async function() {
      let fn = function() {
        return 'result';
      };

      let result = await logger.trackTime(fn);

      expect(result).toBe('result');
    });
  });
});
