import _ from 'lodash-firecloud';

import {
  MinLogEntry
} from './types';

export let jsonStringifyReplacer = function(_key: string, value: any): unknown {
  if (_.isFunction(value?.toJSON)) {
    return value;
  }

  if (
    _.isArray(value) ||
    _.isBoolean(value) ||
    _.isNil(value) ||
    _.isNumber(value) ||
    _.isPlainObject(value) ||
    _.isString(value) ||
    _.isSymbol(value)
  ) {
    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  value = require('util').inspect(value);
  value = _.split(value, '\n');
  if (value.length < 2) {
    value = value[0];
  }
  return value;
};

export let keepOnlyExtra = function<T extends MinLogEntry>(logEntry: T): Partial<T> {
  let extraLogEntry = _.pickBy(logEntry, function(_value, key) {
    if (_.includes([
      'ctx',
      'msg'
    ], key)) {
      return false;
    }
    if (_.startsWith(key, '_')) {
      return false;
    }
    return true;
  });

  return extraLogEntry;
};
