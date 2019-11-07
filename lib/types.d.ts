export declare type MaybePromise<T> = T | Promise<T>;
export declare type Fn<TReturn = unknown, TArgs extends unknown[] = unknown[]> = (...args: TArgs) => TReturn;
export declare type AsyncFn<TReturn = unknown, TArgs extends unknown[] = unknown[]> = (...args: TArgs) => Promise<TReturn>;
export declare type Unpromise<TMaybePromise extends any> = TMaybePromise extends Promise<infer TValue> ? TValue : TMaybePromise;
export declare type MaybePromiseReturn<TReturn, T extends Fn> = ReturnType<T> extends Promise<any> ? Promise<TReturn> : TReturn;
export declare type FnChangeReturnType<T extends Fn, TReturn = Unpromise<ReturnType<T>>> = ReturnType<T> extends Promise<any> ? (...args: Parameters<T>) => Promise<TReturn> : (...args: Parameters<T>) => TReturn;
export declare type CallbackFn = Fn<MaybePromise<void>>;
export declare type NodeCallbackFn<TResult = unknown> = Fn<MaybePromise<void>, [Error, TResult]>;
export declare type NodeCallbackErrorLastFn<TResult = unknown> = Fn<MaybePromise<void>, [TResult, Error]>;
export declare type MinLogLevelName = string;
export declare type MinLogLevelCode = number;
export declare type MinLogLevel = MinLogLevelName | MinLogLevelCode;
export declare type MinLogLevelNameToCode = {
    [key: string]: MinLogLevelCode;
};
export declare type MinLogOptions = {
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
export declare type MinLogListener = (args: {
    entry: MinLogEntry;
    logger: import('./minlog').TypescriptMinLog;
    rawEntry: MinLogRawEntry;
}) => MaybePromise<void>;
export declare type MinLogSerializer = (args: {
    entry: MinLogEntry;
    logger: import('./minlog').TypescriptMinLog;
    rawEntry: MinLogRawEntry;
}) => MaybePromise<MinLogEntry>;
