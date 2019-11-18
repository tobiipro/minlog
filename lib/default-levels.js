"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.defaultLevels = void 0;let defaultLevels = {
  time: 70,

  // npm alias
  fatal: 0, // emergency
  verbose: 70, // debug
  silly: 80,

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
  trace: 90 };exports.defaultLevels = defaultLevels;var _default = exports.defaultLevels;exports.default = _default;

//# sourceMappingURL=default-levels.js.map