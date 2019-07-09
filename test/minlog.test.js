import MinLog from '../src/minlog';
import _ from 'lodash-firecloud';

describe('minlog', function() {
  describe('child', function() {
    it('should create children by appending serializers and listeners', function() {
      let loggerConfigs = [];
      loggerConfigs.push({});
      loggerConfigs.push({
        serializers: [
          async function({entry}) {
            return entry;
          }
        ]
      });

      _.forEach(loggerConfigs, function(loggerConfig = {}) {
        _.merge(loggerConfig, {
          serializers: [],
          listeners: []
        });

        let newSerializer = async function({entry}) {
          return entry;
        };
        let newListener = _.noop;

        let logger = new MinLog(loggerConfig);
        let childLogger = logger.child({
          serializers: [
            newSerializer
          ],
          listeners: [
            newListener
          ]
        });

        expect(logger.serializers).toHaveLength(loggerConfig.serializers.length);
        expect(logger.listeners).toHaveLength(loggerConfig.listeners.length);

        expect(logger.serializers).toStrictEqual(loggerConfig.serializers);
        expect(logger.listeners).toStrictEqual(loggerConfig.listeners);

        expect(childLogger.serializers).toHaveLength(loggerConfig.serializers.length + 1);
        expect(childLogger.listeners).toHaveLength(loggerConfig.listeners.length + 1);

        expect(_.slice(childLogger.serializers, 0, -1)).toStrictEqual(logger.serializers);
        expect(_.slice(childLogger.listeners, 0, -1)).toStrictEqual(logger.listeners);

        expect(_.last(childLogger.serializers)).toStrictEqual(newSerializer);
        expect(_.last(childLogger.listeners)).toStrictEqual(newListener);
      });
    });
  });

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
      let expectedResult = Symbol('result');
      let fn = function() {
        return expectedResult;
      };

      let result = await logger.trackTime(fn);

      expect(result).toBe(expectedResult);
    });
  });

  describe('logging call', function() {
    it('should call one listener with the correct entry, logger and rawEntry', async function() {
      let stringArg = 'test';
      let errArg = new Error();
      let objArg = {
        test: true
      };
      let symbolArg = Symbol('test');
      let args = [
        stringArg,
        errArg,
        objArg,
        symbolArg
      ];

      let d1 = _.defer();
      let listener1 = d1.resolve;
      let logger = new MinLog({
        listeners: [
          listener1
        ]
      });
      logger.info(...args);

      let {
        entry,
        logger: listenerLogger,
        rawEntry
      } = await d1.promise;

      expect(entry.msg).toBe(stringArg);
      expect(entry.err).toBe(errArg);
      expect(entry).toMatchObject(objArg);
      expect(rawEntry).toBeUndefined();
      expect(listenerLogger).toBe(logger);
    });

    it(`should call one listener with the correct entry, logger and rawEntry
when requireRawEntry=true`, async function() {
      let stringArg = 'test';
      let errArg = new Error();
      let objArg = {
        test: true
      };
      let symbolArg = Symbol('test');
      let args = [
        stringArg,
        errArg,
        objArg,
        symbolArg
      ];

      let d1 = _.defer();
      let listener1 = d1.resolve;
      let logger = new MinLog({
        listeners: [
          listener1
        ],
        requireRawEntry: true
      });
      logger.info(...args);

      let {
        entry,
        logger: listenerLogger,
        rawEntry
      } = await d1.promise;

      expect(rawEntry).toStrictEqual(entry);
      expect(rawEntry.msg).toBe(stringArg);
      expect(rawEntry.err).toBe(errArg);
      expect(rawEntry).toMatchObject(objArg);
      expect(rawEntry._arg3).toBe(symbolArg);
      expect(listenerLogger).toBe(logger);
    });

    it('should call multiple listeners', async function() {
      let d1 = _.defer();
      let listener1 = d1.resolve;

      let d2 = _.defer();
      let listener2 = d2.resolve;

      let logger = new MinLog({
        listeners: [
          listener1,
          listener2
        ]
      });
      logger.info();

      await Promise.all([
        d1.promise,
        d2.promise
      ]);

      expect(true).toBe(true);
    });

    it('should call one serializer with the correct entry, logger and rawEntry', async function() {
      let stringArg = 'test';
      let errArg = new Error();
      let objArg = {
        test: true
      };
      let symbolArg = Symbol('test');
      let args = [
        stringArg,
        errArg,
        objArg,
        symbolArg
      ];

      let d1 = _.defer();
      let serializer1 = async function(...args) {
        let [{
          entry
        }] = args;
        d1.resolve(...args);
        return entry;
      };
      let logger = new MinLog({
        serializers: [
          serializer1
        ]
      });
      logger.info(...args);

      let {
        entry,
        logger: serializerLogger,
        rawEntry
      } = await d1.promise;

      expect(entry.msg).toBe(stringArg);
      expect(entry.err).toBe(errArg);
      expect(rawEntry).toBeUndefined();
      expect(serializerLogger).toBe(logger);
    });

    it(`should call one serializer with the correct entry, logger and rawEntry
when requireRawEntry=true`, async function() {
      let stringArg = 'test';
      let errArg = new Error();
      let objArg = {
        test: true
      };
      let symbolArg = Symbol('test');
      let args = [
        stringArg,
        errArg,
        objArg,
        symbolArg
      ];

      let d1 = _.defer();
      let serializer1 = async function(...args) {
        let [{
          entry
        }] = args;
        d1.resolve(...args);
        return entry;
      };
      let logger = new MinLog({
        serializers: [
          serializer1
        ],
        requireRawEntry: true
      });
      logger.info(...args);

      let {
        entry,
        logger: serializerLogger,
        rawEntry
      } = await d1.promise;

      expect(rawEntry).toStrictEqual(entry);
      expect(rawEntry.msg).toBe(stringArg);
      expect(rawEntry.err).toBe(errArg);
      expect(rawEntry).toMatchObject(objArg);
      expect(rawEntry._arg3).toBe(symbolArg);
      expect(serializerLogger).toBe(logger);
    });

    it('should call multiple serializers', async function() {
      let d1Symbol = Symbol('d1');
      let d1 = _.defer();
      let serializer1 = async function(...args) {
        let [{
          entry
        }] = args;
        entry.d1 = d1Symbol;
        d1.resolve(...args);
        return entry;
      };

      let d2Symbol = Symbol('d2');
      let d2 = _.defer();
      let serializer2 = async function(...args) {
        let [{
          entry
        }] = args;
        entry.d2 = d2Symbol;
        d2.resolve(...args);
        return entry;
      };

      let logger = new MinLog({
        serializers: [
          serializer1,
          serializer2
        ]
      });
      logger.info();

      let [{
        entry: entry1
      }, {
        entry: entry2
      }] = await Promise.all([
        d1.promise,
        d2.promise
      ]);

      expect(entry1.d1).toBe(d1Symbol);
      expect(entry2.d2).toBe(d2Symbol);
    });
  });
});
