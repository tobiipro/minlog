import TypescriptMinLog from '../minlog';
import { MinLogEntry, MinLogFormatArgs, MinLogListener, MinLogRawEntry, MinLogSerializedTime } from '../types';
declare type FormatPair = string | [string, any];
export declare let serialize: (args: {
    entry: MinLogEntry & {
        _time: MinLogSerializedTime;
    };
    logger: TypescriptMinLog;
    rawEntry: MinLogRawEntry;
    cfg?: {
        contextId?: string;
        level?: string | number;
        localTime?: boolean;
        localStamp?: number;
        stamp?: number;
    };
}) => {
    cfg: {
        contextId?: string;
        level?: string | number;
        localTime?: boolean;
        localStamp?: number;
        stamp?: number;
    };
    hasCssSupport: boolean;
    now: string;
    levelName: string;
    formattedLevelName: string;
    consoleFun: string;
    color: string;
    src: string;
    msg: string;
    extra: Partial<MinLogEntry & {
        _time: MinLogSerializedTime;
    }>;
};
export declare let toFormatArgs: (...formatPairs: FormatPair[]) => MinLogFormatArgs;
export declare let format: (consoleFun: string, formatArgs_0: string, ...formatArgs_1: any[]) => void;
export declare let logToConsole: (cfg?: {
    /**
     * Any log entry less important that cfg.level is ignored.
     */
    level?: string | number;
    /**
     * A context id. In a browser environment, it defaults to 'top'/'iframe'.
     */
    contextId?: string;
}) => MinLogListener;
export default logToConsole;
