import {
  MaybePromise
} from 'lodash-firecloud/types';

export type MinLogLevelName = string;

export type MinLogLevelCode = number;

export type MinLogLevel = MinLogLevelName | MinLogLevelCode;

export type MinLogLevelNameToCode = {
  // [key: MinLogLevelName]: MinLogLevelCode
  [key: string]: MinLogLevelCode;
};

export type MinLogOptions = {
  serializers?: MinLogSerializer[];
  listeners?: MinLogListener[];
  levels?: MinLogLevelNameToCode;
  requireRawEntry?: boolean;
  requireSrc?: boolean;
};

export interface MinLogRawEntry {
  _args: any[];
  _time: number;
  _level: MinLogLevelCode;
  _src?: {
    file: string;
    line: number;
    function: string;
  };
  _babelSrc?: {
    file: string;
    line: number;
    column: number;
    function: string;
  };
  msg?: string;
  err?: Error;
}

export interface MinLogSerializedTime {
  stamp: string;
  localStamp: string;
  zone: string;
  // eslint-disable-next-line camelcase
  utc_offset: number;
}

export interface MinLogSerializedErr {
  name: string;
  message: string;
  uncaught?: boolean;
  inPromise?: boolean;
  stack: string[];
}

export interface MinLogEntry extends Omit<MinLogRawEntry, '_time' | 'err'> {
  _time: MinLogRawEntry['_time'] | MinLogSerializedTime;
  err?: MinLogRawEntry['err'] | MinLogSerializedErr;
  _duration?: {
    stamp: string;
    human: string;
    ms: number;
  };
}

export type MinLogListener = (args: {
  entry: MinLogEntry;
  logger: import('./minlog').TypescriptMinLog;
  rawEntry?: MinLogRawEntry;
}) => MaybePromise<void>;

export type MinLogSerializer = (args: {
  entry: MinLogEntry;
  logger: import('./minlog').TypescriptMinLog;
  rawEntry?: MinLogRawEntry;
}) => MaybePromise<MinLogEntry>;

export type MinLogFormatArgs = [string, ...any[]];

export type MinLogArg =
  string |
  Error |
  object;
