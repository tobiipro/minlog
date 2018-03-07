'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird/js/release/bluebird');

var _lodashFirecloud = require('lodash-firecloud');

var _lodashFirecloud2 = _interopRequireDefault(_lodashFirecloud);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _bluebird.coroutine)(function* ({ entry }) {
    let { _time } = entry;

    if (!_lodashFirecloud2.default.isDate(_time)) {
      return entry;
    }

    entry._time = {
      stamp: (0, _moment2.default)(_time).toISOString(),
      zone: _momentTimezone2.default.tz.guess(),
      utc_offset: (0, _moment2.default)(_time).utcOffset()
    };

    return entry;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

//# sourceMappingURL=time.js.map