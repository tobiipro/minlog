import _ from 'lodash';
import levels from '../src/levels';

describe('levels', () => {
  it('should be defined', () => {
    let expectedLevels = [
      'alert',
      'critical',
      'debug',
      'emergency',
      'error',
      'fatal',
      'info',
      'informational',
      'notice',
      'silly',
      'trace',
      'verbose',
      'warn',
      'warning'];

    _.forEach(expectedLevels, (lvl) => {
      expect(levels[lvl]).toBeDefined();
    });
  });
});

describe('levelToLevelName', () => {
  it('should be defined', () => {
    expect(levels.levelToLevelName).not.toBeUndefined();
  });

  it('should return as expected for defined levels', () => {
    expect(levels.levelToLevelName(levels.alert)).toBe('alert');
    expect(levels.levelToLevelName(levels.critical)).toBe('critical');
    expect(levels.levelToLevelName(levels.debug)).toBe('debug');
    expect(levels.levelToLevelName(levels.emergency)).toBe('fatal');
    expect(levels.levelToLevelName(levels.error)).toBe('error');
    expect(levels.levelToLevelName(levels.fatal)).toBe('fatal');
    expect(levels.levelToLevelName(levels.info)).toBe('info');
    expect(levels.levelToLevelName(levels.informational)).toBe('info');
    expect(levels.levelToLevelName(levels.notice)).toBe('notice');
    expect(levels.levelToLevelName(levels.silly)).toBe('silly');
    expect(levels.levelToLevelName(levels.trace)).toBe('trace');
    expect(levels.levelToLevelName(levels.verbose)).toBe('debug');
    expect(levels.levelToLevelName(levels.warn)).toBe('warn');
    expect(levels.levelToLevelName(levels.warning)).toBe('warn');
  });

  it('should return as expected for custom levels', () => {
    expect(levels.levelToLevelName(42)).toBe('lvl42');
  });
});

describe('levelToConsoleFun', () => {
  it('should be defined', () => {
    expect(levels.levelToConsoleFun).not.toBeUndefined();
  });

  it('should return as expected for defined levels', () => {
    expect(levels.levelToConsoleFun(levels.alert)).toBe('error');
    expect(levels.levelToConsoleFun(levels.critical)).toBe('error');
    expect(levels.levelToConsoleFun(levels.debug)).toBe('log');
    expect(levels.levelToConsoleFun(levels.emergency)).toBe('error');
    expect(levels.levelToConsoleFun(levels.error)).toBe('error');
    expect(levels.levelToConsoleFun(levels.fatal)).toBe('error');
    expect(levels.levelToConsoleFun(levels.info)).toBe('info');
    expect(levels.levelToConsoleFun(levels.informational)).toBe('info');
    expect(levels.levelToConsoleFun(levels.notice)).toBe('warn');
    expect(levels.levelToConsoleFun(levels.silly)).toBe('log');
    expect(levels.levelToConsoleFun(levels.trace)).toBe('trace');
    expect(levels.levelToConsoleFun(levels.verbose)).toBe('log');
    expect(levels.levelToConsoleFun(levels.warn)).toBe('warn');
    expect(levels.levelToConsoleFun(levels.warning)).toBe('warn');
  });

  it('should pick up string names of levels', () => {
    expect(levels.levelToConsoleFun('verbose')).toBe('log');
  });

  it('should return correctly for intermediate levels', () => {
    expect(levels.levelToConsoleFun((levels.error + levels.warn) / 2)).toBe('error');
  });

  it('should return log as default', () => {
    expect(levels.levelToConsoleFun()).toBe('log');
    expect(levels.levelToConsoleFun({})).toBe('log');
    expect(levels.levelToConsoleFun('blabla')).toBe('log');
    expect(levels.levelToConsoleFun('levelToConsoleFun')).toBe('log');
  });
});

