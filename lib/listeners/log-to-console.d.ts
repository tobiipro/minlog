import TypescriptMinLog from '../minlog';
import { MinLogEntry, MinLogFormatArgs, MinLogLevel, MinLogListener, MinLogRawEntry, MinLogSerializedTime } from '../types';
import { Fn, MaybePromise } from 'lodash-firecloud/types';
declare type FormatPair = string | [string, any];
export interface Cfg {
    /**
     * Any log entry less important that cfg.level is ignored.
     */
    level?: MinLogLevel;
    /**
     * A context id. In a browser environment, it defaults to 'top'/'iframe'.
     */
    contextId?: string;
}
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
export declare let logToConsole: (cfg?: Cfg | Promise<Cfg> | Fn<MaybePromise<Cfg>, unknown[]>) => MinLogListener;
export default logToConsole;
