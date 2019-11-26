import { MinLogLevel, MinLogListener } from '../types';
import { Fn, MaybePromise } from 'lodash-firecloud/types';
export interface Cfg {
    /**
     * Any log entry less important that cfg.level is ignored.
     */
    level?: MinLogLevel;
}
export declare let format: (formatArgs_0: string, ...formatArgs_1: any[]) => void;
export declare let logToConsoleAwsLambda: (cfg?: Cfg | Promise<Cfg> | Fn<MaybePromise<Cfg>, unknown[]>) => MinLogListener;
export default logToConsoleAwsLambda;
