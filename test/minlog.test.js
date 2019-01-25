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

    it('should return the level code for defined level names', function() {
      _.forEach(_.keys(logger.levels), function(levelName) {
        let levelCode = logger.levelToLevelCode(levelName);

        expect(levelCode).toBe(logger.levels[levelName]);
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
        expect(levelCode).toBe(vanillaLevelCode);
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
});
