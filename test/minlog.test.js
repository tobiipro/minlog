import MinLog from '../src/minlog';
import _ from 'lodash-firecloud';

describe('minlog', function() {
  describe('levels', function() {
    it('should create convenience methods (default levels)', function() {
      let instance = new MinLog();

      _.forEach(_.keys(instance.levels), function(levelName) {
        expect(instance).toHaveProperty(levelName);
      });
    });

    it('should create convenience methods (default and custom levels)', function() {
      let customLevels = {
        foo: 0,
        bar: 10,
        baz: 20
      };

      let instance = new MinLog();
      let customInstance = new MinLog({
        levels: customLevels
      });

      _.forEach(_.keys(customLevels), function(levelName) {
        expect(customInstance).toHaveProperty(levelName);
      });

      _.forEach(_.keys(instance.levels), function(levelName) {
        expect(customInstance).toHaveProperty(levelName);
      });
    });
  });

  describe('levelToLevelCode', function() {
    let instance = new MinLog();

    it('should return the level code for defined level names', function() {
      _.forEach(_.keys(instance.levels), function(levelName) {
        let levelCode = instance.levelToLevelCode(levelName);

        expect(levelCode).toBe(instance.levels[levelName]);
      });
    });

    it('should return the level code for defined level codes', function() {
      _.forEach(_.values(instance.levels), function(vanillaLevelCode) {
        let levelCode = instance.levelToLevelCode(vanillaLevelCode);

        expect(levelCode).toBe(vanillaLevelCode);
      });
    });

    it('should return the level code for undefined <lvlN> levels', function() {
      _.forEach(_.range(0, 100), function(vanillaLevelCode) {
        let levelName = instance.levelToLevelName(vanillaLevelCode);

        if (levelName in instance.levels) {
          // ignore defined levels
          return;
        }

        let levelCode = instance.levelToLevelCode(levelName);
        expect(levelCode).toBe(vanillaLevelCode);
      });
    });
  });

  describe('levelToLevelName', function() {
    let instance = new MinLog();

    it('should return the level name for defined levels', function() {
      _.forEach(_.keys(instance.levels), function(vanillaLevelName) {
        let levelName = instance.levelToLevelName(instance.levels[vanillaLevelName]);
        let preferrredLevelName = _.invert(instance.levels)[instance.levels[vanillaLevelName]];

        expect(levelName).toBe(preferrredLevelName);
      });
    });

    it('should return <lvlN> for undefined levels', function() {
      _.forEach(_.range(0, 100), function(level) {
        let levelName = instance.levelToLevelName(level);

        if (levelName in instance.levels) {
          // ignore defined levels
          return;
        }

        expect(levelName).toBe(`lvl${level}`);
      });
    });
  });
});
