"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.serializeTime = void 0;

var _bluebird = require("bluebird/js/release/bluebird");

var _lodashFirecloud = _interopRequireDefault(require("lodash-firecloud"));

var _moment = _interopRequireDefault(require("moment"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let serializeTime =
/*#__PURE__*/
function () {
  var _ref = (0, _bluebird.coroutine)(function* ({
    entry
  }) {
    let {
      _time
    } = entry;

    if (!_lodashFirecloud.default.isDate(_time)) {
      return entry;
    }

    entry._time = {
      stamp: (0, _moment.default)(_time).toISOString(),
      zone: _momentTimezone.default.tz.guess(),
      utc_offset: (0, _moment.default)(_time).utcOffset()
    };
    return entry;
  });

  return function serializeTime(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.serializeTime = serializeTime;
var _default = exports.serializeTime;
exports.default = _default;

//# sourceMappingURL=time.js.map