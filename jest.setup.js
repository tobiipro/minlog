import * as jestDateMock from 'jest-date-mock';

jestDateMock.advanceTo(0);

// eslint-disable-next-line no-extend-native
Date.prototype.getTimezoneOffset = function() {
  return 0;
};
