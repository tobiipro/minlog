import _ from 'lodash';

export let levels = {
  // https://tools.ietf.org/html/rfc3164 (multiplier 10)
  emergency: 0,
  alert: 10,
  critical: 20,
  error: 30,
  warning: 40,
  notice: 50,
  informational: 60,
  debug: 70,

  // console
  warn: 40, // warning
  info: 60, // informational
  trace: 90,

  // alias
  fatal: 0, // emergency
  verbose: 70, // debug
  silly: 80,


  levelToLevelName: function(level) {
    if (_.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this[level] || this.trace;
    }

    let levelName = _.invert(this)[level] || `lvl${level}`;
    switch (levelName) {
    case 'verbose':
      levelName = 'debug';
      break;
    default:
      break;
    }

    return levelName;
  },


  levelToConsoleFun: function(level) {
    if (_.isString(level)) {
      // eslint-disable-next-line prefer-destructuring
      level = this[level];
    }

    if (_.inRange(level, 0, this.warn)) {
      return 'error';
    } else if (_.inRange(level, this.warn, this.info)) {
      return 'warn';
    } else if (_.inRange(level, this.info, this.debug)) {
      return 'info';
    } else if (_.inRange(level, this.debug, this.trace)) {
      // return 'debug';
      // console.debug doesn't seem to print anything,
      // but console.debug is an alias to console.log anyway
      return 'log';
    } else if (level === this.trace) {
      return 'trace';
    }

    return 'log';
  }
};

export default levels;
