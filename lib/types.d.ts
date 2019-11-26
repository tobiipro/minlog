import { MaybePromise } from 'lodash-firecloud/types';
export declare type MinLog = import('./minlog').MinLog;
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
export interface MinLogErr extends Error {
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
    err?: MinLogErr;
}
export interface MinLogSerializedTime {
    stamp: string;
    localStamp: string;
    zone: string;
    utc_offset: number;
}
export interface MinLogSerializedErr extends Omit<MinLogErr, 'stack'> {
    stack: string[];
}
export interface MinLogEntry extends Omit<MinLogRawEntry, '_time' | 'err'> {
    _time: MinLogRawEntry['_time'] | MinLogSerializedTime;
    err?: MinLogErr | MinLogSerializedErr;
    _duration?: {
        stamp: string;
        human: string;
        ms: number;
    };
}
export declare type MinLogListener = (args: {
    entry: MinLogEntry;
    logger: import('./minlog').MinLog;
    rawEntry?: MinLogRawEntry;
}) => MaybePromise<void>;
export declare type MinLogSerializer = (args: {
    entry: MinLogEntry;
    logger: import('./minlog').MinLog;
    rawEntry?: MinLogRawEntry;
}) => MaybePromise<MinLogEntry>;
export declare type MinLogFormatArgs = [string, ...any[]];
export declare type MinLogArg = string | Error | object;
