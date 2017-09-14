import _ from 'lodash';
import moment from 'moment';
import state from '../state';

let _log = {
  local: console
};

export default async function({entry, logger, rawEntry}) {
  if (_.filter(rawEntry._args).length === 1 && rawEntry._args[0]._babelSrc) {
    return;
  }

  let {config, storage} = state;
  if (storage) {
    let maxLevelName = await storage.getItem('logger.log_to_console.level');
    let maxLevel = logger.levels[maxLevelName];
    maxLevel = _.floor(maxLevel / 10) * 10 + 10 - 1; // round up to next level, not inclusive
    if (entry.level > maxLevel) {
      return;
    }
  }

  let now = moment(entry._time.stamp).utcOffset(entry._time.utc_offset).toISOString();
  let levelName = logger.levelToLevelName(entry._level);
  let formattedLevelName = _.padStart(_.toUpper(levelName), '5');
  let consoleFun = logger.levelToConsoleFun(entry._level);

  let color = '';
  switch (consoleFun) {
  case 'log':
  case 'info':
  case 'trace':
    color = 'color: dodgerblue';
    break;
  default:
  }

  let prefixFormat = '%c%s %c%s%c';
  let prefixArgs = [
    color,
    now,
    'font-weight: bold',
    formattedLevelName,
    color
  ];

  let src = '';
  if (entry._babelSrc) {
    src = _.merge({}, entry._src, entry._babelSrc);
    src = ` @webpack:///./${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
  } else if (entry._src) {
    src = entry._src;
    src = ` ${src.file}:${src.line}:${src.column}${src.function ? ` in ${src.function}()` : ''}`;
  }

  let iframeId = '?';
  if (config) {
    iframeId = window.document.documentElement.getAttribute(`${config.ns}-iframe-id`) || '?';
  }

  let context = {
    window,
    documentElement: window.document.documentElement
  };

  let srcFormat = '%s in the %s context';
  let srcArgs = [
    src,
    iframeId
  ];

  let msgFormat = '';
  let msgArgs = [];
  if (entry.msg) {
    msgFormat = '\n%s';
    msgArgs = [
      entry.msg
    ];
  }

  let extraFormat = '';
  let extraArgs = [];

  let extra = _.omit(rawEntry, [
    '_args',
    '_babelSrc',
    '_level',
    '_src',
    '_time',
    'iframeId',
    'msg'
  ]);
  _.merge(extra, context);

  // devTools console sorts keys when object is expanded
  extra = _.toPairs(extra);
  extra = _.sortBy(extra, 0);
  extra = _.fromPairs(extra);

  // devTools collapses objects with 'too many' keys,
  // so we output objects with only one key
  _.forEach(extra, function(value, key) {
    extraArgs.push('\n');
    extraArgs.push({[key]: value});
  });

  // eslint-disable-next-line no-console
  console[consoleFun](
    `${prefixFormat}${srcFormat}:${msgFormat}${extraFormat}`,
    ...prefixArgs,
    ...srcArgs,
    ...msgArgs,
    ...extraArgs
  );
};
