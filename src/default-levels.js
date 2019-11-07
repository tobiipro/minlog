export let defaultLevels = {
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
  trace: 90
};

export default defaultLevels;
