import defaultLevels from './default-levels';
import { MinLogArg, MinLogLevel, MinLogLevelCode, MinLogLevelName, MinLogLevelNameToCode, MinLogListener, MinLogOptions, MinLogSerializer } from './types';
import { Fn, InstanceReplace } from 'lodash-firecloud/types';
interface MinLogLogFn {
    (...args: MinLogArg[]): ReturnType<MinLog['log']>;
}
declare type MinLogDefaultLevelLogFns = {
    [TKey in keyof typeof defaultLevels]: MinLogLogFn;
};
export declare class BaseMinLog {
    _queue: Fn<Promise<void>, []>[];
    _queueFlushing: Promise<void>;
    serializers: MinLogSerializer[];
    listeners: MinLogListener[];
    levels: MinLogLevelNameToCode;
    requireRawEntry: boolean;
    requireSrc: boolean;
    time: MinLogLogFn;
    constructor(options?: MinLogOptions);
    child(childOptions?: MinLogOptions): MinLog;
    levelIsBeyondGroup(levelCodeOrName: MinLogLevel, groupCodeOrName: MinLogLevel): boolean;
    levelToLevelCode(levelCodeOrName: MinLogLevel): MinLogLevelCode;
    levelToLevelName(levelCodeOrName: MinLogLevel): MinLogLevelName;
    maxLevelCodeInGroup(levelCodeOrName: MinLogLevel): MinLogLevelCode;
    flush(): Promise<void>;
    log(levelCodeOrName: MinLogLevel, ...args: MinLogArg[]): {
        promise: Promise<void>;
    };
    trackTime<TFn extends Fn>(fn: TFn): ReturnType<TFn>;
    trackTime<TFn extends Fn>(_arg1: MinLogArg, fn: TFn): ReturnType<TFn>;
    trackTime<TFn extends Fn>(_arg1: MinLogArg, _arg2: MinLogArg, fn: TFn): ReturnType<TFn>;
    trackTime<TFn extends Fn>(_arg1: MinLogArg, _arg2: MinLogArg, _arg3: MinLogArg, fn: TFn): ReturnType<TFn>;
    trackTime<TFn extends Fn>(_arg1: MinLogArg, _arg2: MinLogArg, _arg3: MinLogArg, _arg4: MinLogArg, fn: TFn): ReturnType<TFn>;
    trackTime<TFn extends Fn>(_arg1: MinLogArg, _arg2: MinLogArg, _arg3: MinLogArg, _arg4: MinLogArg, _arg5: MinLogArg, fn: TFn): ReturnType<TFn>;
}
export declare type MinLog = BaseMinLog & MinLogDefaultLevelLogFns;
export declare type MinLogConstructor = InstanceReplace<typeof BaseMinLog, MinLog>;
export declare let MinLog: {
    new (options?: MinLogOptions): MinLog;
    prototype: MinLog;
} & Pick<typeof BaseMinLog, never>;
export default MinLog;
