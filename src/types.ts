export type MaybePromise<T> =
  T | Promise<T>;

/* Functions */

export type Fn<
  TReturn = unknown,
  TArgs extends unknown[] = unknown[]
> =
  (...args: TArgs) => TReturn;

export type AsyncFn<
  TReturn = unknown,
  TArgs extends unknown[] = unknown[]
> =
  (...args: TArgs) => Promise<TReturn>;

export type Unpromise<TMaybePromise extends any> =
  TMaybePromise extends Promise<infer TValue>
    ? TValue
    : TMaybePromise

export type MaybePromiseReturn<
  TReturn,
  T extends Fn
> =
  ReturnType<T> extends Promise<any> ? Promise<TReturn> : TReturn;

export type FnChangeReturnType<
  T extends Fn,
  TReturn = Unpromise<ReturnType<T>>
> =
  ReturnType<T> extends Promise<any> ?
    (...args: Parameters<T>) => Promise<TReturn> :
    (...args: Parameters<T>) => TReturn;

/* Callbacks */

export type CallbackFn =
  Fn<MaybePromise<void>>;

export type NodeCallbackFn<TResult = unknown> =
  Fn<MaybePromise<void>, [Error, TResult]>;

export type NodeCallbackErrorLastFn<TResult = unknown> =
  Fn<MaybePromise<void>, [TResult, Error]>;

/* MinLog */

export type MinLogLevelName = string;

export type MinLogLevelCode = number;

export type MinLogLevel = MinLogLevelName | MinLogLevelCode;

export type MinLogLevelNameToCode = {
  // [key: MinLogLevelName]: MinLogLevelCode
  [key: string]: MinLogLevelCode
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
    file: string,
    line: number
    function: string
  };
  _babelSrc?: {
    file: string,
    line: number
    column: number,
    function: string
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
    stamp: string,
    human: string,
    ms: number
  };
}

export type MinLogListener = (args: {
  entry: MinLogEntry;
  logger: import('./minlog').TypescriptMinLog;
  rawEntry: MinLogRawEntry;
}) => MaybePromise<void>;

export type MinLogSerializer = (args: {
  entry: MinLogEntry;
  logger: import('./minlog').TypescriptMinLog;
  rawEntry: MinLogRawEntry;
}) => MaybePromise<MinLogEntry>;
