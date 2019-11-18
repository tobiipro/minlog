import defaultLevels from './default-levels';
import { MinLogArg, MinLogLevel, MinLogLevelCode, MinLogLevelName, MinLogLevelNameToCode, MinLogListener, MinLogOptions, MinLogSerializer } from './types';
declare type MinLogDefaultLevelLogFns = {
    [TKey in keyof (typeof defaultLevels)]: (...args: MinLogArg[]) => Promise<void>;
};
export declare class MinLog {
    serializers: MinLogSerializer[];
    listeners: MinLogListener[];
    levels: MinLogLevelNameToCode;
    requireRawEntry: boolean;
    requireSrc: boolean;
    time: (...args: any[]) => Promise<void>;
    constructor(options?: MinLogOptions);
    child(childOptions?: MinLogOptions): MinLog;
    levelIsBeyondGroup(levelCodeOrName: MinLogLevel, groupCodeOrName: MinLogLevel): boolean;
    levelToLevelCode(levelCodeOrName: MinLogLevel): MinLogLevelCode;
    levelToLevelName(levelCodeOrName: MinLogLevel): MinLogLevelName;
    maxLevelCodeInGroup(levelCodeOrName: MinLogLevel): MinLogLevelCode;
    log(levelCodeOrName: MinLogLevel, ...args: MinLogArg[]): Promise<void>;
    trackTime(...args: any[]): Promise<void>;
}
export declare type TypescriptMinLog = MinLog & {
    new (options?: MinLogOptions): MinLog & MinLogDefaultLevelLogFns;
};
export declare let TypescriptMinLog: TypescriptMinLog;
export default TypescriptMinLog;
