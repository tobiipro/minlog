import {
  MaybePromise
} from 'lodash-firecloud/types';

export type MinLog = import('./minlog').MinLog;

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

export interface MinLogError extends Error {
  // custom
  uncaught?: boolean;
  inPromise?: boolean;
}

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
  err?: MinLogError;
}

export interface MinLogSerializedTime {
  stamp: string;
  localStamp: string;
  zone: string;
  // eslint-disable-next-line camelcase
  utc_offset: number;
}

export interface MinLogSerializedError extends Omit<MinLogError, 'stack'> {
  stack: string[];
}

export interface MinLogEntry extends Omit<MinLogRawEntry, '_time' | 'err'> {
  _time: MinLogRawEntry['_time'] | MinLogSerializedTime;
  err?: MinLogError | MinLogSerializedError;
  _duration?: {
    stamp: string;
    human: string;
    ms: number;
  };
}

export type MinLogListener = (args: {
  entry: MinLogEntry;
  logger: import('./minlog').MinLog;
  rawEntry?: MinLogRawEntry;
}) => MaybePromise<void>;

export type MinLogSerializer = (args: {
  entry: MinLogEntry;
  logger: import('./minlog').MinLog;
  rawEntry?: MinLogRawEntry;
}) => MaybePromise<MinLogEntry>;

export type MinLogFormatArgs = [string, ...any[]];

export type MinLogArg =
  string |
  Error |
  object;
