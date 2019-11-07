import TypescriptMinLog from '../minlog';
import { MinLogEntry, MinLogListener, MinLogRawEntry, MinLogSerializedTime } from '../types';
declare type FormatPair = string | [string, any];
export declare let serialize: ({ entry, logger, rawEntry: _rawEntry, cfg }: {
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
export declare let toFormatArgs: (...formatPairs: FormatPair[]) => any[];
export declare let logToConsole: (cfg?: {
    level?: string | number;
    contextId?: string;
}) => MinLogListener;
export default logToConsole;
